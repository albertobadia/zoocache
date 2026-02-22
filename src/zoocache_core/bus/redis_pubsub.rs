use r2d2::Pool;
use redis::{Client, Commands};
use std::thread;

use super::InvalidateBus;

pub(crate) struct RedisPubSubBus {
    pool: Pool<Client>,
    channel: String,
    node_channel: Option<String>,
    inspect_channel: String,
    inspect_reply_channel: String,
    prefix: String,
}

impl RedisPubSubBus {
    pub fn new(
        url: &str,
        channel: Option<&str>,
        prefix: Option<&str>,
        node_id: Option<&str>,
    ) -> Result<Self, redis::RedisError> {
        let client = Client::open(url)?;
        let pool = Pool::builder()
            .build(client)
            .map_err(|e| redis::RedisError::from(std::io::Error::other(e)))?;

        let p_str = prefix.unwrap_or("zoocache");
        let n_channel = node_id.map(|id| format!("{}:node:{}:invalidate", p_str, id));

        let inspect_channel = format!("{}:inspect:request", p_str);
        let inspect_reply_channel = format!("{}:inspect:reply", p_str);

        Ok(Self {
            pool,
            channel: channel
                .map(|s| s.to_string())
                .unwrap_or_else(|| format!("{}:invalidate", p_str)),
            node_channel: n_channel,
            inspect_channel,
            inspect_reply_channel,
            prefix: p_str.to_string(),
        })
    }

    pub fn start_listener<F, I>(&self, invalidate_cb: F, inspect_cb: I)
    where
        F: Fn(&str, u64) + Send + Sync + 'static,
        I: Fn(&str, &str) -> Option<String> + Send + Sync + 'static,
    {
        let pool = self.pool.clone();
        let channel = self.channel.clone();
        let n_channel = self.node_channel.clone();
        let inspect_channel = self.inspect_channel.clone();
        let inspect_reply_channel = self.inspect_reply_channel.clone();

        thread::spawn(move || {
            let mut backoff_ms = 100;

            loop {
                let conn_res = pool.get();

                let mut conn = match conn_res {
                    Ok(c) => c,
                    Err(e) => {
                        log::warn!(
                            "Bus listener connection failed: {}. Retrying in {}ms...",
                            e,
                            backoff_ms
                        );
                        thread::sleep(std::time::Duration::from_millis(backoff_ms));
                        backoff_ms = (backoff_ms * 2).min(5000);
                        continue;
                    }
                };

                let mut pubsub = conn.as_pubsub();
                if let Err(e) = pubsub.subscribe(&channel) {
                    log::warn!("Bus subscribe failed: {}. Retrying...", e);
                    thread::sleep(std::time::Duration::from_millis(backoff_ms));
                    backoff_ms = (backoff_ms * 2).min(5000);
                    continue;
                }

                if let Some(ref nc) = n_channel
                    && let Err(e) = pubsub.subscribe(nc)
                {
                    log::warn!("Bus node subscribe failed: {}. Retrying...", e);
                }

                if let Err(e) = pubsub.subscribe(&inspect_channel) {
                    log::warn!("Bus inspect subscribe failed: {}. Retrying...", e);
                }

                log::info!("Bus connected to {}", channel);
                backoff_ms = 100; // Reset on success

                while let Ok(msg) = pubsub.get_message() {
                    let Ok(payload) = msg.get_payload::<String>() else {
                        continue;
                    };

                    let channel_name = msg.get_channel_name();
                    if channel_name == inspect_channel {
                        if let Some((prefix, req_id)) = payload.rsplit_once('|') {
                            let prefix = prefix.trim();
                            let req_id = req_id.trim();
                            
                            if let Some(reply_json) = inspect_cb(prefix, req_id)
                                && let Ok(mut reply_conn) = pool.get()
                            {
                                let _: Result<(), _> =
                                    reply_conn.publish(&inspect_reply_channel, reply_json);
                            }
                        }
                    } else if let Some((tag, ver_str)) = payload.rsplit_once('|')
                        && let Ok(ver) = ver_str.trim().parse::<u64>()
                    {
                        invalidate_cb(tag.trim(), ver);
                    }
                }

                thread::sleep(std::time::Duration::from_millis(100));
            }
        });
    }
}

impl InvalidateBus for RedisPubSubBus {
    fn publish(&self, tag: &str, version: u64) {
        if let Ok(mut conn) = self.pool.get() {
            let payload = format!("{}|{}", tag, version);
            let _: Result<(), _> = conn.publish(&self.channel, payload);
        }
    }

    fn push_heartbeat(&self, node_id: &str, payload: &str, ttl: u64) -> pyo3::PyResult<()> {
        use crate::utils::to_conn_err;
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let key = format!("{}:node:{}", self.prefix, node_id);

        let _: () = redis::cmd("SET")
            .arg(&key)
            .arg(payload)
            .arg("EX")
            .arg(ttl)
            .query(&mut conn)
            .map_err(to_conn_err)?;

        Ok(())
    }
}
