import asyncio
import functools
import inspect
import threading
import time
import uuid
from collections.abc import Callable, Iterable
from contextlib import nullcontext
from typing import Any

from zoocache._zoocache import Core, hash_key
from zoocache.context import DepsTracker, get_current_deps
from zoocache.telemetry import TelemetryManager


class CacheManager:
    def __init__(self):
        self.node_id = uuid.uuid4().hex[:8]
        self.core: Core | None = None
        self.config: dict[str, Any] = {}
        self._flight_signals: dict[str, list[tuple[asyncio.AbstractEventLoop, asyncio.Future[None]]]] = {}
        self._telemetry: TelemetryManager = TelemetryManager()
        self._last_tti_dropped: int = 0
        self._last_silent_errors: int = 0
        self._last_telemetry_check: float = 0
        self._lock = threading.Lock()

    @property
    def telemetry(self) -> TelemetryManager:
        return self._telemetry

    def is_configured(self) -> bool:
        return self.core is not None or bool(self.config)

    def configure(self, telemetry: TelemetryManager | None = None, **kwargs) -> None:
        with self._lock:
            if self.is_configured() and any(self.config.get(k) != v for k, v in kwargs.items()):
                raise RuntimeError("zoocache already initialized with different settings")
            self.config = kwargs
            if telemetry is not None and telemetry is not self._telemetry:
                self._telemetry.close()
                self._telemetry = telemetry

    def get_core(self) -> Core:
        with self._lock:
            if self.core is None:
                core_args = {k: v for k, v in self.config.items() if k != "prune_after" and v is not None}
                core_args["node_id"] = self.node_id
                self.core = Core(**core_args)
            return self.core

    def check_telemetry(self) -> None:
        now = time.monotonic()
        if now - self._last_telemetry_check < 5.0:
            return

        with self._lock:
            if now - self._last_telemetry_check < 5.0:
                return
            self._last_telemetry_check = now
            if self.core:
                current_dropped = self.core.tti_dropped_messages()
                if current_dropped > self._last_tti_dropped:
                    delta = current_dropped - self._last_tti_dropped
                    self.telemetry.increment("cache_tti_overflows_total", delta)
                    self._last_tti_dropped = current_dropped

                current_silent = self.core.silent_errors()
                if current_silent > self._last_silent_errors:
                    delta = current_silent - self._last_silent_errors
                    self.telemetry.increment("cache_silent_errors_total", delta)
                    self._last_silent_errors = current_silent

    def reset(self) -> None:
        with self._lock:
            self._telemetry.close()
            self.node_id = uuid.uuid4().hex[:8]
            self.core = None
            self.config = {}
            self._flight_signals.clear()
            self._telemetry = TelemetryManager()


_manager = CacheManager()


def configure(
    storage_url: str | None = None,
    bus_url: str | None = None,
    prefix: str | None = None,
    prune_after: int | None = None,
    default_ttl: int | None = None,
    read_extend_ttl: bool = True,
    max_entries: int | None = None,
    lmdb_map_size: int | None = None,
    flight_timeout: int = 60,
    tti_flush_secs: int = 30,
    auto_prune_secs: int | None = None,
    auto_prune_interval: int = 3600,
    lru_update_interval: int = 30,
    channel_capacity: int = 1_000_000,
    batch_size: int = 1000,
    lru_cache_size: int = 10_000,
    telemetry: TelemetryManager | None = None,
) -> None:
    defaults: dict[str, Any] = {
        "storage_url": None,
        "bus_url": None,
        "prefix": None,
        "prune_after": None,
        "default_ttl": None,
        "read_extend_ttl": True,
        "max_entries": None,
        "lmdb_map_size": None,
        "flight_timeout": 60,
        "tti_flush_secs": 30,
        "auto_prune_secs": None,
        "auto_prune_interval": 3600,
        "lru_update_interval": 30,
        "channel_capacity": 1_000_000,
        "batch_size": 1000,
        "lru_cache_size": 10_000,
    }

    raw_config = {
        "storage_url": storage_url,
        "bus_url": bus_url,
        "prefix": prefix,
        "prune_after": prune_after,
        "default_ttl": default_ttl,
        "read_extend_ttl": read_extend_ttl,
        "max_entries": max_entries,
        "lmdb_map_size": lmdb_map_size,
        "flight_timeout": flight_timeout,
        "tti_flush_secs": tti_flush_secs,
        "auto_prune_secs": auto_prune_secs,
        "auto_prune_interval": auto_prune_interval,
        "lru_update_interval": lru_update_interval,
        "channel_capacity": channel_capacity,
        "batch_size": batch_size,
        "lru_cache_size": lru_cache_size,
    }

    if _manager.is_configured() and _manager.config:
        normalized_config = dict(raw_config)
        for key, default_value in defaults.items():
            if normalized_config.get(key) == default_value and key in _manager.config:
                normalized_config[key] = _manager.config[key]
    else:
        normalized_config = raw_config

    if telemetry is None and bus_url and bus_url.startswith("redis://"):
        from zoocache.telemetry.adapters.redis_adapter import RedisTelemetryAdapter

        telemetry = TelemetryManager([RedisTelemetryAdapter(None, flush_interval=1.0)])

    _manager.configure(
        storage_url=normalized_config["storage_url"],
        bus_url=normalized_config["bus_url"],
        prefix=normalized_config["prefix"],
        prune_after=normalized_config["prune_after"],
        default_ttl=normalized_config["default_ttl"],
        read_extend_ttl=normalized_config["read_extend_ttl"],
        max_entries=normalized_config["max_entries"],
        lmdb_map_size=normalized_config["lmdb_map_size"],
        flight_timeout=normalized_config["flight_timeout"],
        tti_flush_secs=normalized_config["tti_flush_secs"],
        auto_prune_secs=normalized_config["auto_prune_secs"],
        auto_prune_interval=normalized_config["auto_prune_interval"],
        lru_update_interval=normalized_config["lru_update_interval"],
        channel_capacity=normalized_config["channel_capacity"],
        batch_size=normalized_config["batch_size"],
        lru_cache_size=normalized_config["lru_cache_size"],
        telemetry=telemetry,
    )

    if telemetry:
        core_instance = _manager.get_core()
        telemetry.bind_core(core_instance)


def prune(max_age_secs: int = 3600) -> None:
    _manager.get_core().prune(max_age_secs)


def clear() -> None:
    _manager.get_core().clear()


async def clear_async() -> None:
    await _manager.get_core().clear_async()


def invalidate(tag: str) -> None:
    _manager.get_core().invalidate(tag)
    if _manager.telemetry.enabled:
        _manager.telemetry.increment("cache_invalidations_total")
        _manager.telemetry.increment("cache_invalidations_total", labels={"tag_prefix": tag})


async def invalidate_async(tag: str) -> None:
    await _manager.get_core().invalidate_async(tag)
    if _manager.telemetry.enabled:
        _manager.telemetry.increment("cache_invalidations_total")
        _manager.telemetry.increment("cache_invalidations_total", labels={"tag_prefix": tag})


def version() -> str:
    return _manager.get_core().version()


def get_tag_version(tag: str) -> int:
    return _manager.get_core().get_tag_version(tag)


def _resolve_flight_signals(key: str, exc: BaseException | None = None) -> None:
    signals = _manager._flight_signals.pop(key, [])
    for evt_loop, fut in signals:
        if not evt_loop.is_closed() and not fut.done():
            if exc:
                evt_loop.call_soon_threadsafe(fut.set_exception, exc)
            else:
                evt_loop.call_soon_threadsafe(fut.set_result, None)


def _generate_key(func: Callable, namespace: str | None, args: tuple, kwargs: dict) -> str:
    kw_items = sorted(kwargs.items()) if kwargs else []
    obj = (func.__module__, func.__qualname__, args, kw_items)
    prefix = f"{namespace}:{func.__name__}" if namespace else func.__name__
    try:
        return hash_key(obj, prefix)
    except TypeError as e:
        raise ValueError(
            f"zoocache failed to serialize arguments for `{func.__name__}`.\n"
            f"Ensure all arguments are standard primitive types (str, int, dict, list, etc.).\n"
            f"If passing complex objects (e.g. Models, Dataclasses), extract their IDs or convert "
            f"them to dicts before passing them to the cached function to ensure a stable cache key.\n"
        ) from e


def _collect_deps(deps: Callable | Iterable[str] | None, args: tuple, kwargs: dict) -> list[str]:
    base = list(get_current_deps() or [])
    extra = deps(*args, **kwargs) if callable(deps) else deps
    if not extra:
        return base
    return list(dict.fromkeys([*base, *list(extra)]))


def _timed(metric_name: str):
    telemetry = _manager.telemetry
    if telemetry.enabled:
        return telemetry.time_operation(metric_name)
    return nullcontext()


def cacheable(
    func: Callable | None = None,
    *,
    namespace: str | None = None,
    deps: Callable | Iterable[str] | None = None,
    ttl: int | None = None,
):
    def decorator(fn: Callable):
        @functools.wraps(fn)
        async def async_wrapper(*args, **kwargs):
            core, key = _manager.get_core(), _generate_key(fn, namespace, args, kwargs)

            with _timed("cache_get_duration_seconds"):
                val, _, is_hit = core.get_or_entry_sync(key)
            if is_hit:
                if _manager.telemetry.enabled:
                    _manager.telemetry.increment("cache_hits_total")
                return val

            with _timed("cache_get_duration_seconds"):
                val, is_leader, is_hit = await core.get_or_entry_async(key)

            if is_hit:
                if _manager.telemetry.enabled:
                    _manager.telemetry.increment("cache_hits_total")
                return val

            if is_leader:
                if _manager.telemetry.enabled:
                    _manager.telemetry.increment("cache_misses_total")

            success = False
            res = None
            exception = None
            try:
                with DepsTracker():
                    res = await fn(*args, **kwargs)
                    with _timed("cache_set_duration_seconds"):
                        await core.set_async(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                success = True
                return res
            except BaseException as e:
                exception = e
                _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
                raise
            finally:
                core.finish_flight(key, not success)
                _resolve_flight_signals(key, exception)

        @functools.wraps(fn)
        def sync_wrapper(*args, **kwargs):
            core, key = _manager.get_core(), _generate_key(fn, namespace, args, kwargs)
            _manager.check_telemetry()

            with _timed("cache_get_duration_seconds"):
                val, is_leader, is_hit = core.get_or_entry(key)

            if is_hit:
                if _manager.telemetry.enabled:
                    _manager.telemetry.increment("cache_hits_total")
                return val

            if _manager.telemetry.enabled:
                _manager.telemetry.increment("cache_misses_total")

            if not is_leader:
                return fn(*args, **kwargs)

            success = False
            res = None
            try:
                with DepsTracker():
                    res = fn(*args, **kwargs)
                    with _timed("cache_set_duration_seconds"):
                        core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                success = True
                return res
            except BaseException:
                _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
                raise
            finally:
                core.finish_flight(key, not success)
                _resolve_flight_signals(key)

        return async_wrapper if inspect.iscoroutinefunction(fn) else sync_wrapper

    if func is not None:
        return decorator(func)
    return decorator


def reset() -> None:
    _manager.reset()


def get_cache(key: str) -> Any:
    return _manager.get_core().get(key)


async def get_cache_async(key: str) -> Any:
    core = _manager.get_core()
    val = core.get_sync(key)
    if val is not None:
        return val
    return await core.get_async(key)


def set_cache(key: str, value: Any, deps: Iterable[str] = (), ttl: int | None = None) -> None:
    _manager.get_core().set(key, value, list(deps), ttl=ttl)


async def set_cache_async(key: str, value: Any, deps: Iterable[str] = (), ttl: int | None = None) -> None:
    await _manager.get_core().set_async(key, value, list(deps), ttl=ttl)
