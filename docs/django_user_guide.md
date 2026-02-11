# Django User Guide

This guide covers how to use ZooCache with Django effectively.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Advanced Features](#advanced-features)
5. [Configuration](#configuration)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Installation

To use the Django ORM adapter, install ZooCache with the `django` extra:

```bash
pip install zoocache[django]
```

---

## Quick Start

### 1. Add ZooCacheManager to your Models

To enable caching for a model, add `ZooCacheManager` as a manager. It's recommended to keep the default `objects` manager for non-cached queries.

```python
from django.db import models
from zoocache.contrib.django import ZooCacheManager

class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)

    objects = models.Manager()          # Standard manager
    cached = ZooCacheManager(ttl=300)   # ZooCache manager
```

### 2. Querying

Use the `cached` manager exactly like you would use standard Django managers:

```python
# Hits the database and populates the cache
products = Product.cached.filter(category="electronics")

# Subsequent calls with the same filters hit the cache
products = Product.cached.filter(category="electronics")
```

---

## Core Concepts

### Automatic Invalidation

ZooCache automatically invalidates cached results for a model whenever an instance is saved or deleted.

```python
# Cached query
Product.cached.all()

# Saving any instance invalidates ALL cached queries for Product
p = Product.objects.get(id=1)
p.name = "New Name"
p.save() 
```

### Transaction Support

ZooCache is transaction-aware. Invalidation is deferred until the current database transaction is successfully committed.

```python
from django.db import transaction

with transaction.atomic():
    product.save()
    # Cache is still valid here (pending commit)
    
# Cache is invalidated ONLY after this point
```

---

## Advanced Features

### Dependency Detection (JOINs)

When you perform a query that involves JOINs, ZooCache automatically detects the related models and registers them as dependencies.

```python
# This query depends on BOTH Book and Author models
books = Book.cached.filter(author__name="Tolkien")

# Saving an Author will invalidate this Book query!
author.save()
```

### Query Optimizations

ZooCache works seamlessly with `select_related` and `prefetch_related`.

```python
# Related objects are cached alongside the main entity
books = Book.cached.select_related("author").all()

for book in books:
    print(book.author.name)  # No database hit!
```

---

## Configuration

### Manager Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `ttl` | `int` | Override the default TTL for this manager's queries. |
| `prefix` | `str` | Optional namespace prefix for cache keys. |

```python
cached = ZooCacheManager(ttl=60, prefix="fast_cache")
```

### Global Configuration

The preferred way to configure ZooCache in Django is by adding a `ZOOCACHE` dictionary to your `settings.py`. ZooCache will automatically detect these settings.

```python
# settings.py

ZOOCACHE = {
    "storage_url": "redis://localhost:6379",
    "bus_url": "redis://localhost:6379",
    "default_ttl": 3600,
}
```

#### Alternative: Manual Configuration

If you need more control or want to configure ZooCache programmatically, you can still use the `AppConfig.ready()` pattern:

```python
# myapp/apps.py
from django.apps import AppConfig
import zoocache

class MyAppConfig(AppConfig):
    name = 'myapp'

    def ready(self):
        # This will only run if ZOOCACHE is not defined in settings.py
        zoocache.configure(
            storage_url="redis://localhost:6379",
            default_ttl=3600
        )
```

---

## Best Practices

1. **Keep `objects` as Default**: Always keep a standard `models.Manager()` to avoid accidental caching in administrative or write-heavy tasks.
2. **Monitor Model Write Frequency**: Models that are updated frequently (e.g., `Session`, `Log`) will have a low cache hit rate because every save invalidates the whole model's cache.
3. **Use for Read-Heavy Views**: Identify your most expensive read queries and use `.cached` there for the biggest performance gains.

---

## Troubleshooting

### Stale Data after Bulk Operations
Django's `.update()`, `.bulk_create()`, and `.bulk_update()` do **not** trigger signals. Use manual invalidation if needed:

```python
from zoocache.core import _manager
# Invalidate all Product queries
_manager.get_core().invalidate("myapp.Product")
```

### Large Cache Size
If your cache grows too large, ensure you have configured `prune_after` in your global ZooCache configuration.
