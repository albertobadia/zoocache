use super::InvalidateBus;

pub(crate) struct LocalBus;

impl LocalBus {
    pub fn new() -> Self {
        Self
    }
}

impl InvalidateBus for LocalBus {
    fn publish(&self, _tag: &str, _version: u64) {}
}
