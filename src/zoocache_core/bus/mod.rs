mod local;
mod redis_pubsub;

pub(crate) use local::LocalBus;
pub(crate) use redis_pubsub::RedisPubSubBus;

pub(crate) trait InvalidateBus: Send + Sync {
    fn publish(&self, tag: &str, version: u64);
    fn flush_metrics(
        &self,
        _metrics: std::collections::HashMap<String, f64>,
    ) -> pyo3::PyResult<()> {
        Ok(())
    }
}
