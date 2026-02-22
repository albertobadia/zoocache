import threading
import time

import pytest

from zoocache import cacheable, clear, invalidate


@pytest.fixture(autouse=True)
def cleanup():
    clear()
    yield
    clear()


@cacheable(namespace="bench")
def fast_func(x):
    return x


def test_hit_latency(benchmark):
    benchmark(fast_func, 1)


def test_bulk_read(benchmark):
    @cacheable(namespace="bulk")
    def get_data(i):
        return i

    def setup():
        clear()
        for i in range(1000):
            get_data(i)

    def do_read():
        for i in range(1000):
            get_data(i)

    benchmark.pedantic(do_read, setup=setup, rounds=50, iterations=1)


def test_thundering_herd(benchmark):
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

    count = benchmark.pedantic(run_concurrent, rounds=5, iterations=1)
    assert count == 1


def test_invalidation_efficiency_prefix(benchmark):
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
