use std::sync::Arc;
use lmdb::{Environment, Database, Transaction, WriteFlags, DatabaseFlags};
use crate::storage::{Storage, CacheEntry};
use std::path::Path;
use pyo3::prelude::*;

pub(crate) struct LmdbStorage {
    env: Environment,
    db_main: Database,
    db_ttls: Database,
}

impl LmdbStorage {
    pub fn new(path: &str) -> PyResult<Self> {
        let path_buf = Path::new(path);
        if !path_buf.exists() {
            std::fs::create_dir_all(path_buf).map_err(|e: std::io::Error| PyErr::new::<pyo3::exceptions::PyIOError, _>(e.to_string()))?;
        }

        let env = Environment::new()
            .set_max_dbs(2)
            .set_map_size(1024 * 1024 * 1024) // 1GB default
            .open(path_buf)
            .map_err(|e: lmdb::Error| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        let db_main = env.create_db(Some("main"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        let db_ttls = env.create_db(Some("ttls"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        Ok(Self { env, db_main, db_ttls })
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

        let ts = u64::from_le_bytes(data.try_into().unwrap());
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        ts != 0 && now > ts
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

        Python::attach(|py| {
            CacheEntry::deserialize(py, data).ok().map(Arc::new)
        })
    }

    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) {
        let data = Python::attach(|py| {
            entry.serialize(py).ok()
        });

        if let Some(data) = data
            && let Ok(mut txn) = self.env.begin_rw_txn()
        {
            let _ = txn.put(self.db_main, &key, &data, WriteFlags::empty());
            
            if let Some(t) = ttl {
                let expire_at = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs() + t;
                let _ = txn.put(self.db_ttls, &key, &expire_at.to_le_bytes(), WriteFlags::empty());
            } else {
                let _ = txn.del(self.db_ttls, &key, None);
            }
            
            let _ = txn.commit();
        }
    }

    fn touch(&self, key: &str, ttl: u64) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let expire_at = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() + ttl;
            let _ = txn.put(self.db_ttls, &key, &expire_at.to_le_bytes(), WriteFlags::empty());
            let _ = txn.commit();
        }
    }

    fn remove(&self, key: &str) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let _ = txn.del(self.db_main, &key, None);
            let _ = txn.del(self.db_ttls, &key, None);
            let _ = txn.commit();
        }
    }

    fn clear(&self) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let _ = txn.clear_db(self.db_main);
            let _ = txn.clear_db(self.db_ttls);
            let _ = txn.commit();
        }
    }
}
