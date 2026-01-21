import time
from zoocache import cacheable, invalidate, clear, configure


def benchmark_lazy_update():
    print("--- BENCHMARK: Lazy Update (Self-Healing) ---")
    configure()
    clear()

    # 1. Create entry with 10,000 dependencies
    count = 10000
    deps = [f"tag:{i}" for i in range(count)]

    @cacheable(deps=deps)
    def heavy_func():
        return "data"

    print(f"  Creating entry with {count} dependencies...")
    heavy_func()  # Warm up

    # 2. Baseline: O(1) hit
    start = time.perf_counter()
    heavy_func()
    t_baseline = (time.perf_counter() - start) * 1_000_000
    print(f"  Baseline (O1 hit): {t_baseline:.2f} µs")

    # 3. Global Invalidation (of a DIFFERENT tag)
    print("  Invalidating an unrelated tag 'other:tag'...")
    invalidate("other:tag")

    # 4. First hit after invalidation (should be slow, O(N))
    start = time.perf_counter()
    heavy_func()
    t_first = (time.perf_counter() - start) * 1_000_000
    print(f"  First hit after global change (O(N) + Lazy Update): {t_first:.2f} µs")

    time.sleep(1)  # Ensure everything is settled

    # 5. Second hit (should be fast again, O(1))
    start = time.perf_counter()
    heavy_func()
    t_second = (time.perf_counter() - start) * 1_000_000
    print(f"  Second hit after global change (O(1) again): {t_second:.2f} µs")

    # Verification
    if t_second < t_first * 0.1:  # Significant improvement
        print("  SUCCESS: Lazy Update worked! The second hit is O(1) again.")
    else:
        print("  FAILURE: The second hit is still slow.")


if __name__ == "__main__":
    benchmark_lazy_update()
