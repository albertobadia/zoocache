use crate::bus::InvalidateBus;
use crate::storage::{CacheEntry, Storage};
use crate::trie::PrefixTrie;
use std::collections::HashMap;
use std::num::NonZeroUsize;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{self, SyncSender};
use std::thread;
use std::time::{Duration, Instant};

pub(crate) enum WorkerMsg {
    Touch(String, Option<u64>),
    Prune(u64),
    Delete(String),
    Update(String, Vec<u8>, Option<u64>),
    UpdateEntry(String, Arc<CacheEntry>, Option<u64>),
    FlushMetrics(HashMap<String, f64>),
}

pub(crate) struct TtiState {
    pub(crate) tx: SyncSender<WorkerMsg>,
    pub(crate) dropped: AtomicU64,
}

impl TtiState {
    pub(crate) fn touch(&self, key: &str, ttl: Option<u64>) {
        if self
            .tx
            .try_send(WorkerMsg::Touch(key.to_string(), ttl))
            .is_err()
        {
            self.dropped.fetch_add(1, Ordering::Relaxed);
        }
    }
}

#[allow(clippy::too_many_arguments)]
pub(crate) fn spawn_worker(
    storage: Arc<dyn Storage>,
    trie: PrefixTrie,
    bus: Arc<dyn InvalidateBus>,
    node_id: String,
    flights: Arc<dashmap::DashMap<String, Arc<crate::flight::Flight>>>,
    silent_errors: Arc<AtomicU64>,
    tti_flush_secs: u64,
    auto_prune_secs: Option<u64>,
    auto_prune_interval: Option<u64>,
    bus_is_remote: bool,
    lru_update_interval: u64,
    flight_timeout: u64,
) -> SyncSender<WorkerMsg> {
    let (tx, rx) = mpsc::sync_channel::<WorkerMsg>(1_000_000);
    let tx_clone = tx.clone();

    thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();

        rt.block_on(async move {
            let mut sys = sysinfo::System::new_all();
            let mut local_metrics: HashMap<String, f64> = HashMap::new();
            let mut last_heartbeat = Instant::now();

            let mut last_touches =
                lru::LruCache::<String, Instant>::new(NonZeroUsize::new(10000).unwrap());
            let mut batch = HashMap::<String, Option<u64>>::new();
            let mut last_flush = Instant::now();
            let mut last_auto_prune = Instant::now();
            let flush_duration = Duration::from_secs(tti_flush_secs);
            let prune_interval = Duration::from_secs(auto_prune_interval.unwrap_or(3600));
            let prune_age = auto_prune_secs.unwrap_or(3600);

            loop {
                let now = Instant::now();
                let mut messages = Vec::new();

                match rx.recv_timeout(Duration::from_secs(1)) {
                    Ok(m) => messages.push(m),
                    Err(mpsc::RecvTimeoutError::Timeout) => {}
                    Err(mpsc::RecvTimeoutError::Disconnected) => break,
                };

                if !messages.is_empty() {
                    while let Ok(msg) = rx.try_recv() {
                        messages.push(msg);
                        if messages.len() >= 1000 {
                            break;
                        }
                    }
                }

                for msg in messages {
                    match msg {
                        WorkerMsg::Touch(key, ttl) => {
                            if !key.is_empty()
                                && !last_touches.get(&key).is_some_and(|&last| {
                                    now.duration_since(last)
                                        < Duration::from_secs(lru_update_interval)
                                })
                            {
                                batch.insert(key.clone(), ttl);
                                last_touches.put(key, now);
                            }
                        }
                        WorkerMsg::Prune(max_age) => {
                            trie.prune(max_age);
                        }
                        WorkerMsg::Delete(key) => {
                            if storage.remove(&key).await.is_err() {
                                silent_errors.fetch_add(1, Ordering::Relaxed);
                            }
                        }
                        WorkerMsg::UpdateEntry(key, entry, ttl) => {
                            if storage.set(key, entry, ttl).await.is_err() {
                                silent_errors.fetch_add(1, Ordering::Relaxed);
                            }
                        }
                        WorkerMsg::Update(key, data, ttl) => {
                            if storage.set_raw(key, data, ttl).await.is_err() {
                                silent_errors.fetch_add(1, Ordering::Relaxed);
                            }
                        }
                        WorkerMsg::FlushMetrics(metrics) => {
                            for (k, v) in metrics {
                                *local_metrics.entry(k).or_insert(0.0) += v;
                            }
                        }
                    }
                }

                if (batch.len() >= 1000 || now.duration_since(last_flush) > flush_duration)
                    && !batch.is_empty()
                {
                    if storage.touch_batch(batch.drain().collect()).await.is_err() {
                        silent_errors.fetch_add(1, Ordering::Relaxed);
                    }
                    last_flush = now;
                }

                if now.duration_since(last_auto_prune) > prune_interval {
                    trie.prune(prune_age);
                    last_auto_prune = now;
                }

                if now.duration_since(last_heartbeat) > Duration::from_secs(1) {
                    crate::flight::cleanup_stale_flights(&flights, flight_timeout);

                    if bus_is_remote {
                        sys.refresh_cpu_usage();
                        sys.refresh_memory();
                        let cpu_percent = sys.global_cpu_usage();
                        let ram_used = sys.used_memory() as f64;
                        let ram_total = sys.total_memory() as f64;
                        let ram_percent = if ram_total > 0.0 {
                            (ram_used / ram_total) * 100.0
                        } else {
                            0.0
                        };
                        let hostname =
                            sysinfo::System::host_name().unwrap_or_else(|| "unknown".to_string());
                        let uptime = sysinfo::System::uptime();

                        let payload = serde_json::json!({
                            "uuid": node_id,
                            "hostname": hostname,
                            "cpu": cpu_percent,
                            "ram": ram_percent,
                            "uptime": uptime,
                            "metrics": local_metrics,
                        });

                        if let Ok(json_str) = serde_json::to_string(&payload)
                            && bus.push_heartbeat(&node_id, &json_str, 5).await.is_err()
                        {
                            silent_errors.fetch_add(1, Ordering::Relaxed);
                        }
                    }
                    last_heartbeat = now;
                }
            }
        });
    });

    tx_clone
}
