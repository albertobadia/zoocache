# FastAPI Integration

Zoocache provides an optional, out-of-box integration with [FastAPI](https://fastapi.tiangolo.com/) that makes caching your endpoints trivial while keeping the incredible Developer Experience (DX) that FastAPI is known for.

By using the `@cache_endpoint` decorator, you get the exact same benefits of `zoocache.cacheable`—like Anti-Avalanche protection, Semantic Invalidation, and High Performance—tailored flawlessly for FastAPI.

## Installation

The FastAPI integration is available as an optional extra.

Using `pip`:
```bash
pip install "zoocache[fastapi]"
```

Using `uv`:
```bash
uv add "zoocache[fastapi]"
```

## Quick Start

Import the decorator **directly** from the `zoocache.contrib.fastapi.route` module.

```python
from fastapi import FastAPI
from zoocache.contrib.fastapi.route import cache_endpoint

app = FastAPI()

@app.get("/users/{user_id}")
@cache_endpoint(deps=lambda user_id: [f"user:{user_id}"])
async def get_user(user_id: int):
    # This function only runs if the cache misses.
    # Concurrent identical requests will wait for this single execution.
    return {"id": user_id, "name": "Alice"}
```

## Why `@cache_endpoint` instead of `@cacheable`?

While you could wrap your database calls using the standard `@cacheable`, using `@cache_endpoint` at the router level gives you two massive advantages:

### 1. Transparent Dependency Filtering
FastAPI heavily relies on injecting context objects like `Request`, `Response`, and `BackgroundTasks` into your endpoint signature. If you try to pass these to the standard `@cacheable`, it will crash because it cannot hash them reliably to figure out the cache key.

`@cache_endpoint` automatically understands these FastAPI-specific objects and strips them out of the key generation logic without you having to lift a finger.

```python
from fastapi import Request

@app.get("/expensive-report")
@cache_endpoint()
async def expensive_report(request: Request, filters: str):
    # 'request' is ignored for the cache key, but 'filters' is used.
    return {"data": "A lot of data"}
```

### 2. Native Pydantic Serialization
If your endpoint returns a Pydantic `BaseModel`, `@cache_endpoint` automatically intercepts the response and serializes it using `.model_dump()` before storing it in Zoocache (which uses high-speed MsgPack/LZ4 under the hood).

When the cache is hit, the decorator returns the raw dictionary. FastAPI then takes this dictionary and seamlessly converts it into the final JSON response.

```python
from pydantic import BaseModel
from zoocache.contrib.fastapi.route import cache_endpoint

class UserProfile(BaseModel):
    id: int
    username: str

@app.get("/profile/{user_id}", response_model=UserProfile)
@cache_endpoint()
async def get_profile(user_id: int) -> UserProfile:
    # On a cache miss, Zoocache automatically dumps the UserProfile to a dict internally
    return UserProfile(id=user_id, username="Alice")
```

## Advanced Dependencies (Depends)

FastAPI's dependency injection system (`Depends`) works perfectly with `@cache_endpoint`. The decorator executes *after* FastAPI has resolved the dependencies, so the resolved values are used to construct the cache key.

```python
from typing import Annotated
from fastapi import Depends

async def pagination_params(skip: int = 0, limit: int = 100):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
@cache_endpoint(deps=lambda p: [f"items_page:{p['skip']}"])
async def list_items(p: Annotated[dict, Depends(pagination_params)]):
    # The cache key will automatically consider the resolved dictionary 'p'
    return {"items": [], "pagination": p}
```

## Dynamic Dependencies (`add_deps`)

Sometimes you don't know the exact cache dependencies upfront, or you want to combine the initial `deps` with some dynamic keys calculated inside the endpoint. You can safely use the standard `zoocache.add_deps` function inside your FastAPI endpoints just as you would in normal functions.

```python
from zoocache import add_deps
from zoocache.contrib.fastapi.route import cache_endpoint

@app.get("/orders/{order_id}")
@cache_endpoint() # or @cache_endpoint without parens
async def get_order(order_id: int):
    # Fetch data
    order = db.get_order(order_id)
    
    # Store this request under the specific order ID AND the user's ID
    add_deps([
        f"order:{order_id}",
        f"user:{order.user_id}"
    ])
    
    return order
```

## Rules and Caveats

- **Sync and Async**: `@cache_endpoint` supports both standard `def` and `async def` endpoints perfectly.
- **Side effects in Depends**: Re-read the caching rules carefully. If you use a FastAPI dependency (`Depends()`) that causes a side-effect (like saving an audit log to a database), be aware that if the endpoint hits the cache, the endpoint code itself is skipped, *but the FastAPI dependencies are still executed by FastAPI before reaching the cache decorator*.

## Summary

`@cache_endpoint` is the single most powerful way to bolt Zoocache onto FastAPI, offering distributed cache, thundering-herd protection, and semantic invalidation with near-zero boilerplate.
