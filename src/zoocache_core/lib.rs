mod bus;
mod flight;
mod storage;
mod trie;
mod utils;

use dashmap::DashMap;
use pyo3::prelude::*;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::Arc;

use crate::utils::to_conn_err;
use bus::{InvalidateBus, LocalBus, RedisPubSubBus};
use flight::{Flight, FlightStatus, complete_flight, try_enter_flight, wait_for_flight};
use std::num::NonZeroUsize;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{self, SyncSender};
use std::thread;
use std::time::{Duration, Instant};
use storage::{CacheEntry, InMemoryStorage, LmdbStorage, RedisStorage, Storage};
use trie::{PrefixTrie, build_dependency_snapshots, validate_dependencies};

pyo3::create_exception!(zoocache, InvalidTag, pyo3::exceptions::PyException);
pyo3::create_exception!(zoocache, StorageIsFull, pyo3::exceptions::PyException);

fn validate_tag(tag: &str) -> PyResult<()> {
    if tag.is_empty() {
        return Err(InvalidTag::new_err("Tag cannot be empty"));
    }
    if tag.len() > 256 {
        return Err(InvalidTag::new_err(format!(
            "Tag length exceeded: {}. Max allowed is 256 characters.",
            tag.len()
        )));
    }
    if tag.starts_with(':') || tag.ends_with(':') || tag.starts_with('.') || tag.ends_with('.') {
        return Err(InvalidTag::new_err(
            "Tag cannot start or end with ':' or '.'",
        ));
    }

    let mut depth = 0;
    for c in tag.chars() {
        if c == ':' {
            depth += 1;
        }
        if !c.is_alphanumeric() && c != '_' && c != ':' && c != '.' {
            return Err(InvalidTag::new_err(format!(
                "Invalid character '{}' in tag '{}'. Only alphanumeric, '_', ':' and '.' are allowed.",
                c, tag
            )));
        }
    }
    if depth > 16 {
        return Err(InvalidTag::new_err(format!(
            "Tag depth exceeded: {}. Max allowed depth is 16.",
            depth
        )));
    }
    Ok(())
}

enum WorkerMsg {
    Touch(String, Option<u64>),
    Prune(u64),
    Delete(String),
    Update(String, Vec<u8>, Option<u64>),
    FlushMetrics(HashMap<String, f64>),
}

#[pyclass]
struct Core {
    storage: Arc<dyn Storage>,
    bus: Arc<dyn InvalidateBus>,
    trie: PrefixTrie,
    flights: DashMap<String, Arc<Flight>>,
    default_ttl: Option<u64>,
    max_entries: Option<usize>,
    tti_tx: Option<SyncSender<WorkerMsg>>,
    dropped_tti_msgs: AtomicU64,
    flight_timeout: u64,
    bus_is_remote: bool,
}

#[pymethods]
impl Core {
    #[new]
    #[allow(clippy::too_many_arguments)]
    #[pyo3(signature = (storage_url=None, bus_url=None, prefix=None, default_ttl=None, read_extend_ttl=true, max_entries=None, lmdb_map_size=None, flight_timeout=60, tti_flush_secs=30, auto_prune_secs=3600, auto_prune_interval=3600, lru_update_interval=30))]
    fn new(
        storage_url: Option<&str>,
        bus_url: Option<&str>,
        prefix: Option<&str>,
        default_ttl: Option<u64>,
        read_extend_ttl: bool,
        max_entries: Option<usize>,
        lmdb_map_size: Option<usize>,
        flight_timeout: Option<u64>,
        tti_flush_secs: Option<u64>,
        auto_prune_secs: Option<u64>,
        auto_prune_interval: Option<u64>,
        lru_update_interval: u64,
    ) -> PyResult<Self> {
        let storage: Arc<dyn Storage> = match storage_url {
            Some(url) if url.starts_with("redis://") => {
                Arc::new(RedisStorage::new(url, prefix, lru_update_interval).map_err(to_conn_err)?)
            }
            Some(url) if url.starts_with("lmdb://") => {
                Arc::new(LmdbStorage::new(&url[7..], lmdb_map_size)?)
            }
            Some(url) => {
                return Err(PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Unsupported storage scheme: {}",
                    url
                )));
            }
            None => Arc::new(InMemoryStorage::new()),
        };

        let trie = PrefixTrie::new();
        let mut bus_is_remote = false;

        let bus: Arc<dyn InvalidateBus> = match bus_url {
            Some(url) => {
                bus_is_remote = true;
                let channel = prefix.map(|p| format!("{}:invalidate", p));
                let r_bus = Arc::new(
                    RedisPubSubBus::new(url, channel.as_deref(), prefix).map_err(to_conn_err)?,
                );

                let t_clone = trie.clone();
                r_bus.start_listener(move |tag, ver| {
                    t_clone.set_min_version(tag, ver);
                });
                r_bus
            }
            None => Arc::new(LocalBus::new()),
        };

        let mut tti_tx = None;
        let tti_flush_secs_val = tti_flush_secs.unwrap_or(30);

        if read_extend_ttl {
            let (tx, rx) = mpsc::sync_channel::<WorkerMsg>(1_000_000);
            let storage_worker = Arc::clone(&storage);
            let trie_worker = trie.clone();
            let bus_worker = Arc::clone(&bus);

            thread::spawn(move || {
                let mut last_touches =
                    lru::LruCache::<String, Instant>::new(NonZeroUsize::new(10000).unwrap());
                let mut batch = HashMap::<String, Option<u64>>::new();
                let mut last_flush = Instant::now();
                let mut last_auto_prune = Instant::now();
                let flush_duration = Duration::from_secs(tti_flush_secs_val);
                let prune_interval = Duration::from_secs(auto_prune_interval.unwrap_or(3600));
                let prune_age = auto_prune_secs.unwrap_or(3600);

                loop {
                    let msg_result = rx.recv_timeout(Duration::from_secs(1));
                    let now = Instant::now();
                    let msg = match msg_result {
                        Ok(m) => m,
                        Err(mpsc::RecvTimeoutError::Timeout) => {
                            WorkerMsg::Touch(String::new(), None)
                        }
                        Err(_) => break,
                    };

                    match msg {
                        WorkerMsg::Touch(key, ttl) => {
                            if !key.is_empty() {
                                if last_touches.get(&key).is_some_and(|&last| {
                                    now.duration_since(last)
                                        < Duration::from_secs(lru_update_interval)
                                }) {
                                    continue;
                                }
                                batch.insert(key.clone(), ttl);
                                last_touches.put(key, now);
                            }
                        }
                        WorkerMsg::Prune(max_age) => {
                            trie_worker.prune(max_age);
                        }
                        WorkerMsg::Delete(key) => {
                            let _ = storage_worker.remove(&key);
                        }
                        WorkerMsg::Update(key, data, ttl) => {
                            let _ = storage_worker.set_raw(key, data, ttl);
                        }
                        WorkerMsg::FlushMetrics(metrics) => {
                            let _ = storage_worker.flush_metrics(metrics.clone());
                            let _ = bus_worker.flush_metrics(metrics);
                        }
                    }

                    if (batch.len() >= 1000 || now.duration_since(last_flush) > flush_duration)
                        && !batch.is_empty()
                    {
                        let _ = storage_worker.touch_batch(batch.drain().collect());
                        last_flush = now;
                    }

                    if now.duration_since(last_auto_prune) > prune_interval {
                        trie_worker.prune(prune_age);
                        last_auto_prune = now;
                    }
                }
            });
            tti_tx = Some(tx);
        }

        Ok(Self {
            storage,
            bus,
            trie,
            flights: DashMap::new(),
            default_ttl,
            max_entries,
            tti_tx,
            dropped_tti_msgs: AtomicU64::new(0),
            flight_timeout: flight_timeout.unwrap_or(60),
            bus_is_remote,
        })
    }

    fn get_or_entry(&self, py: Python, key: &str) -> PyResult<(Option<Py<PyAny>>, bool, bool)> {
        if let Some(res) = self.get(py, key)? {
            return Ok((Some(res), false, true));
        }

        let (flight, is_leader) = try_enter_flight(&self.flights, key);

        if is_leader {
            return Ok((None, true, false));
        }
        let timeout = self.flight_timeout;
        let status = py.detach(|| wait_for_flight(&flight, timeout));

        match status {
            FlightStatus::Done => {
                let state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
                Ok((state.1.as_ref().map(|obj| obj.clone_ref(py)), false, true))
            }
            FlightStatus::Error => Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                "Thundering herd leader failed",
            )),
            FlightStatus::Pending => unreachable!(),
        }
    }

    #[allow(clippy::type_complexity)]
    fn get_or_entry_async(
        &self,
        py: Python,
        key: &str,
    ) -> PyResult<(Option<Py<PyAny>>, bool, bool, Option<Py<PyAny>>)> {
        if let Some(res) = self.get(py, key)? {
            return Ok((Some(res), false, true, None));
        }

        let (flight, is_leader) = try_enter_flight(&self.flights, key);

        if is_leader {
            return Ok((None, true, false, None));
        }

        let fut = flight
            .py_future
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .as_ref()
            .map(|f| f.clone_ref(py));
        Ok((None, false, false, fut))
    }

    fn register_flight_future(&self, key: &str, future: Py<PyAny>) {
        if let Some(flight) = self.flights.get(key) {
            let mut fut_guard = flight.py_future.lock().unwrap_or_else(|e| e.into_inner());
            *fut_guard = Some(future);
        }
    }

    #[pyo3(signature = (key, is_error, value=None))]
    fn finish_flight(
        &self,
        py: Python,
        key: &str,
        is_error: bool,
        value: Option<Py<PyAny>>,
    ) -> Option<Py<PyAny>> {
        py.detach(|| complete_flight(&self.flights, key, is_error, value))
    }

    fn get(&self, py: Python, key: &str) -> PyResult<Option<Py<PyAny>>> {
        let storage = Arc::clone(&self.storage);
        let status = py.detach(|| storage.get(key));

        let (entry, expires_at) = match status {
            storage::StorageResult::Hit(e, exp) => (e, exp),
            storage::StorageResult::Expired => {
                self.send_tti_msg(WorkerMsg::Delete(key.to_string()));
                return Ok(None);
            }
            storage::StorageResult::NotFound => return Ok(None),
        };

        let current_global_version = self.trie.get_global_version();
        if entry.trie_version == current_global_version {
            return Ok(Some(entry.value.clone_ref(py)));
        }

        let valid = py.detach(|| validate_dependencies(&self.trie, &entry.dependencies));
        if !valid {
            let storage = Arc::clone(&self.storage);
            py.detach(|| storage.remove(key))?;
            return Ok(None);
        }

        if entry.trie_version < current_global_version {
            let updated_entry = storage::CacheEntry {
                value: entry.value.clone_ref(py),
                dependencies: entry.dependencies.clone(),
                trie_version: current_global_version,
            };
            if let Ok(data) = updated_entry.serialize(py) {
                let ttl = expires_at.and_then(|exp| exp.checked_sub(utils::now_secs()));
                self.send_tti_msg(WorkerMsg::Update(key.to_string(), data, ttl));
            }
        } else {
            self.send_tti_msg(WorkerMsg::Touch(key.to_string(), self.default_ttl));
        }

        Ok(Some(entry.value.clone_ref(py)))
    }

    #[pyo3(signature = (key, value, dependencies, ttl=None))]
    fn set(
        &self,
        py: Python,
        key: String,
        value: Py<PyAny>,
        dependencies: Vec<String>,
        ttl: Option<u64>,
    ) -> PyResult<()> {
        for tag in &dependencies {
            validate_tag(tag)?;
        }
        let trie_version = self.trie.get_global_version();
        let snapshots = py.detach(|| build_dependency_snapshots(&self.trie, dependencies));
        let entry = Arc::new(CacheEntry {
            value,
            dependencies: snapshots,
            trie_version,
        });
        let storage = Arc::clone(&self.storage);
        let final_ttl = ttl.or(self.default_ttl);

        py.detach(|| -> PyResult<()> {
            storage.set(key, entry, final_ttl)?;

            if let Some(max) = self.max_entries {
                let current = storage.len();
                if current > max {
                    let to_evict = current - max + (max / 10).max(1);
                    storage.evict_lru(to_evict)?;
                    self.trie.prune(0);
                }
            }
            Ok(())
        })?;
        Ok(())
    }

    fn invalidate(&self, py: Python, tag: &str) -> PyResult<()> {
        validate_tag(tag)?;
        let new_ver = self.trie.invalidate(tag);
        if self.bus_is_remote {
            py.detach(|| self.bus.publish(tag, new_ver));
        } else {
            self.bus.publish(tag, new_ver);
        }
        Ok(())
    }

    fn clear(&self, py: Python) -> PyResult<()> {
        let storage = Arc::clone(&self.storage);
        py.detach(|| -> PyResult<()> {
            storage.clear()?;
            self.trie.clear();
            Ok(())
        })?;
        Ok(())
    }

    fn request_prune(&self, max_age_secs: u64) {
        self.send_tti_msg(WorkerMsg::Prune(max_age_secs));
    }

    fn prune(&self, max_age_secs: u64) {
        self.trie.prune(max_age_secs);
    }

    fn tag_version(&self, tag: &str) -> u64 {
        self.trie.get_tag_version(tag)
    }

    fn len(&self) -> usize {
        self.storage.len()
    }

    fn version(&self) -> String {
        env!("CARGO_PKG_VERSION").to_string()
    }

    fn tti_dropped_messages(&self) -> u64 {
        self.dropped_tti_msgs.load(Ordering::Relaxed)
    }

    fn flush_metrics(&self, metrics: HashMap<String, f64>) -> PyResult<()> {
        self.send_tti_msg(WorkerMsg::FlushMetrics(metrics));
        Ok(())
    }
}

impl Core {
    fn send_tti_msg(&self, msg: WorkerMsg) {
        if let Some(Err(mpsc::TrySendError::Full(_))) =
            self.tti_tx.as_ref().map(|tx| tx.try_send(msg))
        {
            self.dropped_tti_msgs.fetch_add(1, Ordering::Relaxed);
        }
    }
}

#[pyfunction]
#[pyo3(signature = (obj, prefix=None))]
fn hash_key(_py: Python<'_>, obj: Bound<'_, PyAny>, prefix: Option<&str>) -> PyResult<String> {
    let mut data = Vec::new();
    let mut serializer = rmp_serde::Serializer::new(&mut data);
    let mut depythonizer = pythonize::Depythonizer::from_object(&obj);

    serde_transcode::transcode(&mut depythonizer, &mut serializer)
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyTypeError, _>(e.to_string()))?;

    let mut hasher = Sha256::new();
    hasher.update(&data);
    let digest = hasher.finalize();
    let hex = format!("{:x}", digest);
    let result = match prefix {
        Some(p) => format!("{}:{}", p, &hex[..16]),
        None => hex[..16].to_string(),
    };
    Ok(result)
}

#[pymodule]
fn _zoocache(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Core>()?;
    m.add_function(wrap_pyfunction!(hash_key, m)?)?;
    m.add("InvalidTag", m.py().get_type::<InvalidTag>())?;
    m.add("StorageIsFull", m.py().get_type::<StorageIsFull>())?;
    Ok(())
}
