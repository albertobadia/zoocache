import time
import asyncio
import threading
import pytest
from zoocache import cacheable, invalidate


def test_sync_thundering_herd():
    calls = {"count": 0}

    @cacheable(namespace="thundering_sync")
    def expensive_func(x):
        calls["count"] += 1
        time.sleep(0.1)
        return x

    def worker():
        expensive_func(1)

    threads = [threading.Thread(target=worker) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert calls["count"] == 1


@pytest.mark.asyncio
async def test_async_thundering_herd():
    calls = {"count": 0}

    @cacheable(namespace="thundering_async")
    async def expensive_async_func(x):
        calls["count"] += 1
        await asyncio.sleep(0.1)
        return x

    results = await asyncio.gather(*[expensive_async_func(1) for _ in range(10)])

    assert all(r == 1 for r in results)
    assert calls["count"] == 1


def test_sync_thundering_herd_error():
    calls = {"count": 0}

    @cacheable(namespace="thundering_sync_err")
    def failing_func(x):
        calls["count"] += 1
        time.sleep(0.1)
        raise ValueError("Boom")

    def worker(results):
        try:
            failing_func(1)
        except (ValueError, RuntimeError) as e:
            results.append(str(e))

    results = []
    threads = [threading.Thread(target=worker, args=(results,)) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(results) == 5
    assert any("Boom" in r for r in results)
    assert calls["count"] == 1

    try:
        failing_func(1)
    except ValueError:
        pass
    assert calls["count"] == 2


@pytest.mark.asyncio
async def test_async_thundering_herd_error():
    calls = {"count": 0}

    @cacheable(namespace="thundering_async_err")
    async def failing_async_func(x):
        calls["count"] += 1
        await asyncio.sleep(0.1)
        raise RuntimeError("Async Boom")

    tasks = [failing_async_func(1) for _ in range(5)]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    assert len(results) == 5
    assert all(isinstance(r, RuntimeError) for r in results)
    assert calls["count"] == 1


def test_concurrent_reads_and_invalidations():
    results = []

    @cacheable(deps=["stress"])
    def get_data(i):
        time.sleep(0.001)
        return i

    def reader():
        for i in range(100):
            results.append(get_data(i % 10))

    def invalidator():
        for _ in range(50):
            invalidate("stress")
            time.sleep(0.002)

    threads = [threading.Thread(target=reader) for _ in range(10)]
    threads.append(threading.Thread(target=invalidator))

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(results) == 1000
