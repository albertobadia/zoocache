import time
import os
import shutil
import threading
import subprocess
import sys
from zoocache import configure, cacheable, _reset

DB_PATH = "./repro_bottleneck_db"


def setup_db():
    if os.path.exists(DB_PATH):
        shutil.rmtree(DB_PATH)
    os.makedirs(DB_PATH)


@cacheable(namespace="bench")
def fast_func(x):
    return x


def run_worker(iterations):
    for i in range(iterations):
        fast_func(1)


def run_test_logic(num_threads, iterations_per_thread, storage_url):
    if storage_url and "lmdb" in storage_url:
        setup_db()

    _reset()
    configure(storage_url=storage_url)

    # Warm up
    fast_func(1)

    threads = []
    start = time.perf_counter()
    for _ in range(num_threads):
        t = threading.Thread(target=run_worker, args=(iterations_per_thread,))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()
    end = time.perf_counter()

    total_iterations = num_threads * iterations_per_thread
    elapsed = end - start
    latency = (elapsed / total_iterations) * 1_000_000
    print(f"THREADS:{num_threads}|LATENCY:{latency:.2f}|TIME:{elapsed:.4f}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--worker":
        num_threads = int(sys.argv[2])
        storage_url = sys.argv[3] if sys.argv[3] != "None" else None
        run_test_logic(num_threads, 10000, storage_url)
    else:
        storage_type = sys.argv[1] if len(sys.argv) > 1 else "mem"
        storage_url = f"lmdb://{DB_PATH}" if storage_type == "lmdb" else "None"

        print(f"--- Testing storage: {storage_type.upper()} ---")
        for threads in [1, 4, 8]:
            result = subprocess.run(
                [sys.executable, __file__, "--worker", str(threads), storage_url],
                capture_output=True,
                text=True,
                env=os.environ,
            )
            if result.returncode == 0:
                print(result.stdout.strip())
            else:
                print(f"Error running test for {threads} threads: {result.stderr}")
