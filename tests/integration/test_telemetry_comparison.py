import time

import pytest

from zoocache import cacheable, configure, reset
from zoocache.telemetry import LogAdapter, TelemetryManager
from zoocache.telemetry.adapters.opentelemetry import OpenTelemetryAdapter
from zoocache.telemetry.adapters.prometheus import PrometheusAdapter


@cacheable
async def benchmark_func(n: int):
    return f"result-{n}"


async def run_workload(iterations: int = 50):
    for i in range(iterations):
        await benchmark_func(i % 100)  # Larger pool to avoid trivial hits


@pytest.mark.asyncio
async def test_performance_comparison():
    iterations = 10_000
    results = {}

    # Warmup connection
    reset()
    configure(storage_url="redis://127.0.0.1:6380/0")
    await run_workload(100)

    # 1. No Telemetry
    reset()
    configure(storage_url="redis://127.0.0.1:6380/0")
    start = time.perf_counter()
    await run_workload(iterations)
    results["None"] = time.perf_counter() - start

    # 2. LogAdapter
    reset()
    telemetry = TelemetryManager([LogAdapter(level="ERROR")])  # Minimal logging to be fair
    configure(storage_url="redis://127.0.0.1:6380/0", telemetry=telemetry)
    start = time.perf_counter()
    await run_workload(iterations)
    results["Logs"] = time.perf_counter() - start

    # 3. PrometheusAdapter
    reset()
    # Port 9091 to avoid conflict if something else is on 9090
    telemetry = TelemetryManager([PrometheusAdapter(port=9091)])
    configure(storage_url="redis://127.0.0.1:6380/0", telemetry=telemetry)
    start = time.perf_counter()
    await run_workload(iterations)
    results["Prometheus"] = time.perf_counter() - start

    # 4. OpenTelemetryAdapter (Local Collector)
    reset()
    telemetry = TelemetryManager([OpenTelemetryAdapter()])
    configure(storage_url="redis://127.0.0.1:6380/0", telemetry=telemetry)
    start = time.perf_counter()
    await run_workload(iterations)
    results["OTel"] = time.perf_counter() - start

    print("\nTelemetry Overhead Benchmark (Integration):")
    for name, duration in results.items():
        print(f"  {name:10}: {duration:.4f}s")

    assert all(d > 0 for d in results.values())
