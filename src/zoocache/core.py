import asyncio
import functools
import inspect
from collections.abc import Callable, Iterable
from typing import Any

from zoocache._zoocache import Core, hash_key
from zoocache.context import DepsTracker, get_current_deps
from zoocache.telemetry import TelemetryManager


class CacheManager:
    def __init__(self):
        self.core: Core | None = None
        self.config: dict[str, Any] = {}
        self._op_count: int = 0
        self._flight_signals: dict[str, list[tuple[asyncio.AbstractEventLoop, asyncio.Event]]] = {}
        self._telemetry: TelemetryManager = TelemetryManager()

    @property
    def telemetry(self) -> TelemetryManager:
        return self._telemetry

    def is_configured(self) -> bool:
        return self.core is not None or bool(self.config)

    def configure(self, telemetry: TelemetryManager | None = None, **kwargs) -> None:
        if self.is_configured() and any(self.config.get(k) != v for k, v in kwargs.items()):
            raise RuntimeError("zoocache already initialized with different settings")
        self.config = kwargs
        if telemetry is not None:
            self._telemetry = telemetry

    def get_core(self) -> Core:
        if self.core is None:
            # prune_after is handled by the manager, not the Rust core
            core_args = {k: v for k, v in self.config.items() if k != "prune_after" and v is not None}
            self.core = Core(**core_args)
        return self.core

    def maybe_prune(self) -> None:
        self._op_count += 1
        interval = self.config.get("auto_prune_interval", 1000)
        if interval and self._op_count >= interval:
            self._op_count = 0
            if age := self.config.get("prune_after"):
                core = self.get_core()
                core.request_prune(age)

    def reset(self) -> None:
        self.core = None
        self.config = {}
        self._op_count = 0
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
    auto_prune_interval: int = 1000,
    lru_update_interval: int = 30,
    telemetry: TelemetryManager | None = None,
) -> None:
    _manager.configure(
        storage_url=storage_url,
        bus_url=bus_url,
        prefix=prefix,
        prune_after=prune_after,
        default_ttl=default_ttl,
        read_extend_ttl=read_extend_ttl,
        max_entries=max_entries,
        lmdb_map_size=lmdb_map_size,
        flight_timeout=flight_timeout,
        tti_flush_secs=tti_flush_secs,
        auto_prune_secs=auto_prune_secs,
        auto_prune_interval=auto_prune_interval,
        lru_update_interval=lru_update_interval,
        telemetry=telemetry,
    )


def prune(max_age_secs: int = 3600) -> None:
    _manager.get_core().prune(max_age_secs)


def clear() -> None:
    _manager.get_core().clear()


def invalidate(tag: str) -> None:
    _manager.get_core().invalidate(tag)
    _manager.telemetry.increment("cache_invalidations_total", labels={"tag_prefix": tag})


def version() -> str:
    return _manager.get_core().version()


def _resolve_flight_signals(key: str) -> None:
    signals = _manager._flight_signals.pop(key, [])
    for evt_loop, sig in signals:
        if not evt_loop.is_closed():
            evt_loop.call_soon_threadsafe(sig.set)


def _register_flight_signal(key: str) -> asyncio.Event:
    loop = asyncio.get_running_loop()
    sig = asyncio.Event()
    _manager._flight_signals.setdefault(key, []).append((loop, sig))
    return sig


async def _wait_for_leader(fut: Any) -> Any:
    timeout = _manager.config.get("flight_timeout", 60)
    try:
        return await asyncio.wait_for(asyncio.shield(fut), timeout=timeout)
    except asyncio.TimeoutError:
        _manager.telemetry.increment("singleflight_timeouts_total")
        raise RuntimeError("Thundering herd leader failed") from None


def _generate_key(func: Callable, namespace: str | None, args: tuple, kwargs: dict) -> str:
    obj = (func.__module__, func.__qualname__, args, sorted(kwargs.items()))
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
    extra = (deps(*args, **kwargs) if callable(deps) else deps) if deps else []
    return list(set(base + list(extra)))


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
            _manager.maybe_prune()

            while True:
                with _manager.telemetry.time_operation("cache_get_duration_seconds"):
                    val, is_leader, is_hit, fut = core.get_or_entry_async(key)

                if is_hit:
                    _manager.telemetry.increment("cache_hits_total")
                    return val

                _manager.telemetry.increment("cache_misses_total")
                if is_leader:
                    break

                if fut is not None:
                    with _manager.telemetry.time_operation("singleflight_wait_duration_seconds"):
                        return await _wait_for_leader(fut)

                sig = _register_flight_signal(key)
                try:
                    val, is_leader, is_hit, fut = core.get_or_entry_async(key)
                    if is_hit:
                        return val
                    if is_leader:
                        break
                    if fut is not None:
                        return await _wait_for_leader(fut)
                    await sig.wait()
                finally:
                    _resolve_flight_signals(key)

            leader_fut = asyncio.get_running_loop().create_future()
            try:
                core.register_flight_future(key, leader_fut)
            finally:
                _resolve_flight_signals(key)

            try:
                with DepsTracker():
                    res = await fn(*args, **kwargs)
                    with _manager.telemetry.time_operation("cache_set_duration_seconds"):
                        core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                core.finish_flight(key, False, res)
                if not leader_fut.done():
                    leader_fut.set_result(res)
                return res
            except Exception as e:
                _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
                core.finish_flight(key, True, None)
                if not leader_fut.done():
                    leader_fut.set_exception(e)
                raise

        @functools.wraps(fn)
        def sync_wrapper(*args, **kwargs):
            core, key = _manager.get_core(), _generate_key(fn, namespace, args, kwargs)
            _manager.maybe_prune()

            val, is_leader, is_hit = core.get_or_entry(key)
            if is_hit:
                _manager.telemetry.increment("cache_hits_total")
                return val

            _manager.telemetry.increment("cache_misses_total")
            if not is_leader:
                return fn(*args, **kwargs)  # Bypass to avoid returning None if leader active

            try:
                with DepsTracker():
                    res = fn(*args, **kwargs)
                    with _manager.telemetry.time_operation("cache_set_duration_seconds"):
                        core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                core.finish_flight(key, False, res)
                return res
            except Exception:
                _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
                core.finish_flight(key, True, None)
                raise
            finally:
                _resolve_flight_signals(key)

        return async_wrapper if inspect.iscoroutinefunction(fn) else sync_wrapper

    if func is not None:
        return decorator(func)
    return decorator


def reset() -> None:
    _manager.reset()


def get_cache(key: str) -> Any:
    return _manager.get_core().get(key)


def set_cache(key: str, value: Any, deps: Iterable[str] = (), ttl: int | None = None) -> None:
    _manager.get_core().set(key, value, list(deps), ttl=ttl)
