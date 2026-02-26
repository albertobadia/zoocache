# FastAPI Integration

ZooCache provides seamless integration with FastAPI through the `@cache_endpoint` decorator. Cache your endpoints with minimal code changes while getting all ZooCache benefits: semantic invalidation, anti-avalanche protection, and distributed consistency.

## Why Use ZooCache with FastAPI?

- ✅ **Transparent**: Add `@cache_endpoint` to your route, everything else is automatic
- ✅ **Pydantic Native**: Automatically serializes Pydantic models to cache
- ✅ **FastAPI Aware**: Automatically handles `Request`, `Response`, `BackgroundTasks` objects
- ✅ **Dependency Injection**: Works seamlessly with FastAPI's `Depends()`
- ✅ **Anti-Avalanche**: Multiple concurrent requests for the same endpoint execute only once
- ✅ **Distributed**: Works across multiple instances via Redis Pub/Sub

## Installation

```bash
# Using uv (recommended)
uv add "zoocache[fastapi]"

# Using pip
pip install "zoocache[fastapi]"
```

> **Note**: The `fastapi` extra is required for this integration.

## Quick Start

### Basic Endpoint Caching

```python
from fastapi import FastAPI
from zoocache import configure, add_deps
from zoocache.contrib.fastapi import cache_endpoint

# Configure ZooCache first!
configure()

app = FastAPI()

@app.get("/users/{user_id}")
@cache_endpoint()
async def get_user(user_id: int):
    # Register dependencies inside the function
    add_deps([f"user:{user_id}"])
    
    # This runs only on cache miss
    # Concurrent identical requests wait for this single execution
    return {"id": user_id, "name": f"User {user_id}"}
```

### With Pydantic Models

```python
from fastapi import FastAPI
from pydantic import BaseModel
from zoocache import configure, add_deps
from zoocache.contrib.fastapi import cache_endpoint

configure()

app = FastAPI()

class User(BaseModel):
    id: int
    username: str
    email: str

@app.get("/users/{user_id}", response_model=User)
@cache_endpoint()
async def get_user(user_id: int) -> User:
    add_deps([f"user:{user_id}"])
    # On cache miss, the return value is automatically serialized
    # On cache hit, the dict is automatically converted to User
    return User(id=user_id, username="alice", email="alice@example.com")
```

## How It Works

The `@cache_endpoint` decorator:

1. **Caches the response**: Serializes the return value using MsgPack + LZ4
2. **Extracts cache key**: Uses path parameters and query parameters (not FastAPI internals)
3. **Handles Pydantic**: Automatically converts Pydantic models to dict for caching
4. **Filters FastAPI objects**: Ignores `Request`, `Response`, `BackgroundTasks` in cache key

## Advanced Usage

### Using with Dependencies

FastAPI's dependency injection works seamlessly:

```python
from typing import Annotated
from fastapi import FastAPI, Depends
from zoocache import configure
from zoocache.contrib.fastapi import cache_endpoint

configure()

app = FastAPI()

async def get_current_user():
    # This runs before the endpoint
    return {"id": 1, "username": "admin"}

@app.get("/dashboard")
@cache_endpoint(deps=lambda user: [f"dashboard:{user['id']}"])
async def get_dashboard(
    user: Annotated[dict, Depends(get_current_user)]
):
    return {"user": user, "data": "expensive computation"}
```

### Dynamic Dependencies

Add dependencies at runtime:

```python
from fastapi import FastAPI
from zoocache import configure, add_deps
from zoocache.contrib.fastapi import cache_endpoint

configure()

app = FastAPI()

@app.get("/orders/{order_id}")
@cache_endpoint()
async def get_order(order_id: int):
    # Fetch from database
    order = db.get_order(order_id)
    
    # Add dependencies dynamically
    add_deps([
        f"order:{order_id}",
        f"user:{order.user_id}",
    ])
    
    return order
```

### Filtering Query Parameters

Control which parameters affect the cache key:

```python
@app.get("/search")
@cache_endpoint(
    deps=lambda q, category: [f"search:{category}:{q}"]
)
async def search(q: str, category: str = "all", page: int = 1):
    # Only q and category affect cache key
    # page is ignored for caching purposes
    return {"results": [], "page": page}
```

### Caching POST, PUT, DELETE

You can cache any HTTP method:

```python
@app.post("/items/")
@cache_endpoint(deps=lambda item: [f"item:{item['id']}"])
async def create_item(item: dict):
    return db.create(item)

@app.put("/items/{item_id}")
@cache_endpoint(deps=lambda item_id: [f"item:{item_id}"])
async def update_item(item_id: int, item: dict):
    return db.update(item_id, item)

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    db.delete(item_id)
    invalidate(f"item:{item_id}")  # Manual invalidation
    return {"status": "deleted"}
```

## Invalidation Patterns

### Automatic Invalidation

Create a separate endpoint to invalidate:

```python
from fastapi import FastAPI, HTTPException
from zoocache import configure, invalidate
from zoocache.contrib.fastapi import cache_endpoint

configure()

app = FastAPI()

@app.get("/users/{user_id}")
@cache_endpoint(deps=lambda user_id: [f"user:{user_id}"])
async def get_user(user_id: int):
    return {"id": user_id}

@app.put("/users/{user_id}")
async def update_user(user_id: int, data: dict):
    db.save(user_id, data)
    invalidate(f"user:{user_id}")  # Invalidate the cached GET
    return {"status": "updated"}
```

### Hierarchical Invalidation

Cache multiple related endpoints and invalidate together:

```python
@app.get("/users/{user_id}")
@cache_endpoint(deps=lambda user_id: [f"user:{user_id}"])
async def get_user(user_id: int):
    return {"id": user_id}

@app.get("/users/{user_id}/profile")
@cache_endpoint(deps=lambda user_id: [f"user:{user_id}:profile"])
async def get_user_profile(user_id: int):
    return {"user_id": user_id}

@app.get("/users/{user_id}/orders")
@cache_endpoint(deps=lambda user_id: [f"user:{user_id}:orders"])
async def get_user_orders(user_id: int):
    return []

# Invalidate user AND all related data
invalidate(f"user:{user_id}")
```

## Configuration Options

The `@cache_endpoint` decorator accepts these options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deps` | `Callable` or `list` | `None` | Dependencies for cache invalidation |
| `ttl` | `int` | `None` | Time-to-live in seconds |
| `key_builder` | `Callable` | `None` | Custom function to build cache key |

```python
@app.get("/items/{item_id}")
@cache_endpoint(
    deps=lambda item_id: [f"item:{item_id}"],
    ttl=300,  # 5 minutes
)
async def get_item(item_id: int):
    return {"id": item_id}
```

## Comparison: `@cacheable` vs `@cache_endpoint`

| Feature | `@cacheable` | `@cache_endpoint` |
|---------|--------------|-------------------|
| Use case | Any function | FastAPI endpoints |
| Pydantic support | ❌ Manual | ✅ Automatic |
| Request filtering | ❌ | ✅ |
| BackgroundTasks handling | ❌ | ✅ |
| Depends integration | Manual | Automatic |

## Complete Example

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from zoocache import configure, invalidate
from zoocache.contrib.fastapi import cache_endpoint

# Configure first!
configure()

app = FastAPI()

class Item(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

# Cache GET endpoints
@app.get("/items/{item_id}", response_model=Item)
@cache_endpoint(deps=lambda item_id: [f"item:{item_id}"])
async def get_item(item_id: int) -> Item:
    # Simulate DB call
    return Item(id=item_id, name=f"Item {item_id}", price=9.99, quantity=100)

@app.get("/items/", response_model=list[Item])
@cache_endpoint(deps=lambda: ["items:list"])
async def list_items() -> list[Item]:
    # Simulate DB call
    return [Item(id=i, name=f"Item {i}", price=9.99, quantity=100) for i in range(10)]

# Update endpoint with manual invalidation
@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: Item) -> Item:
    saved = db.save(item_id, item)
    invalidate(f"item:{item_id}")  # Invalidate cached GET
    invalidate("items:list")  # Invalidate list
    return saved

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    db.delete(item_id)
    invalidate(f"item:{item_id}")
    invalidate("items:list")
    return {"status": "deleted"}
```

## Next Steps

- [→ Configuration](configuration/index.md) — Customize storage, TTL, serialization
- [→ Concepts](concepts.md) — Learn about dependencies and invalidation
- [→ CLI](cli.md) — Monitor your cache with the TUI
