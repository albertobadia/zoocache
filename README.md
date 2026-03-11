<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/logo-light.svg">
    <img alt="ZooCache Logo" src="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/logo-light.svg" width="600">
  </picture>
</p>

<p align="center">
  ZooCache is a high-performance caching library with a Rust core, designed for applications where data consistency and read performance are critical.
</p>

<p align="center">
  <a href="https://www.python.org/downloads/"><img alt="Python 3.10+" src="https://img.shields.io/badge/python-3.10+-blue.svg?style=flat-square&logo=python"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square"></a>
  <a href="https://pypi.org/project/zoocache/"><img alt="PyPI" src="https://img.shields.io/pypi/v/zoocache?style=flat-square&logo=pypi&logoColor=white"></a>
  <a href="https://pypi.org/project/zoocache/"><img alt="Downloads" src="https://img.shields.io/pepy/dt/zoocache?style=flat-square&color=blue"></a>
  <a href="https://github.com/albertobadia/zoocache/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/albertobadia/zoocache/ci.yml?branch=main&style=flat-square&logo=github"></a>
  <a href="https://albertobadia.github.io/zoocache/benchmarks/"><img alt="Benchmarks" src="https://img.shields.io/badge/benchmarks-charts-orange?style=flat-square&logo=google-cloud&logoColor=white"></a>
  <a href="https://zoocache.readthedocs.io/"><img alt="ReadTheDocs" src="https://img.shields.io/readthedocs/zoocache?style=flat-square&logo=readthedocs"></a>
</p>

---

## Quick Start

```python
# Install
uv add zoocache

# Use
from zoocache import cacheable, invalidate, configure, add_deps

configure()  # Configure first!

@cacheable()
def get_user(uid):
    add_deps([f"user:{uid}"])  # Register dependencies inside
    return db.fetch_user(uid)  # Runs once

get_user(1)  # Database
get_user(1)  # Cache - instant

invalidate("user:1")  # Invalidate instantly
```

---

## Why ZooCache?

Traditional caches use **TTL** (Time To Live), which causes stale data and cache thrashing. ZooCache uses **Semantic Invalidation** with a **PrefixTrie** to invalidate exactly what changed — instantly.

| Feature | **🐾 ZooCache** | **🔴 Redis** | **🐶 Dogpile** | **diskcache** |
|---------|:---------------:|:------------:|:-------------:|:-------------:|
| **Semantic Invalidation** | Trie-based | Manual | Manual | TTL only |
| **Smart Serialization** | MsgPack+LZ4 | No | No | No |
| **Distributed Sync** | Redis Bus | Pub/Sub | No | No |
| **Observability** | Full | Basic | No | No |

---

## Key Features

- 🧠 **Semantic Invalidation**: Use a `PrefixTrie` for hierarchical invalidation. Clear `"user:*"` to invalidate all keys related to a specific user instantly.
- 💾 **Flexible Storage Backends**: Choose between in-memory, LMDB for persistence, or Redis for distributed caching.
- 🛡️ **Causal Consistency**: Built-in support for Hybrid Logical Clocks (HLC) ensures consistency even in distributed systems.
- ⚡ **Anti-Avalanche (SingleFlight)**: Protects your backend from "thundering herd" effects by coalescing concurrent identical requests.
- 📦 **Smart Serialization**: Transparently handles MsgPack and LZ4 compression for maximum throughput and minimum storage.
- 🔄 **Self-Healing Distributed Cache**: Automatic synchronization via Redis Bus with robust error recovery.
- 📊 **Observability**: Built-in support for Logs, Prometheus, and OpenTelemetry.

---

## Installation

```bash
# Using uv (recommended)
uv add zoocache

# Using pip
pip install zoocache
```

### Optional Extras

```bash
# CLI & TUI for monitoring
uv add "zoocache[cli]"

# FastAPI integration
uv add "zoocache[fastapi]"

# Django integration
uv add "zoocache[django]"

# Litestar integration
uv add "zoocache[litestar]"

# All integrations
uv add "zoocache[cli,fastapi,django,litestar]"

# Full telemetry (Prometheus + OpenTelemetry)
uv add "zoocache[telemetry]"
```

---

## Quick Start

### 1. Basic Caching

```python
from zoocache import cacheable, invalidate, add_deps

@cacheable()
def get_user(user_id: int):
    add_deps([f"user:{user_id}"])
    return db.fetch_user(user_id)

# First call: executes the function
user = get_user(42)

# Second call: returns cached result instantly
user = get_user(42)
```

### 2. Invalidation

```python
def update_user(user_id: int, data: dict):
    db.save(user_id, data)
    invalidate(f"user:{user_id}")  # All cached 'get_user' calls for this ID die instantly
```

### 3. Hierarchical Dependencies

```python
from zoocache import cacheable, add_deps

@cacheable()
def get_product(pid):
    add_deps([f"product:{pid}"])
    return db.get_product(pid)

@cacheable()
def get_reviews(pid):
    add_deps([f"product:{pid}:reviews"])
    return db.get_reviews(pid)

# Invalidate product AND its reviews
invalidate("product:42")

# Invalidate only reviews
invalidate("product:42:reviews")
```

### 4. Dynamic Dependencies

```python
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

### 5. Distributed Mode

```python
from zoocache import configure

# Configure for distributed caching
configure(
    storage_url="redis://localhost:6379",
    bus_url="redis://localhost:6379",
    prefix="myapp_prod",
    default_ttl=3600,
)
```

---

## Optional CLI & TUI

ZooCache includes an optional CLI for real-time monitoring and cache management:

```bash
uv run zoocache cli
```

<p align="center">
  <img alt="ZooCache CLI" src="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/cli.gif" width="830">
</p>

---

## Performance

Zoocache is continuously benchmarked to ensure zero performance regressions.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/benchmarks/comparison-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/benchmarks/comparison-light.svg">
    <img alt="ZooCache Performance" src="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/benchmarks/comparison-light.svg" width="830">
  </picture>
</p>

> **Note**: Benchmark scale: 5,000 operations. Redis running on **localhost** to eliminate network latency.

---

## When to Use ZooCache

### ✅ Good Fit
- **Complex Data Relationships**: Use dependencies to invalidate groups of data.
- **High Read/Write Ratio**: Where TTL causes stale data or unnecessary cache churn.
- **Distributed Systems**: Native Redis Pub/Sub invalidation and HLC consistency.
- **Strict Consistency**: When users must see updates immediately (e.g., pricing, inventory).

### ❌ Not Ideal
- **Pure Time-Based Expiry**: If you only need simple TTL for session tokens.
- **Simple Key-Value**: If you don't need dependencies or hierarchical invalidation.
- **Minimal Dependencies**: For small, local-only apps where basic `lru_cache` suffices.

---

## Documentation

### 🚀 Getting Started
- [**Quick Start & Installation**](docs/setup.md) — Install and run your first cached function

### 🔌 Integrations
- [**FastAPI Integration**](docs/fastapi.md) — Out-of-box caching for FastAPI endpoints
- [**Django Integration**](docs/django.md) — Transparent caching for Django ORM
- [**Litestar Integration**](docs/litestar.md) — Out-of-box caching for Litestar endpoints

### 💡 Concepts & Deep Dives
- [**Core Concepts**](docs/concepts.md) — Dependencies, hierarchical tags, and dynamic dependencies
- [**Semantic Invalidation**](docs/invalidation.md) — Deep dive into PrefixTrie and O(D) invalidation
- [**Distributed Consistency**](docs/consistency.md) — HLC, Redis Bus, and consistency models
- [**Concurrency & SingleFlight**](docs/concurrency.md) — Shielding your database from traffic spikes
- [**Architecture Overview**](docs/architecture.md) — How the Rust core and Python wrapper interact

### ⚙️ Configuration
- [**General Configuration**](docs/configuration/index.md) — Configure storage, TTL, serialization
- [**Storage Backends**](docs/configuration/storage.md) — Memory, Redis, LMDB options

### 🛠️ How-to Guides
- [**CLI / TUI Usage**](docs/cli.md) — Monitor and manage your cache
- [**Telemetry & Observability**](docs/telemetry/index.md) — Prometheus, OpenTelemetry

### 📚 Reference
- [**API Reference**](docs/reference/api.md) — Detailed API documentation
- [**Reliability & Edge Cases**](docs/reliability.md) — Fail-fast mechanisms and error handling

---

## Architectural Decisions (ADR)

- [**ADR 0001: Prefix-Trie Invalidation**](docs/adr/0001-prefix-trie-invalidation.md)
- [**ADR 0002: Rust Core Python Wrapper**](docs/adr/0002-rust-core-python-wrapper.md)
- [**ADR 0003: HLC Distributed Consistency**](docs/adr/0003-hlc-distributed-consistency.md)
- [**ADR 0004: Serialization Strategy**](docs/adr/0004-serialization-strategy.md)
- [**ADR 0005: Singleflight Pattern**](docs/adr/0005-singleflight-pattern.md)
- [**ADR 0006: Trie Performance Optimizations**](docs/adr/0006-trie-performance-optimizations.md)
- [**ADR 0007: Zero-Bridge Serialization**](docs/adr/0007-zero-bridge-serialization.md)
- [**ADR 0008: Redis Bus Connection Pooling**](docs/adr/0008-redis-bus-connection-pooling.md)
- [**ADR 0009: Robust Sync and Error Handling**](docs/adr/0009-robust-sync-and-error-handling.md)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
