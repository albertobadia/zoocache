import os
import shutil

import pytest

from zoocache import cacheable, configure, reset

DB_PATH_BASELINE = "./bench_lmdb_baseline"
DB_PATH_TTI = "./bench_lmdb_tti"


@pytest.fixture(scope="module")
def lmdb_baseline_setup():
    if os.path.exists(DB_PATH_BASELINE):
        shutil.rmtree(DB_PATH_BASELINE)
    os.makedirs(DB_PATH_BASELINE)
    yield
    if os.path.exists(DB_PATH_BASELINE):
        shutil.rmtree(DB_PATH_BASELINE)


@pytest.fixture(scope="module")
def lmdb_tti_setup():
    if os.path.exists(DB_PATH_TTI):
        shutil.rmtree(DB_PATH_TTI)
    os.makedirs(DB_PATH_TTI)
    yield
    if os.path.exists(DB_PATH_TTI):
        shutil.rmtree(DB_PATH_TTI)


def run_storage_bench(benchmark, name, storage_url, ttl=None):
    reset()
    configure(storage_url=storage_url, default_ttl=ttl)

    @cacheable(namespace=f"bench_{name}")
    def get_data(i):
        return {"id": i, "payload": "x" * 100, "meta": [1, 2, 3]}

    for i in range(100):
        get_data(i)

    def do_work():
        for i in range(100):
            get_data(i)

    benchmark(do_work)


def test_storage_memory_baseline(benchmark):
    run_storage_bench(benchmark, "Memory", None)


def test_storage_memory_tti(benchmark):
    run_storage_bench(benchmark, "Memory_TTI", None, ttl=3600)


def test_storage_lmdb_baseline(benchmark, lmdb_baseline_setup):
    run_storage_bench(benchmark, "LMDB", f"lmdb://{DB_PATH_BASELINE}")


def test_storage_lmdb_tti(benchmark, lmdb_tti_setup):
    run_storage_bench(benchmark, "LMDB_TTI", f"lmdb://{DB_PATH_TTI}", ttl=3600)


def test_storage_redis_baseline(benchmark):
    try:
        run_storage_bench(benchmark, "Redis", "redis://localhost:6379")
    except Exception:
        pytest.skip("Redis not available")


def test_storage_redis_tti(benchmark):
    try:
        run_storage_bench(benchmark, "Redis_TTI", "redis://localhost:6379", ttl=3600)
    except Exception:
        pytest.skip("Redis not available")
