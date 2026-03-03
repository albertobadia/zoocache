# ⚙️ General Configuration

ZooCache is highly configurable, allowing you to tune its behavior for different environments and performance requirements.

> [!IMPORTANT]
> You must call `configure()` **before any other cache operation** (like using the `@cacheable` decorator).

---

## Basic Configuration Example

```python
from zoocache import configure

configure(
    storage_url="redis://localhost:6379",    # Storage backend
    bus_url="redis://localhost:6379",        # Distributed bus
    prefix="myapp_prod",                     # Namespace isolation
    default_ttl=3600,                        # Default expiration
)
```

## Core Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage_url` | `str` | `None` | The backend storage connection string. `None` uses In-Memory. |
| `bus_url` | `str` | `None` | Redis URL for public/private invalidation bus. |
| `prefix` | `str` | `None` | Logical namespace to isolate cache keys and bus channels. |
| `default_ttl` | `int` | `None` | Default Time-To-Live (TTL) or Time-To-Idle (TTI) in seconds. |
| `read_extend_ttl` | `bool` | `True` | If `True`, every read resets the TTL (making it TTI/Sliding Expiration). |
| `max_entries` | `int` | `None` | Hard limit on the number of entries (Memory/LMDB only). |

---

## 🚌 Distributed Bus

The "Bus" is responsible for propagating invalidation signals across multiple nodes.

### Configuration
Enable it by providing a `bus_url` (currently supports Redis):

```python
configure(
    bus_url="redis://localhost:6379",
    prefix="my_service" # Nodes with same prefix share invalidations
)
```

### Reliability Options
- **Connection Recovery**: ZooCache automatically attempts to reconnect to the bus if the connection is lost.
- **Message Snapshots**: If a node misses messages, the self-healing mechanism (Causal Consistency) will detect and fix the stale data upon read.

---

## 🛠️ Advanced Options

### Automatic Pruning
The PrefixTrie stores tag versions to ensure consistency. To prevent memory growth from old, unused tags, you can configure automatic pruning:

```python
configure(
    auto_prune_secs=86400,      # Prune tags not used in the last 24h
    auto_prune_interval=3600    # Run the pruning worker every hour
)
```

### Performance Tuning
- `lru_update_interval` (int): Frequency in seconds to update the LRU access times in storage. Default: `30`.
- `lmdb_map_size` (int): Maximum size of the LMDB database in bytes.
- `tti_flush_secs` (int): How often to flush Time-To-Idle updates to storage. Default: `30`.
- `flight_timeout` (int): Maximum seconds to wait for a SingleFlight leader before giving up. Default: `60`.

---

## Next Steps

- [**Storage Backends**](storage.md): Choose and configure the right storage for your data.
- [**Distributed Mode**](../distributed.md): Learn how the bus works internally.
