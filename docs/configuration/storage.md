# 📦 Storage Backends

ZooCache supports various storage backends depending on your needs for persistence, speed, and distribution.

---

## 1. In-Memory
The fastest option. Data is stored in the process RAM and lost when the process restarts.

- **Best for**: Small ephemeral caches, local development, or data that can be easily re-computed.
- **Config**: Default behavior if `storage_url` is omitted.

```python
from zoocache import configure
configure(max_entries=1000)
```

---

## 2. LMDB (Local Persistent)
High-performance, file-based storage. It is shared between all processes on the same machine.

- **Best for**: High-throughput caching where data must persist between restarts.
- **Config**: Use `lmdb://` protocol.

```python
from zoocache import configure
configure(storage_url="lmdb://./cache_db")
```

---

## 3. Redis
Distributed caching. Multiple application instances share the same cache via Redis.

- **Best for**: Multi-node deployments (Kubernetes, AWS ECS) and large datasets.
- **Config**: Use `redis://` or `rediss://` (for SSL) protocol.

```python
from zoocache import configure
configure(storage_url="redis://:password@localhost:6379/0")
```

---

## Comparison Table

| Backend | Speed | Persistence | Distributed | Sharing |
|---------|-------|-------------|-------------|---------|
| **In-Memory** | ⚡ Extreme | No | No | No |
| **LMDB** | 🚀 Very High | Yes | No | Multi-process (Local) |
| **Redis** | 🏎️ High | Yes | Yes | Multi-node |
