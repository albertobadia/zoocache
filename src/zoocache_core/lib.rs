mod bus;
mod flight;
mod storage;
mod trie;

use dashmap::DashMap;
use pyo3::prelude::*;
use pyo3::types::PyAny;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::Arc;

use bus::{InvalidateBus, LocalBus, RedisPubSubBus};
use flight::{complete_flight, try_enter_flight, wait_for_flight, Flight, FlightStatus};
use storage::{CacheEntry, InMemoryStorage, LmdbStorage, RedisStorage, Storage};
use trie::{build_dependency_snapshots, validate_dependencies, PrefixTrie};
use std::sync::mpsc::{self, Sender};
use std::thread;
use std::time::{Duration, Instant};

#[pyclass]
struct Core {
    storage: Arc<dyn Storage>,
    bus: Arc<dyn InvalidateBus>,
    trie: PrefixTrie,
    flights: DashMap<String, Arc<Flight>>,
    default_ttl: Option<u64>,
    max_entries: Option<usize>,
    #[allow(dead_code)]
    read_extend_ttl: bool,
    tti_tx: Option<Sender<(String, u64)>>,
}

#[pymethods]
impl Core {
    #[new]
    #[pyo3(signature = (storage_url=None, bus_url=None, prefix=None, default_ttl=None, read_extend_ttl=true, max_entries=None))]
    fn new(storage_url: Option<&str>, bus_url: Option<&str>, prefix: Option<&str>, default_ttl: Option<u64>, read_extend_ttl: bool, max_entries: Option<usize>) -> PyResult<Self> {
        let storage: Arc<dyn Storage> = match storage_url {
            Some(url) if url.starts_with("redis://") => Arc::new(
                RedisStorage::new(url, prefix)
                    .map_err(|e| PyErr::new::<pyo3::exceptions::PyConnectionError, _>(e.to_string()))?,
            ),
            Some(url) if url.starts_with("lmdb://") => {
                let path = &url[7..];
                Arc::new(
                    LmdbStorage::new(path)
                        .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?,
                )
            }
            Some(url) => {
                return Err(PyErr::new::<pyo3::exceptions::PyValueError, _>(
                    format!("Unsupported storage scheme: {}", url),
                ))
            }
            None => Arc::new(InMemoryStorage::new()),
        };

        let trie = PrefixTrie::new();

        let bus: Arc<dyn InvalidateBus> = match bus_url {
            Some(url) => {
                let channel = prefix.map(|p| format!("{}:invalidate", p));
                let r_bus = Arc::new(
                    RedisPubSubBus::new(url, channel.as_deref())
                        .map_err(|e| PyErr::new::<pyo3::exceptions::PyConnectionError, _>(e.to_string()))?,
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
        if default_ttl.is_some() && read_extend_ttl {
            let (tx, rx) = mpsc::channel::<(String, u64)>();
            let storage_worker = Arc::clone(&storage);
            
            thread::spawn(move || {
                let mut last_touches: HashMap<String, Instant> = HashMap::new();
                while let Ok((key, ttl)) = rx.recv() {
                    let now = Instant::now();
                    if last_touches.get(&key).is_some_and(|&last| now.duration_since(last) < Duration::from_secs(60)) {
                        continue;
                    }
                    
                    storage_worker.touch(&key, ttl);
                    last_touches.insert(key, now);
                    
                    // Periodic cleanup of last_touches to avoid memory leak
                    if last_touches.len() > 10000 {
                         last_touches.retain(|_, &mut instant| now.duration_since(instant) < Duration::from_secs(300));
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
            read_extend_ttl,
            tti_tx,
        })
    }

    fn get_or_entry(&self, py: Python, key: &str) -> PyResult<(Option<Py<PyAny>>, bool)> {
        if let Some(res) = self.get(py, key)? {
            return Ok((Some(res), false));
        }

        let (flight, is_leader) = try_enter_flight(&self.flights, key);

        if is_leader {
            return Ok((None, true));
        }

        let status = py.detach(|| wait_for_flight(&flight));

        match status {
            FlightStatus::Done => {
                let state = flight.state.lock().unwrap();
                Ok((state.1.as_ref().map(|obj| obj.clone_ref(py)), false))
            }
            FlightStatus::Error => Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                "Thundering herd leader failed",
            )),
            FlightStatus::Pending => unreachable!(),
        }
    }

    #[allow(clippy::type_complexity)]
    fn get_or_entry_async(&self, py: Python, key: &str) -> PyResult<(Option<Py<PyAny>>, bool, Option<Py<PyAny>>)> {
        if let Some(res) = self.get(py, key)? {
            return Ok((Some(res), false, None));
        }

        let (flight, is_leader) = try_enter_flight(&self.flights, key);

        if is_leader {
            return Ok((None, true, None));
        }

        // Return the existing future if it exists
        let fut = flight.py_future.lock().unwrap().as_ref().map(|f| f.clone_ref(py));
        Ok((None, false, fut))
    }

    fn register_flight_future(&self, key: &str, future: Py<PyAny>) {
        if let Some(flight) = self.flights.get(key) {
            let mut fut_guard = flight.py_future.lock().unwrap();
            *fut_guard = Some(future);
        }
    }

    #[pyo3(signature = (key, is_error, value=None))]
    fn finish_flight(&self, py: Python, key: &str, is_error: bool, value: Option<Py<PyAny>>) -> Option<Py<PyAny>> {
        py.detach(|| complete_flight(&self.flights, key, is_error, value))
    }

    fn get(&self, py: Python, key: &str) -> PyResult<Option<Py<PyAny>>> {
        let storage = Arc::clone(&self.storage);
        let entry = py.detach(|| storage.get(key));

        let entry = match entry {
            Some(e) => e,
            None => return Ok(None),
        };

        let global_version = self.trie.get_global_version();

        // Short-circuit: O(1) validation if no invalidations occurred globally
        if entry.trie_version == global_version {
            return Ok(Some(entry.value.clone_ref(py)));
        }

        let valid = py.detach(|| validate_dependencies(&self.trie, &entry.dependencies));
        if !valid {
            let storage = Arc::clone(&self.storage);
            py.detach(|| storage.remove(key));
            return Ok(None);
        }

        // Lazy Update: Re-stamp the entry with the current global version
        // so that the next hit can use the O(1) short-circuit.
        let current_global_version = self.trie.get_global_version();
        if entry.trie_version < current_global_version {
            let storage = Arc::clone(&self.storage);
            let updated_entry = Arc::new(crate::storage::CacheEntry {
                value: entry.value.clone_ref(py),
                dependencies: entry.dependencies.clone(),
                trie_version: current_global_version,
            });
            let key_str = key.to_string();
            py.detach(move || storage.set(key_str, updated_entry, None));
        }

        // TTI: Deferred refresh
        if let (Some(tx), Some(ttl)) = (&self.tti_tx, self.default_ttl) {
            let _ = tx.send((key.to_string(), ttl));
        }

        Ok(Some(entry.value.clone_ref(py)))
    }

    #[pyo3(signature = (key, value, dependencies, ttl=None))]
    fn set(&self, py: Python, key: String, value: Py<PyAny>, dependencies: Vec<String>, ttl: Option<u64>) {
        let trie_version = self.trie.get_global_version();
        let snapshots = py.detach(|| build_dependency_snapshots(&self.trie, dependencies));
        let entry = Arc::new(CacheEntry {
            value,
            dependencies: snapshots,
            trie_version,
        });
        let storage = Arc::clone(&self.storage);
        let final_ttl = ttl.or(self.default_ttl);
        
        py.detach(|| {
            storage.set(key, entry, final_ttl);
            
            if let Some(max) = self.max_entries {
                let current = storage.len();
                if current > max {
                    let to_evict = current - max + (max / 10).max(1);
                    storage.evict_lru(to_evict);
                    self.trie.prune(0);
                }
            }
        });
    }

    fn invalidate(&self, py: Python, tag: &str) {
        py.detach(|| {
            let new_ver = self.trie.invalidate(tag);
            self.bus.publish(tag, new_ver);
        });
    }

    fn clear(&self, py: Python) {
        let storage = Arc::clone(&self.storage);
        py.detach(|| {
            storage.clear();
            self.trie.clear();
        });
    }

    fn prune(&self, max_age_secs: u64) {
        self.trie.prune(max_age_secs);
    }

    fn tag_version(&self, tag: &str) -> u64 {
        self.trie.get_tag_version(tag)
    }

    fn version(&self) -> String {
        env!("CARGO_PKG_VERSION").to_string()
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
    Ok(())
}
