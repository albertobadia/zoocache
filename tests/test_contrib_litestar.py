import msgspec
import pytest
from litestar import Litestar, get
from litestar.testing import TestClient
from pydantic import BaseModel

from zoocache import add_deps, configure, invalidate, reset
from zoocache.contrib.litestar.route import cache_endpoint

execution_counts = {}


def track_execution(name: str):
    execution_counts[name] = execution_counts.get(name, 0) + 1


# Models
class User(BaseModel):
    id: int
    name: str


class StructUser(msgspec.Struct):
    id: int
    name: str


# Endpoints
@get("/simple")
@cache_endpoint()
async def simple_endpoint() -> dict:
    track_execution("simple")
    return {"status": "ok"}


@get("/sync_endpoint", sync_to_thread=False)
@cache_endpoint()
def sync_endpoint() -> dict:
    track_execution("sync")
    return {"status": "ok"}


@get("/no_parens")
@cache_endpoint
async def no_parens() -> dict:
    track_execution("no_parens")
    return {"status": "ok_no_parens"}


@get("/with_pydantic")
@cache_endpoint()
async def with_pydantic() -> User:
    track_execution("pydantic")
    return User(id=1, name="Alice")


@get("/with_struct")
@cache_endpoint()
async def with_struct() -> StructUser:
    track_execution("struct")
    return StructUser(id=2, name="Bob")


async def dependencies_hook(q: str, skip: int = 0, limit: int = 100) -> dict:
    return {"q": q, "skip": skip, "limit": limit}


@get("/with_depends", dependencies={"commons": dependencies_hook})
@cache_endpoint()
async def with_depends(commons: dict) -> dict:
    track_execution("depends")
    return {"commons": commons}


@get("/with_add_deps/{item_id:int}")
@cache_endpoint()
async def with_add_deps(item_id: int) -> dict:
    track_execution("add_deps")
    add_deps([f"item:{item_id}"])
    return {"item_id": item_id}


app = Litestar(
    route_handlers=[
        simple_endpoint,
        sync_endpoint,
        no_parens,
        with_pydantic,
        with_struct,
        with_depends,
        with_add_deps,
    ]
)

client = TestClient(app=app)


@pytest.fixture(autouse=True)
def setup_zoocache():
    execution_counts.clear()
    reset()
    configure(prefix="test:")
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


def test_sync_caching():
    response = client.get("/sync_endpoint")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert execution_counts.get("sync") == 1

    response = client.get("/sync_endpoint")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert execution_counts.get("sync") == 1


def test_no_parens():
    response = client.get("/no_parens")
    assert response.status_code == 200
    assert response.json() == {"status": "ok_no_parens"}
    assert execution_counts.get("no_parens") == 1

    response = client.get("/no_parens")
    assert response.status_code == 200
    assert response.json() == {"status": "ok_no_parens"}
    assert execution_counts.get("no_parens") == 1


def test_pydantic_caching():
    response = client.get("/with_pydantic")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "name": "Alice"}
    assert execution_counts.get("pydantic") == 1

    response = client.get("/with_pydantic")
    assert response.status_code == 200
    assert response.json() == {"id": 1, "name": "Alice"}
    assert execution_counts.get("pydantic") == 1


def test_struct_caching():
    response = client.get("/with_struct")
    assert response.status_code == 200
    assert response.json() == {"id": 2, "name": "Bob"}
    assert execution_counts.get("struct") == 1

    response = client.get("/with_struct")
    assert response.status_code == 200
    assert response.json() == {"id": 2, "name": "Bob"}
    assert execution_counts.get("struct") == 1


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
