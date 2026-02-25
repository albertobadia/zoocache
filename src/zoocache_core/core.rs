use crate::bus::InvalidateBus;
use crate::flight::Flight;
use crate::storage::Storage;
use crate::trie::PrefixTrie;
use crate::worker::TtiState;
use dashmap::DashMap;
use pyo3::prelude::*;
use std::sync::Arc;
use std::sync::atomic::AtomicU64;

#[pyclass]
pub(crate) struct Core {
    pub(crate) storage: Arc<dyn Storage>,
    pub(crate) bus: Arc<dyn InvalidateBus>,
    pub(crate) trie: PrefixTrie,
    pub(crate) flights: Arc<DashMap<String, Arc<Flight>>>,
    pub(crate) default_ttl: Option<u64>,
    pub(crate) max_entries: Option<usize>,
    pub(crate) tti_state: Option<Arc<TtiState>>,
    pub(crate) flight_timeout: u64,
    pub(crate) silent_errors: Arc<AtomicU64>,
    pub(crate) bus_is_remote: bool,
}

impl Core {
    pub(crate) fn tti_touch(&self, key: &str, ttl: Option<u64>) {
        if let Some(state) = &self.tti_state {
            state.touch(key, ttl);
        }
    }
}
