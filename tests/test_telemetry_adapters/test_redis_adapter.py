import time
from unittest.mock import MagicMock

import pytest

from zoocache.telemetry.adapters.redis_adapter import RedisTelemetryAdapter


def test_redis_adapter_increment():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)
    adapter.increment("hits", 1.0)
    adapter.increment("hits", 2.0)
    adapter.increment("misses", 1.0, {"tag": "test"})

    assert adapter._counters["hits"] == 3.0
    assert adapter._counters["misses_tag=test"] == 1.0

    adapter.close()


def test_redis_adapter_observe():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)
    adapter.observe("latency", 0.05)
    adapter.observe("latency", 0.1)

    assert adapter._counters["latency_sum"] == pytest.approx(0.15)
    assert adapter._counters["latency_count"] == 2.0

    adapter.close()


def test_redis_adapter_set_gauge_noop():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)
    adapter.set_gauge("size", 100)

    adapter.close()


def test_redis_adapter_build_metric_name():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)

    assert adapter._build_metric_name("hits", None) == "hits"
    assert adapter._build_metric_name("hits", {"tag": "val"}) == "hits_tag=val"
    assert adapter._build_metric_name("hits", {"a": "1", "b": "2"}) == "hits_a=1_b=2"

    adapter.close()


def test_redis_adapter_metric_name_includes_label_keys_to_avoid_collisions():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)

    first = adapter._build_metric_name("metric", {"region": "us", "env": "prod"})
    second = adapter._build_metric_name("metric", {"tier": "us", "role": "prod"})

    assert first != second

    adapter.close()


def test_redis_adapter_close():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)
    adapter.close()

    assert adapter._shutdown_event.is_set()


def test_redis_adapter_bind_core():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)
    mock_core = MagicMock()

    adapter.bind_core(mock_core)
    assert adapter.core is mock_core

    adapter.close()


def test_redis_adapter_flush_no_core():
    adapter = RedisTelemetryAdapter(core=None, flush_interval=0.1)
    adapter.increment("hits", 1.0)

    adapter._flush()

    assert adapter._counters["hits"] == 1.0

    adapter.close()


def test_redis_adapter_flush_with_core():
    mock_core = MagicMock()
    adapter = RedisTelemetryAdapter(core=mock_core, flush_interval=0.1)
    adapter.increment("hits", 1.0)
    adapter.increment("misses", 2.0)

    time.sleep(0.15)

    adapter._flush()

    mock_core.flush_metrics.assert_called_once_with({"hits": 1.0, "misses": 2.0})
    assert adapter._counters["hits"] == 0.0

    adapter.close()
