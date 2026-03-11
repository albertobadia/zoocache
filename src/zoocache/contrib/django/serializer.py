import functools
import json
from hashlib import sha256
from typing import Any, cast

from zoocache.core import _manager

try:
    from django.db import models, transaction
    from django.db.models.signals import m2m_changed, post_delete, post_save

    from .util import instance_tag, model_tag
except ImportError:
    models = None

    def model_tag(model_or_instance):
        return str(model_or_instance)

    def instance_tag(instance):
        return str(instance)


class BaseCacheableSerializerMixin:
    _zoo_signals_connected: set[type[Any]] = set()
    _zoo_related_models_cache: dict[type[Any], set[Any]] = {}

    def _get_zoo_model(self):
        meta = getattr(self, "Meta", None)
        if meta is not None and hasattr(meta, "model"):
            return meta.model
        return getattr(self, "zoocache_model", None)

    def _get_related_models(self):
        cls = self.__class__
        if cls in self._zoo_related_models_cache:
            return self._zoo_related_models_cache[cls]

        models_found = {base_model} if (base_model := self._get_zoo_model()) else set()

        child = getattr(self, "child", None)
        if child is not None and hasattr(child, "_get_related_models"):
            related_models = child._get_related_models()
            self._zoo_related_models_cache[cls] = related_models
            return related_models

        fields = getattr(self, "fields", {}) or getattr(self, "_declared_fields", {})

        if hasattr(fields, "values"):
            for field in fields.values():
                if hasattr(field, "_get_related_models"):
                    models_found.update(field._get_related_models())
                elif hasattr(field, "child") and hasattr(field.child, "_get_related_models"):
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
            def _do_invalidate():
                core = _manager.get_core()
                if instance and hasattr(instance, "pk"):
                    core.invalidate(instance_tag(instance))
                core.invalidate(model_tag(sender))

            transaction.on_commit(_do_invalidate)

        uid = f"zoocache_serializer_{model_tag(model)}"
        post_save.connect(_invalidate_handler, sender=model, dispatch_uid=uid, weak=False)
        post_delete.connect(_invalidate_handler, sender=model, dispatch_uid=uid, weak=False)

        for field in model._meta.local_many_to_many:
            through = field.remote_field.through
            m2m_changed.connect(
                _invalidate_handler,
                sender=through,
                dispatch_uid=f"{uid}_m2m_{model_tag(through)}",
                weak=False,
            )

    def _setup_caching(self):
        if self.__class__ not in self._zoo_signals_connected:
            for model in self._get_related_models():
                self._connect_signals(model)
            self._zoo_signals_connected.add(self.__class__)


class CacheableSerializerMixin(BaseCacheableSerializerMixin):
    def _serialize_context_value(self, value: Any) -> Any:
        if isinstance(value, (str, int, float, bool, type(None))):
            return value
        if isinstance(value, dict):
            return {
                str(k): self._serialize_context_value(v)
                for k, v in sorted(value.items(), key=lambda item: str(item[0]))
            }
        if isinstance(value, (list, tuple, set)):
            return [self._serialize_context_value(v) for v in value]
        if hasattr(value, "pk"):
            return {"_pk": getattr(value, "pk", None), "_type": value.__class__.__name__}
        return str(value)

    def _get_context_fingerprint(self) -> str:
        context = getattr(self, "context", None)
        if not context:
            return "nocx"

        request = context.get("request") if hasattr(context, "get") else None
        user = getattr(request, "user", None) if request is not None else None

        user_id = getattr(user, "pk", None)
        if callable(user_id):
            user_id = user_id()

        safe_context = {}
        if hasattr(context, "items"):
            for key, value in context.items():
                if key == "request":
                    continue
                safe_context[str(key)] = self._serialize_context_value(value)

        normalized = {
            "keys": sorted(context.keys()) if hasattr(context, "keys") else [],
            "user_id": user_id,
            "is_staff": bool(getattr(user, "is_staff", False)) if user is not None else False,
            "is_authenticated": bool(getattr(user, "is_authenticated", False)) if user is not None else False,
            "lang": getattr(request, "LANGUAGE_CODE", None) if request is not None else None,
            "context_values": safe_context,
        }
        payload = json.dumps(normalized, sort_keys=True, default=str)
        return sha256(payload.encode()).hexdigest()[:16]

    def _get_cache_key(self, instance):
        model = self._get_zoo_model()
        model_label = model_tag(model) if model else "unknown"
        pk = getattr(instance, "pk", id(instance))
        cls = self.__class__
        class_id = f"{cls.__module__}.{cls.__name__}"
        context_fingerprint = self._get_context_fingerprint()
        return f"django.serializer:{class_id}:{model_label}:{pk}:{context_fingerprint}"

    def to_representation(self, instance):
        serializer_super = cast(Any, super())
        core = _manager.get_core()
        model = self._get_zoo_model()

        if not model or not hasattr(instance, "pk"):
            return serializer_super.to_representation(instance)

        self._setup_caching()

        key = self._get_cache_key(instance)
        if (cached := core.get(key)) is not None:
            return cached

        data = serializer_super.to_representation(instance)
        deps = {instance_tag(instance)} | {model_tag(m) for m in self._get_related_models()}
        core.set(key, data, list(deps))
        return data


class CacheableListSerializerMixin(BaseCacheableSerializerMixin):
    def _serialize_context_value(self, value: Any) -> Any:
        if isinstance(value, (str, int, float, bool, type(None))):
            return value
        if isinstance(value, dict):
            return {
                str(k): self._serialize_context_value(v)
                for k, v in sorted(value.items(), key=lambda item: str(item[0]))
            }
        if isinstance(value, (list, tuple, set)):
            return [self._serialize_context_value(v) for v in value]
        if hasattr(value, "pk"):
            return {"_pk": getattr(value, "pk", None), "_type": value.__class__.__name__}
        return str(value)

    def _get_context_fingerprint(self) -> str:
        context = getattr(self, "context", None)
        if not context:
            return "nocx"

        request = context.get("request") if hasattr(context, "get") else None
        user = getattr(request, "user", None) if request is not None else None

        user_id = getattr(user, "pk", None)
        if callable(user_id):
            user_id = user_id()

        safe_context = {}
        if hasattr(context, "items"):
            for key, value in context.items():
                if key == "request":
                    continue
                safe_context[str(key)] = self._serialize_context_value(value)

        normalized = {
            "keys": sorted(context.keys()) if hasattr(context, "keys") else [],
            "user_id": user_id,
            "is_staff": bool(getattr(user, "is_staff", False)) if user is not None else False,
            "is_authenticated": bool(getattr(user, "is_authenticated", False)) if user is not None else False,
            "lang": getattr(request, "LANGUAGE_CODE", None) if request is not None else None,
            "context_values": safe_context,
        }
        payload = json.dumps(normalized, sort_keys=True, default=str)
        return sha256(payload.encode()).hexdigest()[:16]

    def to_representation(self, data):
        serializer_super = cast(Any, super())
        core = _manager.get_core()
        model = self._get_zoo_model()

        if not model or not hasattr(data, "query"):
            return serializer_super.to_representation(data)

        self._setup_caching()

        try:
            compiler = data.query.get_compiler(data.db)
            sql, params = compiler.as_sql()
            fingerprint = sha256(f"{sql}|{params}".encode()).hexdigest()[:16]
            cls = self.__class__
            class_id = f"{cls.__module__}.{cls.__name__}"
            context_fingerprint = self._get_context_fingerprint()
            key = f"django.serializer.list:{class_id}:{model_tag(model)}:{fingerprint}:{context_fingerprint}"
        except Exception:
            return serializer_super.to_representation(data)

        if (cached := core.get(key)) is not None:
            return cached

        result = serializer_super.to_representation(data)
        deps = {model_tag(model)} | {model_tag(m) for m in self._get_related_models()}
        core.set(key, result, list(deps))
        return result


def cacheable_serializer(cls):
    if not issubclass(cls, CacheableSerializerMixin):
        cls = type(cls.__name__, (CacheableSerializerMixin, cls), {})

    if hasattr(cls, "many_init"):
        cls_dynamic = cast(Any, cls)
        orig_many_init = cls_dynamic.many_init

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
                cls_meta = getattr(cls, "Meta", None)
                if cls_meta is not None and hasattr(cls_meta, "model"):
                    if not hasattr(list_serializer, "Meta"):
                        list_serializer.Meta = type("Meta", (), {"model": cls_meta.model})
                    elif not hasattr(list_serializer.Meta, "model"):
                        list_serializer.Meta.model = cls_meta.model
            return list_serializer

        cls_dynamic.many_init = many_init

    return cls
