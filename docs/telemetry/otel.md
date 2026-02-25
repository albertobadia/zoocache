# 🌐 OpenTelemetry (OTel) Adapter

ZooCache provides native support for OpenTelemetry, allowing you to export metrics and traces to any OTel-compliant backend (like Jaeger, Honeycomb, or Grafana Tempo).

## Installation

Install the OTel dependencies:

```bash
uv add "zoocache[telemetry-otel]"
```

## Setup

ZooCache automatically detects if OpenTelemetry is configured globally in your application.

### Basic Setup Example

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import RESOURCE_ATTRIBUTES, Resource
from opentelemetry.sdk.metrics.export import ConsoleMetricExporter, PeriodicExportingMetricReader
from zoocache import configure

# Setup OTel Metrics
resource = Resource(attributes={RESOURCE_ATTRIBUTES.SERVICE_NAME: "my-service"})
reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(resource=resource, metric_readers=[reader])
metrics.set_meter_provider(provider)

# ZooCache will now automatically use the globally configured meter provider
configure(storage_url="redis://localhost:6379")
```

## Benefits of OTel with ZooCache

1. **Vendor Neutrality**: Export to any backend without changing your code.
2. **Context Propagation**: Native support for traces allows you to see cache operations within your request lifespan.
3. **Standardized Metrics**: Consistent naming conventions across your entire service stack.
