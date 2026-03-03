use crate::bus::{InvalidateBus, LocalBus, RedisPubSubBus};
use crate::core::Core;
use crate::storage::{InMemoryStorage, LmdbStorage, RedisStorage, set_compression_threshold};
use crate::trie::PrefixTrie;
use crate::utils;
use crate::utils::FastDashMap as DashMap;
use crate::worker::{TtiState, spawn_worker};
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
        compression_threshold: usize,
        channel_capacity: usize,
        batch_size: usize,
        lru_cache_size: usize,
    ) -> PyResult<Self> {
        set_compression_threshold(compression_threshold);
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
                    move |prefix, req_id, client, inspect_reply_channel| {
                        let storage = Arc::clone(&storage_clone);
                        let prefix = prefix.to_string();
                        let node_id = node_id_owned.clone();
                        let req_id = req_id.to_string();

                        if storage.is_sync_storage()
                            && let Some(matching_keys) = storage.try_scan_keys_sync(&prefix)
                        {
                            let payload = serde_json::json!({
                                "req_id": req_id,
                                "node_id": node_id,
                                "keys": matching_keys.into_iter().map(|(k, exp)| {
                                    serde_json::json!({
                                        "key": k,
                                        "ttl_remaining": exp.and_then(|e| e.checked_sub(utils::now_secs()))
                                    })
                                }).collect::<Vec<_>>()
                            });
                            if let Ok(reply_json) = serde_json::to_string(&payload) {
                                crate::RUNTIME.spawn(async move {
                                    use redis::AsyncCommands;
                                    if let Ok(mut reply_conn) = client.get_multiplexed_async_connection().await {
                                        let _: Result<(), redis::RedisError> = reply_conn.publish(&inspect_reply_channel, reply_json).await;
                                    }
                                });
                            }
                            return;
                        }

                        crate::RUNTIME.spawn(async move {
                            use redis::AsyncCommands;
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

                            if let Ok(reply_json) = serde_json::to_string(&payload)
                                && let Ok(mut reply_conn) = client.get_multiplexed_async_connection().await
                            {
                                let _: Result<(), redis::RedisError> = reply_conn.publish(&inspect_reply_channel, reply_json).await;
                            }
                        });
                    },
                );
                r_bus
            }
            None => Arc::new(LocalBus::new()),
        };

        let mut tti_state = None;
        let flights = Arc::new(DashMap::default());
        let flight_timeout_val = flight_timeout.unwrap_or(60);
        let silent_errors = Arc::new(AtomicU64::new(0));

        if read_extend_ttl || max_entries.is_some() || bus_is_remote {
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
                channel_capacity,
                batch_size,
                lru_cache_size,
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
