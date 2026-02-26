# Django Integration

ZooCache provides a lightweight, transparent Django ORM adapter that caches QuerySet results and automatically handles invalidation based on model signals.

## Why Use ZooCache with Django?

- ✅ **Transparent**: Just add `.cached` to your queryset, nothing else changes
- ✅ **Auto-Invalidation**: Automatically invalidates on `post_save` and `post_delete`
- ✅ **Transaction-Aware**: Invalidation only happens after successful commits
- ✅ **Deep Optimization**: Supports `select_related`, `prefetch_related`, and complex JOINs
- ✅ **Django Signals**: Seamless integration with Django's signal system

## Installation

```bash
# Using uv (recommended)
uv add "zoocache[django]"

# Using pip
pip install "zoocache[django]"
```

## Quick Start

### Basic Usage

```python
from django.db import models
from zoocache.contrib.django import ZooCacheManager

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    active = models.BooleanField(default=True)
    
    # Replace default objects manager with ZooCacheManager
    objects = ZooCacheManager()

# First call: hits database
products = Product.cached.filter(active=True)

# Second call: returns cached result instantly
products = Product.cached.filter(active=True)
```

### With Related Objects

```python
class Category(models.Model):
    name = models.CharField(max_length=255)
    
    class Meta:
        objects = ZooCacheManager()

class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    class Meta:
        objects = ZooCacheManager()

# This is cached and automatically tracks the category dependency
products = Product.cached.select_related('category').filter(category_id=1)
```

## How It Works

The `ZooCacheManager` wraps Django's QuerySet with caching:

1. **First call**: Executes the query, caches results with dependencies on the model + field values
2. **Subsequent calls**: Returns cached results instantly
3. **On save/delete**: Invalidates cache for affected records

### Automatic Dependencies

ZooCache automatically tracks:

- **Primary key values**: `product:42`
- **Foreign key values**: `category:1`
- **Model identity**: `Product` model

```python
# This creates dependencies like:
# - "Product:123"
# - "Product:category:5" (for foreign keys)
products = Product.cached.filter(id__range=(100, 200))
```

## Configuration

### Per-Model Configuration

```python
class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        objects = ZooCacheManager()
        
    def zoocache_deps(self):
        """Custom dependencies for this instance"""
        return [f"product:{self.pk}", f"store:{self.store_id}"]
```

### Per-Queryset TTL

```python
# Cache with custom TTL (in seconds)
products = Product.cached.filter(active=True).zoocache(ttl=60)
```

## Advanced Usage

### Selective Caching

```python
# Always fresh - don't cache
products = Product.objects.filter(active=True)

# Use cache
products = Product.cached.filter(active=True)

# Bypass cache for this specific query
products = Product.objects.filter(active=True).no_cache()
```

### Complex Queries

ZooCache handles complex Django ORM queries:

```python
# Complex filter
products = Product.cached.filter(
    Q(category__in=[1, 2, 3]) | Q(price__lt=100),
    active=True
).select_related('category').prefetch_related('tags')

# Aggregation
from django.db.models import Count
categories = Category.cached.annotate(product_count=Count('product'))
```

### Raw Queries

```python
# Raw SQL is not cached (bypasses the manager)
products = Product.objects.raw("SELECT * FROM product WHERE active = %s", [True])
```

## Automatic Invalidation

ZooCache integrates with Django signals:

```python
from django.db import models
from zoocache.contrib.django import ZooCacheManager

class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    active = models.BooleanField(default=True)
    
    objects = ZooCacheManager()
    
    class Meta:
        # Automatically register signal handlers
        zoo_cache_signals = True

# When you save a product, cache is automatically invalidated
product = Product.objects.get(id=42)
product.name = "New Name"
product.save()  # Automatically invalidates Product.cached.filter(id=42)
```

### Manual Invalidation

```python
from zoocache import invalidate

# Invalidate specific product
invalidate("Product:42")

# Invalidate all products
invalidate("Product")

# Invalidate products by category
invalidate("Product:category:5")
```

### Custom Invalidation Logic

```python
class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    store = models.ForeignKey('Store', on_delete=models.CASCADE)
    
    objects = ZooCacheManager()
    
    @classmethod
    def zoocache_invalidate_on_save(cls, instance, **kwargs):
        """Custom invalidation logic"""
        invalidate(f"Product:{instance.pk}")
        invalidate(f"Product:category:{instance.category_id}")
        invalidate(f"Product:store:{instance.store_id}")
        invalidate("Product:list")  # Invalidate list views
    
    class Meta:
        zoo_cache_signals = True
```

## Django REST Framework Integration

For Django REST Framework, use the serializer caching:

```python
from rest_framework import serializers
from zoocache.contrib.django import cached_model_serializers

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price']

# Automatic caching of serialized data
serializer = ProductSerializer(instance, cached=True)
```

[→ See Django Serializers Guide](django_serializers.md) for more details.

## Comparison with Other Approaches

| Feature | ZooCache Manager | django-cache-memoize | django-redis |
|---------|-----------------|---------------------|--------------|
| **Invalidation** | Semantic (automatic) | Manual | TTL only |
| **Query tracking** | Automatic | Manual | None |
| **Foreign keys** | ✅ Automatic | ❌ | ❌ |
| **Signals** | ✅ Built-in | ❌ | ❌ |
| **Consistency** | Causal (HLC) | None | Eventual |

## Common Patterns

### List View Caching

```python
# views.py
class ProductListView(ListView):
    model = Product
    
    def get_queryset(self):
        return Product.cached.filter(active=True)
```

### Detail View Caching

```python
# views.py
class ProductDetailView(DetailView):
    model = Product
    
    def get_object(self):
        return Product.cached.get(pk=self.kwargs['pk'])
```

### API View Caching

```python
# views.py
from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer

class ProductList(generics.ListAPIView):
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        return Product.cached.filter(active=True)
```

## Troubleshooting

### Cache Not Invalidating

Make sure `zoo_cache_signals = True` is set in the model's Meta class:

```python
class Product(models.Model):
    ...
    class Meta:
        objects = ZooCacheManager()
        zoo_cache_signals = True  # This enables automatic invalidation
```

### Cache Not Being Used

Check that you're using `.cached` instead of `.objects`:

```python
# Wrong - no caching
Product.objects.filter(active=True)

# Correct - uses cache
Product.cached.filter(active=True)
```

## Next Steps

- [→ Django User Guide](django_user_guide.md) — Comprehensive guide for Django users
- [→ Django Serializers](django_serializers.md) — Automatic caching for DRF serializers
- [→ Configuration](configuration/index.md) — Customize storage, TTL
