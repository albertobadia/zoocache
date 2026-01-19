import multiprocessing
import time
import os
import shutil
from zoocache import configure, cacheable, invalidate, clear

# Shared LMDB path
DB_PATH = "./test_lmdb_path"


def setup_db():
    if os.path.exists(DB_PATH):
        shutil.rmtree(DB_PATH)
    os.makedirs(DB_PATH)


@cacheable(deps=["item:1"])
def get_shared_data(shared_arg):
    print(f"[Worker] Cache miss, generating data for {shared_arg}...")
    return f"data_{time.time()}"


# Redis connection URL
REDIS_URL = "redis://localhost:6379"


def worker_process(proc_id, results_queue):
    # Configure each process to use LMDB and Redis Bus with same prefix
    configure(storage_url=f"lmdb://{DB_PATH}", bus_url=REDIS_URL, prefix="test")

    # Try to get data
    val1 = get_shared_data("shared")
    results_queue.put((proc_id, "first_read", val1))

    # Wait for a bit (main will invalidate)
    time.sleep(2)

    # Read again
    val2 = get_shared_data("shared")
    results_queue.put((proc_id, "second_read", val2))


def main():
    setup_db()

    # Main process configuration (to be able to invalidate/clear)
    configure(storage_url=f"lmdb://{DB_PATH}", bus_url=REDIS_URL, prefix="test")
    clear()

    results_queue = multiprocessing.Queue()

    # Start processes
    p1 = multiprocessing.Process(target=worker_process, args=(1, results_queue))
    p2 = multiprocessing.Process(target=worker_process, args=(2, results_queue))

    p1.start()
    time.sleep(1)
    p2.start()

    time.sleep(0.5)

    # Now, from main process, invalidate!
    # This sends a signal via Redis that both workers should receive.
    print("[Main] Invalidating item:1 via Redis Bus...")
    invalidate("item:1")

    p1.join()
    p2.join()

    # Collect results
    results = []
    while not results_queue.empty():
        results.append(results_queue.get())

    # Print results
    for res in sorted(results):
        print(f"Result: {res}")


if __name__ == "__main__":
    main()
