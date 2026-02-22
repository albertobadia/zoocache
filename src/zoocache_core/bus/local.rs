use super::InvalidateBus;
use async_trait::async_trait;

pub(crate) struct LocalBus;

impl LocalBus {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl InvalidateBus for LocalBus {
    async fn publish(&self, _tag: &str, _version: u64) {}
}
