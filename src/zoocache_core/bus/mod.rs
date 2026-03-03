mod local;
mod redis_pubsub;

pub(crate) use local::LocalBus;
pub(crate) use redis_pubsub::RedisPubSubBus;

use async_trait::async_trait;

#[async_trait]
pub(crate) trait InvalidateBus: Send + Sync {
    async fn publish(
        &self,
        tag: &str,
        version: u64,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>>;
    async fn push_heartbeat(
        &self,
        _node_id: &str,
        _payload: &str,
        _ttl: u64,
    ) -> pyo3::PyResult<()> {
        Ok(())
    }
}
