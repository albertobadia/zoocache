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
    db_lru_index: Database,
    db_meta: Database,
    count: AtomicUsize,
}

impl LmdbStorage {
    pub fn new(path: &str) -> PyResult<Self> {
        let path = Path::new(path);
        if !path.exists() {
            std::fs::create_dir_all(path)
                .map_err(|e| PyErr::new::<pyo3::exceptions::PyIOError, _>(e.to_string()))?;
        }

        let env = Environment::new()
            .set_max_dbs(5)
            .set_map_size(1024 * 1024 * 1024)
            .open(path)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        let db_main = env
            .create_db(Some("main"), DatabaseFlags::empty())
            .map_err(to_py_err)?;
        let db_ttls = env
            .create_db(Some("ttls"), DatabaseFlags::empty())
            .map_err(to_py_err)?;
        let db_lru = env
            .create_db(Some("lru"), DatabaseFlags::empty())
            .map_err(to_py_err)?;
        let db_lru_index = env
            .create_db(Some("lru_index"), DatabaseFlags::empty())
            .map_err(to_py_err)?;
        let db_meta = env
            .create_db(Some("meta"), DatabaseFlags::empty())
            .map_err(to_py_err)?;

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
            db_lru_index,
            db_meta,
            count: AtomicUsize::new(count),
        })
    }

    fn make_index_key(ts: u64, key: &str) -> Vec<u8> {
        let mut buf = Vec::with_capacity(8 + key.len());
        buf.extend_from_slice(&ts.to_be_bytes());
        buf.extend_from_slice(key.as_bytes());
        buf
    }

    fn delete_from_index(&self, txn: &mut lmdb::RwTransaction, key: &str) {
        let old_ts = txn
            .get(self.db_lru, &key)
            .ok()
            .and_then(|d| d.try_into().ok().map(u64::from_le_bytes));

        if let Some(ts) = old_ts {
            let _ = txn.del(self.db_lru_index, &Self::make_index_key(ts, key), None);
        }
    }

    fn remove_internal(&self, txn: &mut lmdb::RwTransaction, key: &str) -> bool {
        self.delete_from_index(txn, key);

        if txn.get(self.db_main, &key).is_ok() {
            let _ = txn.del(self.db_main, &key, None);
            let _ = txn.del(self.db_ttls, &key, None);
            let _ = txn.del(self.db_lru, &key, None);
            self.count.fetch_sub(1, Ordering::SeqCst);
            true
        } else {
            false
        }
    }
}

fn to_py_err(e: lmdb::Error) -> PyErr {
    PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
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
            self.delete_from_index(&mut txn, &key);

            let is_new = txn.get(self.db_main, &key).is_err();
            let new_ts = now_secs();

            let _ = txn.put(self.db_main, &key, &data, WriteFlags::empty());
            let _ = txn.put(
                self.db_lru,
                &key,
                &new_ts.to_le_bytes(),
                WriteFlags::empty(),
            );
            let _ = txn.put(
                self.db_lru_index,
                &Self::make_index_key(new_ts, &key),
                &[],
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
            let now = now_secs();
            let now_le = now.to_le_bytes();
            for (key, ttl) in updates {
                self.delete_from_index(&mut txn, &key);

                let _ = txn.put(self.db_lru, &key, &now_le, WriteFlags::empty());
                let _ = txn.put(
                    self.db_lru_index,
                    &Self::make_index_key(now, &key),
                    &[],
                    WriteFlags::empty(),
                );

                if let Some(t) = ttl {
                    let expire_at = now + t;
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
        if let Ok(mut txn) = self.env.begin_rw_txn()
            && self.remove_internal(&mut txn, key)
        {
            let _ = txn.commit();
        }
    }

    fn clear(&self) {
        if let Ok(mut txn) = self.env.begin_rw_txn() {
            let _ = txn.clear_db(self.db_main);
            let _ = txn.clear_db(self.db_ttls);
            let _ = txn.clear_db(self.db_lru);
            let _ = txn.clear_db(self.db_lru_index);
            let _ = txn.clear_db(self.db_meta);
            self.count.store(0, Ordering::SeqCst);
            let _ = txn.commit();
        }
    }

    fn len(&self) -> usize {
        self.count.load(Ordering::SeqCst)
    }

    fn evict_lru(&self, count: usize) -> Vec<String> {
        let mut to_evict = Vec::new();

        if let Ok(mut txn) = self.env.begin_rw_txn() {
            if let Ok(mut cursor) = txn.open_ro_cursor(self.db_lru_index) {
                for (k, _) in cursor.iter().take(count) {
                    if let Some(key_str) = k.get(8..).and_then(|b| std::str::from_utf8(b).ok()) {
                        to_evict.push(key_str.to_string());
                    }
                }
            }

            for key in &to_evict {
                self.remove_internal(&mut txn, key);
            }

            let current_count = self.count.load(Ordering::SeqCst);
            let _ = txn.put(
                self.db_meta,
                &"count",
                &(current_count as u64).to_le_bytes(),
                WriteFlags::empty(),
            );
            let _ = txn.commit();
        }

        to_evict
    }
}
