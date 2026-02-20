from prometheus_client import CollectorRegistry

from zoocache.telemetry.adapters.prometheus import PrometheusAdapter


def test_prometheus_adapter_metrics():
    registry = CollectorRegistry()
    adapter = PrometheusAdapter(registry=registry, prefix="test")

    adapter.increment("hits", 1.0, {"storage": "lmdb"})
    adapter.increment("hits", 2.0, {"storage": "lmdb"})

    val = registry.get_sample_value("test_hits_total", labels={"storage": "lmdb"})
    assert val == 3.0

    adapter.observe("latency", 0.05)
    val_sum = registry.get_sample_value("test_latency_sum")
    assert val_sum == 0.05
    val_count = registry.get_sample_value("test_latency_count")
    assert val_count == 1.0

    adapter.set_gauge("size", 100)
    val_gauge = registry.get_sample_value("test_size")
    assert val_gauge == 100
