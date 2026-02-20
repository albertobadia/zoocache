from zoocache.telemetry.base import TelemetryAdapter
from zoocache.telemetry.manager import TelemetryManager


class MockAdapter(TelemetryAdapter):
    def __init__(self):
        self.increments = []
        self.observations = []
        self.gauges = []

    def increment(self, name, value=1.0, labels=None):
        self.increments.append((name, value, labels))

    def observe(self, name, value, labels=None):
        self.observations.append((name, value, labels))

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self.gauges.append((name, value, labels))

    def close(self) -> None:
        pass


def test_telemetry_manager_disabled():
    manager = TelemetryManager()
    assert manager._enabled is False
    manager.increment("test")
    manager.observe("test", 1.0)
    manager.set_gauge("test", 1.0)


def test_telemetry_manager_enabled():
    adapter = MockAdapter()
    manager = TelemetryManager([adapter])
    assert manager._enabled is True

    manager.increment("hits", 1.0, {"tag": "val"})
    assert adapter.increments == [("hits", 1.0, {"tag": "val"})]

    manager.observe("latency", 0.5)
    assert adapter.observations == [("latency", 0.5, None)]

    manager.set_gauge("size", 100)
    assert adapter.gauges == [("size", 100, None)]


def test_telemetry_manager_multiple_adapters():
    a1 = MockAdapter()
    a2 = MockAdapter()
    manager = TelemetryManager([a1, a2])

    manager.increment("hits")
    assert len(a1.increments) == 1
    assert len(a2.increments) == 1
