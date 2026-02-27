# 🚀 Quick Start

Get up and running with ZooCache in under 5 minutes.

> **TL;DR**: Use `@cacheable()` with `add_deps()` inside your functions to register dependencies.

## Installation

```bash
# Using uv (recommended)
uv add zoocache

# Using pip
pip install zoocache
```

### Requirements

- **Python 3.10+**
- No external dependencies required for in-memory mode
- **Redis** required for distributed mode

---

## ⚠️ Configuration (Critical!)

You **must** call `configure()` before using any cache functionality:

```python
from zoocache import configure

# Basic: In-memory mode (simplest, for development)
configure()

# With Redis: Persistent storage
configure(storage_url="redis://localhost:6379")

# Full: Distributed caching
configure(
    storage_url="redis://localhost:6379",
    bus_url="redis://localhost:6379",
    prefix="myapp_prod",  # Namespace for isolation
    default_ttl=3600,     # 1 hour default TTL
)
```

### Storage Options

| Storage | Use Case | Persistence | Installation |
|---------|----------|-------------|--------------|
| **Memory** | Development, testing | ❌ | Built-in |
| **Redis** | Production, distributed | ✅ | Built-in |
| **LMDB** | High-performance local | ✅ | Built-in |

| Storage | Bus | Use Case | Recommended For |
|---------|-----|----------|-----------------|
| **Memory** | ❌ | Development, testing | Local dev only |
| **Memory** | ✅ Redis | Single node with pub/sub | Not recommended |
| **Redis** | ❌ | Single instance | Simple deployments |
| **Redis** | ✅ Redis | Multi-node | ✅ **Recommended for distributed** |
| **LMDB** | ❌ | High-performance local | Single node, high throughput |
| **LMDB** | ✅ Redis | **High-performance distributed** | ✅ **Best for most production** |

> **Recommendation**: For most production deployments, use **LMDB** for storage (high performance) with **Redis** for the bus (distributed invalidation).

[→ See full storage configuration](configuration/storage.md)

---

## Your First Cached Function

```python
from zoocache import cacheable, invalidate, configure, add_deps

# Configure first!
configure()

@cacheable()
def get_user(uid):
    add_deps([f"user:{uid}"])  # Register dependencies
    # This function runs only on cache miss
    return {"id": uid, "name": f"User {uid}"}

# First call: executes function, caches result
user = get_user(1)
# Output: Function executed

# Second call: returns cached result instantly
user = get_user(1)
# Output: (instant, no print)
```

### How It Works

1. First call to `get_user(1)` executes the function and caches the result
2. Subsequent calls return the cached result immediately
3. The `deps` parameter defines what this cached result depends on

---

## Invalidation

### Basic Invalidation

```python
def update_user(uid, data):
    db.save(uid, data)
    invalidate(f"user:{uid}")  # Invalidate ALL cached results for user:uid
```

### Hierarchical Invalidation

```python
@cacheable()
def get_product(pid):
    add_deps([f"product:{pid}"])  # Register dependencies
    return db.get_product(pid)

@cacheable()
def get_reviews(pid):
    add_deps([f"product:{pid}:reviews"])  # Register dependencies
    return db.get_reviews(pid)

# Invalidate product AND its reviews
invalidate("product:42")

# Invalidate only reviews
invalidate("product:42:reviews")
```

[→ Learn more about semantic invalidation](invalidation.md)

---

## Dynamic Dependencies

Sometimes you don't know dependencies until runtime:

```python
@cacheable()
def get_dashboard(uid):
    user = db.get_user(uid)
    add_deps([f"user:{uid}"])
    
    if user.is_admin:
        reports = db.get_admin_reports()
        add_deps(["reports:admin"])
        return {"user": user, "reports": reports}
    
    return {"user": user}
```

[→ Learn more about dependencies](concepts.md)

---

## Distributed Mode

For multi-node deployments, configure the bus:

```python
configure(
    storage_url="redis://redis:6379",
    bus_url="redis://redis:6379",
    prefix="myapp_prod",
)
```

When any node invalidates a tag, all nodes receive the message and update their local cache.

[→ Learn more about distributed mode](distributed.md)

---

## Next Steps: Choose Your Path

### 🔌 FastAPI
Cache your FastAPI endpoints with `@cache_endpoint`.

[→ FastAPI Guide](fastapi.md)

### 🌐 Django
Transparent ORM caching with Django integration.

[→ Django Guide](django.md)

### ⭐ Litestar
Cache Litestar routes effortlessly.

[→ Litestar Guide](litestar.md)

### 💻 CLI
Monitor and manage your cache with the TUI.

[→ CLI Guide](cli.md)

### ⚙️ Configuration
Storage backends, TTL, serialization options.

[→ Configuration](configuration/index.md)

### 🧠 Concepts
Deep dive into how ZooCache works.

[→ Concepts](concepts.md)
