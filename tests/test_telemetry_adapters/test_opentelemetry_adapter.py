from opentelemetry.sdk.metrics import MeterProvider

from zoocache.telemetry.adapters.opentelemetry import OpenTelemetryAdapter


def test_otel_adapter_calls():
    provider = MeterProvider()
    adapter = OpenTelemetryAdapter(meter_provider=provider)

    adapter.increment("hits", 1.0, {"label": "v"})
    adapter.observe("latency", 0.1)
    adapter.set_gauge("size", 100)


def test_otel_adapter_lazy_init():
    adapter = OpenTelemetryAdapter(service_name="test-service")
    assert adapter._meter is not None
