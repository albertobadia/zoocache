# 🚀 Installation and First Steps

This guide will help you install ZooCache and perform your first basic integration.

## Installation

We recommend using `uv` for dependency management:

```bash
uv add zoocache
```

Or using `pip`:

```bash
pip install zoocache
```

### Requirements
- **Python 3.10+**
- No external dependencies required for in-memory mode.
- Requires **Redis** for distributed mode.

---

## Quick Start

### Basic Caching

The most common use is through the `@cacheable` decorator.

```python
from zoocache import cacheable, invalidate

@cacheable(deps=lambda user_id: [f"user:{user_id}"])
def get_user(user_id: int):
    # This function will execute only the first time
    return db.fetch_user(user_id)

# First call: executes the function
get_user(42)

# Second call: returns the cached result instantly
get_user(42)

# Invalidation when data changes
def update_user(user_id: int, data: dict):
    db.save(user_id, data)
    invalidate(f"user:{user_id}") # Kills all cache entries for this user
```

### Hierarchical Invalidation

ZooCache shines when you have complex dependencies. You can invalidate entire groups of data:

```python
@cacheable(deps=lambda org_id, user_id: [f"org:{org_id}:user:{user_id}"])
def get_org_user(org_id: int, user_id: int):
    return db.fetch_org_user(org_id, user_id)

# Cache for several users of the same organization
get_org_user(1, 100)
get_org_user(1, 200)

# Invalidate ALL users in organization 1 with a single call
invalidate("org:1")
```
