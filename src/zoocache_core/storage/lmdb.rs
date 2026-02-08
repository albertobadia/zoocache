use crate::storage::{CacheEntry, Storage};
use crate::utils::now_secs;
use lmdb::{Cursor, Database, DatabaseFlags, Environment, Transaction, WriteFlags};
use pyo3::prelude::*;
use std::path::Path;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

pub(crate) struct LmdbStorage {
    env: Environment,
    db_main: Database,
    db_ttls: Database,
    db_lru: Database,
    db_meta: Database,
    count: AtomicUsize,
}

impl LmdbStorage {
    pub fn new(path: &str) -> PyResult<Self> {
        let path_buf = Path::new(path);
        if !path_buf.exists() {
            std::fs::create_dir_all(path_buf).map_err(|e: std::io::Error| {
                PyErr::new::<pyo3::exceptions::PyIOError, _>(e.to_string())
            })?;
        }

        let env = Environment::new()
            .set_max_dbs(4)
            .set_map_size(1024 * 1024 * 1024)
            .open(path_buf)
            .map_err(|e: lmdb::Error| {
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
            })?;

        let db_main = env
            .create_db(Some("main"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| {
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
            })?;

        let db_ttls = env
            .create_db(Some("ttls"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| {
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
            })?;

        let db_lru =
            env.create_db(Some("lru"), DatabaseFlags::empty())
                .map_err(|e: lmdb::Error| {
                    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
                })?;

        let db_meta = env
            .create_db(Some("meta"), DatabaseFlags::empty())
            .map_err(|e: lmdb::Error| {
                PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
            })?;

        let count = (|| {
            let txn = env.begin_ro_txn().ok()?;
            let data = txn.get(db_meta, &"count").ok()?;
            let bytes: [u8; 8] = data.try_into().ok()?;
            Some(u64::from_le_bytes(bytes))
        })()
        .unwrap_or(0) as usize;

        Ok(Self {
            env,
            db_main,
            db_ttls,
            db_lru,
            db_meta,
            count: AtomicUsize::new(count),
        })
    }
}

impl Storage for LmdbStorage {
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>> {
        let txn = self.env.begin_ro_txn().ok()?;

        if txn
            .get(self.db_ttls, &key)
            .ok()
            .and_then(|d| d.try_into().ok().map(u64::from_le_bytes))
            .filter(|&ts| ts != 0 && now_secs() > ts)
            .is_some()
        {
            drop(txn);
            self.remove(key);
            return None;
        }

        let data = txn.get(self.db_main, &key).ok()?;
        Python::attach(|py| CacheEntry::deserialize(py, data).ok().map(Arc::new))
    }

    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) {
        let data = Python::attach(|py| entry.serialize(py).ok());
        if data.is_none() {
            return;
        }
        let data = data.unwrap();

        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let is_new = txn.get(self.db_main, &key).is_err();

            let _ = txn.put(self.db_main, &key, &data, WriteFlags::empty());
            let _ = txn.put(
                self.db_lru,
                &key,
                &now_secs().to_le_bytes(),
                WriteFlags::empty(),
            );

            if let Some(t) = ttl {
                let expire_at = now_secs() + t;
                let _ = txn.put(
                    self.db_ttls,
                    &key,
                    &expire_at.to_le_bytes(),
                    WriteFlags::empty(),
                );
            } else {
                let _ = txn.del(self.db_ttls, &key, None);
            }

            if is_new {
                let new_count = self.count.fetch_add(1, Ordering::SeqCst) + 1;
                let _ = txn.put(
                    self.db_meta,
                    &"count",
                    &(new_count as u64).to_le_bytes(),
                    WriteFlags::empty(),
                );
            }

            let _ = txn.commit();
        }
    }

    fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let now = now_secs().to_le_bytes();
            for (key, ttl) in updates {
                let _ = txn.put(self.db_lru, &key, &now, WriteFlags::empty());
                if let Some(t) = ttl {
                    let expire_at = now_secs() + t;
                    let _ = txn.put(
                        self.db_ttls,
                        &key,
                        &expire_at.to_le_bytes(),
                        WriteFlags::empty(),
                    );
                }
            }
            let _ = txn.commit();
        }
    }

    fn remove(&self, key: &str) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let existed = txn.get(self.db_main, &key).is_ok();
            if existed {
                let _ = txn.del(self.db_main, &key, None);
                let _ = txn.del(self.db_ttls, &key, None);
                let _ = txn.del(self.db_lru, &key, None);

                let new_count = self.count.fetch_sub(1, Ordering::SeqCst) - 1;
                let _ = txn.put(
                    self.db_meta,
                    &"count",
                    &(new_count as u64).to_le_bytes(),
                    WriteFlags::empty(),
                );
                let _ = txn.commit();
            }
        }
    }

    fn clear(&self) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let _ = txn.clear_db(self.db_main);
            let _ = txn.clear_db(self.db_ttls);
            let _ = txn.clear_db(self.db_lru);
            let _ = txn.clear_db(self.db_meta);
            self.count.store(0, Ordering::SeqCst);
            let _ = txn.commit();
        }
    }

    fn len(&self) -> usize {
        self.count.load(Ordering::SeqCst)
    }

    fn evict_lru(&self, count: usize) -> Vec<String> {
        let mut entries: Vec<(String, u64)> = Vec::new();

        if let Ok(txn) = self.env.begin_ro_txn()
            && let Ok(mut cursor) = txn.open_ro_cursor(self.db_lru)
        {
            for (k, v) in cursor.iter() {
                if let (Ok(key), Ok(bytes)) = (std::str::from_utf8(k), v.try_into()) {
                    let ts = u64::from_le_bytes(bytes);
                    entries.push((key.to_string(), ts));
                }
            }
        }

        entries.sort_by_key(|(_, ts)| *ts);
        let to_evict: Vec<String> = entries.into_iter().take(count).map(|(k, _)| k).collect();

        for key in &to_evict {
            self.remove(key);
        }

        to_evict
    }
}
