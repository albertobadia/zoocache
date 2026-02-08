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
        
        // Prepend Magic Header
        let mut final_data = Vec::with_capacity(MAGIC_HEADER.len() + compressed.len());
        final_data.extend_from_slice(MAGIC_HEADER);
        final_data.extend_from_slice(&compressed);
        
        Ok(final_data)
    }

    pub fn deserialize(py: Python, data: &[u8]) -> PyResult<Self> {
        if data.len() < MAGIC_HEADER.len() || &data[..MAGIC_HEADER.len()] != MAGIC_HEADER {
             return Err(to_runtime_err("Invalid cache file format or version mismatch"));
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
}

pub(crate) trait Storage: Send + Sync {
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>>;
    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()>;
    fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()>;
    fn remove(&self, key: &str) -> PyResult<()>;
    fn clear(&self) -> PyResult<()>;
    fn len(&self) -> usize;
    fn evict_lru(&self, count: usize) -> PyResult<Vec<String>>;
}
