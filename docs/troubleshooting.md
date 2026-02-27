# 🛠️ Best Practices and Troubleshooting

## Best Practices

### 1. Design Tag Hierarchy
Plan your invalidation patterns. Prefer logical hierarchies:

- **Good**: `org:{id}:team:{id}:user:{id}`
- **Bad**: `user_{id}` (no hierarchical relationship)

### 2. Safety TTL
Always use a default TTL as a safety net in case you forget a manual invalidation:

```python
configure(default_ttl=3600)
```

### 3. Correct Invalidation Level
Invalidate at the entity level; don't be too generic nor too specific:

- **Too generic**: `invalidate("products")` (invalidates the whole catalog)
- **Just right**: `invalidate("product:42")` (invalidates only that product and its variations)

---

## Troubleshooting

### Cache Not Invalidating
**Symptom**: Data changes but cache returns old values.
- Check that the tags in `@cacheable` and `invalidate()` match exactly.
- Ensure you are not using forbidden characters in the tags.

### Memory Growth
**Symptom**: Process consumes increasing amounts of RAM.
- The Trie stores tag versions indefinitely unless pruned.
- Enable automatic pruning: `configure(auto_prune_secs=3600, auto_prune_interval=3600)`.

### Nodes Out of Sync
**Symptom**: One server returns one value and another server returns another.
- Verify `bus_url` is correctly configured on all nodes.
- Check Redis connectivity.
- Remember that self-healing will sync data upon cross-reads.
