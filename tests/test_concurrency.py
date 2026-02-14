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


@pytest.mark.asyncio
async def test_race_condition_protection():
    """
    Verify protection against thundering herd / race conditions.
    Based on the reproduction script logic to ensure single execution per expired key.
    """
    from zoocache import reset, configure

    reset()
    configure()

    calls = 0

    @cacheable(ttl=1)
    async def slow_func():
        nonlocal calls
        calls += 1
        await asyncio.sleep(0.1)
        return "done"

    # Launch multiple concurrent requests
    tasks = [slow_func() for _ in range(10)]
    results = await asyncio.gather(*tasks)

    assert all(r == "done" for r in results)


@pytest.mark.asyncio
async def test_async_stress_race_condition():
    """
    Stress test with high concurrency to ensure the race condition fix is robust.
    Based on reproduce_race.py
    """
    from zoocache import reset, configure, clear

    reset()
    configure()
    clear()

    calls = 0

    @cacheable(namespace="stress_async")
    async def stress_func(arg):
        nonlocal calls
        # Simulate small work but enough to allow context switches
        await asyncio.sleep(0.01)
        calls += 1
        return f"result-{arg}"

    # Launch 500 concurrent tasks
    n_tasks = 500
    tasks = [stress_func("common_key") for _ in range(n_tasks)]

    results = await asyncio.gather(*tasks)

    assert len(results) == n_tasks
    assert all(r == "result-common_key" for r in results)
    # MUST be exactly 1 call
    assert calls == 1


def test_sync_stress_race_condition():
    """
    Stress test for synchronous thundering herd.
    Based on reproduce_race_sync.py
    """
    from zoocache import reset, configure, clear

    reset()
    configure()
    clear()

    calls = {"count": 0}
    lock = threading.Lock()

    @cacheable(namespace="stress_sync")
    def stress_sync_func(arg):
        time.sleep(0.01)
        with lock:
            calls["count"] += 1
        return f"result-{arg}"

    def worker():
        stress_sync_func("common_key_sync")

    n_threads = 100
    threads = [threading.Thread(target=worker) for _ in range(n_threads)]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert calls["count"] == 1


@pytest.mark.asyncio
async def test_flight_timeout_configurable_async():
    from zoocache import reset, configure

    # Ensure fresh state
    reset()
    # Configure with a very short timeout (1 second)
    configure(flight_timeout=1)

    # Define a dependency function that takes 2 seconds (exceeds timeout)
    async def slow_func():
        await asyncio.sleep(2)
        return "slow"

    # Wrap it with cacheable
    cached_slow = cacheable(slow_func)

    # First call will be the leader
    task1 = asyncio.create_task(cached_slow())

    # Wait a bit to ensure task1 is leader
    await asyncio.sleep(0.1)

    # Second call should wait for task1, but timeout after 1s
    with pytest.raises(RuntimeError, match="Thundering herd leader failed"):
        await cached_slow()

    # Clean up
    await task1
    reset()


def test_flight_timeout_configurable_sync():
    from zoocache import reset, configure

    # Ensure fresh state
    reset()
    # Configure with a very short timeout (1 second)
    configure(flight_timeout=1)

    # Define a dependency function that takes 2 seconds (exceeds timeout)
    def slow_func():
        time.sleep(2)
        return "slow"

    # Wrap it with cacheable
    cached_slow = cacheable(slow_func)

    def call_slow():
        try:
            cached_slow()
        except Exception:
            pass

    # First call will be the leader
    t1 = threading.Thread(target=call_slow)
    t1.start()

    # Wait a bit to ensure t1 is leader
    time.sleep(0.1)

    # Second call should wait for t1, but timeout after 1s
    with pytest.raises(RuntimeError, match="Thundering herd leader failed"):
        cached_slow()

    t1.join()
    reset()
