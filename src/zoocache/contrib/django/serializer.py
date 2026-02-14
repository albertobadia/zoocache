import functools
from hashlib import sha256
from zoocache.core import _manager

try:
    from django.db import models
    from django.db.models.signals import post_save, post_delete, m2m_changed
    from .util import model_tag, instance_tag
except ImportError:
    models = None

    def model_tag(x):
        return str(x)

    def instance_tag(x):
        return str(x)


class BaseCacheableSerializerMixin:
    """Shared logic for single and list serializers."""

    _zoo_signals_connected = set()
    _zoo_related_models_cache = {}

    def _get_zoo_model(self):
        """Introspect model from Meta or zoocache_model attribute."""
        if hasattr(self, "Meta") and hasattr(self.Meta, "model"):
            return self.Meta.model
        return getattr(self, "zoocache_model", None)

    def _get_related_models(self):
        cls = self.__class__
        if cls in self._zoo_related_models_cache:
            return self._zoo_related_models_cache[cls]

        models_found = {base_model} if (base_model := self._get_zoo_model()) else set()

        if hasattr(self, "child"):
            res = self.child._get_related_models()
            self._zoo_related_models_cache[cls] = res
            return res

        fields = getattr(self, "fields", {}) or getattr(self, "_declared_fields", {})

        if hasattr(fields, "values"):
            for field in fields.values():
                if hasattr(field, "_get_related_models"):
                    models_found.update(field._get_related_models())
                elif hasattr(field, "child") and hasattr(
                    field.child, "_get_related_models"
                ):
                    models_found.update(field.child._get_related_models())

                queryset = getattr(field, "queryset", None)
                if queryset is not None and hasattr(queryset, "model"):
                    models_found.add(queryset.model)

                if rel_model := getattr(field, "model", None):
                    models_found.add(rel_model)

        self._zoo_related_models_cache[cls] = models_found
        return models_found

    def _connect_signals(self, model):
        if not models:
            return

        def _invalidate_handler(sender, instance=None, **kwargs):
            core = _manager.get_core()
            if instance and hasattr(instance, "pk"):
                core.invalidate(instance_tag(instance))
            core.invalidate(model_tag(sender))

        uid = f"zoocache_serializer_{model_tag(model)}"
        post_save.connect(
            _invalidate_handler, sender=model, dispatch_uid=uid, weak=False
        )
        post_delete.connect(
            _invalidate_handler, sender=model, dispatch_uid=uid, weak=False
        )

        # M2M signals must be connected to the through model
        for field in model._meta.local_many_to_many:
            through = field.remote_field.through
            m2m_changed.connect(
                _invalidate_handler,
                sender=through,
                dispatch_uid=f"{uid}_m2m_{model_tag(through)}",
                weak=False,
            )

    def _setup_caching(self):
        """One-time setup for this serializer class."""
        if self.__class__ not in self._zoo_signals_connected:
            for model in self._get_related_models():
                self._connect_signals(model)
            self._zoo_signals_connected.add(self.__class__)


class CacheableSerializerMixin(BaseCacheableSerializerMixin):
    """
    Mixin to add automatic caching to serializers.
    Designed to be framework-agnostic but compatible with DRF.
    """

    def _get_cache_key(self, instance):
        model = self._get_zoo_model()
        model_label = model_tag(model) if model else "unknown"
        pk = getattr(instance, "pk", id(instance))
        # Use full class path to avoid collisions
        cls = self.__class__
        class_id = f"{cls.__module__}.{cls.__name__}"
        return f"django.serializer:{class_id}:{model_label}:{pk}"

    def to_representation(self, instance):
        core = _manager.get_core()
        model = self._get_zoo_model()

        if not model or not hasattr(instance, "pk"):
            return super().to_representation(instance)

        self._setup_caching()

        key = self._get_cache_key(instance)
        if (cached := core.get(key)) is not None:
            return cached

        data = super().to_representation(instance)
        deps = {instance_tag(instance)} | {model_tag(m) for m in self._get_related_models()}
        core.set(key, data, list(deps))
        return data


class CacheableListSerializerMixin(BaseCacheableSerializerMixin):
    """Specialized mixin for ListSerializers to avoid redundant DB queries."""

    def to_representation(self, data):
        core = _manager.get_core()
        model = self._get_zoo_model()

        if not model or not hasattr(data, "query"):
            return super().to_representation(data)

        self._setup_caching()

        try:
            compiler = data.query.get_compiler(data.db)
            sql, params = compiler.as_sql()
            fingerprint = sha256(f"{sql}|{params}".encode()).hexdigest()[:16]
            cls = self.__class__
            class_id = f"{cls.__module__}.{cls.__name__}"
            key = f"django.serializer.list:{class_id}:{model_tag(model)}:{fingerprint}"
        except Exception:
            # Fallback to standard representation if query fails (e.g. empty queryset or complex query)
            return super().to_representation(data)

        if (cached := core.get(key)) is not None:
            return cached

        result = super().to_representation(data)
        deps = {model_tag(model)} | {model_tag(m) for m in self._get_related_models()}
        core.set(key, result, list(deps))
        return result


def cacheable_serializer(cls):
    """Decorator to make a serializer class cacheable."""
    if not issubclass(cls, CacheableSerializerMixin):
        cls = type(cls.__name__, (CacheableSerializerMixin, cls), {})

    if hasattr(cls, "many_init"):
        orig_many_init = cls.many_init

        @functools.wraps(orig_many_init)
        def many_init(*args, **kwargs):
            list_serializer = orig_many_init(*args, **kwargs)
            if not isinstance(list_serializer, CacheableListSerializerMixin):
                list_serializer.__class__ = type(
                    f"Cacheable{list_serializer.__class__.__name__}",
                    (CacheableListSerializerMixin, list_serializer.__class__),
                    {},
                )
                list_serializer.zoocache_model = getattr(cls, "zoocache_model", None)
                if hasattr(cls, "Meta") and hasattr(cls.Meta, "model"):
                    if not hasattr(list_serializer, "Meta"):
                        list_serializer.Meta = type(
                            "Meta", (), {"model": cls.Meta.model}
                        )
                    elif not hasattr(list_serializer.Meta, "model"):
                        list_serializer.Meta.model = cls.Meta.model
            return list_serializer

        cls.many_init = many_init

    return cls
