import time
import threading
import pytest
from zoocache import cacheable, invalidate, clear


@pytest.fixture(autouse=True)
def cleanup():
    clear()
    yield
    clear()


@cacheable(namespace="bench")
def fast_func(x):
    return x


def test_hit_latency(benchmark):
    """Benchmark the overhead of a cache hit."""
    # pytest-benchmark automatically handles warmup and iterations
    benchmark(fast_func, 1)


def test_thundering_herd(benchmark):
    """Benchmark SingleFlight behavior under high concurrency."""
    calls = {"count": 0}

    @cacheable(namespace="herd")
    def expensive_func(x):
        calls["count"] += 1
        time.sleep(0.1)
        return x

    def run_concurrent():
        clear()
        calls["count"] = 0
        threads = []
        for _ in range(50):
            t = threading.Thread(target=expensive_func, args=(1,))
            threads.append(t)
            t.start()
        for t in threads:
            t.join()
        return calls["count"]

    # Use pedantic for complex setups
    count = benchmark.pedantic(run_concurrent, rounds=5, iterations=1)
    # We also verify correctness
    assert count == 1


def test_invalidation_efficiency_prefix(benchmark):
    """Benchmark invalidating 1000 entries via a single parent prefix."""
    num_entries = 1000

    @cacheable(deps=lambda i: [f"org:1:user:{i}"])
    def get_user_data(i):
        return i

    def setup():
        clear()
        for i in range(num_entries):
            get_user_data(i)

    def do_invalidate():
        invalidate("org:1")

    benchmark.pedantic(do_invalidate, setup=setup, rounds=100, iterations=1)
