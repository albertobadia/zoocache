use async_trait::async_trait;
use redis::aio::MultiplexedConnection;
use redis::{AsyncCommands, Client};
use std::sync::Arc;
use tokio::sync::RwLock;

use super::InvalidateBus;

pub(crate) struct RedisPubSubBus {
    client: Client,
    connection: Arc<RwLock<Option<MultiplexedConnection>>>,
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
        let p_str = prefix.unwrap_or("zoocache");
        let n_channel = node_id.map(|id| format!("{}:node:{}:invalidate", p_str, id));

        let inspect_channel = format!("{}:inspect:request", p_str);
        let inspect_reply_channel = format!("{}:inspect:reply", p_str);

        Ok(Self {
            client,
            connection: Arc::new(RwLock::new(None)),
            channel: channel
                .map(|s| s.to_string())
                .unwrap_or_else(|| format!("{}:invalidate", p_str)),
            node_channel: n_channel,
            inspect_channel,
            inspect_reply_channel,
            prefix: p_str.to_string(),
        })
    }

    async fn get_conn(&self) -> Result<MultiplexedConnection, redis::RedisError> {
        let mut conn_guard = self.connection.write().await;
        if let Some(conn) = &*conn_guard {
            return Ok(conn.clone());
        }

        let conn = self.client.get_multiplexed_async_connection().await?;
        *conn_guard = Some(conn.clone());
        Ok(conn)
    }

    pub fn start_listener<F, I>(&self, invalidate_cb: F, inspect_cb: I)
    where
        F: Fn(&str, u64) + Send + Sync + 'static,
        I: Fn(&str, &str) -> Option<String> + Send + Sync + 'static,
    {
        let client = self.client.clone();
        let channel = self.channel.clone();
        let n_channel = self.node_channel.clone();
        let inspect_channel = self.inspect_channel.clone();
        let inspect_reply_channel = self.inspect_reply_channel.clone();

        crate::RUNTIME.spawn(async move {
            let mut backoff_ms = 100;

            loop {
                let pubsub_res = client.get_async_pubsub().await;

                let mut pubsub = match pubsub_res {
                    Ok(p) => p,
                    Err(e) => {
                        log::warn!(
                            "Bus listener connection failed: {}. Retrying in {}ms...",
                            e,
                            backoff_ms
                        );
                        tokio::time::sleep(tokio::time::Duration::from_millis(backoff_ms)).await;
                        backoff_ms = (backoff_ms * 2).min(5000);
                        continue;
                    }
                };

                if let Err(e) = pubsub.subscribe(&channel).await {
                    log::warn!("Bus subscribe failed: {}. Retrying...", e);
                    tokio::time::sleep(tokio::time::Duration::from_millis(backoff_ms)).await;
                    backoff_ms = (backoff_ms * 2).min(5000);
                    continue;
                }

                if let Some(ref nc) = n_channel
                    && let Err(e) = pubsub.subscribe(nc).await
                {
                    log::warn!("Bus node subscribe failed: {}", e);
                }

                if let Err(e) = pubsub.subscribe(&inspect_channel).await {
                    log::warn!("Bus inspect subscribe failed: {}", e);
                }

                log::info!("Bus connected to {}", channel);
                backoff_ms = 100;

                let mut stream = pubsub.on_message();
                use futures_util::StreamExt;

                while let Some(msg) = stream.next().await {
                    let Ok(payload) = msg.get_payload::<String>() else {
                        continue;
                    };

                    let channel_name = msg.get_channel_name();
                    if channel_name == inspect_channel {
                        if let Some((prefix, req_id)) = payload.rsplit_once('|') {
                            let prefix_str = prefix.trim();
                            let req_id_str = req_id.trim();

                            if let Some(reply_json) = inspect_cb(prefix_str, req_id_str) {
                                // For reply, we need another connection
                                if let Ok(mut reply_conn) =
                                    client.get_multiplexed_async_connection().await
                                {
                                    let _: Result<(), redis::RedisError> = reply_conn
                                        .publish(&inspect_reply_channel, reply_json)
                                        .await;
                                }
                            }
                        }
                    } else if let Some((tag, ver_str)) = payload.rsplit_once('|')
                        && let Ok(ver) = ver_str.trim().parse::<u64>()
                    {
                        invalidate_cb(tag.trim(), ver);
                    }
                }

                tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            }
        });
    }
}

#[async_trait]
impl InvalidateBus for RedisPubSubBus {
    async fn publish(&self, tag: &str, version: u64) {
        if let Ok(mut conn) = self.get_conn().await {
            let payload = format!("{}|{}", tag, version);
            let _: Result<(), _> = conn.publish(&self.channel, payload).await;
        }
    }

    async fn push_heartbeat(&self, node_id: &str, payload: &str, ttl: u64) -> pyo3::PyResult<()> {
        use crate::utils::to_conn_err;
        let mut conn = self.get_conn().await.map_err(to_conn_err)?;
        let key = format!("{}:node:{}", self.prefix, node_id);

        let _: () = conn
            .set_ex(key, payload.to_string(), ttl)
            .await
            .map_err(to_conn_err)?;

        Ok(())
    }
}
