# Litestar Integration

Zoocache provides an optional, out-of-box integration with [Litestar](https://litestar.dev/) that makes caching your endpoints incredibly simple, natively supporting `msgspec` and `pydantic`.

By using the `@cache_endpoint` decorator, you get the exact same benefits of `zoocache.cacheable`—like Anti-Avalanche protection, Semantic Invalidation, and High Performance—tailored flawlessly for Litestar.

## Installation

The Litestar integration is available as an optional extra.

Using `pip`:
```bash
pip install "zoocache[litestar]"
```

Using `uv`:
```bash
uv add "zoocache[litestar]"
```

## Quick Start

Import the decorator **directly** from the `zoocache.contrib.litestar.route` module.

```python
from litestar import Litestar, get
from zoocache.contrib.litestar.route import cache_endpoint

@get("/users/{user_id:int}")
@cache_endpoint(deps=lambda user_id: [f"user:{user_id}"])
async def get_user(user_id: int) -> dict:
    # This function only runs if the cache misses.
    # Concurrent identical requests will wait for this single execution.
    return {"id": user_id, "name": "Alice"}

app = Litestar(route_handlers=[get_user])
```

## Why `@cache_endpoint` instead of `@cacheable`?

While you could wrap your database calls using the standard `@cacheable`, using `@cache_endpoint` at the router level gives you two massive advantages:

### 1. Transparent Dependency Filtering
Litestar injects ASGI connections (like `Request` and `WebSocket`) and other context objects (like `State`) into your endpoint signature if you request them. If you try to pass these to the standard `@cacheable`, it will crash because it cannot hash them reliably to figure out the cache key.

`@cache_endpoint` automatically understands these Litestar-specific objects and strips them out of the key generation logic without you having to lift a finger.

```python
from litestar import Request, get

@get("/expensive-report")
@cache_endpoint()
async def expensive_report(request: Request, filters: str) -> dict:
    # 'request' is ignored for the cache key, but 'filters' is used.
    return {"data": "A lot of data"}
```

### 2. Native `msgspec` and `pydantic` Serialization
If your endpoint returns a `msgspec.Struct` or a Pydantic `BaseModel`, `@cache_endpoint` automatically intercepts the response and serializes it to a dictionary before caching it.

```python
import msgspec
from litestar import get
from zoocache.contrib.litestar.route import cache_endpoint

class UserProfile(msgspec.Struct):
    id: int
    username: str

@get("/profile/{user_id:int}")
@cache_endpoint()
async def get_profile(user_id: int) -> UserProfile:
    # On a cache miss, Zoocache automatically dumps the UserProfile to a dict internally
    return UserProfile(id=user_id, username="Alice")
```

## Advanced Dependencies (`Provide`)

Litestar's Dependency Injection (`Provide`) works perfectly with `@cache_endpoint`. The decorator executes *after* Litestar has resolved the dependencies, so the resolved variables are used to construct the cache key.

```python
from litestar import get
from litestar.di import Provide

async def pagination_params(skip: int = 0, limit: int = 100) -> dict:
    return {"skip": skip, "limit": limit}

@get("/items/", dependencies={"p": Provide(pagination_params)})
@cache_endpoint(deps=lambda p: [f"items_page:{p['skip']}"])
async def list_items(p: dict) -> dict:
    # The cache key will automatically consider the injected dictionary 'p'
    return {"items": [], "pagination": p}
```

## Dynamic Dependencies (`add_deps`)

Sometimes you don't know the exact cache dependencies upfront, or you want to combine the initial `deps` with dynamic keys calculated inside the endpoint. You can safely use the standard `zoocache.add_deps` function inside your Litestar endpoints.

```python
from zoocache import add_deps
from zoocache.contrib.litestar.route import cache_endpoint

@get("/orders/{order_id:int}")
@cache_endpoint()
async def get_order(order_id: int) -> dict:
    # Fetch data
    order = db.get_order(order_id)
    
    # Store this request under the specific order ID AND the user's ID
    add_deps([
        f"order:{order_id}",
        f"user:{order.user_id}"
    ])
    
    return {"order": order}
```

## Summary

`@cache_endpoint` allows you to add distributed caching with thundering-herd protection and semantic invalidation to your Litestar applications seamlessly, respecting its powerful typing and injection system natively.
