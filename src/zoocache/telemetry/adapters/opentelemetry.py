from typing import Any

from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource

from zoocache.telemetry.base import TelemetryAdapter


class OpenTelemetryAdapter(TelemetryAdapter):
    __slots__ = ("_meter", "_metrics", "_gauge_values")

    def __init__(
        self,
        service_name: str = "zoocache",
        otlp_endpoint: str | None = None,
        meter_provider: MeterProvider | None = None,
    ):
        if meter_provider is None:
            resource = Resource.create({"service.name": service_name})
            meter_provider = MeterProvider(
                resource=resource,
                metric_readers=[PeriodicExportingMetricReader(OTLPMetricExporter(endpoint=otlp_endpoint))]
                if otlp_endpoint
                else [],
            )

        self._meter = meter_provider.get_meter("zoocache")
        self._metrics: dict[str, Any] = {}
        self._gauge_values: dict[tuple[str, tuple], float] = {}

    def _get_metric(self, type_: str, name: str) -> Any:
        cache_key = (type_, name)
        if cache_key not in self._metrics:
            meth = {
                "counter": self._meter.create_counter,
                "histogram": self._meter.create_histogram,
                "gauge": self._meter.create_up_down_counter,
            }[type_]
            self._metrics[cache_key] = meth(name=name, description=f"ZooCache {name}")
        return self._metrics[cache_key]

    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        self._get_metric("counter", name).add(value, labels or {})

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._get_metric("histogram", name).record(value, labels or {})

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        # OTel sync gauges use UpDownCounter add() with deltas to simulate set()
        label_tuple = tuple(sorted((labels or {}).items()))
        key = (name, label_tuple)
        prev = self._gauge_values.get(key, 0.0)
        self._get_metric("gauge", name).add(value - prev, labels or {})
        self._gauge_values[key] = value
