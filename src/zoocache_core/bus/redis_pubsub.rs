use redis::{Client, Commands};
use std::sync::Arc;
use std::thread;

use super::InvalidateBus;

pub(crate) struct RedisPubSubBus {
    client: Client,
    channel: String,
}

impl RedisPubSubBus {
    pub fn new(url: &str, channel: Option<&str>) -> Result<Self, redis::RedisError> {
        let client = Client::open(url)?;
        client.get_connection()?;
        Ok(Self {
            client,
            channel: channel.unwrap_or("zoocache:invalidate").to_string(),
        })
    }

    pub fn start_listener<F>(self: &Arc<Self>, callback: F)
    where
        F: Fn(&str) + Send + Sync + 'static,
    {
        let client = self.client.clone();
        let channel = self.channel.clone();

        thread::spawn(move || {
            let mut backoff_ms = 100;
            loop {
                let conn_res = client.get_connection();
                
                let mut conn = match conn_res {
                    Ok(c) => c,
                    Err(e) => {
                        eprintln!("[zoocache] Bus connection failed: {}. Retrying in {}ms...", e, backoff_ms);
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
                    if let Ok(tag) = msg.get_payload::<String>() {
                        callback(&tag);
                    }
                }
                
                eprintln!("[zoocache] Bus connection lost. Reconnecting...");
                thread::sleep(std::time::Duration::from_millis(100));
            }
        });
    }
}

impl InvalidateBus for RedisPubSubBus {
    fn publish(&self, tag: &str) {
        if let Ok(mut conn) = self.client.get_connection() {
            let _: Result<(), _> = conn.publish(&self.channel, tag);
        }
    }
}
