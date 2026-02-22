use crate::StorageIsFull;
use crate::storage::{CacheEntry, Storage, StorageResult};
use crate::utils::{now_nanos, now_secs, to_runtime_err};
use async_trait::async_trait;
use lmdb::{
    Cursor, Database, DatabaseFlags, Environment, EnvironmentFlags, Transaction, WriteFlags,
};
use pyo3::prelude::*;
use std::path::Path;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

pub(crate) struct LmdbStorage {
    env: Arc<Environment>,
    db_main: Database,
    db_ttls: Database,
    db_lru: Database,
    db_lru_index: Database,
    db_meta: Database,
    count: Arc<AtomicUsize>,
}

impl LmdbStorage {
    pub fn new(path: &str, map_size: Option<usize>) -> PyResult<Self> {
        let path = Path::new(path);
        if !path.exists() {
            std::fs::create_dir_all(path)
                .map_err(|e| PyErr::new::<pyo3::exceptions::PyIOError, _>(e.to_string()))?;
        }

        let map_size = map_size.unwrap_or(1024 * 1024 * 1024);

        // SAFETY TRADE-OFF: These flags prioritize performance over durability:
        // - NO_SYNC: Don't fsync after writes (faster but may lose data on crash)
        // - NO_META_SYNC: Don't sync metadata (faster but may corrupt on crash)
        // - WRITE_MAP: Use writable memory map (faster but less safe)
        // - MAP_ASYNC: Don't flush pages synchronously (faster but riskier)
        //
        // For a cache, this is acceptable because:
        // 1. All cached data can be recomputed from the source
        // 2. On restart, corrupted entries will fail deserialization and be evicted
        // 3. The performance gain is significant for high-throughput workloads
        //
        // If durability is critical, consider using Redis storage instead.
        let env = Environment::new()
            .set_max_dbs(5)
            .set_map_size(map_size)
            .set_flags(
                EnvironmentFlags::NO_SYNC
                    | EnvironmentFlags::NO_META_SYNC
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
            env: Arc::new(env),
            db_main,
            db_ttls,
            db_lru,
            db_lru_index,
            db_meta,
            count: Arc::new(AtomicUsize::new(count)),
        })
    }

    fn make_index_key(ts: u64, key: &str) -> Vec<u8> {
        let mut buf = Vec::with_capacity(8 + key.len());
        buf.extend_from_slice(&ts.to_be_bytes());
        buf.extend_from_slice(key.as_bytes());
        buf
    }

    fn delete_from_index(
        txn: &mut lmdb::RwTransaction,
        db_lru: Database,
        db_lru_index: Database,
        key: &str,
    ) {
        let old_ts = txn
            .get(db_lru, &key)
            .ok()
            .and_then(|d| d.try_into().ok().map(u64::from_le_bytes));

        if let Some(ts) = old_ts {
            let _ = txn.del(db_lru_index, &Self::make_index_key(ts, key), None);
        }
    }

    fn remove_internal(
        txn: &mut lmdb::RwTransaction,
        dbs: &(Database, Database, Database, Database),
        key: &str,
    ) -> bool {
        Self::delete_from_index(txn, dbs.2, dbs.3, key);

        if txn.get(dbs.0, &key).is_ok() {
            let _ = txn.del(dbs.0, &key, None);
            let _ = txn.del(dbs.1, &key, None);
            let _ = txn.del(dbs.2, &key, None);
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

    fn put_internal(&self, key: &str, data: &[u8], ttl: Option<u64>) -> PyResult<()> {
        let env = &self.env;
        let count_atom = &self.count;
        let dbs = (
            self.db_main,
            self.db_ttls,
            self.db_lru,
            self.db_lru_index,
            self.db_meta,
        );

        let mut txn = env.begin_rw_txn().map_err(to_runtime_err)?;
        Self::delete_from_index(&mut txn, dbs.2, dbs.3, key);

        let is_new = txn.get(dbs.0, &key).is_err();
        let new_ts = now_nanos();

        txn.put(dbs.0, &key, &data, WriteFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        txn.put(dbs.2, &key, &new_ts.to_le_bytes(), WriteFlags::empty())
            .map_err(Self::to_storage_is_full_err)?;
        txn.put(
            dbs.3,
            &Self::make_index_key(new_ts, key),
            &[],
            WriteFlags::empty(),
        )
        .map_err(Self::to_storage_is_full_err)?;

        if let Some(t) = ttl {
            let expire_at = now_secs() + t;
            txn.put(dbs.1, &key, &expire_at.to_le_bytes(), WriteFlags::empty())
                .map_err(Self::to_storage_is_full_err)?;
        } else {
            let _ = txn.del(dbs.1, &key, None);
        }

        if is_new {
            let current_count = count_atom.load(Ordering::SeqCst);
            let new_count = current_count + 1;
            txn.put(
                dbs.4,
                b"count",
                &(new_count as u64).to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;
        }

        txn.commit().map_err(Self::to_storage_is_full_err)?;

        if is_new {
            count_atom.fetch_add(1, Ordering::SeqCst);
        }

        Ok(())
    }
}

#[async_trait]
impl Storage for LmdbStorage {
    async fn get(&self, key: &str) -> StorageResult {
        Python::attach(|py| {
            self.try_get_sync(py, key)
                .unwrap_or(StorageResult::NotFound)
        })
    }

    fn try_get_sync(&self, py: Python, key: &str) -> Option<StorageResult> {
        let env = &self.env;
        let db_main = self.db_main;
        let db_ttls = self.db_ttls;

        let txn = env.begin_ro_txn().ok()?;
        let expires_at = txn
            .get(db_ttls, &key)
            .ok()
            .and_then(|d| d.try_into().ok().map(u64::from_le_bytes))
            .filter(|&ts| ts != 0);

        if expires_at.is_some_and(|ts| now_secs() > ts) {
            return Some(StorageResult::Expired);
        }

        let data = txn.get(db_main, &key).ok()?;
        let entry = CacheEntry::deserialize(py, data).ok().map(Arc::new)?;

        Some(StorageResult::Hit(entry, expires_at))
    }

    async fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()> {
        let data = Python::attach(|py| entry.serialize(py))?;
        self.put_internal(&key, &data, ttl)
    }

    async fn set_raw(&self, key: String, data: Vec<u8>, ttl: Option<u64>) -> PyResult<()> {
        self.put_internal(&key, &data, ttl)
    }

    async fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()> {
        let env = &self.env;
        let dbs = (
            self.db_main,
            self.db_ttls,
            self.db_lru,
            self.db_lru_index,
            self.db_meta,
        );

        let mut txn = env.begin_rw_txn().map_err(to_runtime_err)?;
        let now_n = now_nanos();
        let now_s = now_secs();
        let now_le = now_n.to_le_bytes();
        for (key, ttl) in updates {
            Self::delete_from_index(&mut txn, dbs.2, dbs.3, &key);

            txn.put(dbs.2, &key, &now_le, WriteFlags::empty())
                .map_err(Self::to_storage_is_full_err)?;
            txn.put(
                dbs.3,
                &Self::make_index_key(now_n, &key),
                &[],
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;

            if let Some(t) = ttl {
                let expire_at = now_s + t;
                txn.put(dbs.1, &key, &expire_at.to_le_bytes(), WriteFlags::empty())
                    .map_err(Self::to_storage_is_full_err)?;
            }
        }
        txn.commit().map_err(Self::to_storage_is_full_err)?;
        Ok(())
    }

    async fn remove(&self, key: &str) -> PyResult<()> {
        let env = &self.env;
        let count_atom = &self.count;
        let dbs = (
            self.db_main,
            self.db_ttls,
            self.db_lru,
            self.db_lru_index,
            self.db_meta,
        );

        let mut txn = env.begin_rw_txn().map_err(to_runtime_err)?;
        if Self::remove_internal(&mut txn, &(dbs.0, dbs.1, dbs.2, dbs.3), key) {
            let current_count = count_atom.load(Ordering::SeqCst);
            let new_count = current_count.saturating_sub(1);
            txn.put(
                dbs.4,
                b"count",
                &(new_count as u64).to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;

            txn.commit().map_err(Self::to_storage_is_full_err)?;
            count_atom.fetch_sub(1, Ordering::SeqCst);
        }
        Ok(())
    }

    async fn clear(&self) -> PyResult<()> {
        let env = &self.env;
        let count_atom = &self.count;
        let dbs = (
            self.db_main,
            self.db_ttls,
            self.db_lru,
            self.db_lru_index,
            self.db_meta,
        );

        let mut txn = env.begin_rw_txn().map_err(to_runtime_err)?;
        let _ = txn.clear_db(dbs.0);
        let _ = txn.clear_db(dbs.1);
        let _ = txn.clear_db(dbs.2);
        let _ = txn.clear_db(dbs.3);
        let _ = txn.clear_db(dbs.4);
        txn.commit().map_err(Self::to_storage_is_full_err)?;
        count_atom.store(0, Ordering::SeqCst);
        Ok(())
    }

    async fn len(&self) -> usize {
        self.count.load(Ordering::SeqCst)
    }

    async fn evict_lru(&self, count: usize) -> PyResult<Vec<String>> {
        let env = &self.env;
        let count_atom = &self.count;
        let dbs = (
            self.db_main,
            self.db_ttls,
            self.db_lru,
            self.db_lru_index,
            self.db_meta,
        );

        let mut to_evict = Vec::new();

        let mut txn = env.begin_rw_txn().map_err(to_runtime_err)?;
        {
            let mut cursor = txn.open_ro_cursor(dbs.3).map_err(to_runtime_err)?;
            for (k, _) in cursor.iter().take(count) {
                if let Some(key_str) = k.get(8..).and_then(|b| std::str::from_utf8(b).ok()) {
                    to_evict.push(key_str.to_string());
                }
            }
        }

        let mut evicted_count = 0;
        for key in &to_evict {
            if Self::remove_internal(&mut txn, &(dbs.0, dbs.1, dbs.2, dbs.3), key) {
                evicted_count += 1;
            }
        }

        let current_count = count_atom.load(Ordering::SeqCst);
        let new_count = current_count.saturating_sub(evicted_count);
        txn.put(
            dbs.4,
            b"count",
            &(new_count as u64).to_le_bytes(),
            WriteFlags::empty(),
        )
        .map_err(Self::to_storage_is_full_err)?;

        txn.commit().map_err(Self::to_storage_is_full_err)?;
        count_atom.fetch_sub(evicted_count, Ordering::SeqCst);

        Ok(to_evict)
    }

    async fn scan_keys(&self, prefix: &str) -> Vec<(String, Option<u64>)> {
        let env = &self.env;
        let dbs = (self.db_main, self.db_ttls);

        let mut results = Vec::new();
        let txn = match env.begin_ro_txn() {
            Ok(t) => t,
            Err(_) => return results,
        };

        let mut cursor = match txn.open_ro_cursor(dbs.0) {
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
                if !prefix.is_empty() {
                    break;
                }
                continue;
            }
            let expires_at = txn
                .get(dbs.1, &k)
                .ok()
                .and_then(|d| d.try_into().ok().map(u64::from_le_bytes))
                .filter(|&ts| ts != 0);

            if expires_at.is_none() || now_secs() <= expires_at.unwrap() {
                results.push((key_str.to_string(), expires_at));
            }
        }
        results
    }

    fn needs_tti_worker(&self) -> bool {
        true
    }

    fn try_set_sync(
        &self,
        py: Python,
        key: String,
        entry: Arc<CacheEntry>,
        ttl: Option<u64>,
    ) -> PyResult<()> {
        let data = entry.serialize(py)?;
        self.put_internal(&key, &data, ttl)
    }

    fn try_remove_sync(&self, key: &str) -> PyResult<()> {
        let env = &self.env;
        let count_atom = &self.count;
        let dbs = (
            self.db_main,
            self.db_ttls,
            self.db_lru,
            self.db_lru_index,
            self.db_meta,
        );

        let mut txn = env.begin_rw_txn().map_err(to_runtime_err)?;
        if Self::remove_internal(&mut txn, &(dbs.0, dbs.1, dbs.2, dbs.3), key) {
            let current_count = count_atom.load(Ordering::SeqCst);
            let new_count = current_count.saturating_sub(1);
            txn.put(
                dbs.4,
                b"count",
                &(new_count as u64).to_le_bytes(),
                WriteFlags::empty(),
            )
            .map_err(Self::to_storage_is_full_err)?;

            txn.commit().map_err(Self::to_storage_is_full_err)?;
            count_atom.fetch_sub(1, Ordering::SeqCst);
        }
        Ok(())
    }

    fn try_clear_sync(&self) -> PyResult<()> {
        let env = &self.env;
        let count_atom = &self.count;
        let dbs = (
            self.db_main,
            self.db_ttls,
            self.db_lru,
            self.db_lru_index,
            self.db_meta,
        );

        let mut txn = env.begin_rw_txn().map_err(to_runtime_err)?;
        let _ = txn.clear_db(dbs.0);
        let _ = txn.clear_db(dbs.1);
        let _ = txn.clear_db(dbs.2);
        let _ = txn.clear_db(dbs.3);
        let _ = txn.clear_db(dbs.4);
        txn.commit().map_err(Self::to_storage_is_full_err)?;
        count_atom.store(0, Ordering::SeqCst);
        Ok(())
    }
}
