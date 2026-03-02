use crate::bus::InvalidateBus;
use crate::storage::{CacheEntry, Storage};
use crate::trie::PrefixTrie;
use crossbeam_channel::{self, RecvTimeoutError, Sender};
use foldhash::HashMap;
use std::num::NonZeroUsize;
use std::panic::AssertUnwindSafe;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
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
    pub(crate) tx: Sender<WorkerMsg>,
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
    flights: Arc<crate::utils::FastDashMap<String, Arc<crate::flight::Flight>>>,
    silent_errors: Arc<AtomicU64>,
    tti_flush_secs: u64,
    auto_prune_secs: Option<u64>,
    auto_prune_interval: Option<u64>,
    bus_is_remote: bool,
    lru_update_interval: u64,
    flight_timeout: u64,
    channel_capacity: usize,
    batch_size: usize,
    lru_cache_size: usize,
) -> Sender<WorkerMsg> {
    let (tx, rx) = crossbeam_channel::bounded::<WorkerMsg>(channel_capacity);
    let tx_clone = tx.clone();

    thread::spawn(move || {
        loop {
            let storage = Arc::clone(&storage);
            let trie = trie.clone();
            let bus = Arc::clone(&bus);
            let node_id = node_id.clone();
            let flights = Arc::clone(&flights);
            let silent_errors = Arc::clone(&silent_errors);
            let rx = rx.clone();

            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("Failed to create runtime");

            let res = std::panic::catch_unwind(AssertUnwindSafe(|| {
                rt.block_on(async move {
                    let mut sys = sysinfo::System::new_all();
                    let mut local_metrics: HashMap<String, f64> = Default::default();
                    let mut last_heartbeat = Instant::now();

                    let mut last_touches = lru::LruCache::<String, Instant>::new(
                        NonZeroUsize::new(lru_cache_size).unwrap(),
                    );
                    let mut batch = HashMap::<String, Option<u64>>::default();
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
                            Err(RecvTimeoutError::Timeout) => {}
                            Err(RecvTimeoutError::Disconnected) => break,
                        };

                        if !messages.is_empty() {
                            while let Ok(msg) = rx.try_recv() {
                                messages.push(msg);
                                if messages.len() >= batch_size {
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
                                    if let Err(e) = storage.remove(&key).await {
                                        silent_errors.fetch_add(1, Ordering::Relaxed);
                                        log::warn!("Background Prune failed for {}: {}", key, e);
                                    }
                                }
                                WorkerMsg::UpdateEntry(key, entry, ttl) => {
                                    if let Err(e) = storage.set(key.clone(), entry, ttl).await {
                                        silent_errors.fetch_add(1, Ordering::Relaxed);
                                        log::warn!(
                                            "Background UpdateEntry failed for {}: {}",
                                            key,
                                            e
                                        );
                                    }
                                }
                                WorkerMsg::Update(key, data, ttl) => {
                                    if let Err(e) = storage.set_raw(key.clone(), data, ttl).await {
                                        silent_errors.fetch_add(1, Ordering::Relaxed);
                                        log::warn!("Background Update failed for {}: {}", key, e);
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
                            if let Err(e) = storage.touch_batch(batch.drain().collect()).await {
                                silent_errors.fetch_add(1, Ordering::Relaxed);
                                log::warn!("Background TTI touch_batch failed: {}", e);
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
                                let hostname = sysinfo::System::host_name()
                                    .unwrap_or_else(|| "unknown".to_string());
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
                                    && let Err(e) = bus.push_heartbeat(&node_id, &json_str, 5).await
                                {
                                    silent_errors.fetch_add(1, Ordering::Relaxed);
                                    log::trace!("Heartbeat push failed: {}", e);
                                }
                            }
                            last_heartbeat = now;
                        }
                    }
                });
            }));

            match res {
                Ok(_) => break, // Normal exit (Disconnected)
                Err(_) => {
                    log::error!("Background worker panicked! Restarting in 3 seconds...");
                    std::thread::sleep(Duration::from_secs(3));
                }
            }
        }
    });

    tx_clone
}
