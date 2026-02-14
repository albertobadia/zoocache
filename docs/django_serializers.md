# Intelligent Serializer Caching

ZooCache provides a powerful way to cache the output of your serializers (like Django REST Framework's `ModelSerializer`) with automatic invalidation.

## Why use Serializer Caching?

Caching the output of a serializer is often more efficient than caching the database query itself because:
1.  **Computation is expensive**: Transforming a model instance into a JSON dictionary (serialization) can be CPU-intensive for complex objects.
2.  **Nested Data**: You can cache a whole tree of serialized data in a single key.
3.  **Consistency**: ZooCache automatically invalidates the cached JSON whenever the underlying model is saved.

## Usage

### Simple ModelSerializer

Just add the `@cacheable_serializer` decorator to your class.

```python
from rest_framework import serializers
from zoocache.contrib.django import cacheable_serializer

@cacheable_serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'bio']
```

### Deep Introspection & Relations

One of the most powerful features of `@cacheable_serializer` is its ability to scan your serializer fields and nested serializers to detect all involved models.

```python
@cacheable_serializer
class AuthorSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True) # Nested

    class Meta:
        model = Author
```

When you decorate `AuthorSerializer`:
1.  ZooCache detects it uses `Author` and `Book` models.
2.  It automatically connects signals to **both** models.
3.  If you save a `Book`, ZooCache knows it might affect `AuthorSerializer` and invalidates the corresponding entries.

## How it works (Internals)

1.  **Cache Key**: Generated from class name, model label, and instance PK (Prefix: `django.serializer:`).
2.  **Dependencies**: Entries depend on the instance tag (`app.model:pk`) and all models detected during introspection.
3.  **Auto-Invalidation**: Connected via Django signals (`post_save`, `post_delete`, `m2m_changed`).
4.  **Zero-SQL for Lists**: Querysets with `many=True` cache the complete result set, bypassing SQL execution on hits.

## Performance Tip

For maximum performance, ensure you call `.data` inside a context where ZooCache is configured.

```python
# First call (Cache MISS)
data = UserSerializer(user).data

# Subsequent calls (Cache HIT)
data = UserSerializer(user).data
```

## Generic Serializers

If you are not using DRF but a custom class, you can still use the mixin as long as your class follows a similar pattern or defines `zoocache_model`.

```python
from zoocache.contrib.django import CacheableSerializerMixin, cacheable_serializer, ZooCacheManager

class MyCustomSerializer(CacheableSerializerMixin):
    zoocache_model = MyModel  # Tell ZooCache which model to watch
    
    def to_representation(self, instance):
        return {"foo": "bar"}
```

## Auditoría y Mejoras Técnicas Finales

Se han aplicado las siguientes mejoras tras una revisión técnica profunda:

- **Corrección Bug M2M**: Las relaciones Many-to-Many ahora invalidan correctamente la caché del serializador al conectarse directamente al modelo intermedio (*through model*).
- **Seguridad de Claves**: Se ha implementado un sistema de claves basado en `module.ClassName` para evitar colisiones entre serializadores con el mismo nombre en distintas apps.
- **Optimización de Rendimiento**: La introspección de modelos relacionados ahora se cachea a nivel de clase tras el primer uso, eliminando sobrecostes computacionales en cada petición.
- **Robustez en Listas**: Mejorado el manejo de errores en `ListSerializer` para degradar graciosamente en caso de consultas SQL complejas no cacheables.

### Verificación Final
- **Tests Totales**: 87 PASSED.
- **Regresión M2M**: Verificada específicamente en `tests/test_serializer_m2m.py`.
