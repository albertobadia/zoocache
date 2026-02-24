mod lmdb;
mod memory;
mod redis;

pub(crate) use self::lmdb::LmdbStorage;
pub(crate) use self::redis::RedisStorage;
pub(crate) use memory::InMemoryStorage;

use lz4_flex::block::{compress_prepend_size, decompress_size_prepended};
use pyo3::prelude::*;
use pythonize::pythonize;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

use crate::trie::DepSnapshot;
use crate::utils::to_runtime_err;

#[derive(Serialize, Deserialize)]
struct SerializableCacheEntry {
    #[serde(with = "serde_bytes")]
    value: Vec<u8>,
    dependencies: HashMap<String, DepSnapshot>,
    trie_version: u64,
}

pub(crate) struct CacheEntry {
    pub value: Py<PyAny>,
    pub dependencies: HashMap<String, DepSnapshot>,
    pub trie_version: u64,
}

const MAGIC_HEADER: &[u8] = b"ZOO1";

impl CacheEntry {
    pub fn serialize(&self, py: Python) -> PyResult<Vec<u8>> {
        let mut value_buf = Vec::new();
        let mut serializer = rmp_serde::Serializer::new(&mut value_buf);
        let mut depythonizer = pythonize::Depythonizer::from_object(self.value.bind(py));

        serde_transcode::transcode(&mut depythonizer, &mut serializer)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyTypeError, _>(e.to_string()))?;

        let entry = SerializableCacheEntry {
            value: value_buf,
            dependencies: self.dependencies.clone(),
            trie_version: self.trie_version,
        };

        let packed = rmp_serde::to_vec(&entry).map_err(to_runtime_err)?;
        let compressed = compress_prepend_size(&packed);

        let mut final_data = Vec::with_capacity(MAGIC_HEADER.len() + compressed.len());
        final_data.extend_from_slice(MAGIC_HEADER);
        final_data.extend_from_slice(&compressed);

        Ok(final_data)
    }

    pub fn deserialize(py: Python, data: &[u8]) -> PyResult<Self> {
        if data.len() < MAGIC_HEADER.len() || &data[..MAGIC_HEADER.len()] != MAGIC_HEADER {
            return Err(to_runtime_err(
                "Invalid cache file format or version mismatch",
            ));
        }

        let payload = &data[MAGIC_HEADER.len()..];
        let decompressed = decompress_size_prepended(payload).map_err(to_runtime_err)?;
        let entry: SerializableCacheEntry =
            rmp_serde::from_slice(&decompressed).map_err(to_runtime_err)?;

        let mut deserializer = rmp_serde::decode::Deserializer::new(&entry.value[..]);
        let transcoder = serde_transcode::Transcoder::new(&mut deserializer);

        let py_val = pythonize(py, &transcoder)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyTypeError, _>(e.to_string()))?;

        Ok(Self {
            value: py_val.into(),
            dependencies: entry.dependencies,
            trie_version: entry.trie_version,
        })
    }

    pub fn update_trie_version_raw(data: &[u8], new_version: u64) -> PyResult<Vec<u8>> {
        if data.len() < MAGIC_HEADER.len() || &data[..MAGIC_HEADER.len()] != MAGIC_HEADER {
            return Err(to_runtime_err("Invalid format"));
        }

        let payload = &data[MAGIC_HEADER.len()..];
        let decompressed = decompress_size_prepended(payload).map_err(to_runtime_err)?;
        let mut entry: SerializableCacheEntry =
            rmp_serde::from_slice(&decompressed).map_err(to_runtime_err)?;

        entry.trie_version = new_version;

        let packed = rmp_serde::to_vec(&entry).map_err(to_runtime_err)?;
        let compressed = compress_prepend_size(&packed);

        let mut final_data = Vec::with_capacity(MAGIC_HEADER.len() + compressed.len());
        final_data.extend_from_slice(MAGIC_HEADER);
        final_data.extend_from_slice(&compressed);

        Ok(final_data)
    }
}

pub(crate) enum StorageResult {
    Hit(Arc<CacheEntry>, Option<u64>, Option<Vec<u8>>),
    Expired,
    NotFound,
}

use async_trait::async_trait;

pub(crate) trait SyncStorage: Send + Sync {
    fn get(&self, py: Python, key: &str) -> StorageResult;
    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()>;
    fn set_raw(&self, key: String, data: Vec<u8>, ttl: Option<u64>) -> PyResult<()> {
        let entry = Python::attach(|py| CacheEntry::deserialize(py, &data))?;
        self.set(key, Arc::new(entry), ttl)
    }
    fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()>;
    fn remove(&self, key: &str) -> PyResult<()>;
    fn clear(&self) -> PyResult<()>;
    fn len(&self) -> usize;
    fn evict_lru(&self, count: usize) -> PyResult<Vec<String>>;
    fn scan_keys(&self, prefix: &str) -> Vec<(String, Option<u64>)>;
    fn needs_tti_worker(&self) -> bool {
        false
    }
}

#[async_trait]
pub(crate) trait Storage: Send + Sync {
    async fn get(&self, key: &str) -> StorageResult;
    async fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()>;
    async fn set_raw(&self, key: String, data: Vec<u8>, ttl: Option<u64>) -> PyResult<()> {
        let entry = Python::attach(|py| CacheEntry::deserialize(py, &data))?;
        self.set(key, Arc::new(entry), ttl).await
    }
    async fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()>;
    async fn remove(&self, key: &str) -> PyResult<()>;
    async fn clear(&self) -> PyResult<()>;
    async fn len(&self) -> usize;
    async fn evict_lru(&self, count: usize) -> PyResult<Vec<String>>;
    async fn scan_keys(&self, prefix: &str) -> Vec<(String, Option<u64>)>;
    fn needs_tti_worker(&self) -> bool {
        false
    }
    fn check_and_update_touch_gate(&self) -> bool {
        true
    }
    fn try_get_sync(&self, _py: Python, _key: &str) -> Option<StorageResult> {
        None
    }
    fn try_set_sync(
        &self,
        _py: Python,
        _key: String,
        _entry: Arc<CacheEntry>,
        _ttl: Option<u64>,
    ) -> PyResult<()> {
        Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
            "Sync set not supported",
        ))
    }
    fn try_remove_sync(&self, _key: &str) -> PyResult<()> {
        Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
            "Sync remove not supported",
        ))
    }
    fn try_clear_sync(&self) -> PyResult<()> {
        Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
            "Sync clear not supported",
        ))
    }
    fn try_len_sync(&self) -> Option<usize> {
        None
    }
    fn try_evict_lru_sync(&self, _count: usize) -> Option<PyResult<Vec<String>>> {
        None
    }
    #[allow(dead_code)]
    fn try_scan_keys_sync(&self, _prefix: &str) -> Option<Vec<(String, Option<u64>)>> {
        None
    }
    fn is_sync_storage(&self) -> bool {
        false
    }
}
