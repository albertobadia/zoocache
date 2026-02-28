use crate::core::Core;
use crate::{InvalidTag, StorageIsFull};
use foldhash::HashMap;
use pyo3::prelude::*;
use std::sync::atomic::Ordering;

mod core_impl;
mod read;
pub mod utils;
mod write;

#[pymethods]
impl Core {
    #[new]
    #[allow(clippy::too_many_arguments)]
    #[pyo3(signature = (node_id=None, storage_url=None, bus_url=None, prefix=None, default_ttl=None, read_extend_ttl=true, max_entries=None, lmdb_map_size=None, flight_timeout=60, tti_flush_secs=30, auto_prune_secs=3600, auto_prune_interval=3600, lru_update_interval=30, compression_threshold=256))]
    fn new(
        node_id: Option<&str>,
        storage_url: Option<&str>,
        bus_url: Option<&str>,
        prefix: Option<&str>,
        default_ttl: Option<u64>,
        read_extend_ttl: bool,
        max_entries: Option<usize>,
        lmdb_map_size: Option<usize>,
        flight_timeout: Option<u64>,
        tti_flush_secs: Option<u64>,
        auto_prune_secs: Option<u64>,
        auto_prune_interval: Option<u64>,
        lru_update_interval: u64,
        compression_threshold: usize,
    ) -> PyResult<Self> {
        Self::bridge_new(
            node_id,
            storage_url,
            bus_url,
            prefix,
            default_ttl,
            read_extend_ttl,
            max_entries,
            lmdb_map_size,
            flight_timeout,
            tti_flush_secs,
            auto_prune_secs,
            auto_prune_interval,
            lru_update_interval,
            compression_threshold,
        )
    }

    fn get_sync<'py>(&self, py: Python<'py>, key: &str) -> PyResult<Option<Py<PyAny>>> {
        self.bridge_get_sync(py, key)
    }

    fn get_or_entry_sync<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<(Option<Py<PyAny>>, bool, bool)> {
        self.bridge_get_or_entry_sync(py, key)
    }

    fn get_or_entry<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<(Option<Py<PyAny>>, bool, bool)> {
        self.bridge_get_or_entry(py, key)
    }

    fn get_or_entry_async<'py>(&self, py: Python<'py>, key: &str) -> PyResult<Bound<'py, PyAny>> {
        self.bridge_get_or_entry_async(py, key)
    }

    fn finish_flight(&self, _py: Python, key: &str, is_error: bool, value: Option<Py<PyAny>>) {
        self.complete_flight(key, is_error, value);
    }

    fn get<'py>(&self, py: Python<'py>, key: &str) -> PyResult<Option<Py<PyAny>>> {
        self.bridge_get(py, key)
    }

    fn get_async<'py>(&self, py: Python<'py>, key: &str) -> PyResult<Bound<'py, PyAny>> {
        self.bridge_get_async(py, key)
    }

    #[pyo3(signature = (key, value, dependencies, ttl=None))]
    fn set(
        &self,
        py: Python,
        key: String,
        value: Py<PyAny>,
        dependencies: Vec<String>,
        ttl: Option<u64>,
    ) -> PyResult<()> {
        self.bridge_set(py, key, value, dependencies, ttl)
    }

    #[pyo3(signature = (key, value, dependencies, ttl=None))]
    fn set_async<'py>(
        &self,
        py: Python<'py>,
        key: String,
        value: Py<PyAny>,
        dependencies: Vec<String>,
        ttl: Option<u64>,
    ) -> PyResult<Bound<'py, PyAny>> {
        self.bridge_set_async(py, key, value, dependencies, ttl)
    }

    fn invalidate(&self, py: Python, tag: String) -> PyResult<()> {
        self.bridge_invalidate(py, tag)
    }

    fn invalidate_async<'py>(&self, py: Python<'py>, tag: String) -> PyResult<Bound<'py, PyAny>> {
        self.bridge_invalidate_async(py, tag)
    }

    fn clear(&self, py: Python) -> PyResult<()> {
        self.bridge_clear(py)
    }

    fn clear_async<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
        self.bridge_clear_async(py)
    }

    fn request_prune(&self, max_age_secs: u64) {
        if let Some(state) = &self.tti_state {
            let _ = state
                .tx
                .try_send(crate::worker::WorkerMsg::Prune(max_age_secs));
        }
    }

    fn prune(&self, max_age_secs: u64) {
        self.trie.prune(max_age_secs);
    }

    fn tag_version(&self, tag: &str) -> u64 {
        self.trie.get_tag_version(tag)
    }

    fn len(&self) -> usize {
        if self.storage.is_sync_storage() {
            self.storage.try_len_sync().unwrap_or(0)
        } else {
            crate::RUNTIME.block_on(self.storage.len())
        }
    }

    fn version(&self) -> String {
        env!("CARGO_PKG_VERSION").to_string()
    }

    fn tti_dropped_messages(&self) -> u64 {
        self.tti_state
            .as_ref()
            .map(|s| s.dropped.load(Ordering::Relaxed))
            .unwrap_or(0)
    }

    fn silent_errors(&self) -> u64 {
        self.silent_errors.load(Ordering::Relaxed)
    }

    fn get_tag_version(&self, tag: String) -> u64 {
        self.trie.get_tag_version(&tag)
    }

    fn flush_metrics(&self, metrics: HashMap<String, f64>) -> PyResult<()> {
        self.bridge_flush_metrics(metrics)
    }
}

// Internal helper for finish_flight to avoid circular reliance on bridge name
impl Core {
    fn complete_flight(&self, key: &str, is_error: bool, _value: Option<Py<PyAny>>) {
        crate::flight::complete_flight(&self.flights, key, is_error);
    }
}

#[pymodule]
pub fn _zoocache(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Core>()?;
    m.add_function(wrap_pyfunction!(utils::hash_key, m)?)?;
    m.add("InvalidTag", m.py().get_type::<InvalidTag>())?;
    m.add("StorageIsFull", m.py().get_type::<StorageIsFull>())?;
    Ok(())
}
