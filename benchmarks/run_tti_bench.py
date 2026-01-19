import time
import os
import shutil
from zoocache import cacheable, configure, _reset


def bench_storage(name, storage_url, iterations=1000, ttl=None):
    _reset()
    configure(storage_url=storage_url, default_ttl=ttl)

    @cacheable(namespace=f"bench_{name}")
    def get_data(i):
        return {"id": i, "payload": "x" * 100, "meta": [1, 2, 3]}

    # Warm up + Seed
    for i in range(100):
        get_data(i)

    print(f"--- BENCHMARK: {name} (TTL={ttl}) ---")
    start = time.perf_counter()
    for _ in range(iterations):
        for i in range(100):
            get_data(i)
    end = time.perf_counter()

    total_time = end - start
    total_calls = iterations * 100
    avg_latency_us = (total_time / total_calls) * 1_000_000
    print(f"  Total calls: {total_calls:,}")
    print(f"  Avg latency: {avg_latency_us:.2f} µs")
    return avg_latency_us


def run_all():
    # 1. Memory (Baseline)
    bench_storage("Memory (Baseline)", None)
    bench_storage("Memory (with TTI)", None, ttl=3600)

    # 2. LMDB
    lmdb_path = "./bench_lmdb_tti"
    if os.path.exists(lmdb_path):
        shutil.rmtree(lmdb_path)
    os.makedirs(lmdb_path)

    bench_storage("LMDB", f"lmdb://{lmdb_path}")
    bench_storage("LMDB (with TTI)", f"lmdb://{lmdb_path}", ttl=3600)

    # 3. Redis (if available)
    # Note: Assuming redis is running locally for this bench
    try:
        bench_storage("Redis", "redis://localhost:6379")
        bench_storage("Redis (with TTI)", "redis://localhost:6379", ttl=3600)
    except Exception as e:
        print(f"Skipping Redis: {e}")


if __name__ == "__main__":
    run_all()
