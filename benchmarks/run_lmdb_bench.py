import subprocess
import os
import shutil

DB_PATH = "./bench_lmdb"


def setup_db():
    if os.path.exists(DB_PATH):
        shutil.rmtree(DB_PATH)
    os.makedirs(DB_PATH)


def run_config(storage_url):
    code = f"""
import time
from zoocache import configure, cacheable

@cacheable(namespace="bench")
def fast_func(x):
    return x

configure(storage_url={repr(storage_url)})
fast_func(1) # Warm up

iterations = 50000
start = time.perf_counter()
for i in range(iterations):
    fast_func(1)
end = time.perf_counter()
print((end - start) / iterations * 1000000)
"""
    result = subprocess.run(
        ["python3", "-c", code],
        capture_output=True,
        text=True,
        env=dict(os.environ, PYTHONPATH="src"),
    )
    return float(result.stdout.strip())


def main():
    print("--- BENCHMARK: Shared Storage Comparison ---")

    # In-Memory
    mem_lat = run_config(None)
    print(f"  In-Memory: {mem_lat:.2f} µs")

    # LMDB
    setup_db()
    lmdb_lat = run_config(f"lmdb://{DB_PATH}")
    print(f"  LMDB:      {lmdb_lat:.2f} µs")

    print("\nExecution Summary:")
    print(f"  LMDB adds ~{lmdb_lat - mem_lat:.2f} µs of overhead per hit vs In-Memory.")


if __name__ == "__main__":
    main()
