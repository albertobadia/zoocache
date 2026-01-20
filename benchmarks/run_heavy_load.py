import time
import threading
from zoocache import cacheable, invalidate, clear, configure


def benchmark_massive_dependencies():
    print("--- BENCHMARK: Massive Dependencies ---")

    for count in [10, 100, 1000, 5000, 10000]:
        clear()

        # Create a function with 'count' dependencies
        deps = [f"tag:{i}" for i in range(count)]

        @cacheable(deps=deps)
        def heavy_deps_func():
            return "data"

        # Write to cache
        heavy_deps_func()

        # Measure read (get) latency
        iterations = 5000 if count < 5000 else 1000
        start = time.perf_counter()
        for _ in range(iterations):
            heavy_deps_func()
        end = time.perf_counter()

        avg_us = (end - start) / iterations * 1_000_000
        print(f"  Dependencies: {count:5} | Avg Get Latency: {avg_us:8.2f} µs")


def benchmark_high_concurrency():
    print("\n--- BENCHMARK: High Concurrency (Stress) ---")

    @cacheable()
    def concurrent_func(i):
        return f"value_{i}"

    # Warm up with some data
    num_keys = 1000
    for i in range(num_keys):
        concurrent_func(i)

    def worker(stop_event, stats):
        local_hits = 0
        while not stop_event.is_set():
            concurrent_func(local_hits % num_keys)
            local_hits += 1
        stats.append(local_hits)

    for thread_count in [10, 50, 100, 200]:
        stop_event = threading.Event()
        stats = []
        threads = []

        for _ in range(thread_count):
            t = threading.Thread(target=worker, args=(stop_event, stats))
            threads.append(t)

        start = time.perf_counter()
        for t in threads:
            t.start()

        time.sleep(2)  # Run for 2 seconds
        stop_event.set()

        for t in threads:
            t.join()
        end = time.perf_counter()

        total_ops = sum(stats)
        duration = end - start
        throughput = total_ops / duration

        print(f"  Threads: {thread_count:3} | Throughput: {throughput:10.2f} ops/sec")


def benchmark_deep_hierarchy():
    print("\n--- BENCHMARK: Deep Hierarchy Invalidation ---")

    # Create a very deep path
    depth = 20
    parts = [f"level{i}:id" for i in range(depth)]
    deep_tag = ":".join(parts)

    @cacheable(deps=[deep_tag])
    def deep_func():
        return "deep_data"

    deep_func()

    # Measure validation time (hit)
    start = time.perf_counter()
    for _ in range(10000):
        deep_func()
    end = time.perf_counter()
    print(f"  Validation (Depth {depth}): {(end - start) / 10000 * 1_000_000:8.2f} µs")

    # Measure invalidation at root vs leaf
    start = time.perf_counter()
    for _ in range(1000):
        invalidate("level0:id")
    end = time.perf_counter()
    print(f"  Invalidate Root (Level 0): {(end - start) / 1000 * 1_000_000:8.2f} µs")

    start = time.perf_counter()
    for _ in range(1000):
        invalidate(deep_tag)
    end = time.perf_counter()
    print(
        f"  Invalidate Leaf (Level {depth}): {(end - start) / 1000 * 1_000_000:8.2f} µs"
    )


def run_all():
    configure()  # Default in-memory
    print("ZooCache Heavy Load Benchmarking")
    benchmark_massive_dependencies()
    benchmark_high_concurrency()
    benchmark_deep_hierarchy()


if __name__ == "__main__":
    run_all()
