# 🔥 Prometheus Adapter

The Prometheus adapter exposes internal ZooCache metrics in a format that can be scraped by a Prometheus server.

## Installation

Install the required dependencies via the `telemetry-prometheus` extra:

```bash
uv add "zoocache[telemetry-prometheus]"
```

## Metrics Exposed

| Metric Name | Type | Description |
|-------------|------|-------------|
| `zoocache_hits_total` | Counter | Total number of cache hits. |
| `zoocache_misses_total` | Counter | Total number of cache misses. |
| `zoocache_latency_seconds` | Histogram | Latency of cache operations (read/write). |
| `zoocache_trie_nodes_count` | Gauge | Current number of nodes in the PrefixTrie. |
| `zoocache_bus_messages_total` | Counter | Number of messages sent/received via the Redis bus. |

## Integration Examples

### Simple Python Script

```python
from prometheus_client import start_http_server
from zoocache import configure, cacheable

# Start Prometheus metrics server
start_http_server(8000)

configure(storage_url="redis://localhost:6379")

@cacheable(deps=["data"])
def get_data():
    return {"key": "value"}

# These operations will record hits/misses in Prometheus
get_data()
```

### FastAPI Integration

You can easily expose ZooCache metrics alongside your FastAPI metrics.

```python
from fastapi import FastAPI
from prometheus_client import make_asgi_app
from zoocache import configure

app = FastAPI()

# Mount prometheus metrics to /metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

configure(storage_url="redis://localhost:6379")

@app.get("/")
async def root():
    return {"message": "Hello World"}
```
