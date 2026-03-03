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
| `cache_hits_total` | Counter | Total number of cache hits. |
| `cache_misses_total` | Counter | Total number of cache misses. |
| `cache_errors_total` | Counter | Total number of cache errors. |
| `cache_invalidations_total` | Counter | Total number of cache invalidations. |
| `cache_get_duration_seconds` | Histogram | Latency of cache get operations. |
| `cache_set_duration_seconds` | Histogram | Latency of cache set operations. |
| `singleflight_timeouts_total` | Counter | Total number of singleflight (anti-avalanche) timeouts. |
| `cache_tti_overflows_total` | Counter | Total number of TTI message overflows. |
| `cache_silent_errors_total` | Counter | Total number of silent errors in distributed mode. |

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
