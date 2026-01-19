use dashmap::DashMap;
use std::sync::Arc;

use super::{CacheEntry, Storage};

pub(crate) struct InMemoryStorage {
    map: DashMap<String, Arc<CacheEntry>>,
}

impl InMemoryStorage {
    pub fn new() -> Self {
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
