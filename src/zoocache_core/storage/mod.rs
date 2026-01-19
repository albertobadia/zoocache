mod memory;
mod redis;
mod lmdb;

pub(crate) use memory::InMemoryStorage;
pub(crate) use self::redis::RedisStorage;
pub(crate) use self::lmdb::LmdbStorage;

use pyo3::prelude::*;
use lz4_flex::block::{compress_prepend_size, decompress_size_prepended};
use pythonize::pythonize;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

use crate::trie::DepSnapshot;

#[derive(Serialize, Deserialize)]
struct SerializableCacheEntry {
    #[serde(with = "serde_bytes")]
    value: Vec<u8>, // Internal MsgPack for the value
    dependencies: HashMap<String, DepSnapshot>,
}

pub(crate) struct CacheEntry {
    pub value: Py<PyAny>,
    pub dependencies: HashMap<String, DepSnapshot>,
}

impl CacheEntry {
    pub fn serialize(&self, py: Python) -> PyResult<Vec<u8>> {
        // 1. Convert Python object to a serializable Value via depythonize (fallback due to pythonize limitations)
        let serde_val: serde_json::Value = pythonize::depythonize(self.value.bind(py))
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyTypeError, _>(e.to_string()))?;

        let entry = SerializableCacheEntry {
            value: rmp_serde::to_vec(&serde_val)
                .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?,
            dependencies: self.dependencies.clone(),
        };

        // 2. Serialize metadata and compressed-value to high-level MsgPack
        let packed = rmp_serde::to_vec(&entry)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        // 3. Compress
        Ok(compress_prepend_size(&packed))
    }

    pub fn deserialize(py: Python, data: &[u8]) -> PyResult<Self> {
        // 1. Decompress
        let decompressed = decompress_size_prepended(data)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        // 2. Deserialize metadata
        let entry: SerializableCacheEntry = rmp_serde::from_slice(&decompressed)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))?;

        // 3. Deserialize MsgPack value directly to Python object (streaming/transcode)
        let mut deserializer = rmp_serde::decode::Deserializer::new(&entry.value[..]);
        let transcoder = serde_transcode::Transcoder::new(&mut deserializer);
        
        let py_val = pythonize(py, &transcoder)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyTypeError, _>(e.to_string()))?;

        Ok(Self {
            value: py_val.into(),
            dependencies: entry.dependencies,
        })
    }
}

pub(crate) trait Storage: Send + Sync {
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>>;
    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>);
    fn touch(&self, key: &str, ttl: u64);
    fn remove(&self, key: &str);
    fn clear(&self);
}
