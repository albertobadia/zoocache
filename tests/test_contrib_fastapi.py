from typing import Annotated

import pytest
from fastapi import Depends, FastAPI, Request
from fastapi.testclient import TestClient
from pydantic import BaseModel

from zoocache import add_deps, configure, invalidate, reset
from zoocache.contrib.fastapi.route import cache_endpoint

app = FastAPI()


class User(BaseModel):
    id: int
    name: str


execution_counts = {}


def track_execution(name: str):
    execution_counts[name] = execution_counts.get(name, 0) + 1


@app.get("/simple")
@cache_endpoint()
async def simple_endpoint():
    track_execution("simple")
    return {"status": "ok"}


@app.get("/with_pydantic")
@cache_endpoint()
async def pydantic_endpoint():
    track_execution("pydantic")
    return User(id=1, name="Alice")


async def common_params(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}


@app.get("/with_depends")
@cache_endpoint(deps=lambda request, commons: [f"q:{commons['q']}"])
async def depends_endpoint(request: Request, commons: Annotated[dict, Depends(common_params)]):
    track_execution("depends")
    return {"commons": commons}


@app.get("/simple_no_parens")
@cache_endpoint
async def simple_no_parens_endpoint():
    track_execution("simple_no_parens")
    return {"status": "ok_no_parens"}


@app.get("/with_add_deps/{item_id}")
@cache_endpoint()
async def add_deps_endpoint(item_id: int):
    track_execution("add_deps")
    add_deps([f"item:{item_id}"])
    return {"item_id": item_id}


@app.get("/sync_endpoint")
@cache_endpoint
def sync_endpoint():
    track_execution("sync")
    return {"status": "ok_sync"}


client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_zoocache():
    reset()
    configure(prefix="fastapi_test")
    execution_counts.clear()
    yield
    reset()


def test_simple_caching():
    response = client.get("/simple")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert execution_counts.get("simple") == 1

    response = client.get("/simple")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert execution_counts.get("simple") == 1


def test_pydantic_caching():
    response = client.get("/with_pydantic")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "name": "Alice"}
    assert execution_counts.get("pydantic") == 1

    response = client.get("/with_pydantic")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "name": "Alice"}
    assert execution_counts.get("pydantic") == 1


def test_depends_caching():
    response = client.get("/with_depends?q=test&skip=5")
    assert response.status_code == 200
    assert response.json() == {"commons": {"q": "test", "skip": 5, "limit": 100}}
    assert execution_counts.get("depends") == 1

    response = client.get("/with_depends?q=test&skip=5")
    assert response.status_code == 200
    assert response.json() == {"commons": {"q": "test", "skip": 5, "limit": 100}}
    assert execution_counts.get("depends") == 1

    response = client.get("/with_depends?q=test2")
    assert response.status_code == 200
    assert response.json() == {"commons": {"q": "test2", "skip": 0, "limit": 100}}
    assert execution_counts.get("depends") == 2


def test_simple_no_parens_caching():
    response = client.get("/simple_no_parens")
    assert response.status_code == 200
    assert response.json() == {"status": "ok_no_parens"}
    assert execution_counts.get("simple_no_parens") == 1

    response = client.get("/simple_no_parens")
    assert response.status_code == 200
    assert response.json() == {"status": "ok_no_parens"}
    assert execution_counts.get("simple_no_parens") == 1


def test_add_deps_inside_endpoint():
    response = client.get("/with_add_deps/42")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42}
    assert execution_counts.get("add_deps") == 1

    response = client.get("/with_add_deps/42")
    assert response.status_code == 200
    assert execution_counts.get("add_deps") == 1

    invalidate("item:42")

    response = client.get("/with_add_deps/42")
    assert response.status_code == 200
    assert execution_counts.get("add_deps") == 2


def test_sync_caching():
    response = client.get("/sync_endpoint")
    assert response.status_code == 200
    assert response.json() == {"status": "ok_sync"}
    assert execution_counts.get("sync") == 1

    response = client.get("/sync_endpoint")
    assert response.status_code == 200
    assert response.json() == {"status": "ok_sync"}
    assert execution_counts.get("sync") == 1
