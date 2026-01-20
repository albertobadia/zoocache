use redis::{Client, Commands};
use std::sync::Arc;
use std::thread;
use r2d2::Pool;

use super::InvalidateBus;

pub(crate) struct RedisPubSubBus {
    pool: Pool<Client>,
    channel: String,
}

impl RedisPubSubBus {
    pub fn new(url: &str, channel: Option<&str>) -> Result<Self, redis::RedisError> {
        let client = Client::open(url)?;
        let pool = Pool::builder()
            .build(client)
            .map_err(|e| redis::RedisError::from(std::io::Error::other(e)))?;

        Ok(Self {
            pool,
            channel: channel.unwrap_or("zoocache:invalidate").to_string(),
        })
    }

    pub fn start_listener<F>(self: &Arc<Self>, callback: F)
    where
        F: Fn(&str, u64) + Send + Sync + 'static,
    {
        let pool = self.pool.clone();
        let channel = self.channel.clone();

        thread::spawn(move || {
            let mut backoff_ms = 100;
            loop {
                let conn_res = pool.get();
                
                let mut conn = match conn_res {
                    Ok(c) => c,
                    Err(e) => {
                        eprintln!("[zoocache] Bus listener connection failed: {}. Retrying in {}ms...", e, backoff_ms);
                        thread::sleep(std::time::Duration::from_millis(backoff_ms));
                        backoff_ms = (backoff_ms * 2).min(5000);
                        continue;
                    }
                };

                let mut pubsub = conn.as_pubsub();
                if let Err(e) = pubsub.subscribe(&channel) {
                    eprintln!("[zoocache] Bus subscribe failed: {}. Retrying...", e);
                    thread::sleep(std::time::Duration::from_millis(backoff_ms));
                    backoff_ms = (backoff_ms * 2).min(5000);
                    continue;
                }

                println!("[zoocache] Bus connected to {}", channel);
                backoff_ms = 100; // Reset on success

                while let Ok(msg) = pubsub.get_message() {
                    if let Ok(payload) = msg.get_payload::<String>()
                        && let Some((tag, ver_str)) = payload.rsplit_once('|')
                        && let Ok(ver) = ver_str.parse::<u64>()
                    {
                        callback(tag, ver);
                    }
                }
                
                eprintln!("[zoocache] Bus connection lost. Reconnecting...");
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
}
