from hashlib import sha256
from typing import Optional

from django.db import models
from django.db.models.signals import post_save, post_delete, m2m_changed

from zoocache.core import _manager


def _model_label(model):
    return f"{model._meta.app_label}.{model._meta.model_name}"


def _model_to_raw(instance):
    data = {}
    for field in instance._meta.concrete_fields:
        value = field.value_from_object(instance)
        if isinstance(value, (int, float, str, bool, type(None), list, dict)):
            data[field.attname] = value
        else:
            data[field.attname] = str(value)
    return data


def _raw_to_instance(model, data):
    instance = model(**data)
    instance._state.adding = False
    instance._state.db = "default"
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
            through = getattr(getattr(field, "remote_field", None), "through", None)
            if through and not through._meta.auto_created:
                _walk(through)
            elif through and through._meta.auto_created:
                table_map[through._meta.db_table] = through

    _walk(model)
    return table_map


def _get_query_deps(queryset):
    table_map = _build_table_map(queryset.model)
    query_tables = {info.table_name for info in queryset.query.alias_map.values()}
    labels = set()
    for table_name in query_tables:
        matched_model = table_map.get(table_name)
        if matched_model:
            labels.add(_model_label(matched_model))
    labels.add(_model_label(queryset.model))
    return list(labels)


class ZooCacheQuerySet(models.QuerySet):
    _zoo_ttl: Optional[int] = None
    _zoo_prefix: Optional[str] = None

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

        core = _manager.get_core()
        key = self._get_cache_key()
        cached = core.get(key)

        if cached is not None:
            self._result_cache = [_raw_to_instance(self.model, row) for row in cached]
            return

        super()._fetch_all()

        raw_rows = [_model_to_raw(obj) for obj in self._result_cache]
        deps = _get_query_deps(self)
        core.set(key, raw_rows, deps, ttl=self._zoo_ttl)

    def count(self):
        core = _manager.get_core()
        fingerprint = f"count:{self._get_query_fingerprint()}"
        key = _make_cache_key(self._zoo_prefix, self.model, fingerprint)
        cached = core.get(key)

        if cached is not None:
            return cached

        result = super().count()
        deps = _get_query_deps(self)
        core.set(key, result, deps, ttl=self._zoo_ttl)
        return result

    def exists(self):
        core = _manager.get_core()
        fingerprint = f"exists:{self._get_query_fingerprint()}"
        key = _make_cache_key(self._zoo_prefix, self.model, fingerprint)
        cached = core.get(key)

        if cached is not None:
            return cached

        result = super().exists()
        deps = _get_query_deps(self)
        core.set(key, result, deps, ttl=self._zoo_ttl)
        return result


def _invalidate_model(sender, **kwargs):
    label = _model_label(sender)
    core = _manager.get_core()
    core.invalidate(label)


def _invalidate_m2m(sender, instance, **kwargs):
    core = _manager.get_core()
    core.invalidate(_model_label(instance.__class__))
    model = kwargs.get("model")
    if model:
        core.invalidate(_model_label(model))


class ZooCacheManager(models.Manager):
    def __init__(self, *, ttl=None, prefix=None):
        super().__init__()
        self._zoo_ttl = ttl
        self._zoo_prefix = prefix

    def get_queryset(self):
        qs = ZooCacheQuerySet(self.model, using=self._db)
        qs._zoo_ttl = self._zoo_ttl
        qs._zoo_prefix = self._zoo_prefix
        return qs

    def contribute_to_class(self, model, name):
        super().contribute_to_class(model, name)
        if not getattr(model, "_zoo_signals_connected", False):
            post_save.connect(_invalidate_model, sender=model, weak=False)
            post_delete.connect(_invalidate_model, sender=model, weak=False)
            for field in model._meta.local_many_to_many:
                through = field.remote_field.through
                m2m_changed.connect(_invalidate_m2m, sender=through, weak=False)
            model._zoo_signals_connected = True
