# Django Integration

ZooCache provides a Django ORM adapter that transparently caches QuerySet results
and automatically invalidates them when models are saved or deleted.

## Installation

```bash
pip install zoocache[django]
```

## Quick Start

Add `ZooCacheManager` as a second manager on your model:

```python
from django.db import models
from zoocache.contrib.django import ZooCacheManager

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    category = models.CharField(max_length=50)

    objects = models.Manager()          # Normal queries (no caching)
    cached = ZooCacheManager(ttl=300)   # Cached queries
```

Use it exactly like `objects`:

```python
# First call hits the database and stores result in cache
products = Product.cached.filter(category="electronics")

# Second call returns from cache instantly
products = Product.cached.filter(category="electronics")

# Saving or deleting invalidates ALL cached queries for this model
Product.objects.create(name="Tablet", price=499, category="electronics")
# ^ Next call to Product.cached.* will hit the database again
```

## What Gets Cached

| Method | Cached |
|--------|--------|
| `filter()` / `all()` / `get()` | ✅ via `_fetch_all()` |
| `first()` / `last()` | ✅ via `_fetch_all()` |
| `count()` | ✅ dedicated override |
| `exists()` | ✅ dedicated override |
| `values()` / `values_list()` | ✅ via `_fetch_all()` |
| `update()` / `delete()` (QuerySet) | ❌ write operations |
| `add()` / `remove()` / `clear()` (M2M) | ✅ via `m2m_changed` |
| `aggregate()` | ❌ not intercepted |

## Automatic Invalidation

`ZooCacheManager` connects to Django's `post_save` and `post_delete` signals automatically.
When any instance of a model is saved or deleted, **all cached queries** for that model are invalidated.

```python
# All these cached results are invalidated when any Product is saved:
Product.cached.all()
Product.cached.filter(category="electronics")
Product.cached.filter(price__lt=100).count()
```

No manual invalidation is needed for standard ORM operations.

## Transaction Support
 
ZooCache is transaction-aware. Invalidation is automatically deferred until the transaction commits successfully using `transaction.on_commit()`.
 
- **Rollback**: If a transaction is rolled back, the cache is **NOT** invalidated.
- **Commit**: Invalidation happens only after the data is safely persisted.
 
```python
from django.db import transaction
 
with transaction.atomic():
    product.price = 200
    product.save()
    # Cache is NOT invalidated yet (pending commit)
    raise ValueError("Rollback!")
 
# Transaction rolled back -> Cache remains valid (no invalidation)
```
 
## Query Optimizations
 
ZooCache supports Django's query optimizations out of the box:
 
### `select_related`
 
Foreign key objects are recursively serialized and cached. When fetching from cache, the related objects are fully reconstructed, so accessing them does **not** trigger a database query.
 
```python
# Fetches Book + Author in 1 query (or 0 if cached)
book = Book.cached.select_related("author").get(pk=1)
print(book.author.name)  # No DB hit, author is loaded from cache
```
 
### `prefetch_related`
 
Prefetching is automatically restored on cache hits. ZooCache detects the prefetch request and efficiently populates related objects on the cached instances.
 
```python
# Fetches Author + Books in 2 queries (or 1 query for books if Author is cached)
author = Author.cached.prefetch_related("books").get(pk=1)
print(author.books.all())  # No N+1 problem, books are prefetched
```
 
## JOIN Dependency Detection

When a query involves a JOIN (e.g., filtering by a related model's field), ZooCache
automatically detects all models involved and registers them as dependencies.

```python
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    score = models.IntegerField()

    objects = models.Manager()
    cached = ZooCacheManager()
```

```python
# This query JOINs Product → deps = ["app.review", "app.product"]
reviews = Review.cached.filter(product__name="Laptop")

# Saving a Product invalidates this query automatically!
product.name = "Updated Laptop"
product.save()  # Review cache with JOIN on Product is cleared

# Also works for ManyToMany relationships:
Book.cached.filter(tags__name="python")  # deps = ["app.book", "app.tag"]
# Adding/removing tags invalidates the query:
book.tags.add(tag)  # Invalidates query


# Simple queries only depend on their own model
Review.cached.filter(score=5)  # deps = ["app.review"] only
# ^ NOT invalidated by Product.save()
```

### How it works

1. ZooCache inspects `query.alias_map` to find all tables involved in JOINs
2. Maps each table back to its Django model via relation traversal
3. Registers all matched model labels as cache dependencies
4. When any of the involved models triggers `post_save` / `post_delete`, the cache is invalidated

## Configuration

### `ZooCacheManager(*, ttl=None, prefix=None)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ttl` | `int` | `None` | Cache TTL in seconds. Falls back to `zoocache.configure(default_ttl=...)` |
| `prefix` | `str` | `None` | Optional prefix for cache keys |

```python
class Product(models.Model):
    # Short-lived cache for frequently changing data
    cached = ZooCacheManager(ttl=60)

class Config(models.Model):
    # Long-lived cache with custom prefix
    cached = ZooCacheManager(ttl=3600, prefix="config")
```

### Cache Key Format

Keys follow this pattern:

```
[prefix:]django:{app_label}.{model_name}:{query_hash}
```

Examples:
```
django:shop.product:a1b2c3d4e5f6g7h8
config:django:shop.config:9i0j1k2l3m4n5o6p
```

### Using with `zoocache.configure()`

The Django adapter uses the same global ZooCache core. Call `configure()` as usual:

```python
from zoocache import configure

configure(
    storage_url="lmdb://./cache_data",
    bus_url="redis://localhost:6379",
    default_ttl=3600,
)
```

All `ZooCacheManager` instances will use this configuration automatically.

## Cache Hit Expectations

The cache hit rate depends on the read/write ratio of each model:

| Model type | Read/Write ratio | Expected hit rate |
|------------|-----------------|-------------------|
| Configuration / Settings | 1000:1 | ~99.9% |
| Product catalog | 100:1 | ~95%+ |
| User profiles | 50:1 | ~90%+ |
| Posts / Comments | 10:1 | ~70-80% |
| Sessions / Logs | 1:1 | Not worth caching |

!!! warning "Invalidation granularity"
    Invalidation is **per model**, not per row. A single `product.save()` invalidates
    *all* cached queries for the `Product` model. Models with very frequent writes
    will see lower hit rates.

## Both Managers Side by Side

The normal `objects` manager is **never affected** by ZooCache:

```python
class Product(models.Model):
    objects = models.Manager()      # Always hits the database
    cached = ZooCacheManager()      # Uses cache

# Use objects for writes and admin operations
Product.objects.create(name="Widget", price=10, category="misc")

# Use cached for read-heavy views
products = Product.cached.filter(category="misc")
```

## Full Example

See [`examples/django_adapter_demo.py`](https://github.com/albertobadia/zoocache/blob/main/examples/django_adapter_demo.py)
for a self-contained, runnable demo covering all features.

## Known Limitations

### Bulk Operations
Django's `update()`, `bulk_create()`, and `bulk_update()` methods **do not send signals**.
Therefore, ZooCache cannot detect these changes, and the cache will remain stale until the TTL expires.

```python
# WARNING: This does NOT invalidate the cache!
Product.objects.filter(category="old").update(active=False)
```

**Workaround**: Manually invalidate the model after bulk operations:
```python
from zoocache.core import _manager
_manager.get_core().invalidate("shop.product")
```

### Annotations
Fields added via `.annotate()` are currently **not cached**. When an object is retrieved from the cache, the annotated fields will be missing.

### Defer / Only
`ZooCache` always caches the **full object**, ignoring `defer()` and `only()`.
Calls to `.defer('field')` will return objects with all fields loaded (from cache).
