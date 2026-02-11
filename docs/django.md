# Django Integration

ZooCache provides a lightweight, transparent Django ORM adapter that caches QuerySet results and automatically handles invalidation based on model signals.

## Benefits

- **Transparent Caching**: Works directly with your standard Django models.
- **Auto-Invalidation**: Automatically invalidates cache on `post_save` and `post_delete`.
- **Transaction-Aware**: Invalidation only happens after successful commits.
- **Deep Optimization**: Supports `select_related`, `prefetch_related`, and complex JOIN detection.

## Quick Example

```python
from zoocache.contrib.django import ZooCacheManager

class Product(models.Model):
    # ... fields ...
    cached = ZooCacheManager()

# First call hits DB, second call hits cache
products = Product.cached.filter(active=True)
```

## Ready to dive in?

Read the full **[Django User Guide](django_user_guide.md)** for detailed installation instructions, core concepts, and best practices.
