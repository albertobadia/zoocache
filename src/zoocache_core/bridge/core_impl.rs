use crate::bus::{InvalidateBus, LocalBus, RedisPubSubBus};
use crate::core::Core;
use crate::storage::{InMemoryStorage, LmdbStorage, RedisStorage};
use crate::trie::PrefixTrie;
use crate::utils;
use crate::worker::{TtiState, spawn_worker};
use dashmap::DashMap;
use pyo3::prelude::*;
use std::sync::Arc;
use std::sync::atomic::AtomicU64;

impl Core {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn bridge_new(
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
    ) -> PyResult<Self> {
        let storage: Arc<dyn crate::storage::Storage> = match storage_url {
            Some(url) if url.starts_with("redis://") => Arc::new(
                RedisStorage::new(url, prefix, lru_update_interval).map_err(utils::to_conn_err)?,
            ),
            Some(url) if url.starts_with("lmdb://") => {
                Arc::new(LmdbStorage::new(&url[7..], lmdb_map_size)?)
            }
            Some(url) => {
                return Err(PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Unsupported storage scheme: {}",
                    url
                )));
            }
            None => Arc::new(InMemoryStorage::new()),
        };

        let trie = PrefixTrie::new();
        let mut bus_is_remote = false;

        let bus: Arc<dyn InvalidateBus> = match bus_url {
            Some(url) => {
                bus_is_remote = true;
                let channel = prefix.map(|p| format!("{}:invalidate", p));
                let r_bus = Arc::new(
                    RedisPubSubBus::new(url, channel.as_deref(), prefix, node_id)
                        .map_err(utils::to_conn_err)?,
                );

                let t_clone = trie.clone();
                let storage_clone = Arc::clone(&storage);
                let node_id_owned = node_id.unwrap_or("unknown").to_string();

                r_bus.start_listener(
                    move |tag, ver| {
                        t_clone.set_min_version(tag, ver);
                    },
                    move |prefix, req_id| {
                        let storage = Arc::clone(&storage_clone);
                        let prefix = prefix.to_string();
                        let node_id = node_id_owned.clone();
                        let req_id = req_id.to_string();

                        tokio::task::block_in_place(|| {
                            let rt = tokio::runtime::Handle::current();
                            rt.block_on(async move {
                                let matching_keys = storage.scan_keys(&prefix).await;
                                let keys_json: Vec<serde_json::Value> = matching_keys
                                    .into_iter()
                                    .map(|(k, expires_at)| {
                                        let ttl_rem = expires_at
                                            .and_then(|exp| exp.checked_sub(utils::now_secs()));
                                        serde_json::json!({
                                            "key": k,
                                            "ttl_remaining": ttl_rem
                                        })
                                    })
                                    .collect();

                                let payload = serde_json::json!({
                                    "req_id": req_id,
                                    "node_id": node_id,
                                    "keys": keys_json
                                });
                                serde_json::to_string(&payload).ok()
                            })
                        })
                    },
                );
                r_bus
            }
            None => Arc::new(LocalBus::new()),
        };

        let mut tti_state = None;
        let flights = Arc::new(DashMap::new());
        let flight_timeout_val = flight_timeout.unwrap_or(60);
        let silent_errors = Arc::new(AtomicU64::new(0));

        if read_extend_ttl {
            let tx = spawn_worker(
                Arc::clone(&storage),
                trie.clone(),
                Arc::clone(&bus),
                node_id.unwrap_or("unknown").to_string(),
                Arc::clone(&flights),
                Arc::clone(&silent_errors),
                tti_flush_secs.unwrap_or(30),
                auto_prune_secs,
                auto_prune_interval,
                bus_is_remote,
                lru_update_interval,
                flight_timeout_val,
            );
            tti_state = Some(Arc::new(TtiState {
                tx,
                dropped: AtomicU64::new(0),
            }));
        }

        Ok(Self {
            storage,
            bus,
            trie,
            flights,
            default_ttl,
            max_entries,
            tti_state,
            flight_timeout: flight_timeout_val,
            silent_errors,
            bus_is_remote,
        })
    }
}
