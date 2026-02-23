# 🔄 Distributed Mode

For multi-node deployments, ZooCache offers an invalidation bus based on Redis.

## Configuration

Enable distributed mode by configuring the `bus_url`:

```python
configure(
    storage_url="redis://redis:6379",
    bus_url="redis://redis:6379",
    prefix="my_app" # Very important for environment isolation
)
```

## How It Works

1. **Node A** invalidates a tag → publishes a message to Redis Pub/Sub.
2. **Node B** (and others) receive the message → update their local `PrefixTrie`.
3. All related cache entries in all nodes are instantly invalidated.

## Self-Healing

What happens if a Redis message is lost? ZooCache is resilient:

1. Cache entries store "snapshots" of their dependency versions.
2. Upon reading an entry, its versions are compared with the current Trie state.
3. If the entry has obsolete versions (or the local Trie is lagging), ZooCache detects the inconsistency and forces an update.

This ensures **strong eventual consistency** even with messenger bus failures.
