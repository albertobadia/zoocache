use crate::utils::now_secs;
use dashmap::DashMap;
use pyo3::prelude::*;
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

    fn set_internal(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()> {
        let expires_at = ttl.map(|t| now_secs() + t);
        let last_accessed = now_secs();
        self.map.insert(key, (entry, expires_at, last_accessed));
        Ok(())
    }
}

use async_trait::async_trait;

#[async_trait]
impl Storage for InMemoryStorage {
    #[inline]
    async fn get(&self, key: &str) -> super::StorageResult {
        Python::attach(|py| {
            self.try_get_sync(py, key)
                .unwrap_or(super::StorageResult::NotFound)
        })
    }

    fn try_get_sync(&self, _py: Python, key: &str) -> Option<super::StorageResult> {
        let mut entry = self.map.get_mut(key)?;
        let (val, expires_at, last_accessed) = entry.value_mut();

        if expires_at.is_some_and(|expires| now_secs() > expires) {
            return Some(super::StorageResult::Expired);
        }

        *last_accessed = now_secs();
        Some(super::StorageResult::Hit(Arc::clone(val), *expires_at))
    }

    async fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()> {
        self.set_internal(key, entry, ttl)
    }

    #[inline]
    async fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()> {
        for (key, ttl) in updates {
            if let Some(mut entry) = self.map.get_mut(&key) {
                if let Some(t) = ttl {
                    entry.1 = Some(now_secs() + t);
                }
                entry.2 = now_secs();
            }
        }
        Ok(())
    }

    #[inline]
    async fn remove(&self, key: &str) -> PyResult<()> {
        self.map.remove(key);
        Ok(())
    }

    async fn clear(&self) -> PyResult<()> {
        self.map.clear();
        Ok(())
    }

    fn len(&self) -> usize {
        self.map.len()
    }

    async fn evict_lru(&self, count: usize) -> PyResult<Vec<String>> {
        let mut entries: Vec<(String, u64)> = self
            .map
            .iter()
            .map(|e| (e.key().clone(), e.value().2))
            .collect();

        if entries.is_empty() || count == 0 {
            return Ok(Vec::new());
        }

        let count = count.min(entries.len());
        entries.select_nth_unstable_by_key(count - 1, |(_, ts)| *ts);

        let to_evict: Vec<String> = entries.drain(..count).map(|(k, _)| k).collect();
        for key in &to_evict {
            self.map.remove(key);
        }

        Ok(to_evict)
    }

    async fn scan_keys(&self, prefix: &str) -> Vec<(String, Option<u64>)> {
        let mut results = Vec::new();
        for entry in self.map.iter() {
            let key = entry.key();
            if key.starts_with(prefix) {
                let (_, expires_at, _) = entry.value();
                let is_expired = expires_at.is_some_and(|expires| now_secs() > expires);
                if !is_expired {
                    results.push((key.clone(), *expires_at));
                }
            }
        }
        results
    }

    fn try_set_sync(
        &self,
        _py: Python,
        key: String,
        entry: Arc<CacheEntry>,
        ttl: Option<u64>,
    ) -> PyResult<()> {
        self.set_internal(key, entry, ttl)
    }

    fn try_remove_sync(&self, key: &str) -> PyResult<()> {
        self.map.remove(key);
        Ok(())
    }

    fn try_clear_sync(&self) -> PyResult<()> {
        self.map.clear();
        Ok(())
    }
}
