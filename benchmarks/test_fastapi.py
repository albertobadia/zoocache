import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import zoocache
from zoocache.contrib.fastapi.route import cache_endpoint

from .utils import simulated_latency

app = FastAPI()


@app.get("/baseline")
async def baseline_endpoint():
    @simulated_latency(ms=5)
    def db_call():
        return {"data": "A lot of data"}

    return db_call()


@app.get("/cached")
@cache_endpoint()
async def cached_endpoint():
    @simulated_latency(ms=5)
    def db_call():
        return {"data": "A lot of data"}

    return db_call()


client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_zoocache():
    zoocache.reset()
    zoocache.configure(prefix="bench:fastapi:")
    yield
    zoocache.reset()


def test_fastapi_baseline(benchmark):
    """Benchmark raw FastAPI endpoint handling involving a 5ms latency call."""

    def run():
        response = client.get("/baseline")
        assert response.status_code == 200

    benchmark(run)


def test_fastapi_cached_hit(benchmark):
    """Benchmark FastAPI @cache_endpoint hit performance (No latency added because it's cached)."""
    # Populate the cache first
    client.get("/cached")

    def run():
        response = client.get("/cached")
        assert response.status_code == 200

    benchmark(run)


def test_fastapi_cached_miss(benchmark):
    """Benchmark FastAPI @cache_endpoint miss overhead (includes simulated 5ms DB latency)."""

    def setup():
        zoocache.clear()

    def run():
        response = client.get("/cached")
        assert response.status_code == 200

    benchmark.pedantic(run, setup=setup, rounds=10, iterations=1)
