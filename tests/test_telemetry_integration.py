import pytest

from zoocache import cacheable, configure, reset
from zoocache.telemetry import TelemetryAdapter, TelemetryManager


class MockAdapter(TelemetryAdapter):
    def __init__(self):
        self.metrics = []

    def increment(self, name, value=1.0, labels=None):
        self.metrics.append(("inc", name, value, labels))

    def observe(self, name, value, labels=None):
        self.metrics.append(("obs", name, value, labels))

    def set_gauge(self, name, value, labels=None):
        self.metrics.append(("gauge", name, value, labels))

    def shutdown(self):
        pass


@pytest.mark.asyncio
async def test_integration_telemetry(tmp_path):
    reset()
    adapter = MockAdapter()
    storage_path = tmp_path / "zoocache_test"
    configure(storage_url=f"lmdb://{storage_path}", telemetry=TelemetryManager([adapter]))

    @cacheable
    async def get_data(x):
        return x * 2

    await get_data(1)

    metric_names = [m[1] for m in adapter.metrics]
    assert "cache_misses_total" in metric_names
    assert "cache_get_duration_seconds" in metric_names
    assert "cache_set_duration_seconds" in metric_names

    adapter.metrics.clear()
    await get_data(1)
    metric_names = [m[1] for m in adapter.metrics]
    assert "cache_hits_total" in metric_names
    assert "cache_get_duration_seconds" in metric_names
    assert "cache_misses_total" not in metric_names
