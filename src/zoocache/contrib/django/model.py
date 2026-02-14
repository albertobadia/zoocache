from hashlib import sha256
from typing import Optional
from django.apps import apps
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models, transaction
from django.db.models.query import ModelIterable, prefetch_related_objects
from django.db.models.signals import post_save, post_delete, m2m_changed

from zoocache.core import _manager
from .util import model_tag

INTERNAL_CACHE_KEY_RELATED = "_zoo_related"
_json_encoder = DjangoJSONEncoder()


def _serialize_instance(obj, visited):
    if not hasattr(obj, "_meta"):
        return None

    obj_id = (obj.__class__, obj.pk) if obj.pk else id(obj)
    if obj_id in visited:
        return None
    visited.add(obj_id)

    data = {}
    encoder = _json_encoder.default
    for field in obj._meta.concrete_fields:
        val = field.value_from_object(obj)
        try:
            data[field.attname] = encoder(val)
        except TypeError:
            data[field.attname] = val

    if relations := getattr(obj._state, "fields_cache", None):
        rel_payload = {}
        for name, entry in relations.items():
            if not entry:
                continue

            serialized = _model_to_raw(entry, visited=visited)
            if serialized:
                target = entry[0] if isinstance(entry, (list, tuple)) else entry
                rel_payload[name] = {
                    "label": model_tag(target.__class__),
                    "data": serialized,
                    "is_list": isinstance(entry, (list, tuple)),
                }

        if rel_payload:
            data[INTERNAL_CACHE_KEY_RELATED] = rel_payload

    return data


def _model_to_raw(instance, visited=None):
    if visited is None:
        visited = set()

    if isinstance(instance, (list, tuple)):
        return [_serialize_instance(i, visited) for i in instance]
    return _serialize_instance(instance, visited)


def _raw_to_instance(model, data, db="default"):
    if not data:
        return None

    rel_data = data.pop(INTERNAL_CACHE_KEY_RELATED, None)

    concrete_fields = {f.attname: f for f in model._meta.concrete_fields}
    init_kwargs = {
        name: concrete_fields[name].to_python(val)
        for name, val in data.items()
        if name in concrete_fields
    }

    instance = model(**init_kwargs)
    instance._state.adding = False
    instance._state.db = db

    if rel_data:
        instance._state.fields_cache = {}
        for name, info in rel_data.items():
            rel_model = apps.get_model(info["label"])
            raw = info["data"]

            if info.get("is_list"):
                val = [_raw_to_instance(rel_model, d, db=db) for d in raw]
            else:
                val = _raw_to_instance(rel_model, raw, db=db)

            instance._state.fields_cache[name] = val

    return instance


def _make_cache_key(prefix, model, query_str):
    label = model_tag(model)
    digest = sha256(query_str.encode()).hexdigest()[:16]
    base = f"{prefix}:django.model:{label}" if prefix else f"django.model:{label}"
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
    labels = {model_tag(table_map[t]) for t in query_tables if t in table_map}
    labels.add(model_tag(queryset.model))
    return list(labels)


class ZooCacheQuerySet(models.QuerySet):
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
        return _make_cache_key(
            self._zoo_prefix, self.model, self._get_query_fingerprint()
        )

    def _fetch_all(self):
        if self._result_cache is not None:
            return

        key = self._get_cache_key()
        cached = self._core.get(key)

        is_model_iter = self._iterable_class is ModelIterable

        if cached is not None:
            if is_model_iter:
                self._result_cache = [
                    _raw_to_instance(self.model, row, db=self.db) for row in cached
                ]
                if self._prefetch_related_lookups:
                    prefetch_related_objects(
                        self._result_cache, *self._prefetch_related_lookups
                    )
            else:
                self._result_cache = cached
            return

        super()._fetch_all()

        if is_model_iter:
            raw_rows = [_model_to_raw(obj) for obj in self._result_cache]
        else:
            raw_rows = list(self._result_cache)

        self._core.set(key, raw_rows, _get_query_deps(self), ttl=self._zoo_ttl)

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
    label = model_tag(sender)
    transaction.on_commit(lambda: _manager.get_core().invalidate(label))


def _invalidate_m2m(instance, **kwargs):
    def _do_invalidate():
        core = _manager.get_core()
        core.invalidate(model_tag(instance.__class__))
        if model_val := kwargs.get("model"):
            core.invalidate(model_tag(model_val))

    transaction.on_commit(_do_invalidate)


def _auto_configure():
    """Attempt to configure ZooCache from Django settings."""
    if _manager.is_configured():
        return

    from django.conf import settings

    if conf := getattr(settings, "ZOOCACHE", None):
        _manager.configure(**conf)


class ZooCacheManager(models.Manager):
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
