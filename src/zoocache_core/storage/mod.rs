mod memory;

pub(crate) use memory::InMemoryStorage;

use pyo3::prelude::*;
use pyo3::types::PyAny;
use std::collections::HashMap;
use std::sync::Arc;

use crate::trie::DepSnapshot;

pub(crate) struct CacheEntry {
    pub value: Py<PyAny>,
    pub dependencies: HashMap<String, DepSnapshot>,
}

pub(crate) trait Storage: Send + Sync {
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>>;
    fn set(&self, key: String, entry: Arc<CacheEntry>);
    fn remove(&self, key: &str);
    fn clear(&self);
}
