mod bus;
mod flight;
mod storage;
mod trie;
mod utils;

use dashmap::DashMap;
use once_cell::sync::Lazy;
use pyo3::prelude::*;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::Arc;

pub(crate) static RUNTIME: Lazy<tokio::runtime::Runtime> = Lazy::new(|| {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Failed to create Tokio runtime")
});

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

struct TtiState {
    tx: SyncSender<WorkerMsg>,
    dropped: AtomicU64,
}

impl TtiState {
    fn touch(&self, key: &str, ttl: Option<u64>) {
        if self
            .tx
            .try_send(WorkerMsg::Touch(key.to_string(), ttl))
            .is_err()
        {
            self.dropped.fetch_add(1, Ordering::Relaxed);
        }
    }
}

#[pyclass]
struct Core {
    storage: Arc<dyn Storage>,
    bus: Arc<dyn InvalidateBus>,
    trie: PrefixTrie,
    flights: Arc<DashMap<String, Arc<Flight>>>,
    default_ttl: Option<u64>,
    max_entries: Option<usize>,
    tti_state: Option<Arc<TtiState>>,
    flight_timeout: u64,
    silent_errors: Arc<AtomicU64>,
    bus_is_remote: bool,
}

#[pymethods]
impl Core {
    #[new]
    #[allow(clippy::too_many_arguments)]
    #[pyo3(signature = (node_id=None, storage_url=None, bus_url=None, prefix=None, default_ttl=None, read_extend_ttl=true, max_entries=None, lmdb_map_size=None, flight_timeout=60, tti_flush_secs=30, auto_prune_secs=3600, auto_prune_interval=3600, lru_update_interval=30))]
    fn new(
        node_id: Option<&str>,
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
                    RedisPubSubBus::new(url, channel.as_deref(), prefix, node_id)
                        .map_err(to_conn_err)?,
                );

                let t_clone = trie.clone();
                let storage_clone = Arc::clone(&storage);
                let node_id_owned = node_id.unwrap_or("unknown").to_string();

                r_bus.start_listener(
                    move |tag, ver| {
                        t_clone.set_min_version(tag, ver);
                    },
                    move |prefix, req_id| {
                        let storage = Arc::clone(&storage_clone);
                        let prefix = prefix.to_string();
                        let node_id = node_id_owned.clone();
                        let req_id = req_id.to_string();

                        tokio::task::block_in_place(|| {
                            let rt = tokio::runtime::Handle::current();
                            rt.block_on(async move {
                                let matching_keys = storage.scan_keys(&prefix).await;
                                let keys_json: Vec<serde_json::Value> = matching_keys
                                    .into_iter()
                                    .map(|(k, expires_at)| {
                                        let ttl_rem = expires_at
                                            .and_then(|exp| exp.checked_sub(utils::now_secs()));
                                        serde_json::json!({
                                            "key": k,
                                            "ttl_remaining": ttl_rem
                                        })
                                    })
                                    .collect();

                                let payload = serde_json::json!({
                                    "req_id": req_id,
                                    "node_id": node_id,
                                    "keys": keys_json
                                });
                                serde_json::to_string(&payload).ok()
                            })
                        })
                    },
                );
                r_bus
            }
            None => Arc::new(LocalBus::new()),
        };

        let mut tti_state = None;
        let tti_flush_secs_val = tti_flush_secs.unwrap_or(30);
        let flights = Arc::new(DashMap::new());
        let flight_timeout_val = flight_timeout.unwrap_or(60);
        let silent_errors = Arc::new(AtomicU64::new(0));

        if read_extend_ttl {
            let (tx, rx) = mpsc::sync_channel::<WorkerMsg>(1_000_000);
            tti_state = Some(Arc::new(TtiState {
                tx: tx.clone(),
                dropped: AtomicU64::new(0),
            }));

            let storage_worker = Arc::clone(&storage);
            let trie_worker = trie.clone();
            let bus_worker = Arc::clone(&bus);
            let node_id_worker = node_id.unwrap_or("unknown").to_string();
            let flights_worker = Arc::clone(&flights);
            let silent_errors_worker = Arc::clone(&silent_errors);

            thread::spawn(move || {
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .unwrap();

                rt.block_on(async move {
                    let mut sys = sysinfo::System::new_all();
                    let mut local_metrics: HashMap<String, f64> = HashMap::new();
                    let mut last_heartbeat = Instant::now();

                    let mut last_touches =
                        lru::LruCache::<String, Instant>::new(NonZeroUsize::new(10000).unwrap());
                    let mut batch = HashMap::<String, Option<u64>>::new();
                    let mut last_flush = Instant::now();
                    let mut last_auto_prune = Instant::now();
                    let flush_duration = Duration::from_secs(tti_flush_secs_val);
                    let prune_interval = Duration::from_secs(auto_prune_interval.unwrap_or(3600));
                    let prune_age = auto_prune_secs.unwrap_or(3600);

                    loop {
                        let now = Instant::now();

                        let msg = match rx.try_recv() {
                            Ok(m) => Some(m),
                            Err(mpsc::TryRecvError::Empty) => {
                                tokio::time::sleep(Duration::from_millis(10)).await;
                                None
                            }
                            Err(mpsc::TryRecvError::Disconnected) => break,
                        };

                        if let Some(msg) = msg {
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
                                    if storage_worker.remove(&key).await.is_err() {
                                        silent_errors_worker.fetch_add(1, Ordering::Relaxed);
                                    }
                                }
                                WorkerMsg::Update(key, data, ttl) => {
                                    if storage_worker.set_raw(key, data, ttl).await.is_err() {
                                        silent_errors_worker.fetch_add(1, Ordering::Relaxed);
                                    }
                                }
                                WorkerMsg::FlushMetrics(metrics) => {
                                    for (k, v) in metrics {
                                        *local_metrics.entry(k).or_insert(0.0) += v;
                                    }
                                }
                            }
                        }

                        if (batch.len() >= 1000 || now.duration_since(last_flush) > flush_duration)
                            && !batch.is_empty()
                        {
                            if storage_worker
                                .touch_batch(batch.drain().collect())
                                .await
                                .is_err()
                            {
                                silent_errors_worker.fetch_add(1, Ordering::Relaxed);
                            }
                            last_flush = now;
                        }

                        if now.duration_since(last_auto_prune) > prune_interval {
                            trie_worker.prune(prune_age);
                            last_auto_prune = now;
                        }

                        if now.duration_since(last_heartbeat) > Duration::from_secs(1) {
                            flight::cleanup_stale_flights(&flights_worker, flight_timeout_val);

                            if bus_is_remote {
                                sys.refresh_cpu_usage();
                                sys.refresh_memory();
                                let cpu_percent = sys.global_cpu_usage();
                                let ram_used = sys.used_memory() as f64;
                                let ram_total = sys.total_memory() as f64;
                                let ram_percent = if ram_total > 0.0 {
                                    (ram_used / ram_total) * 100.0
                                } else {
                                    0.0
                                };
                                let hostname = sysinfo::System::host_name()
                                    .unwrap_or_else(|| "unknown".to_string());
                                let uptime = sysinfo::System::uptime();

                                let payload = serde_json::json!({
                                    "uuid": node_id_worker,
                                    "hostname": hostname,
                                    "cpu": cpu_percent,
                                    "ram": ram_percent,
                                    "uptime": uptime,
                                    "metrics": local_metrics,
                                });

                                if let Ok(json_str) = serde_json::to_string(&payload)
                                    && bus_worker
                                        .push_heartbeat(&node_id_worker, &json_str, 5)
                                        .await
                                        .is_err()
                                {
                                    silent_errors_worker.fetch_add(1, Ordering::Relaxed);
                                }
                            }
                            last_heartbeat = now;
                        }
                    }
                });
            });
        }

        Ok(Self {
            storage,
            bus,
            trie,
            flights,
            default_ttl,
            max_entries,
            tti_state,
            flight_timeout: flight_timeout_val,
            silent_errors,
            bus_is_remote,
        })
    }

    fn tti_touch(&self, key: &str, ttl: Option<u64>) {
        if let Some(state) = &self.tti_state {
            state.touch(key, ttl);
        }
    }

    fn get_sync<'py>(&self, py: Python<'py>, key: &str) -> PyResult<Option<Py<PyAny>>> {
        let status = self.storage.try_get_sync(py, key);
        let status = match status {
            Some(s) => s,
            None => return Ok(None),
        };

        let (entry, _expires_at) = match status {
            storage::StorageResult::Hit(e, exp) => (e, exp),
            storage::StorageResult::Expired => {
                if let Some(state) = &self.tti_state {
                    let _ = state.tx.try_send(WorkerMsg::Delete(key.to_string()));
                }
                return Ok(None);
            }
            storage::StorageResult::NotFound => return Ok(None),
        };

        let current_global_version = self.trie.get_global_version();
        if entry.trie_version == current_global_version {
            if self.storage.needs_tti_worker() {
                self.tti_touch(key, self.default_ttl);
            }
            return Ok(Some(entry.value.clone_ref(py)));
        }

        let valid = validate_dependencies(&self.trie, &entry.dependencies);
        if !valid {
            let _ = self.storage.try_remove_sync(key);
            if let Some(state) = &self.tti_state {
                let _ = state.tx.try_send(WorkerMsg::Delete(key.to_string()));
            }
            return Ok(None);
        }

        Ok(Some(entry.value.clone_ref(py)))
    }

    fn get_or_entry_sync<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<(Option<Py<PyAny>>, bool, bool)> {
        let status = self.storage.try_get_sync(py, key);
        let status = match status {
            Some(s) => s,
            None => return Ok((None, false, false)),
        };

        let (entry, _expires_at) = match status {
            storage::StorageResult::Hit(e, exp) => (e, exp),
            storage::StorageResult::Expired => {
                if let Some(state) = &self.tti_state {
                    let _ = state.tx.try_send(WorkerMsg::Delete(key.to_string()));
                }
                return Ok((None, false, false));
            }
            storage::StorageResult::NotFound => return Ok((None, false, false)),
        };

        let current_global_version = self.trie.get_global_version();
        if entry.trie_version == current_global_version {
            if self.storage.needs_tti_worker() {
                self.tti_touch(key, self.default_ttl);
            }
            return Ok((Some(entry.value.clone_ref(py)), false, true));
        }

        let valid = validate_dependencies(&self.trie, &entry.dependencies);
        if !valid {
            let _ = self.storage.try_remove_sync(key);
            if let Some(state) = &self.tti_state {
                let _ = state.tx.try_send(WorkerMsg::Delete(key.to_string()));
            }
            return Ok((None, false, false));
        }

        Ok((Some(entry.value.clone_ref(py)), false, true))
    }

    fn get_or_entry<'py>(
        &self,
        py: Python<'py>,
        key: String,
    ) -> PyResult<(Option<Py<PyAny>>, bool, bool)> {
        if let Ok(res @ (_, _, true)) = self.get_or_entry_sync(py, &key) {
            return Ok(res);
        }

        let storage = Arc::clone(&self.storage);
        let flights = self.flights.clone();
        let trie = self.trie.clone();
        let flight_timeout = self.flight_timeout;
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();

        py.detach(|| {
            RUNTIME.block_on(async move {
                let (flight, is_leader) = try_enter_flight(&flights, &key);
                if !is_leader {
                    let status = wait_for_flight(&flight, flight_timeout).await;
                    return match status {
                        FlightStatus::Done => {
                            let state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
                            let val = Python::attach(|inner_py| {
                                state.1.as_ref().map(|obj| obj.clone_ref(inner_py))
                            });
                            Ok((val, false, true))
                        }
                        FlightStatus::Error => {
                            Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                                "Thundering herd leader failed",
                            ))
                        }
                        _ => Ok((None, false, false)),
                    };
                }

                let status = storage.get(&key).await;
                let (entry, _expires_at) = match status {
                    storage::StorageResult::Hit(e, exp) => (e, exp),
                    storage::StorageResult::Expired => {
                        if let Some(state) = &tti_state {
                            let _ = state.tx.try_send(WorkerMsg::Delete(key.clone()));
                        }
                        return Ok((None, true, false));
                    }
                    storage::StorageResult::NotFound => {
                        return Ok((None, true, false));
                    }
                };

                let current_global_version = trie.get_global_version();
                let mut valid_hit = false;
                let mut value = None;

                if entry.trie_version == current_global_version {
                    valid_hit = true;
                    value = Some(Python::attach(|inner_py| entry.value.clone_ref(inner_py)));
                } else {
                    let valid = validate_dependencies(&trie, &entry.dependencies);
                    if valid {
                        valid_hit = true;
                        value = Some(Python::attach(|inner_py| entry.value.clone_ref(inner_py)));
                    } else {
                        let _ = storage.remove(&key).await;
                    }
                }

                if valid_hit {
                    if let Some(state) = &tti_state {
                        state.touch(&key, default_ttl);
                    }
                    let val_clone =
                        Python::attach(|inner_py| value.as_ref().map(|v| v.clone_ref(inner_py)));
                    complete_flight(&flights, &key, false, val_clone);
                    return Ok((value, false, true));
                }

                Ok((None, true, false))
            })
        })
    }

    fn get_or_entry_async<'py>(&self, py: Python<'py>, key: String) -> PyResult<Bound<'py, PyAny>> {
        let storage = Arc::clone(&self.storage);
        let flights = self.flights.clone();
        let trie = self.trie.clone();
        let flight_timeout = self.flight_timeout;
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            // First check if it's already in flight
            let (flight, is_leader) = try_enter_flight(&flights, &key);
            if !is_leader {
                // Wait for existing flight
                let status = wait_for_flight(&flight, flight_timeout).await;
                return match status {
                    FlightStatus::Done => {
                        let state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
                        let val =
                            Python::attach(|py| state.1.as_ref().map(|obj| obj.clone_ref(py)));
                        Ok((val, false, true))
                    }
                    FlightStatus::Error => Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                        "Thundering herd leader failed",
                    )),
                    FlightStatus::Pending => unreachable!(),
                };
            }

            // We are the leader, check storage
            let status = storage.get(&key).await;
            let (entry, _expires_at) = match status {
                storage::StorageResult::Hit(e, exp) => (e, exp),
                storage::StorageResult::Expired => {
                    if let Some(state) = &tti_state {
                        let _ = state.tx.try_send(WorkerMsg::Delete(key.clone()));
                    }
                    return Ok((None, true, false));
                }
                storage::StorageResult::NotFound => {
                    // Stay as leader, but return None to indicate we need population
                    return Ok((None, true, false));
                }
            };

            // Found in storage, validate
            let current_global_version = trie.get_global_version();
            let mut valid_hit = false;
            let mut value = None;

            if entry.trie_version == current_global_version {
                valid_hit = true;
                value = Some(Python::attach(|py| entry.value.clone_ref(py)));
            } else {
                let valid = validate_dependencies(&trie, &entry.dependencies);
                if valid {
                    valid_hit = true;
                    value = Some(Python::attach(|py| entry.value.clone_ref(py)));
                } else {
                    let _ = storage.remove(&key).await;
                }
            }

            if valid_hit {
                if let Some(state) = &tti_state {
                    state.touch(&key, default_ttl);
                }
                complete_flight(
                    &flights,
                    &key,
                    false,
                    value.as_ref().map(|v| Python::attach(|py| v.clone_ref(py))),
                );
                return Ok((value, false, true));
            }

            // Not valid (invalidated), keep flight open for leader to repopulate
            Ok((None, true, false))
        })
    }

    fn finish_flight(&self, _py: Python, key: &str, is_error: bool, value: Option<Py<PyAny>>) {
        complete_flight(&self.flights, key, is_error, value);
    }

    fn get<'py>(&self, py: Python<'py>, key: String) -> PyResult<Option<Py<PyAny>>> {
        if let Ok(Some(val)) = self.get_sync(py, &key) {
            return Ok(Some(val));
        }

        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();

        py.detach(|| {
            RUNTIME.block_on(async move {
                let status = storage.get(&key).await;

                let (entry, expires_at) = match status {
                    storage::StorageResult::Hit(e, exp) => (e, exp),
                    storage::StorageResult::Expired => {
                        if let Some(state) = &tti_state {
                            let _ = state.tx.try_send(WorkerMsg::Delete(key.clone()));
                        }
                        return Ok(None);
                    }
                    storage::StorageResult::NotFound => return Ok(None),
                };

                let current_global_version = trie.get_global_version();
                if entry.trie_version == current_global_version {
                    if let Some(state) = &tti_state {
                        state.touch(&key, default_ttl);
                    }
                    return Ok(Some(Python::attach(|inner_py| {
                        entry.value.clone_ref(inner_py)
                    })));
                }

                let valid = validate_dependencies(&trie, &entry.dependencies);
                if !valid {
                    let _ = storage.remove(&key).await;
                    return Ok(None);
                }

                if entry.trie_version < current_global_version {
                    let value_clone = Python::attach(|inner_py| entry.value.clone_ref(inner_py));
                    let deps_clone = entry.dependencies.clone();
                    let updated_entry = Arc::new(storage::CacheEntry {
                        value: value_clone,
                        dependencies: deps_clone,
                        trie_version: current_global_version,
                    });
                    if let Ok(data) = Python::attach(|inner_py| updated_entry.serialize(inner_py)) {
                        let ttl = expires_at.and_then(|exp| exp.checked_sub(utils::now_secs()));
                        if let Some(state) = &tti_state {
                            let _ = state.tx.try_send(WorkerMsg::Update(key.clone(), data, ttl));
                        }
                    }
                } else if let Some(state) = &tti_state {
                    state.touch(&key, default_ttl);
                }

                Ok(Some(Python::attach(|inner_py| {
                    entry.value.clone_ref(inner_py)
                })))
            })
        })
    }

    fn get_async<'py>(&self, py: Python<'py>, key: String) -> PyResult<Bound<'py, PyAny>> {
        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let status = storage.get(&key).await;

            let (entry, expires_at) = match status {
                storage::StorageResult::Hit(e, exp) => (e, exp),
                storage::StorageResult::Expired => {
                    if let Some(state) = &tti_state {
                        let _ = state.tx.try_send(WorkerMsg::Delete(key.clone()));
                    }
                    return Ok(Python::attach(|py| py.None()));
                }
                storage::StorageResult::NotFound => return Ok(Python::attach(|py| py.None())),
            };

            let current_global_version = trie.get_global_version();
            if entry.trie_version == current_global_version {
                if let Some(state) = &tti_state {
                    state.touch(&key, default_ttl);
                }
                return Ok(Python::attach(|py| entry.value.clone_ref(py)));
            }

            let valid = validate_dependencies(&trie, &entry.dependencies);
            if !valid {
                let _ = storage.remove(&key).await;
                return Ok(Python::attach(|py| py.None()));
            }

            if entry.trie_version < current_global_version {
                let value_clone = Python::attach(|py| entry.value.clone_ref(py));
                let deps_clone = entry.dependencies.clone();
                let updated_entry = Arc::new(storage::CacheEntry {
                    value: value_clone,
                    dependencies: deps_clone,
                    trie_version: current_global_version,
                });
                if let Ok(data) = Python::attach(|py| updated_entry.serialize(py)) {
                    let ttl = expires_at.and_then(|exp| exp.checked_sub(utils::now_secs()));
                    if let Some(state) = &tti_state {
                        let _ = state.tx.try_send(WorkerMsg::Update(key.clone(), data, ttl));
                    }
                }
            } else if let Some(state) = &tti_state {
                state.touch(&key, default_ttl);
            }

            Ok(Python::attach(|py| entry.value.clone_ref(py)))
        })
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
        let snapshots = build_dependency_snapshots(&self.trie, dependencies);
        let entry = Arc::new(CacheEntry {
            value,
            dependencies: snapshots,
            trie_version,
        });
        let storage = Arc::clone(&self.storage);
        let final_ttl = ttl.or(self.default_ttl);
        let max_entries = self.max_entries;
        let trie = self.trie.clone();

        // Fast path for local storages
        if let Ok(()) = storage.try_set_sync(py, key.clone(), Arc::clone(&entry), final_ttl) {
            if let Some(max) = max_entries
                && let Some(current) = storage.try_len_sync()
                && current > max
            {
                let to_evict = current - max + (max / 10).max(1);
                if let Some(Ok(evicted)) = storage.try_evict_lru_sync(to_evict) {
                    let _ = evicted;
                }
                trie.prune(0);
            }
            return Ok(());
        }

        py.detach(|| {
            RUNTIME.block_on(async move {
                storage.set(key, entry, final_ttl).await?;

                if let Some(max) = max_entries {
                    let current = storage.len().await;
                    if current > max {
                        let to_evict = current - max + (max / 10).max(1);
                        storage.evict_lru(to_evict).await?;
                        trie.prune(0);
                    }
                }
                Ok(())
            })
        })
    }

    #[pyo3(signature = (key, value, dependencies, ttl=None))]
    fn set_async<'py>(
        &self,
        py: Python<'py>,
        key: String,
        value: Py<PyAny>,
        dependencies: Vec<String>,
        ttl: Option<u64>,
    ) -> PyResult<Bound<'py, PyAny>> {
        for tag in &dependencies {
            validate_tag(tag)?;
        }
        let trie_version = self.trie.get_global_version();
        let snapshots = build_dependency_snapshots(&self.trie, dependencies);
        let entry = Arc::new(CacheEntry {
            value,
            dependencies: snapshots,
            trie_version,
        });
        let storage = Arc::clone(&self.storage);
        let final_ttl = ttl.or(self.default_ttl);
        let max_entries = self.max_entries;
        let trie = self.trie.clone();

        // Fast path: try sync len/evict for local storages
        let sync_evict = max_entries.and_then(|max| {
            storage.try_len_sync().and_then(|current| {
                if current > max {
                    let to_evict = current - max + (max / 10).max(1);
                    storage.try_evict_lru_sync(to_evict)
                } else {
                    None
                }
            })
        });

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            storage.set(key, entry, final_ttl).await?;

            if let Some(evicted) = sync_evict {
                if let Ok(_keys) = evicted {
                    trie.prune(0);
                }
            } else if let Some(max) = max_entries
                && let Some(current) = storage.try_len_sync()
                && current > max
            {
                let to_evict = current - max + (max / 10).max(1);
                storage.evict_lru(to_evict).await?;
                trie.prune(0);
            }
            Ok(Python::attach(|py| py.None()))
        })
    }

    fn invalidate(&self, py: Python, tag: String) -> PyResult<()> {
        validate_tag(&tag)?;
        let new_ver = self.trie.invalidate(&tag);

        // For local bus, publish is a no-op - skip async overhead entirely
        // For remote bus, we need to publish asynchronously
        if self.bus_is_remote {
            let bus = Arc::clone(&self.bus);
            py.detach(|| {
                RUNTIME.spawn(async move {
                    bus.publish(&tag, new_ver).await;
                });
            });
        }
        Ok(())
    }

    fn invalidate_async<'py>(&self, py: Python<'py>, tag: String) -> PyResult<Bound<'py, PyAny>> {
        validate_tag(&tag)?;
        let new_ver = self.trie.invalidate(&tag);
        let bus = Arc::clone(&self.bus);
        let tag_clone = tag.clone();

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            bus.publish(&tag_clone, new_ver).await;
            Ok(Python::attach(|py| py.None()))
        })
    }

    fn clear(&self, py: Python) -> PyResult<()> {
        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();

        if let Ok(()) = storage.try_clear_sync() {
            trie.clear();
            return Ok(());
        }

        py.detach(|| {
            RUNTIME.block_on(async move {
                storage.clear().await?;
                trie.clear();
                Ok(())
            })
        })
    }

    fn clear_async<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            storage.clear().await?;
            trie.clear();
            Ok(Python::attach(|py| py.None()))
        })
    }

    fn request_prune(&self, max_age_secs: u64) {
        if let Some(state) = &self.tti_state {
            let _ = state.tx.try_send(WorkerMsg::Prune(max_age_secs));
        }
    }

    fn prune(&self, max_age_secs: u64) {
        self.trie.prune(max_age_secs);
    }

    fn tag_version(&self, tag: &str) -> u64 {
        self.trie.get_tag_version(tag)
    }

    fn len(&self) -> usize {
        if self.storage.is_sync_storage() {
            self.storage.try_len_sync().unwrap_or(0)
        } else {
            RUNTIME.block_on(self.storage.len())
        }
    }

    fn version(&self) -> String {
        env!("CARGO_PKG_VERSION").to_string()
    }

    fn tti_dropped_messages(&self) -> u64 {
        self.tti_state
            .as_ref()
            .map(|s| s.dropped.load(Ordering::Relaxed))
            .unwrap_or(0)
    }

    fn silent_errors(&self) -> u64 {
        self.silent_errors.load(Ordering::Relaxed)
    }

    fn get_tag_version(&self, tag: String) -> u64 {
        self.trie.get_tag_version(&tag)
    }

    fn flush_metrics(&self, metrics: HashMap<String, f64>) -> PyResult<()> {
        if let Some(state) = &self.tti_state {
            let _ = state.tx.try_send(WorkerMsg::FlushMetrics(metrics));
        }
        Ok(())
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
