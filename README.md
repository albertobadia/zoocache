# 🐾 Zoocache

**Cache that invalidates when your data changes, not when a timer expires.**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

```python
from zoocache import cacheable, invalidate

@cacheable(deps=lambda user_id: [f"user:{user_id}"])
def get_user(user_id: int):
    return db.fetch_user(user_id)

def update_user(user_id: int, data: dict):
    db.save(user_id, data)
    invalidate(f"user:{user_id}")  # Cache dies instantly
```

---

## The Problem

TTL-based caching is a guess. You set `ttl=300` and hope your data doesn't change in 5 minutes. When it does, users see stale data. When it doesn't, you're making unnecessary queries.

**Zoocache flips this**: readers declare what they depend on, writers signal what changed. The cache handles the rest.

---

## Installation

```bash
pip install zoocache
```

---

## Quick Start

### 1. Cache with Dependencies

```python
from zoocache import cacheable

@cacheable(deps=lambda order_id: [f"order:{order_id}"])
def get_order(order_id: int):
    return db.query("SELECT * FROM orders WHERE id = ?", order_id)

@cacheable(deps=["orders:list"])
def list_orders():
    return db.query("SELECT * FROM orders LIMIT 100")
```

### 2. Invalidate on Write

```python
from zoocache import invalidate

def ship_order(order_id: int):
    db.execute("UPDATE orders SET status='shipped' WHERE id = ?", order_id)
    invalidate(f"order:{order_id}")
    invalidate("orders:list")
```

### 3. Hierarchical Invalidation

Dependencies form a tree. Invalidating a parent kills all children:

```python
# Cache depends on a specific user in an org
@cacheable(deps=["org:acme:user:42"])
def get_user_data():
    return fetch_user()

# Invalidate just this user
invalidate("org:acme:user:42")

# Or nuke the entire org
invalidate("org:acme")  # Kills everything under org:acme
```

### 4. Dynamic Dependencies

When you don't know all dependencies upfront:

```python
from zoocache import cacheable, add_deps

@cacheable(deps=lambda user_id: [f"user:{user_id}"])
def get_user_with_orders(user_id):
    user = db.get_user(user_id)
    orders = db.get_orders(user_id)
    
    for order in orders:
        add_deps([f"order:{order['id']}"])
    
    return {"user": user, "orders": orders}
```

### 5. Async Support

Works out of the box:

```python
@cacheable(deps=["data"])
async def fetch_data():
    return await async_db.query("...")
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Semantic Invalidation** | Cache dies when data changes, not when time passes |
| **Hierarchical Tags** | `invalidate("org:1")` kills `org:1:user:*`, `org:1:orders:*`, etc. |
| **Thundering Herd Protection** | 100 concurrent requests = 1 execution, 99 wait |
| **Rust Core** | Sub-microsecond overhead, zero-copy storage |
| **Async Native** | sync and async functions just work |
| **Zero Config** | No Redis, no setup, just decorate |

---

## How It Works

Zoocache uses a **PrefixTrie** with version numbers at each node:

```
root (v0)
└── org (v0)
    └── acme (v2)      ← invalidate("org:acme") bumps this
        └── user (v0)
            └── 42 (v5) ← invalidate("org:acme:user:42") bumps this
```

When you read from cache, Zoocache snapshots the versions along the path. On cache hit, it compares current versions vs snapshot. If any node was bumped → cache miss.

**Result**: O(depth) invalidation regardless of how many entries are affected.

---

## When to Use Zoocache

✅ **Good fit:**
- Data changes on events (user updates, webhooks, writes)
- Multi-tenant apps where you need per-tenant invalidation
- Complex data relationships (orders → products → inventory)
- High read/write ratio where TTL causes either stale data or cache churn
- **Distributed systems** (using Redis storage + Pub/Sub invalidation)

❌ **Not ideal:**
- Data that genuinely expires by time (session tokens, rate limits)

---

## API Reference

```python
from zoocache import cacheable, invalidate, add_deps, clear

@cacheable(namespace="optional", deps=["tag"] or lambda *args: ["tag"])
def my_func(): ...

invalidate("tag")           # Invalidate tag and all children
add_deps(["tag1", "tag2"])  # Add deps during execution
clear()                     # Reset everything
```

---

## Dependency Naming Convention

```
{entity}:{id}[:{sub-entity}:{id}]...
```

Examples:
```python
"user:123"                  # Single entity
"user:123:profile"          # Sub-resource
"tenant:acme:user:123"      # Multi-tenant
"orders:list"               # Collections
```

---

## Roadmap

- [ ] Prometheus metrics
- [ ] Prometheus metrics
- [ ] Django / SQLAlchemy plugins
- [ ] Dependency propagation for nested `@cacheable`

---

## License

MIT
