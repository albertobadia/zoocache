# 📊 Telemetry and Observability

ZooCache is designed to be monitored in production. It provides deep visibility into cache performance, internal state, and distribution signals.

Our telemetry system is modular and supports:
- **Native Logs**: Detailed internal debugging information.
- **Prometheus**: Metrics for monitoring hit rates, latency, and memory.
- **OpenTelemetry (OTel)**: Distributed tracing and standardized metrics.

---

## Logging

ZooCache uses the standard Python `logging` system. You can easily integrate it with your existing logging configuration.

### Basic Logging Setup

To enable debugging logs for ZooCache:

```python
import logging
from zoocache import configure

# Configure basic logging
logging.basicConfig(level=logging.INFO)

# Set ZooCache logger to DEBUG for more detail
logging.getLogger("zoocache").setLevel(logging.DEBUG)

configure(storage_url="redis://localhost:6379")
```

### Log Levels

- **INFO**: General events like configuration and initialization.
- **DEBUG**: Internal operations, invalidation propagation, and storage details. Perfect for development.
- **WARNING/ERROR**: Failures in the invalidation bus or storage backend.

---

## Selecting an Adapter

Depending on your infrastructure, you can choose one of the available adapters:

- [**Prometheus**](prometheus.md): Best for Kubernetes and standard metric scrapers.
- [**OpenTelemetry**](otel.md): Best for distributed systems requiring vendor-agnostic tracing and metrics.
