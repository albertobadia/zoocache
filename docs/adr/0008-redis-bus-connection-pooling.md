# ADR 0008: Redis Bus Connection Pooling

## Status
Accepted

## Context
High-frequency invalidations in distributed mode were creating a new Redis connection for every `publish` call. This led to connection exhaustion on the Redis server and high latency due to TCP handshake overhead.

## Decision
1. **Use `r2d2` Pooling**: Implement a connection pool for the `RedisPubSubBus`.
2. **Recycle Connections**: Reuse existing connections for metadata publication and listener threads.
3. **Exponential Backoff**: Implement robust reconnection logic in the listener thread using the pool.

## Consequences
- **Positive**: Extremely stable invalidation bus under extreme load.
- **Positive**: Lower latency for `invalidate()` calls in Redis mode.
- **Negative**: Increased memory usage to maintain the connection pool (configurable).
