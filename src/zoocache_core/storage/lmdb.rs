use crate::StorageIsFull;
use crate::storage::{CacheEntry, Storage};
use crate::utils::{now_nanos, now_secs, to_runtime_err};
use lmdb::{
    Cursor, Database, DatabaseFlags, Environment, EnvironmentFlags, Transaction, WriteFlags,
};
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
    pub fn new(path: &str, map_size: Option<usize>) -> PyResult<Self> {
        let path = Path::new(path);
        if !path.exists() {
            std::fs::create_dir_all(path)
                .map_err(|e| PyErr::new::<pyo3::exceptions::PyIOError, _>(e.to_string()))?;
        }

        let map_size = map_size.unwrap_or(1024 * 1024 * 1024);

        let env = Environment::new()
            .set_max_dbs(5)
            .set_map_size(map_size)
            .set_flags(
                EnvironmentFlags::NO_SYNC
                    | EnvironmentFlags::NO_META_SYNC
                    | EnvironmentFlags::NO_TLS
                    | EnvironmentFlags::WRITE_MAP
                    | EnvironmentFlags::MAP_ASYNC,
            )
            .open(path)
            .map_err(Self::to_storage_is_full_err)?;

        let db_main = env
            .create_db(Some("main"), DatabaseFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        let db_ttls = env
            .create_db(Some("ttls"), DatabaseFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        let db_lru = env
            .create_db(Some("lru"), DatabaseFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        let db_lru_index = env
            .create_db(Some("lru_index"), DatabaseFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        let db_meta = env
            .create_db(Some("meta"), DatabaseFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;

        let count = (|| {
            let txn = env.begin_ro_txn().ok()?;
            let data = txn.get(db_meta, b"count").ok()?;
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
            true
        } else {
            false
        }
    }

    fn to_storage_is_full_err<E: std::fmt::Display>(e: E) -> PyErr {
        let msg = e.to_string();
        if msg.contains("MDB_MAP_FULL") || msg.contains("MAP_FULL") {
            StorageIsFull::new_err(format!(
                "LMDB storage is full (map_size reached). Increase 'lmdb_map_size' in configuration. Error: {}",
                msg
            ))
        } else {
            to_runtime_err(e)
        }
    }
}

impl Storage for LmdbStorage {
    fn get(&self, key: &str) -> super::StorageResult {
        let txn = match self.env.begin_ro_txn() {
            Ok(t) => t,
            Err(_) => return super::StorageResult::NotFound,
        };

        let expires_at = txn
            .get(self.db_ttls, &key)
            .ok()
            .and_then(|d| d.try_into().ok().map(u64::from_le_bytes))
            .filter(|&ts| ts != 0);

        if expires_at.is_some_and(|ts| now_secs() > ts) {
            return super::StorageResult::Expired;
        }

        let data = match txn.get(self.db_main, &key) {
            Ok(d) => d,
            Err(_) => return super::StorageResult::NotFound,
        };

        Python::attach(|py| {
            CacheEntry::deserialize(py, data)
                .ok()
                .map(Arc::new)
                .map(|e| super::StorageResult::Hit(e, expires_at))
                .unwrap_or(super::StorageResult::NotFound)
        })
    }

    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()> {
        let data = Python::attach(|py| entry.serialize(py))?;
        let mut txn = self.env.begin_rw_txn().map_err(to_runtime_err)?;
        self.delete_from_index(&mut txn, &key);

        let is_new = txn.get(self.db_main, &key).is_err();
        let new_ts = now_nanos();

        txn.put(self.db_main, &key, &data, WriteFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        txn.put(
            self.db_lru,
            &key,
            &new_ts.to_le_bytes(),
            WriteFlags::empty(),
        )
        .map_err(Self::to_storage_is_full_err)?;
        txn.put(
            self.db_lru_index,
            &Self::make_index_key(new_ts, &key),
            &[],
            WriteFlags::empty(),
        )
        .map_err(Self::to_storage_is_full_err)?;

        if let Some(t) = ttl {
            let expire_at = now_secs() + t;
            txn.put(
                self.db_ttls,
                &key,
                &expire_at.to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;
        } else {
            let _ = txn.del(self.db_ttls, &key, None);
        }

        if is_new {
            let current_count = self.count.load(Ordering::SeqCst);
            let new_count = current_count + 1;
            txn.put(
                self.db_meta,
                b"count",
                &(new_count as u64).to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;
        }

        txn.commit().map_err(Self::to_storage_is_full_err)?;

        if is_new {
            self.count.fetch_add(1, Ordering::SeqCst);
        }
        Ok(())
    }

    fn set_raw(&self, key: String, data: Vec<u8>, ttl: Option<u64>) -> PyResult<()> {
        let mut txn = self.env.begin_rw_txn().map_err(to_runtime_err)?;
        self.delete_from_index(&mut txn, &key);

        let is_new = txn.get(self.db_main, &key).is_err();
        let new_ts = now_nanos();

        txn.put(self.db_main, &key, &data, WriteFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        txn.put(
            self.db_lru,
            &key,
            &new_ts.to_le_bytes(),
            WriteFlags::empty(),
        )
        .map_err(Self::to_storage_is_full_err)?;
        txn.put(
            self.db_lru_index,
            &Self::make_index_key(new_ts, &key),
            &[],
            WriteFlags::empty(),
        )
        .map_err(Self::to_storage_is_full_err)?;

        if let Some(t) = ttl {
            let expire_at = now_secs() + t;
            txn.put(
                self.db_ttls,
                &key,
                &expire_at.to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;
        } else {
            let _ = txn.del(self.db_ttls, &key, None);
        }

        if is_new {
            let current_count = self.count.load(Ordering::SeqCst);
            let new_count = current_count + 1;
            txn.put(
                self.db_meta,
                b"count",
                &(new_count as u64).to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;
        }

        txn.commit().map_err(Self::to_storage_is_full_err)?;

        if is_new {
            self.count.fetch_add(1, Ordering::SeqCst);
        }
        Ok(())
    }

    fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()> {
        let mut txn = self.env.begin_rw_txn().map_err(to_runtime_err)?;
        let now_n = now_nanos();
        let now_s = now_secs();
        let now_le = now_n.to_le_bytes();
        for (key, ttl) in updates {
            self.delete_from_index(&mut txn, &key);

            txn.put(self.db_lru, &key, &now_le, WriteFlags::empty())
                .map_err(Self::to_storage_is_full_err)?;
            txn.put(
                self.db_lru_index,
                &Self::make_index_key(now_n, &key),
                &[],
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;

            if let Some(t) = ttl {
                let expire_at = now_s + t;
                txn.put(
                    self.db_ttls,
                    &key,
                    &expire_at.to_le_bytes(),
                    WriteFlags::empty(),
                )
                .map_err(Self::to_storage_is_full_err)?;
            }
        }
        txn.commit().map_err(Self::to_storage_is_full_err)
    }

    fn remove(&self, key: &str) -> PyResult<()> {
        let mut txn = self.env.begin_rw_txn().map_err(to_runtime_err)?;
        if self.remove_internal(&mut txn, key) {
            let current_count = self.count.load(Ordering::SeqCst);
            let new_count = current_count.saturating_sub(1);
            txn.put(
                self.db_meta,
                b"count",
                &(new_count as u64).to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;

            txn.commit().map_err(Self::to_storage_is_full_err)?;
            self.count.fetch_sub(1, Ordering::SeqCst);
        }
        Ok(())
    }

    fn clear(&self) -> PyResult<()> {
        let mut txn = self.env.begin_rw_txn().map_err(to_runtime_err)?;
        let _ = txn.clear_db(self.db_main);
        let _ = txn.clear_db(self.db_ttls);
        let _ = txn.clear_db(self.db_lru);
        let _ = txn.clear_db(self.db_lru_index);
        let _ = txn.clear_db(self.db_meta);
        txn.commit().map_err(Self::to_storage_is_full_err)?;
        self.count.store(0, Ordering::SeqCst);
        Ok(())
    }

    fn len(&self) -> usize {
        self.count.load(Ordering::SeqCst)
    }

    fn evict_lru(&self, count: usize) -> PyResult<Vec<String>> {
        let mut to_evict = Vec::new();

        let mut txn = self.env.begin_rw_txn().map_err(to_runtime_err)?;
        {
            let mut cursor = txn
                .open_ro_cursor(self.db_lru_index)
                .map_err(to_runtime_err)?;
            for (k, _) in cursor.iter().take(count) {
                if let Some(key_str) = k.get(8..).and_then(|b| std::str::from_utf8(b).ok()) {
                    to_evict.push(key_str.to_string());
                }
            }
        }

        let mut evicted_count = 0;
        for key in &to_evict {
            if self.remove_internal(&mut txn, key) {
                evicted_count += 1;
            }
        }

        let current_count = self.count.load(Ordering::SeqCst);
        let new_count = current_count.saturating_sub(evicted_count);
        txn.put(
            self.db_meta,
            b"count",
            &(new_count as u64).to_le_bytes(),
            WriteFlags::empty(),
        )
        .map_err(Self::to_storage_is_full_err)?;

        txn.commit().map_err(Self::to_storage_is_full_err)?;
        self.count.fetch_sub(evicted_count, Ordering::SeqCst);

        Ok(to_evict)
    }

    fn scan_keys(&self, prefix: &str) -> Vec<(String, Option<u64>)> {
        let mut results = Vec::new();
        let txn = match self.env.begin_ro_txn() {
            Ok(t) => t,
            Err(_) => return results,
        };

        let mut cursor = match txn.open_ro_cursor(self.db_main) {
            Ok(c) => c,
            Err(_) => return results,
        };

        let iter = if prefix.is_empty() {
            cursor.iter()
        } else {
            cursor.iter_from(prefix.as_bytes())
        };

        for (k, _) in iter {
            let Ok(key_str) = std::str::from_utf8(k) else {
                continue;
            };
            if !key_str.starts_with(prefix) {
                // Since LMDB keys are sorted, once we pass the prefix matches, we can stop.
                if !prefix.is_empty() {
                    break;
                }
                continue;
            }
            let expires_at = txn
                .get(self.db_ttls, &k)
                .ok()
                .and_then(|d| d.try_into().ok().map(u64::from_le_bytes))
                .filter(|&ts| ts != 0);

            if expires_at.is_none_or(|ts| now_secs() <= ts) {
                results.push((key_str.to_string(), expires_at));
            }
        }

        results
    }

    fn needs_tti_worker(&self) -> bool {
        true
    }
}
