<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/logo-light.svg">
    <img alt="ZooCache Logo" src="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/logo-light.svg" width="600">
  </picture>
</p>

<p align="center">
  Zoocache is a high-performance caching library with a Rust core, designed for applications where data consistency and read performance are critical.
</p>
<div align="center" markdown="1">

[**📖 Read the User Guide**](docs/user_guide.md)

</div>
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

## ✨ Key Features

- 🚀 **Rust-Powered Performance**: Core logic implemented in Rust for ultra-low latency and safe concurrency.
- 🧠 **Semantic Invalidation**: Use a `PrefixTrie` for hierarchical invalidation. Clear "user:*" to invalidate all keys related to a specific user instantly.
- 🛡️ **Causal Consistency**: Built-in support for Hybrid Logical Clocks (HLC) ensures consistency even in distributed systems.
- ⚡ **Anti-Avalanche (SingleFlight)**: Protects your backend from "thundering herd" effects by coalescing concurrent identical requests.
- 📦 **Smart Serialization**: Transparently handles MsgPack and LZ4 compression for maximum throughput and minimum storage.
- 🔄 **Self-Healing Distributed Cache**: Automatic synchronization via Redis Bus with robust error recovery.
- 🛡️ **Hardened Safety**: Strict tag validation and mutex-poisoning protection to ensure zero-crash operations.
- 📊 **Observability & Telemetry**: Built-in support for Logs, Prometheus, and OpenTelemetry to monitor cache performance.

---

## 🚀 Performance

Zoocache is continuously benchmarked to ensure zero performance regressions. We track micro-latency, scaling with dependencies, and storage overhead.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/benchmarks/comparison-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/benchmarks/comparison-light.svg">
    <img alt="ZooCache Performance" src="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/benchmarks/comparison-light.svg" width="830">
  </picture>
</p>

### Performance Context

The benchmark results reflect ZooCache's specific architectural choices:

- **Rust Core**: Implementing the core logic in Rust reduces the processing time spent on internal cache management and synchronization compared to pure Python implementations.
- **Trie-based Invalidation**: Instead of matching and deleting individual keys, ZooCache uses a `PrefixTrie` to manage dependencies. Invalidation is performed by updating versions in the trie, which remains efficient even as the number of cached items grows.
- **Pub/Sub Bus**: Using Redis Pub/Sub for the invalidation bus enables low-latency propagation of invalidation signals across multiple nodes, typically completing in under 1ms.

> **Note**: Benchmark scale: 5,000 operations. Redis is running on **localhost** (loopback) to eliminate network latency interference and focus on internal engine overhead. ZooCache maintains O(1) tagging overhead and scales linearly. Latency values represent the end-to-end operation time including storage overhead.

### Optional CLI & TUI

Zoocache includes an optional CLI for real-time monitoring and cache management. It can be installed using the `cli` extra:

```bash
uv add "zoocache[cli]"
```

<p align="center">
  <img alt="ZooCache CLI" src="https://raw.githubusercontent.com/albertobadia/zoocache/main/docs/assets/cli.gif" width="830">
</p>

---

## ⚖️ Comparison

| Feature | **🐾 Zoocache** | **🔴 Redis (Raw)** | **🐶 Dogpile** | **diskcache** |
| :--- | :--- | :--- | :--- | :--- |
| **Invalidation** | 🧠 **Semantic (Trie)** | 🔧 Manual | 🔧 Manual | ⏳ TTL |
| **Consistency** | 🛡️ **Causal (HLC)** | ❌ Eventual | ❌ No | ❌ No |
| **Anti-Avalanche** | ✅ **Native** | ❌ No | ✅ Yes (Locks) | ❌ No |
| **Performance** | 🚀 **Very High** | 🏎️ High | 🐢 Medium | 🐢 Medium |

---

## ⚡ Quick Start

### Installation

Using `uv` (recommended):
```bash
uv add zoocache
```

Using `pip`:
```bash
pip install zoocache
```

### Simple Usage

```python
from zoocache import cacheable, invalidate

@cacheable(deps=lambda user_id: [f"user:{user_id}"])
def get_user(user_id: int):
    return db.fetch_user(user_id)

def update_user(user_id: int, data: dict):
    db.save(user_id, data)
    invalidate(f"user:{user_id}")  # All cached 'get_user' calls for this ID die instantly
```

### Complex Dependencies

```python
from zoocache import cacheable, add_deps

@cacheable
def get_product_page(product_id: int, store_id: int):
    # This page stays cached as long as none of these change:
    add_deps([
        f"prod:{product_id}",
        f"store:{store_id}:inv",
        f"region:eu:pricing",
        "campaign:blackfriday"
    ])
    return render_page(product_id, store_id)

# Any of these will invalidate the page:
# invalidate("prod:42")
# invalidate("store:1:inv")
# invalidate("region:eu") -> Clears ALL prices in that region
```

### Terminal User Interface (TUI)

Zoocache comes with a built-in TUI to monitor metrics, view the caching trie, and run real-time commands such as cache invalidation. 

```bash
uv run zoocache cli
```

---

## 📖 Documentation

Explore the deep dives into Zoocache's architecture and features:

- [**Architecture Overview**](docs/architecture.md) - How the Rust core and Python wrapper interact.
- [**Hierarchical Invalidation**](docs/invalidation.md) - Deep dive into the PrefixTrie and O(D) invalidation.
- [**Serialization Pipeline**](docs/serialization.md) - Efficient data handling with MsgPack and LZ4.
- [**Concurrency & SingleFlight**](docs/concurrency.md) - Shielding your database from traffic spikes.
- [**Distributed Consistency**](docs/consistency.md) - HLC, Redis Bus, and robust consistency models.
- [**FastAPI Integration**](docs/fastapi.md) - Out-of-box caching for FastAPI endpoints.
- [**Litestar Integration**](docs/litestar.md) - Out-of-box caching for Litestar endpoints.
- [**Django Integration**](docs/django.md) - Using ZooCache with the Django ORM.
- [**Django User Guide**](docs/django_user_guide.md) - Detailed guide for Django users.
- [**Django Serializers Auto**](docs/django_serializers.md) - Automatic caching for Django REST Framework.
- [**Reliability & Edge Cases**](docs/reliability.md) - Fail-fast mechanisms and memory management.

### Architectural Decisions (ADR)
- [**ADR 0001: Prefix-Trie Invalidation**](docs/adr/0001-prefix-trie-invalidation.md)
- [**ADR 0002: Rust Core Python Wrapper**](docs/adr/0002-rust-core-python-wrapper.md)
- [**ADR 0003: HLC Distributed Consistency**](docs/adr/0003-hlc-distributed-consistency.md)
- [**ADR 0004: Serialization Strategy**](docs/adr/0004-serialization-strategy.md)
- [**ADR 0005: SingleFlight Pattern**](docs/adr/0005-singleflight-pattern.md)
- [**ADR 0006: Trie Performance Optimizations**](docs/adr/0006-trie-performance-optimizations.md)
- [**ADR 0007: Zero-Bridge Serialization**](docs/adr/0007-zero-bridge-serialization.md)
- [**ADR 0008: Redis Bus Connection Pooling**](docs/adr/0008-redis-bus-connection-pooling.md)
- [**ADR 0009: Robust Sync and Error Handling**](docs/adr/0009-robust-sync-and-error-handling.md)

---


## ❓ When to Use Zoocache

### ✅ Good Fit
- **Complex Data Relationships:** Use dependencies to invalidate groups of data.
- **High Read/Write Ratio:** Where TTL causes stale data or unnecessary cache churn.
- **Distributed Systems:** Native Redis Pub/Sub invalidation and HLC consistency.
- **Strict Consistency:** When users must see updates immediately (e.g., pricing, inventory).

### ❌ Not Ideal
- **Pure Time-Based Expiry:** If you only need simple TTL for session tokens.
- **Simple Key-Value:** If you don't need dependencies or hierarchical invalidation.
- **Minimal Dependencies:** For small, local-only apps where basic `lru_cache` suffices.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
