# Reliability & Edge Cases

Zoocache is designed to handle failure nodes, network issues, and extreme traffic patterns gracefully. This document details how the framework protects itself and your backend.

## 1. Thundering Herd (Cache Stampede)

When a hot key expires, a sudden "stampede" of requests can overwhelm the database.

### The Protection: SingleFlight
Zoocache uses the **SingleFlight** pattern. For any missing or stale key, only one execution (the **Leader**) is allowed to run the decorated function.

### Edge Case: What if the Leader fails?
If the function execution inside a leader fails (raises an exception):
- The exception is propagated to the leader.
- **Fail-fast for followers**: All waiting followers immediately receive a `RuntimeError` stating the leader failed. We do **not** restart the execution for every follower to avoid repeated hammering of a failing backend.
- **Safety Guardrails (ADR 0009)**: If the leader crashes or the thread panics, Zoocache detects the "poisoned" mutex and gracefully notifies all followers with an error. No more hanging or cascading crashes.
- **Timeout**: Followers will only wait for a maximum of 60 seconds before giving up and returning an error, ensuring responsiveness even in extreme stall scenarios.

## 2. Memory Management (Trie Bloat)

Every unique dependency tag (`org:1`, `user:42`) creates a node in the internal `PrefixTrie`.

### The Protection: Automatic Pruning
Zoocache implements a garbage collection mechanism for the Trie:
- **Last Accessed Tracking**: Every time a tag is validated or invalidated, its node (and its parents) are "touched" with the current timestamp.
- **Background Worker (Proactive)**: A dedicated thread sweeps the Trie periodically. Configured via `auto_prune_secs` (age) and `auto_prune_interval` (frequency).
- **Reactive Trigger**: If `prune_after` is set, Zoocache checks for pruning every 1000 operations.
- **Eviction-triggered**: When storage limit is reached and LRU eviction occurs, a full prune (`age=0`) is automatically triggered to immediately reclaim space.

## 3. Storage Performance (TTI De-bouncing)

For TTI (Time-To-Idle), the cache must update the "expiration" time on every read. Doing this synchronously would turn a fast read into a slow write.

### The Protection: Deferred Background Worker
- When `read_extend_ttl=True`, reads emit a signal to a background thread.
- **De-bouncing**: The background worker keeps track of recently "touched" keys. It will only perform a real write to the storage (Redis or LMDB) if the key hasn't been touched in the last 60 seconds.
- This results in a massive performance gain for hot keys while still maintaining the TTI guarantee.

## 4. Connection Stability (Redis Pooling)
In distributed environments, high-frequency invalidations can stress the network and the Redis server.

### The Protection: r2d2 Connection Pooling
- Zoocache implements an internal connection pool (**ADR 0008**) for the Redis Bus.
- Instead of opening a new socket for every invalidation, connections are recycled.
- This prevents TCP port exhaustion and provides robust reconnection logic with exponential backoff.

## 4. Distributed Reliability (Passive Resync)

In distributed mode, the **Redis Pub/Sub Bus** is the primary way to announce invalidations. However, Pub/Sub is "fire and forget" and messages can be lost.

Every entry stored in the cache includes a full snapshot of the versions of its dependencies at the time of creation.
- When an entry is read, Zoocache compares its metadata with the local Trie.
- **Lazy Update (Self-Healing)**: If the local metadata matches but the global Trie version has changed, the entry is validated. If successful, the entry's version is updated in storage (**ADR 0006**).
- If the metadata shows **newer** versions than the local Trie, the node realizes it's behind and **catches up automatically** (Ratchet).
- This ensures that missing a Pub/Sub message only results in temporary eventual consistency, but reading any fresh data "repairs" the local node and restores peak $O(1)$ performance.

## 5. Storage Transaction Safety

Low-level storage operations can fail due to various reasons (disk full, invalid key size, etc.).

### The Protection: Atomic Consistency
- **Error Propagation**: Any error at the storage level (e.g., LMDB errors) is caught and propagated to the Python layer as a `RuntimeError`.
- **Atomic Counter Sync**: For storage backends like LMDB, in-memory counters are only updated *after* the database transaction has successfully committed, ensuring the `len()` report is always accurate.

## Trade-offs & Considerations
- **Follower Cancellation**: Currently, if a follower's request is cancelled (e.g., HTTP client disconnects), the leader continues its work to ensure the cache eventually gets populated for others.
- **Storage Limits**: While Zoocache manages the Trie memory, the underlying storage (like LMDB `map_size` or Redis memory limits) must still be managed by the operator.
