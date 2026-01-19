use dashmap::DashMap;
use std::sync::Arc;

use super::{CacheEntry, Storage};

pub(crate) struct InMemoryStorage {
    map: DashMap<String, (Arc<CacheEntry>, Option<u64>)>,
}

impl InMemoryStorage {
    pub fn new() -> Self {
        Self { map: DashMap::new() }
    }
}

impl Storage for InMemoryStorage {
    #[inline]
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>> {
        let entry = self.map.get(key)?;
        let (val, expires_at) = entry.value();
        
        if let Some(expires) = expires_at {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();
            if now > *expires {
                drop(entry);
                self.map.remove(key);
                return None;
            }
        }
        
        Some(Arc::clone(val))
    }

    #[inline]
    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) {
        let expires_at = ttl.map(|t| {
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() + t
        });
        self.map.insert(key, (entry, expires_at));
    }

    #[inline]
    fn touch(&self, key: &str, ttl: u64) {
        if let Some(mut entry) = self.map.get_mut(key) {
            let expires_at = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() + ttl;
            entry.1 = Some(expires_at);
        }
    }

    #[inline]
    fn remove(&self, key: &str) {
        self.map.remove(key);
    }

    fn clear(&self) {
        self.map.clear();
    }
}
