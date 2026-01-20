use std::sync::Arc;
use lmdb::{Environment, Database, Transaction, WriteFlags, DatabaseFlags, Cursor};
use crate::storage::{Storage, CacheEntry};
use std::path::Path;
use pyo3::prelude::*;

fn now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub(crate) struct LmdbStorage {
    env: Environment,
    db_main: Database,
    db_ttls: Database,
    db_lru: Database,
}

impl LmdbStorage {
    pub fn new(path: &str) -> PyResult<Self> {
        let path_buf = Path::new(path);
        if !path_buf.exists() {
            std::fs::create_dir_all(path_buf).map_err(|e: std::io::Error| PyErr::new::<pyo3::exceptions::PyIOError, _>(e.to_string()))?;
        }

        let env = Environment::new()
            .set_max_dbs(3)
            .set_map_size(1024 * 1024 * 1024)
            .open(path_buf)
            .map_err(|e: lmdb::Error| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        let db_main = env.create_db(Some("main"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        let db_ttls = env.create_db(Some("ttls"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        let db_lru = env.create_db(Some("lru"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        Ok(Self { env, db_main, db_ttls, db_lru })
    }

    fn is_expired(&self, key: &str) -> bool {
        let Some(txn) = self.env.begin_ro_txn().ok() else {
            return false;
        };
        
        let Ok(data) = txn.get(self.db_ttls, &key) else {
            return false;
        };

        if data.len() != 8 {
            return false;
        }

        let ts = u64::from_le_bytes([data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7]]);
        ts != 0 && now_secs() > ts
    }

    fn touch_lru(&self, key: &str) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let _ = txn.put(self.db_lru, &key, &now_secs().to_le_bytes(), WriteFlags::empty());
            let _ = txn.commit();
        }
    }
}

impl Storage for LmdbStorage {
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>> {
        if self.is_expired(key) {
            self.remove(key);
            return None;
        }

        let txn = self.env.begin_ro_txn().ok()?;
        let data = txn.get(self.db_main, &key).ok()?;

        let result = Python::attach(|py| {
            CacheEntry::deserialize(py, data).ok().map(Arc::new)
        });

        if result.is_some() {
            drop(txn);
            self.touch_lru(key);
        }

        result
    }

    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) {
        let data = Python::attach(|py| {
            entry.serialize(py).ok()
        });

        if let Some(data) = data
            && let Ok(mut txn) = self.env.begin_rw_txn()
        {
            let _ = txn.put(self.db_main, &key, &data, WriteFlags::empty());
            let _ = txn.put(self.db_lru, &key, &now_secs().to_le_bytes(), WriteFlags::empty());
            
            if let Some(t) = ttl {
                let expire_at = now_secs() + t;
                let _ = txn.put(self.db_ttls, &key, &expire_at.to_le_bytes(), WriteFlags::empty());
            } else {
                let _ = txn.del(self.db_ttls, &key, None);
            }
            
            let _ = txn.commit();
        }
    }

    fn touch(&self, key: &str, ttl: u64) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let expire_at = now_secs() + ttl;
            let _ = txn.put(self.db_ttls, &key, &expire_at.to_le_bytes(), WriteFlags::empty());
            let _ = txn.put(self.db_lru, &key, &now_secs().to_le_bytes(), WriteFlags::empty());
            let _ = txn.commit();
        }
    }

    fn remove(&self, key: &str) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let _ = txn.del(self.db_main, &key, None);
            let _ = txn.del(self.db_ttls, &key, None);
            let _ = txn.del(self.db_lru, &key, None);
            let _ = txn.commit();
        }
    }

    fn clear(&self) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let _ = txn.clear_db(self.db_main);
            let _ = txn.clear_db(self.db_ttls);
            let _ = txn.clear_db(self.db_lru);
            let _ = txn.commit();
        }
    }

    fn len(&self) -> usize {
        if let Ok(txn) = self.env.begin_ro_txn()
            && let Ok(mut cursor) = txn.open_ro_cursor(self.db_main)
        {
            return cursor.iter().count();
        }
        0
    }

    fn evict_lru(&self, count: usize) -> Vec<String> {
        let mut entries: Vec<(String, u64)> = Vec::new();
        
        if let Ok(txn) = self.env.begin_ro_txn()
            && let Ok(mut cursor) = txn.open_ro_cursor(self.db_lru)
        {
            for (k, v) in cursor.iter() {
                if let Ok(key) = std::str::from_utf8(k)
                    && v.len() == 8
                {
                    let ts = u64::from_le_bytes([v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7]]);
                    entries.push((key.to_string(), ts));
                }
            }
        }

        entries.sort_by_key(|(_, ts)| *ts);

        let to_evict: Vec<String> = entries.into_iter()
            .take(count)
            .map(|(k, _)| k)
            .collect();

        for key in &to_evict {
            self.remove(key);
        }

        to_evict
    }
}


