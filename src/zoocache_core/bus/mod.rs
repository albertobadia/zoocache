mod local;
mod redis_pubsub;

pub(crate) use local::LocalBus;
pub(crate) use redis_pubsub::RedisPubSubBus;

pub(crate) trait InvalidateBus: Send + Sync {
    fn publish(&self, tag: &str, version: u64);
}
