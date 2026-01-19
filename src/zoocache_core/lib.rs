mod flight;
mod storage;
mod trie;

use dashmap::DashMap;
use pyo3::prelude::*;
use pyo3::types::PyAny;
use sha2::{Digest, Sha256};
use std::sync::Arc;

use flight::{complete_flight, try_enter_flight, wait_for_flight, Flight, FlightStatus};
use storage::{CacheEntry, InMemoryStorage, Storage};
use trie::{build_dependency_snapshots, validate_dependencies, PrefixTrie};

#[pyclass]
struct Core {
    storage: Arc<dyn Storage>,
    trie: PrefixTrie,
    flights: DashMap<String, Arc<Flight>>,
}

#[pymethods]
impl Core {
    #[new]
    fn new() -> Self {
        Self {
            storage: Arc::new(InMemoryStorage::new()),
            trie: PrefixTrie::new(),
            flights: DashMap::new(),
        }
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

    #[pyo3(signature = (key, is_error, value=None))]
    fn finish_flight(&self, key: &str, is_error: bool, value: Option<Py<PyAny>>) {
        complete_flight(&self.flights, key, is_error, value);
    }

    fn get(&self, py: Python, key: &str) -> PyResult<Option<Py<PyAny>>> {
        let entry = match self.storage.get(key) {
            Some(e) => e,
            None => return Ok(None),
        };

        if !validate_dependencies(&self.trie, &entry.dependencies) {
            self.storage.remove(key);
            return Ok(None);
        }

        Ok(Some(entry.value.clone_ref(py)))
    }

    fn set(&self, key: String, value: Py<PyAny>, dependencies: Vec<String>) {
        let snapshots = build_dependency_snapshots(&self.trie, dependencies);
        let entry = Arc::new(CacheEntry {
            value,
            dependencies: snapshots,
        });
        self.storage.set(key, entry);
    }

    fn invalidate(&self, tag: &str) {
        self.trie.invalidate(tag);
    }

    fn clear(&self) {
        self.storage.clear();
        self.trie.clear();
    }

    fn version(&self) -> String {
        env!("CARGO_PKG_VERSION").to_string()
    }
}

#[pyfunction]
#[pyo3(signature = (data, prefix=None))]
fn hash_key(data: &[u8], prefix: Option<&str>) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let digest = hasher.finalize();
    let hex = format!("{:x}", digest);
    match prefix {
        Some(p) => format!("{}:{}", p, &hex[..16]),
        None => hex[..16].to_string(),
    }
}

#[pymodule]
fn _zoocache(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Core>()?;
    m.add_function(wrap_pyfunction!(hash_key, m)?)?;
    Ok(())
}
