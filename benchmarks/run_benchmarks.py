import time
import threading
from zoocache import cacheable, invalidate, version


def benchmark_hit_latency():
    print("--- BENCHMARK: Hit Latency ---")

    @cacheable(namespace="bench")
    def fast_func(x):
        return x

    # Warm up
    fast_func(1)

    iterations = 100_000
    start = time.perf_counter()
    for i in range(iterations):
        fast_func(1)
    end = time.perf_counter()

    total_time = end - start
    avg_latency_us = (total_time / iterations) * 1_000_000
    print(f"  Iterations: {iterations:,}")
    print(f"  Total time: {total_time:.4f}s")
    print(f"  Avg latency per hit: {avg_latency_us:.2f} µs")
    print(f"  Approx overhead: {avg_latency_us:.2f} µs / call")


def benchmark_thundering_herd():
    print("\n--- BENCHMARK: Concurrent Thundering Herd ---")

    calls = {"count": 0}

    @cacheable(namespace="herd")
    def expensive_func(x):
        calls["count"] += 1
        time.sleep(0.1)  # Simulate expensive work
        return x

    def worker():
        expensive_func(1)

    threads = []
    num_threads = 50
    start = time.perf_counter()
    for _ in range(num_threads):
        t = threading.Thread(target=worker)
        threads.append(t)
        t.start()

    for t in threads:
        t.join()
    end = time.perf_counter()

    print(f"  Threads: {num_threads}")
    print(f"  Total calls recorded: {calls['count']}")
    print(f"  Total time: {end - start:.4f}s (should be ~0.1s if SingleFlight works)")
    assert calls["count"] == 1


def benchmark_invalidation_efficiency():
    print("\n--- BENCHMARK: Hierarchical Invalidation Efficiency ---")
    from zoocache import clear

    clear()

    num_entries = 1_000

    @cacheable(deps=lambda i: [f"org:1:user:{i}"])
    def get_user_data(i):
        return {"id": i, "data": "x" * 100}

    print(f"  Caching {num_entries:,} entries with unique deps...")
    for i in range(num_entries):
        get_user_data(i)

    print("  Measuring individual tag invalidations...")
    start = time.perf_counter()
    for i in range(num_entries):
        invalidate(f"org:1:user:{i}")
    end = time.perf_counter()
    specific_time = end - start
    print(f"  Invalidating {num_entries:,} specific tags: {specific_time:.4f}s")

    clear()
    for i in range(num_entries):
        get_user_data(i)

    print("  Measuring single prefix invalidation...")
    start = time.perf_counter()
    invalidate("org:1")
    end = time.perf_counter()
    prefix_time = end - start
    print(f"  Invalidating parent prefix 'org:1': {prefix_time:.6f}s")

    if prefix_time > 0:
        print(f"  Speedup: {specific_time / prefix_time:.0f}x")


def run_all():
    print(f"Zoocache version: {version()}")
    benchmark_hit_latency()
    benchmark_thundering_herd()
    benchmark_invalidation_efficiency()


if __name__ == "__main__":
    run_all()
