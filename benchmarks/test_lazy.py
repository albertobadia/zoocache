import time
import pytest
from zoocache import cacheable, invalidate, clear


@pytest.fixture(autouse=True)
def setup():
    clear()
    yield


def test_lazy_update_lifecycle(benchmark):
    """Benchmark the full lifecycle of a lazy update."""
    count = 10000
    deps = [f"tag:{i}" for i in range(count)]

    @cacheable(deps=deps)
    def heavy_func():
        return "data"

    heavy_func()  # Warm up

    def run_lifecycle():
        # 1. Baseline hit (O1)
        heavy_func()

        # 2. Invalidate unrelated tag
        invalidate("other:tag")

        # 3. First hit after global change (O(N) + Lazy Update)
        heavy_func()

        # Allow background worker to complete the lazy update
        time.sleep(0.001)

        # 4. Second hit (O(1) again)
        heavy_func()

    benchmark(run_lifecycle)


def test_lazy_update_recovery(benchmark):
    """Benchmark specifically the recovery hit after a global change."""
    count = 10000
    deps = [f"tag:{i}" for i in range(count)]

    @cacheable(deps=deps)
    def heavy_func():
        return "data"

    def setup_invalidation():
        clear()
        heavy_func()
        invalidate("other:tag")

    benchmark.pedantic(heavy_func, setup=setup_invalidation, rounds=50, iterations=1)


def test_lazy_update_baseline(benchmark):
    """Benchmark the baseline O(1) hit for an entry with 10k deps."""
    count = 10000
    deps = [f"tag:{i}" for i in range(count)]

    @cacheable(deps=deps)
    def heavy_func():
        return "data"

    heavy_func()
    benchmark(heavy_func)
