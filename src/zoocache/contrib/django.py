from hashlib import sha256
from typing import Optional
from django.apps import apps
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models, transaction
from django.db.models import prefetch_related_objects
from django.db.models.signals import post_save, post_delete, m2m_changed

from zoocache.core import _manager

INTERNAL_CACHE_KEY_RELATED = "_zoo_related"


def _model_label(model):
    return f"{model._meta.app_label}.{model._meta.model_name}"


_json_encoder = DjangoJSONEncoder()


def _model_to_raw(instance):
    data = {}
    for field in instance._meta.concrete_fields:
        value = field.value_from_object(instance)
        # Use Django's JSON encoder logic for serializing non-primitive types
        try:
            prepared_value = _json_encoder.default(value)
        except TypeError:
            prepared_value = value
        data[field.attname] = prepared_value

    if hasattr(instance._state, "fields_cache"):
        related_data = {}
        for field_name, related_inst in instance._state.fields_cache.items():
            if related_inst:
                related_data[field_name] = {
                    "model_label": _model_label(related_inst.__class__),
                    "data": _model_to_raw(related_inst),
                }
        if related_data:
            data[INTERNAL_CACHE_KEY_RELATED] = related_data
    return data


def _raw_to_instance(model, data, db="default"):
    related_data = data.pop(INTERNAL_CACHE_KEY_RELATED, None)

    # Convert primitive values back to Python objects using field.to_python
    init_kwargs = {}
    for field in model._meta.concrete_fields:
        if field.attname in data:
            init_kwargs[field.attname] = field.to_python(data[field.attname])

    instance = model(**init_kwargs)

    if related_data:
        for field_name, rel_info in related_data.items():
            rel_model = apps.get_model(rel_info["model_label"])
            rel_instance = _raw_to_instance(rel_model, rel_info["data"], db=db)
            instance._state.fields_cache[field_name] = rel_instance

    instance._state.adding = False
    instance._state.db = db
    return instance


def _make_cache_key(prefix, model, query_str):
    label = _model_label(model)
    digest = sha256(query_str.encode()).hexdigest()[:16]
    base = f"{prefix}:django:{label}" if prefix else f"django:{label}"
    return f"{base}:{digest}"


def _build_table_map(model):
    table_map = {}

    def _walk(m):
        if m._meta.db_table in table_map:
            return
        table_map[m._meta.db_table] = m
        for field in m._meta.get_fields():
            related = getattr(field, "related_model", None)
            if related and related is not m:
                _walk(related)

            remote = getattr(field, "remote_field", None)
            through = getattr(remote, "through", None)
            if through:
                if through._meta.auto_created:
                    table_map[through._meta.db_table] = through
                else:
                    _walk(through)

    _walk(model)
    return table_map


def _get_query_deps(queryset):
    table_map = _build_table_map(queryset.model)
    query_tables = {info.table_name for info in queryset.query.alias_map.values()}
    labels = {_model_label(table_map[t]) for t in query_tables if t in table_map}
    labels.add(_model_label(queryset.model))
    return list(labels)


class ZooCacheQuerySet(models.QuerySet):
    """QuerySet that transparently caches results and validates dependencies."""

    _zoo_ttl: Optional[int] = None
    _zoo_prefix: Optional[str] = None

    @property
    def _core(self):
        return _manager.get_core()

    def _clone(self):
        qs = super()._clone()
        qs._zoo_ttl = self._zoo_ttl
        qs._zoo_prefix = self._zoo_prefix
        return qs

    def _get_query_fingerprint(self):
        compiler = self.query.get_compiler(using=self.db)
        sql, params = compiler.as_sql()
        return f"{sql}|{params}"

    def _get_cache_key(self):
        fingerprint = self._get_query_fingerprint()
        return _make_cache_key(self._zoo_prefix, self.model, fingerprint)

    def _fetch_all(self):
        if self._result_cache is not None:
            return

        key = self._get_cache_key()
        cached = self._core.get(key)

        if cached is not None:
            self._result_cache = [
                _raw_to_instance(self.model, row, db=self.db) for row in cached
            ]
            if self._prefetch_related_lookups:
                prefetch_related_objects(
                    self._result_cache, *self._prefetch_related_lookups
                )
            return

        super()._fetch_all()

        raw_rows = [_model_to_raw(obj) for obj in self._result_cache]
        deps = _get_query_deps(self)
        self._core.set(key, raw_rows, deps, ttl=self._zoo_ttl)

    def count(self):
        fingerprint = f"count:{self._get_query_fingerprint()}"
        key = _make_cache_key(self._zoo_prefix, self.model, fingerprint)
        cached = self._core.get(key)

        if cached is not None:
            return cached

        result = super().count()
        deps = _get_query_deps(self)
        self._core.set(key, result, deps, ttl=self._zoo_ttl)
        return result

    def exists(self):
        fingerprint = f"exists:{self._get_query_fingerprint()}"
        key = _make_cache_key(self._zoo_prefix, self.model, fingerprint)
        cached = self._core.get(key)

        if cached is not None:
            return cached

        result = super().exists()
        deps = _get_query_deps(self)
        self._core.set(key, result, deps, ttl=self._zoo_ttl)
        return result


def _invalidate_model(sender, **kwargs):
    label = _model_label(sender)
    transaction.on_commit(lambda: _manager.get_core().invalidate(label))


def _invalidate_m2m(instance, **kwargs):
    def _do_invalidate():
        core = _manager.get_core()
        core.invalidate(_model_label(instance.__class__))
        if model_val := kwargs.get("model"):
            core.invalidate(_model_label(model_val))

    transaction.on_commit(_do_invalidate)


def _auto_configure():
    """Attempt to configure ZooCache from Django settings."""
    if _manager.is_configured():
        return

    from django.conf import settings

    if conf := getattr(settings, "ZOOCACHE", None):
        _manager.configure(**conf)


class ZooCacheManager(models.Manager):
    """Custom manager that enables transparent caching for Django models."""

    def __init__(self, *, ttl=None, prefix=None, ensure_objects_manager=True):
        super().__init__()
        self._zoo_ttl = ttl
        self._zoo_prefix = prefix
        self._ensure_objects_manager = ensure_objects_manager

    def get_queryset(self):
        qs = ZooCacheQuerySet(self.model, using=self._db)
        qs._zoo_ttl = self._zoo_ttl
        qs._zoo_prefix = self._zoo_prefix
        return qs

    def contribute_to_class(self, model, name):
        super().contribute_to_class(model, name)
        _auto_configure()

        if self._ensure_objects_manager and not hasattr(model, "objects"):
            models.Manager().contribute_to_class(model, "objects")

        if not getattr(model, "_zoo_signals_connected", False):
            post_save.connect(_invalidate_model, sender=model, weak=False)
            post_delete.connect(_invalidate_model, sender=model, weak=False)
            for field in model._meta.local_many_to_many:
                through = field.remote_field.through
                m2m_changed.connect(_invalidate_m2m, sender=through, weak=False)
            model._zoo_signals_connected = True
