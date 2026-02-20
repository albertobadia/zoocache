import pytest
from litestar import Litestar, get
from litestar.testing import TestClient

import zoocache
from zoocache.contrib.litestar.route import cache_endpoint

from .utils import simulated_latency


@get("/baseline")
async def baseline_endpoint() -> dict:
    @simulated_latency(ms=5)
    def db_call():
        return {"data": "A lot of data"}

    return db_call()


@get("/cached")
@cache_endpoint()
async def cached_endpoint() -> dict:
    @simulated_latency(ms=5)
    def db_call():
        return {"data": "A lot of data"}

    return db_call()


app = Litestar(route_handlers=[baseline_endpoint, cached_endpoint])
client = TestClient(app=app)


@pytest.fixture(autouse=True)
def setup_zoocache():
    zoocache.reset()
    zoocache.configure(prefix="bench:litestar:")
    yield
    zoocache.reset()


def test_litestar_baseline(benchmark):
    """Benchmark raw Litestar endpoint handling involving a 5ms latency call."""

    def run():
        response = client.get("/baseline")
        assert response.status_code == 200

    benchmark(run)


def test_litestar_cached_hit(benchmark):
    """Benchmark Litestar @cache_endpoint hit performance (No latency added because it's cached)."""
    # Populate the cache first
    client.get("/cached")

    def run():
        response = client.get("/cached")
        assert response.status_code == 200

    benchmark(run)


def test_litestar_cached_miss(benchmark):
    """Benchmark Litestar @cache_endpoint miss overhead (includes simulated 5ms DB latency)."""

    def setup():
        zoocache.clear()

    def run():
        response = client.get("/cached")
        assert response.status_code == 200

    benchmark.pedantic(run, setup=setup, rounds=10, iterations=1)
