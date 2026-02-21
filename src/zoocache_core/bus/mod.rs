mod local;
mod redis_pubsub;

pub(crate) use local::LocalBus;
pub(crate) use redis_pubsub::RedisPubSubBus;

pub(crate) trait InvalidateBus: Send + Sync {
    fn publish(&self, tag: &str, version: u64);
    fn push_heartbeat(&self, _node_id: &str, _payload: &str, _ttl: u64) -> pyo3::PyResult<()> {
        Ok(())
    }
}
