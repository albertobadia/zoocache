use crate::core::Core;
use crate::storage::CacheEntry;
use crate::trie::build_dependency_snapshots;
use crate::worker::WorkerMsg;
use crate::{RUNTIME, utils};
use foldhash::HashMap;
use pyo3::prelude::*;
use std::sync::Arc;

impl Core {
    pub(crate) fn bridge_set(
        &self,
        py: Python,
        key: String,
        value: Py<PyAny>,
        dependencies: Vec<String>,
        ttl: Option<u64>,
    ) -> PyResult<()> {
        for tag in &dependencies {
            super::utils::validate_tag(tag)?;
        }
        let trie_version = self.trie.get_global_version();
        let snapshots = build_dependency_snapshots(&self.trie, dependencies, utils::now_secs());
        let entry = Arc::new(crate::storage::CacheEntry {
            value,
            dependencies: snapshots,
            trie_version,
        });
        let storage = Arc::clone(&self.storage);
        let final_ttl = ttl.or(self.default_ttl);
        let max_entries = self.max_entries;
        let trie = self.trie.clone();

        let res = storage.try_set_sync(py, key.clone(), Arc::clone(&entry), final_ttl);
        if storage.is_sync_storage() || res.is_ok() {
            if let Ok(()) = res
                && let Some(max) = max_entries
                && let Some(current) = storage.try_len_sync()
                && current > max
            {
                let to_evict = current - max + (max / 10).max(1);
                if let Some(Ok(_evicted)) = storage.try_evict_lru_sync(to_evict) {
                    trie.prune(0);
                }
            }
            return res;
        }

        py.detach(|| {
            RUNTIME.block_on(async move {
                storage.set(key, entry, final_ttl).await?;

                if let Some(max) = max_entries {
                    let current = storage.len().await;
                    if current > max {
                        let to_evict = current - max + (max / 10).max(1);
                        storage.evict_lru(to_evict).await?;
                        trie.prune(0);
                    }
                }
                Ok(())
            })
        })
    }

    pub(crate) fn bridge_set_async<'py>(
        &self,
        py: Python<'py>,
        key: String,
        value: Py<PyAny>,
        dependencies: Vec<String>,
        ttl: Option<u64>,
    ) -> PyResult<Bound<'py, PyAny>> {
        for tag in &dependencies {
            super::utils::validate_tag(tag)?;
        }
        let trie_version = self.trie.get_global_version();
        let snapshots = build_dependency_snapshots(&self.trie, dependencies, utils::now_secs());
        let entry = Arc::new(CacheEntry {
            value,
            dependencies: snapshots,
            trie_version,
        });
        let storage = Arc::clone(&self.storage);
        let final_ttl = ttl.or(self.default_ttl);
        let max_entries = self.max_entries;
        let trie = self.trie.clone();

        let sync_evict = max_entries.and_then(|max| {
            storage.try_len_sync().and_then(|current| {
                if current > max {
                    let to_evict = current - max + (max / 10).max(1);
                    storage.try_evict_lru_sync(to_evict)
                } else {
                    None
                }
            })
        });

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            storage.set(key, entry, final_ttl).await?;

            if let Some(evicted) = sync_evict {
                if let Ok(_keys) = evicted {
                    trie.prune(0);
                }
            } else if let Some(max) = max_entries
                && let Some(current) = storage.try_len_sync()
                && current > max
            {
                let to_evict = current - max + (max / 10).max(1);
                storage.evict_lru(to_evict).await?;
                trie.prune(0);
            }
            Ok(Python::attach(|py| py.None()))
        })
    }

    pub(crate) fn bridge_invalidate(&self, py: Python, tag: String) -> PyResult<()> {
        super::utils::validate_tag(&tag)?;
        let new_ver = self.trie.invalidate(&tag);

        if self.bus_is_remote {
            let bus = Arc::clone(&self.bus);
            py.detach(|| {
                RUNTIME.spawn(async move {
                    bus.publish(&tag, new_ver).await;
                });
            });
        }
        Ok(())
    }

    pub(crate) fn bridge_invalidate_async<'py>(
        &self,
        py: Python<'py>,
        tag: String,
    ) -> PyResult<Bound<'py, PyAny>> {
        super::utils::validate_tag(&tag)?;
        let new_ver = self.trie.invalidate(&tag);
        let bus = Arc::clone(&self.bus);
        let tag_clone = tag.clone();

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            bus.publish(&tag_clone, new_ver).await;
            Ok(Python::attach(|py| py.None()))
        })
    }

    pub(crate) fn bridge_clear(&self, py: Python) -> PyResult<()> {
        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();

        let res = storage.try_clear_sync();
        if storage.is_sync_storage() || res.is_ok() {
            if res.is_ok() {
                trie.clear();
            }
            return res;
        }

        py.detach(|| {
            RUNTIME.block_on(async move {
                storage.clear().await?;
                trie.clear();
                Ok(())
            })
        })
    }

    pub(crate) fn bridge_clear_async<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            storage.clear().await?;
            trie.clear();
            Ok(Python::attach(|py| py.None()))
        })
    }

    pub(crate) fn bridge_flush_metrics(&self, metrics: HashMap<String, f64>) -> PyResult<()> {
        if let Some(state) = &self.tti_state {
            let _ = state.tx.try_send(WorkerMsg::FlushMetrics(metrics));
        }
        Ok(())
    }
}
