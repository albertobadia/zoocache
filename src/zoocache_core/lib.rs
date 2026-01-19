use dashmap::DashMap;
use pyo3::prelude::*;
use pyo3::types::PyAny;
use sha2::{Sha256, Digest};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Condvar, Mutex};

#[derive(Default)]
struct TrieNode {
    version: AtomicU64,
    children: DashMap<String, Arc<TrieNode>>,
}

struct PrefixTrie {
    root: Arc<TrieNode>,
}

impl PrefixTrie {
    fn new() -> Self {
        Self {
            root: Arc::new(TrieNode::default()),
        }
    }

    #[inline]
    fn invalidate(&self, tag: &str) {
        let mut current = Arc::clone(&self.root);
        for part in tag.split(':') {
            let next = {
                let entry = current
                    .children
                    .entry(part.to_string())
                    .or_insert_with(|| Arc::new(TrieNode::default()));
                Arc::clone(entry.value())
            };
            current = next;
        }
        current.version.fetch_add(1, Ordering::SeqCst);
    }

    #[inline]
    fn get_path_versions(&self, parts: &[String]) -> Vec<u64> {
        let mut versions = Vec::with_capacity(parts.len() + 1);
        let mut current = Arc::clone(&self.root);
        versions.push(current.version.load(Ordering::SeqCst));

        for part in parts {
            let next = match current.children.get(part) {
                Some(n) => Arc::clone(n.value()),
                None => break,
            };
            current = next;
            versions.push(current.version.load(Ordering::SeqCst));
        }

        while versions.len() <= parts.len() {
            versions.push(0);
        }
        versions
    }

    #[inline]
    fn is_valid_path(&self, parts: &[String], snapshot_versions: &[u64]) -> bool {
        let mut current = Arc::clone(&self.root);

        if current.version.load(Ordering::SeqCst) > snapshot_versions[0] {
            return false;
        }

        for (i, part) in parts.iter().enumerate() {
            let next = match current.children.get(part) {
                Some(n) => Arc::clone(n.value()),
                None => return true,
            };
            current = next;
            if current.version.load(Ordering::SeqCst) > snapshot_versions[i + 1] {
                return false;
            }
        }
        true
    }

    fn clear(&self) {
        self.root.children.clear();
        self.root.version.store(0, Ordering::SeqCst);
    }
}

struct DepSnapshot {
    parts: Vec<String>,
    path_versions: Vec<u64>,
}

struct CacheEntry {
    value: Py<PyAny>,
    dependencies: HashMap<String, DepSnapshot>,
}

trait Storage: Send + Sync {
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>>;
    fn set(&self, key: String, entry: Arc<CacheEntry>);
    fn remove(&self, key: &str);
    fn clear(&self);
}

struct InMemoryStorage {
    map: DashMap<String, Arc<CacheEntry>>,
}

impl InMemoryStorage {
    fn new() -> Self {
        Self { map: DashMap::new() }
    }
}

impl Storage for InMemoryStorage {
    #[inline]
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>> {
        self.map.get(key).map(|r| Arc::clone(r.value()))
    }

    #[inline]
    fn set(&self, key: String, entry: Arc<CacheEntry>) {
        self.map.insert(key, entry);
    }

    #[inline]
    fn remove(&self, key: &str) {
        self.map.remove(key);
    }

    fn clear(&self) {
        self.map.clear();
    }
}

#[derive(Default, Clone, Copy, PartialEq, Eq)]
enum FlightStatus {
    #[default]
    Pending,
    Done,
    Error,
}

struct Flight {
    state: Mutex<(FlightStatus, Option<Py<PyAny>>)>,
    condvar: Condvar,
}

#[inline]
fn validate_dependencies(trie: &PrefixTrie, deps: &HashMap<String, DepSnapshot>) -> bool {
    for snapshot in deps.values() {
        if !trie.is_valid_path(&snapshot.parts, &snapshot.path_versions) {
            return false;
        }
    }
    true
}

#[inline]
fn build_dependency_snapshots(
    trie: &PrefixTrie,
    dependencies: Vec<String>,
) -> HashMap<String, DepSnapshot> {
    let mut snapshots = HashMap::with_capacity(dependencies.len());
    for tag in dependencies {
        let parts: Vec<String> = tag.split(':').map(|s| s.to_string()).collect();
        let path_versions = trie.get_path_versions(&parts);
        snapshots.insert(tag, DepSnapshot { parts, path_versions });
    }
    snapshots
}

#[inline]
fn try_enter_flight(
    flights: &DashMap<String, Arc<Flight>>,
    key: &str,
) -> (Arc<Flight>, bool) {
    let mut is_leader = false;
    let flight = flights.entry(key.to_string()).or_insert_with(|| {
        is_leader = true;
        Arc::new(Flight {
            state: Mutex::new((FlightStatus::Pending, None)),
            condvar: Condvar::new(),
        })
    });
    (Arc::clone(flight.value()), is_leader)
}

fn complete_flight(
    flights: &DashMap<String, Arc<Flight>>,
    key: &str,
    is_error: bool,
    value: Option<Py<PyAny>>,
) {
    if let Some((_, flight)) = flights.remove(key) {
        let mut state = flight.state.lock().unwrap();
        state.0 = if is_error { FlightStatus::Error } else { FlightStatus::Done };
        state.1 = value;
        flight.condvar.notify_all();
    }
}

fn wait_for_flight(flight: &Flight) -> FlightStatus {
    let mut state = flight.state.lock().unwrap();
    while state.0 == FlightStatus::Pending {
        state = flight.condvar.wait(state).unwrap();
    }
    state.0
}

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

// COVERAGE EXCLUSION: Module initialization requires Python interpreter.
#[pymodule]
fn _zoocache(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Core>()?;
    m.add_function(wrap_pyfunction!(hash_key, m)?)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trie_basic() {
        let trie = PrefixTrie::new();
        let parts = vec!["user".to_string(), "1".to_string()];
        assert_eq!(trie.get_path_versions(&parts), vec![0, 0, 0]);

        trie.invalidate("user:1");
        assert_eq!(trie.get_path_versions(&parts), vec![0, 0, 1]);

        trie.invalidate("user:1");
        assert_eq!(trie.get_path_versions(&parts), vec![0, 0, 2]);
    }

    #[test]
    fn test_trie_prefix_invalidation() {
        let trie = PrefixTrie::new();
        let tag_parts = vec![
            "org".to_string(),
            "1".to_string(),
            "user".to_string(),
            "1".to_string(),
        ];

        let v0 = trie.get_path_versions(&tag_parts);
        assert!(trie.is_valid_path(&tag_parts, &v0));

        trie.invalidate("org:1:user:1");
        let v1 = trie.get_path_versions(&tag_parts);
        assert!(!trie.is_valid_path(&tag_parts, &v0));
        assert!(trie.is_valid_path(&tag_parts, &v1));

        trie.invalidate("org:1");
        assert!(!trie.is_valid_path(&tag_parts, &v1));
    }

    #[test]
    fn test_trie_deep_hierarchy() {
        let trie = PrefixTrie::new();
        let deep_tag = "a:b:c:d:e:f:g:h:i:j";
        let parts: Vec<String> = deep_tag.split(':').map(|s| s.to_string()).collect();

        let path_v0 = trie.get_path_versions(&parts);
        trie.invalidate(deep_tag);
        let path_v1 = trie.get_path_versions(&parts);

        assert!(!trie.is_valid_path(&parts, &path_v0));
        assert!(trie.is_valid_path(&parts, &path_v1));

        trie.invalidate("a:b:c");
        assert!(!trie.is_valid_path(&parts, &path_v1));
    }

    #[test]
    fn test_trie_clear() {
        let trie = PrefixTrie::new();
        trie.invalidate("user:1");
        trie.invalidate("user:2");

        let parts = vec!["user".to_string(), "1".to_string()];
        let v1 = trie.get_path_versions(&parts);
        assert_eq!(v1[2], 1);

        trie.clear();
        let v2 = trie.get_path_versions(&parts);
        assert_eq!(v2, vec![0, 0, 0]);
    }

    #[test]
    fn test_validate_dependencies_empty() {
        let trie = PrefixTrie::new();
        let deps = HashMap::new();
        assert!(validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_validate_dependencies_valid() {
        let trie = PrefixTrie::new();
        let deps = build_dependency_snapshots(&trie, vec!["user:1".to_string()]);
        assert!(validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_validate_dependencies_invalidated() {
        let trie = PrefixTrie::new();
        let deps = build_dependency_snapshots(&trie, vec!["user:1".to_string()]);
        trie.invalidate("user:1");
        assert!(!validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_validate_dependencies_parent_invalidated() {
        let trie = PrefixTrie::new();
        let deps = build_dependency_snapshots(&trie, vec!["org:1:user:5".to_string()]);
        trie.invalidate("org:1");
        assert!(!validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_build_dependency_snapshots() {
        let trie = PrefixTrie::new();
        trie.invalidate("user:1");

        let snapshots = build_dependency_snapshots(&trie, vec!["user:1".to_string(), "user:2".to_string()]);

        assert_eq!(snapshots.len(), 2);
        assert_eq!(snapshots["user:1"].parts, vec!["user", "1"]);
        assert_eq!(snapshots["user:1"].path_versions, vec![0, 0, 1]);
        assert_eq!(snapshots["user:2"].path_versions, vec![0, 0, 0]);
    }

    #[test]
    fn test_flight_lifecycle() {
        let flights: DashMap<String, Arc<Flight>> = DashMap::new();

        let (flight1, is_leader1) = try_enter_flight(&flights, "key1");
        assert!(is_leader1);

        let (flight2, is_leader2) = try_enter_flight(&flights, "key1");
        assert!(!is_leader2);
        assert!(Arc::ptr_eq(&flight1, &flight2));

        complete_flight(&flights, "key1", false, None);
        assert!(flights.get("key1").is_none());
    }
}
