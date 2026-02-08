use crate::utils::now_secs;
use dashmap::DashMap;
use std::sync::Arc;

use super::{CacheEntry, Storage};

pub(crate) struct InMemoryStorage {
    map: DashMap<String, (Arc<CacheEntry>, Option<u64>, u64)>,
}

impl InMemoryStorage {
    pub fn new() -> Self {
        Self {
            map: DashMap::new(),
        }
    }
}

impl Storage for InMemoryStorage {
    #[inline]
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>> {
        let mut entry = self.map.get_mut(key)?;
        let (val, expires_at, last_accessed) = entry.value_mut();

        if expires_at.is_some_and(|expires| now_secs() > expires) {
            drop(entry);
            self.map.remove(key);
            return None;
        }

        *last_accessed = now_secs();
        Some(Arc::clone(val))
    }

    #[inline]
    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) {
        let expires_at = ttl.map(|t| now_secs() + t);
        let last_accessed = now_secs();
        self.map.insert(key, (entry, expires_at, last_accessed));
    }

    #[inline]
    fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) {
        for (key, ttl) in updates {
            if let Some(mut entry) = self.map.get_mut(&key) {
                if let Some(t) = ttl {
                    entry.1 = Some(now_secs() + t);
                }
                entry.2 = now_secs();
            }
        }
    }

    #[inline]
    fn remove(&self, key: &str) {
        self.map.remove(key);
    }

    fn clear(&self) {
        self.map.clear();
    }

    fn len(&self) -> usize {
        self.map.len()
    }

    fn evict_lru(&self, count: usize) -> Vec<String> {
        let mut entries: Vec<(String, u64)> = self
            .map
            .iter()
            .map(|e| (e.key().clone(), e.value().2))
            .collect();

        entries.sort_by_key(|(_, ts)| *ts);

        let to_evict: Vec<String> = entries.into_iter().take(count).map(|(k, _)| k).collect();

        for key in &to_evict {
            self.map.remove(key);
        }

        to_evict
    }
}
