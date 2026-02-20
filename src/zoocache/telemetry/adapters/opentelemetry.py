from typing import Any

from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource

from zoocache.telemetry.base import TelemetryAdapter


class OpenTelemetryAdapter(TelemetryAdapter):
    __slots__ = ("_meter", "_metrics")

    def __init__(
        self,
        service_name: str = "zoocache",
        otlp_endpoint: str | None = None,
        meter_provider: MeterProvider | None = None,
    ):
        if meter_provider is None:
            resource = Resource.create({"service.name": service_name})
            if otlp_endpoint:
                exporter = OTLPMetricExporter(endpoint=otlp_endpoint)
                meter_provider = MeterProvider(
                    resource=resource,
                    metric_readers=[PeriodicExportingMetricReader(exporter)],
                )
            else:
                meter_provider = MeterProvider(resource=resource)

        self._meter = meter_provider.get_meter("zoocache")
        self._metrics: dict[str, Any] = {}

    def _get_metric(self, type_: str, name: str) -> Any:
        cache_key = (type_, name)
        if cache_key not in self._metrics:
            creators = {
                "counter": self._meter.create_counter,
                "histogram": self._meter.create_histogram,
                "gauge": self._meter.create_up_down_counter,
            }
            self._metrics[cache_key] = creators[type_](name=name, description=f"ZooCache {name}")
        return self._metrics[cache_key]

    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        self._get_metric("counter", name).add(value, labels or {})

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._get_metric("histogram", name).record(value, labels or {})

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._get_metric("gauge", name).add(value, labels or {})
