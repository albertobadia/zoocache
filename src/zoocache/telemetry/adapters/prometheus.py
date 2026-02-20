from typing import Any

from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram, start_http_server

from zoocache.telemetry.base import TelemetryAdapter


class PrometheusAdapter(TelemetryAdapter):
    __slots__ = ("_registry", "_prefix", "_metrics")

    def __init__(
        self,
        port: int | None = None,
        addr: str = "0.0.0.0",
        prefix: str = "zoocache",
        registry: CollectorRegistry | None = None,
    ):
        self._registry = registry or CollectorRegistry()
        self._prefix = prefix
        self._metrics: dict[str, Any] = {}

        if port is not None:
            start_http_server(port, addr, registry=self._registry)

    def _get_metric(self, type_: str, name: str, labels: dict[str, str] | None) -> Any:
        full_name = f"{self._prefix}_{name}" if self._prefix else name
        label_names = sorted(labels.keys()) if labels else []
        cache_key = (type_, full_name, tuple(label_names))

        if cache_key not in self._metrics:
            kwargs = {"registry": self._registry}
            if type_ == "histogram":
                kwargs["buckets"] = (0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0)

            metric_cls = {"counter": Counter, "histogram": Histogram, "gauge": Gauge}[type_]
            self._metrics[cache_key] = metric_cls(full_name, f"ZooCache {name}", label_names, **kwargs)

        metric = self._metrics[cache_key]
        return metric.labels(**labels) if labels else metric

    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        self._get_metric("counter", name, labels).inc(value)

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._get_metric("histogram", name, labels).observe(value)

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._get_metric("gauge", name, labels).set(value)
