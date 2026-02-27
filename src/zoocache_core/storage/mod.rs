mod lmdb;
mod memory;
mod redis;

pub(crate) use self::lmdb::LmdbStorage;
pub(crate) use self::redis::RedisStorage;
pub(crate) use memory::InMemoryStorage;

use foldhash::HashMap;
use lz4_flex::block::{compress_prepend_size, decompress_size_prepended};
use pyo3::prelude::*;
use pythonize::pythonize;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::sync::Arc;

thread_local! {
    static SERIALIZE_BUF: RefCell<Vec<u8>> = RefCell::new(Vec::with_capacity(16 * 1024));
}

use crate::trie::DepSnapshot;
use crate::utils::to_runtime_err;
use std::sync::OnceLock;

static COMPRESSION_THRESHOLD: OnceLock<usize> = OnceLock::new();

pub(crate) fn set_compression_threshold(threshold: usize) {
    let _ = COMPRESSION_THRESHOLD.set(threshold);
}

#[inline]
fn get_compression_threshold() -> usize {
    *COMPRESSION_THRESHOLD.get_or_init(|| 256)
}

#[derive(Serialize, Deserialize)]
struct SerializableCacheEntry {
    #[serde(with = "serde_bytes")]
    value: Vec<u8>,
    dependencies: HashMap<String, DepSnapshot>,
}

pub(crate) struct CacheEntry {
    pub value: Py<PyAny>,
    pub dependencies: Arc<HashMap<String, DepSnapshot>>,
    pub trie_version: u64,
}

const MAGIC_HEADER: &[u8] = b"ZOO2";
const MAGIC_HEADER_UNCOMPRESSED: &[u8] = b"ZOO3";
const MAGIC_LEN: usize = 4;
const VERSION_LEN: usize = 8;
const HEADER_LEN: usize = MAGIC_LEN + VERSION_LEN;

impl CacheEntry {
    pub fn serialize(&self, py: Python) -> PyResult<Vec<u8>> {
        SERIALIZE_BUF.with(|buf| {
            let mut value_buf = buf.borrow_mut();
            value_buf.clear();

            let mut serializer = rmp_serde::Serializer::new(&mut *value_buf);
            let mut depythonizer = pythonize::Depythonizer::from_object(self.value.bind(py));

            serde_transcode::transcode(&mut depythonizer, &mut serializer)
                .map_err(|e| PyErr::new::<pyo3::exceptions::PyTypeError, _>(e.to_string()))?;

            let entry = SerializableCacheEntry {
                value: value_buf.clone(),
                dependencies: self.dependencies.as_ref().clone(),
            };

            let packed = rmp_serde::to_vec(&entry).map_err(to_runtime_err)?;
            let threshold = get_compression_threshold();
            let final_data = if packed.len() < threshold {
                let mut data = Vec::with_capacity(HEADER_LEN + 4 + packed.len());
                data.extend_from_slice(MAGIC_HEADER_UNCOMPRESSED);
                data.extend_from_slice(&self.trie_version.to_le_bytes());
                data.extend_from_slice(&(packed.len() as u32).to_le_bytes());
                data.extend_from_slice(&packed);
                data
            } else {
                let compressed = compress_prepend_size(&packed);
                let mut data = Vec::with_capacity(HEADER_LEN + compressed.len());
                data.extend_from_slice(MAGIC_HEADER);
                data.extend_from_slice(&self.trie_version.to_le_bytes());
                data.extend_from_slice(&compressed);
                data
            };

            Ok(final_data)
        })
    }

    pub fn deserialize(py: Python, data: &[u8]) -> PyResult<Self> {
        if data.len() < HEADER_LEN {
            return Err(to_runtime_err(
                "Invalid cache file format or version mismatch",
            ));
        }

        let is_compressed = &data[..MAGIC_LEN] == MAGIC_HEADER;
        if !is_compressed && &data[..MAGIC_LEN] != MAGIC_HEADER_UNCOMPRESSED {
            return Err(to_runtime_err(
                "Invalid cache file format or version mismatch",
            ));
        }

        let trie_version = u64::from_le_bytes(
            data[MAGIC_LEN..HEADER_LEN]
                .try_into()
                .map_err(|_| to_runtime_err("Invalid version bytes"))?,
        );

        let payload = &data[HEADER_LEN..];
        let decompressed = if is_compressed {
            decompress_size_prepended(payload).map_err(to_runtime_err)?
        } else {
            if payload.len() < 4 {
                return Err(to_runtime_err("Invalid uncompressed data format"));
            }
            let size = u32::from_le_bytes(
                payload[..4]
                    .try_into()
                    .map_err(|_| to_runtime_err("Invalid size"))?,
            ) as usize;
            if payload.len() < 4 + size {
                return Err(to_runtime_err("Truncated uncompressed data"));
            }
            payload[4..4 + size].to_vec()
        };
        let entry: SerializableCacheEntry =
            rmp_serde::from_slice(&decompressed).map_err(to_runtime_err)?;

        let mut deserializer = rmp_serde::decode::Deserializer::new(&entry.value[..]);
        let transcoder = serde_transcode::Transcoder::new(&mut deserializer);

        let py_val = pythonize(py, &transcoder)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyTypeError, _>(e.to_string()))?;

        Ok(Self {
            value: py_val.into(),
            dependencies: Arc::new(entry.dependencies),
            trie_version,
        })
    }

    pub fn update_trie_version_raw(data: &[u8], new_version: u64) -> PyResult<Vec<u8>> {
        if data.len() < HEADER_LEN {
            return Err(to_runtime_err("Invalid format"));
        }

        let is_compressed = &data[..MAGIC_LEN] == MAGIC_HEADER;
        if !is_compressed && &data[..MAGIC_LEN] != MAGIC_HEADER_UNCOMPRESSED {
            return Err(to_runtime_err("Invalid format"));
        }

        let mut result = data.to_vec();
        result[MAGIC_LEN..HEADER_LEN].copy_from_slice(&new_version.to_le_bytes());
        Ok(result)
    }
}

pub(crate) enum StorageResult {
    Hit(Arc<CacheEntry>, Option<u64>, Option<Vec<u8>>),
    Expired,
    NotFound,
    Error,
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
