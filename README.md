# 🐾 Zoocache

**Semantic caching for Python. Invalidate when your data changes, not when a timer expires.**

Zoocache is a high-performance caching library with a Rust core, designed for applications where data consistency and read performance are critical.

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## The Core Concept

Traditional caching relies on TTL (Time-To-Live). Zoocache flips this: **readers declare dependencies, writers signal changes.**

```python
from zoocache import cacheable, invalidate

@cacheable(deps=lambda user_id: [f"user:{user_id}"])
def get_user(user_id: int):
    return db.fetch_user(user_id)

def update_user(user_id: int, data: dict):
    db.save(user_id, data)
    invalidate(f"user:{user_id}")  # All cached 'get_user' calls for this ID die instantly
```

---

## 📖 Documentation

For a deep dive into how Zoocache works and why it was built this way, please refer to our detailed documentation:

- [**Architecture Overview**](docs/architecture.md): How the Rust core and Python wrapper interact.
- [**Hierarchical Invalidation**](docs/invalidation.md): Deep dive into the PrefixTrie and O(D) invalidation.
- [**Serialization Pipeline**](docs/serialization.md): How we use MsgPack and LZ4 for maximum performance.
- [**Concurrency & SingleFlight**](docs/concurrency.md): Protection against the thundering herd.
- [**Distributed Consistency**](docs/consistency.md): [HLC](docs/consistency.md#hybrid-logical-clocks-hlc), Redis Bus, and Self-Healing mechanisms.

---

## Comparison

| Feature | **🐹 Zoocache** | **🔴 Redis (Raw)** | **🐶 Dogpile** | **diskcache** |
| :--- | :--- | :--- | :--- | :--- |
| **Invalidation** | 🧠 **Semantic (Trie)** | 🔧 Manual | 🔧 Manual | ⏳ TTL |
| **Consistency** | 🛡️ **Causal (HLC)** | ❌ Eventual | ❌ No | ❌ No |
| **Anti-Avalanche** | ✅ **Native** | ❌ No | ✅ Yes (Locks) | ❌ No |
| **Performance** | 🚀 **Very High** | 🏎️ High | 🐢 Medium | 🐢 Medium |
| **Usage (DX)** | 😍 **Simple** | 😓 Low Level | 😖 Complex | 🙂 Good |

---

## When to Use Zoocache

### ✅ Good Fit
- **Complex Data Relationships:** e.g., "Invalidate all products in this category".
- **High Read/Write Ratio:** Where TTL causes stale data or unnecessary churn.
- **Distributed Systems:** Using Redis backend + Pub/Sub invalidation.
- **Strict Consistency:** When users must see updates immediately (pricing, inventory).

### ❌ Not Ideal
- **Pure Time-Based Expiry:** Session tokens or rate limits.
- **Simple Key-Value:** If you don't need dependencies, standard `redis-py` is enough.
- **Small, Local-only Apps:** If you don't need the performance of a Rust core, simpler Python-only libraries might suffice.

---

## Installation

```bash
pip install zoocache
```

## License

MIT
