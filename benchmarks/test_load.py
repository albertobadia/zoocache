import threading
import pytest
from zoocache import cacheable, invalidate, clear


@pytest.fixture(autouse=True)
def cleanup():
    clear()
    yield
    clear()


@pytest.mark.parametrize("count", [10, 100, 1000, 5000, 10000])
def test_massive_dependencies_get(benchmark, count):
    """Benchmark read latency with many dependencies."""
    deps = [f"tag:{i}" for i in range(count)]

    @cacheable(deps=deps)
    def heavy_deps_func():
        return "data"

    heavy_deps_func()  # warmup/set

    benchmark(heavy_deps_func)


@pytest.mark.parametrize("thread_count", [50, 100, 200])
def test_high_concurrency_throughput(benchmark, thread_count):
    """Benchmark throughput under high concurrency."""

    @cacheable()
    def concurrent_func(i):
        return f"value_{i}"

    num_ops = 1000
    num_keys = 100
    for i in range(num_keys):
        concurrent_func(i)

    def run_pulse():
        threads = []
        ops_per_thread = num_ops // thread_count

        def worker():
            for i in range(ops_per_thread):
                concurrent_func(i % num_keys)

        for _ in range(thread_count):
            t = threading.Thread(target=worker)
            threads.append(t)
            t.start()
        for t in threads:
            t.join()

    benchmark.pedantic(run_pulse, rounds=5, iterations=1)


def test_deep_hierarchy_validation(benchmark):
    """Benchmark validation latency for a deep dependency hierarchy."""
    depth = 15
    parts = [f"level{i}" for i in range(depth)]
    deep_tag = ":".join(parts)

    @cacheable(deps=[deep_tag])
    def deep_func():
        return "deep_data"

    deep_func()

    benchmark(deep_func)


def test_deep_hierarchy_invalidation_root(benchmark):
    """Benchmark invalidation latency at the root of a deep hierarchy."""
    depth = 15
    parts = [f"level{i}" for i in range(depth)]
    deep_tag = ":".join(parts)

    @cacheable(deps=[deep_tag])
    def deep_func():
        return "deep_data"

    def setup():
        clear()
        deep_func()

    benchmark.pedantic(
        invalidate, args=("level0",), setup=setup, rounds=100, iterations=1
    )


def test_deep_hierarchy_invalidation_leaf(benchmark):
    """Benchmark invalidation latency at a leaf of a deep hierarchy."""
    depth = 15
    parts = [f"level{i}" for i in range(depth)]
    deep_tag = ":".join(parts)

    @cacheable(deps=[deep_tag])
    def deep_func():
        return "deep_data"

    def setup():
        clear()
        deep_func()

    benchmark.pedantic(
        invalidate, args=(deep_tag,), setup=setup, rounds=100, iterations=1
    )
