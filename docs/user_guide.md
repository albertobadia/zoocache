# User Guide

This guide covers everything you need to use Zoocache effectively.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Core Concepts](#core-concepts)
5. [API Reference](#api-reference)
6. [Storage Backends](#storage-backends)
7. [Distributed Mode](#distributed-mode)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Installation

```bash
pip install zoocache
```

Requirements:
- Python 3.10+
- No external dependencies for in-memory mode
- Redis for distributed mode

---

## Quick Start

### Basic Caching

```python
from zoocache import cacheable, invalidate

@cacheable(deps=lambda user_id: [f"user:{user_id}"])
def get_user(user_id: int):
    return db.fetch_user(user_id)

# First call: executes the function
get_user(42)

# Second call: returns cached result
get_user(42)

# Invalidate when data changes
def update_user(user_id: int, data: dict):
    db.save(user_id, data)
    invalidate(f"user:{user_id}")
```

### Hierarchical Invalidation

```python
@cacheable(deps=lambda org_id, user_id: [f"org:{org_id}:user:{user_id}"])
def get_org_user(org_id: int, user_id: int):
    return db.fetch_org_user(org_id, user_id)

# Cache entries for org 1
get_org_user(1, 100)
get_org_user(1, 200)
get_org_user(1, 300)

# Invalidate ALL users in org 1 with a single call
invalidate("org:1")
```

---

## Configuration

Call `configure()` **before any cache operation**:

```python
from zoocache import configure

configure(
    storage_url="lmdb://./cache_data",      # Persistent storage
    bus_url="redis://localhost:6379",        # Distributed invalidation
    prefix="myapp",                          # Namespace isolation
    default_ttl=3600,                        # Safety TTL: 1 hour
    read_extend_ttl=True,                    # TTI mode (reset on read)
    prune_after=86400,                       # Prune unused tags after 24h
)
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage_url` | `str` | `None` | Storage backend URL. `None` = in-memory |
| `bus_url` | `str` | `None` | Redis URL for Pub/Sub. `None` = local-only |
| `prefix` | `str` | `None` | Namespace prefix for keys and channels |
| `default_ttl` | `int` | `None` | Default TTL/TTI in seconds |
| `read_extend_ttl` | `bool` | `True` | If `True`, reading extends TTL (TTI mode) |
| `prune_after` | `int` | `None` | Auto-prune trie nodes unused for X seconds |

---

## Core Concepts

### Dependencies

Dependencies are tags that represent what data a cached function depends on:

```python
# Static dependencies (same for all calls)
@cacheable(deps=["global:settings", "feature:flags"])
def get_config():
    return load_config()

# Dynamic dependencies (based on arguments)
@cacheable(deps=lambda pid: [f"product:{pid}", f"store:{get_current_store()}"])
def get_product(pid: int):
    return db.get_product(pid)
```

### Hierarchical Tags

Tags use `:` as separator. Invalidating a parent invalidates all children:

```
org:1                  ← invalidate("org:1") kills ALL below
├── org:1:team:a
│   ├── org:1:team:a:user:1
│   └── org:1:team:a:user:2
└── org:1:team:b
    └── org:1:team:b:user:3
```

### Dynamic Dependencies with `add_deps()`

Register dependencies at runtime inside the function:

```python
from zoocache import cacheable, add_deps

@cacheable()
def get_dashboard(user_id: int):
    user = db.get_user(user_id)
    add_deps([f"user:{user_id}"])
    
    if user.is_admin:
        reports = db.get_admin_reports()
        add_deps(["reports:admin"])
        return {"user": user, "reports": reports}
    
    return {"user": user}
```

---

## API Reference

### `@cacheable(namespace=None, deps=None, ttl=None)`

Decorator that caches function results.

| Parameter | Type | Description |
|-----------|------|-------------|
| `namespace` | `str` | Optional prefix for cache key |
| `deps` | `list[str]` or `callable` | Static list or function returning dependencies |
| `ttl` | `int` | Per-function TTL override (seconds) |

Works with both sync and async functions:

```python
@cacheable(namespace="api", deps=["data"])
def sync_function():
    return "sync"

@cacheable(namespace="api", deps=["data"])
async def async_function():
    return "async"
```

### `invalidate(tag: str)`

Invalidate all cache entries depending on `tag` or any child of `tag`.

```python
invalidate("user:42")           # Invalidates user:42 only
invalidate("org:1")             # Invalidates org:1, org:1:*, etc.
invalidate("region:eu:pricing") # Specific nested tag
```

### `add_deps(deps: list[str])`

Register dependencies dynamically during function execution.

```python
@cacheable()
def fetch_data(query):
    results = db.query(query)
    for result in results:
        add_deps([f"entity:{result.type}:{result.id}"])
    return results
```

### `clear()`

Remove all entries from the cache and reset the trie.

```python
from zoocache import clear

clear()  # Nuclear option
```

### `prune(max_age_secs: int = 3600)`

Manually trigger pruning of unused trie nodes.

```python
from zoocache import prune

prune(86400)  # Remove nodes unused for 24 hours
```

### `configure(...)`

See [Configuration](#configuration) section.

### `version()`

Returns the version of the Rust core.

```python
from zoocache import version

print(version())  # "0.1.0"
```

---

## Storage Backends

### In-Memory (Default)

```python
configure()  # No storage_url = in-memory
```

- **Pros**: Fastest, no setup
- **Cons**: Lost on restart, not shared between processes

### LMDB (Persistent Local)

```python
configure(storage_url="lmdb:///path/to/cache")
```

- **Pros**: Persistent, very fast reads, shared between processes
- **Cons**: Single machine only
- **Note**: Default map size is 1GB

### Redis

```python
configure(storage_url="redis://localhost:6379")
```

- **Pros**: Shared across machines, built-in expiration
- **Cons**: Network latency, requires Redis server

---

## Distributed Mode

For multi-node deployments, enable the invalidation bus:

```python
configure(
    storage_url="redis://redis:6379",
    bus_url="redis://redis:6379",
    prefix="myapp"
)
```

### How It Works

1. **Node A** invalidates a tag → publishes to Redis Pub/Sub
2. **Node B** receives message → updates its local trie
3. All nodes stay consistent

### Self-Healing

If a Pub/Sub message is lost:

1. Cache entries store version snapshots of their dependencies
2. When Node B reads an entry created by Node A, it compares versions
3. If the entry has newer versions, Node B automatically catches up

This ensures eventual consistency even without reliable messaging.

---

## Best Practices

### 1. Design Your Tag Hierarchy

Plan your invalidation patterns upfront:

```
# Good: Hierarchical, matches your domain
org:{org_id}
org:{org_id}:team:{team_id}
org:{org_id}:team:{team_id}:user:{user_id}

# Bad: Flat, no relationships
user_42
team_a_user_42
org_1_team_a_user_42
```

### 2. Use Safety TTLs

Always set a default TTL as a safety net:

```python
configure(default_ttl=3600)  # 1 hour max, even if you forget to invalidate
```

### 3. Invalidate at the Right Level

```python
# Too broad: invalidates too much
invalidate("products")

# Too narrow: might miss related caches
invalidate(f"product:{pid}:detail")

# Just right: invalidate the entity
invalidate(f"product:{pid}")
```

### 4. Use Namespaces for Organization

```python
@cacheable(namespace="api:v2:users")
def get_user_v2(uid): ...

@cacheable(namespace="api:v1:users")
def get_user_v1(uid): ...
```

### 5. Monitor Tag Cardinality

High-cardinality tags can bloat the trie. Use pruning:

```python
configure(prune_after=3600)  # Prune hourly
```

---

## Troubleshooting

### Cache Not Invalidating

**Symptom**: Data updates but cache returns old values.

**Causes**:
1. Tag mismatch between `deps` and `invalidate()`
2. Missing parent/child relationship in tags

**Debug**:
```python
from zoocache._zoocache import Core

core = Core()
print(core.tag_version("user:42"))  # Check current version
```

### Memory Growing

**Symptom**: Process memory increases over time.

**Cause**: Trie nodes never pruned.

**Solution**:
```python
configure(prune_after=3600)  # Enable auto-prune

# Or manually
from zoocache import prune
prune(3600)
```

### Distributed Nodes Out of Sync

**Symptom**: Different nodes return different values.

**Causes**:
1. Redis Pub/Sub not configured
2. Network issues blocking Pub/Sub

**Solutions**:
1. Verify `bus_url` is set
2. Check Redis connectivity
3. Self-healing will eventually sync on reads

### Thundering Herd Still Happening

**Symptom**: Multiple executions for the same cold key.

**Cause**: Short-lived processes or different namespaces.

**Debug**: Ensure all instances use the same `namespace` and `prefix`.

---

## Next Steps

- [Architecture Overview](architecture.md)
- [Hierarchical Invalidation Deep Dive](invalidation.md)
- [Distributed Consistency with HLC](consistency.md)
- [Reliability & Edge Cases](reliability.md)
