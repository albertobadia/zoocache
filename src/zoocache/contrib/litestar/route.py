import asyncio
import functools
import inspect
from collections.abc import Callable, Iterable
from typing import Any

import msgspec
from litestar.connection import ASGIConnection
from litestar.datastructures import State

from zoocache.context import DepsTracker
from zoocache.core import (
    _collect_deps,
    _generate_key,
    _manager,
    _register_flight_signal,
    _resolve_flight_signals,
    _wait_for_leader,
)


def _prepare_for_cache(res: Any) -> Any:
    if isinstance(res, msgspec.Struct):
        return msgspec.to_builtins(res)
    if hasattr(res, "model_dump"):
        return res.model_dump()
    return res


def _extract_hashable_kwargs(kwargs: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in kwargs.items() if not isinstance(v, (ASGIConnection, State))}


def _make_async_wrapper(fn: Callable, namespace: str | None, deps: Callable | Iterable[str] | None, ttl: int | None):
    @functools.wraps(fn)
    async def async_wrapper(*args, **kwargs):
        hashable_kwargs = _extract_hashable_kwargs(kwargs)
        core, key = _manager.get_core(), _generate_key(fn, namespace, args, hashable_kwargs)
        _manager.check_telemetry()

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
            except BaseException:
                raise

        leader_fut = asyncio.get_running_loop().create_future()
        core.register_flight_future(key, leader_fut)

        success = False
        to_cache = None
        try:
            with DepsTracker():
                res = await fn(*args, **kwargs)
                to_cache = _prepare_for_cache(res)

                with _manager.telemetry.time_operation("cache_set_duration_seconds"):
                    core.set(key, to_cache, _collect_deps(deps, args, kwargs), ttl=ttl)

            success = True
            if not leader_fut.done():
                leader_fut.set_result(to_cache)
            return res
        except BaseException as e:
            _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
            if not leader_fut.done():
                leader_fut.set_exception(e)
            raise
        finally:
            core.finish_flight(key, not success, to_cache if success else None)
            _resolve_flight_signals(key)

    return async_wrapper


def _make_sync_wrapper(fn: Callable, namespace: str | None, deps: Callable | Iterable[str] | None, ttl: int | None):
    @functools.wraps(fn)
    def sync_wrapper(*args, **kwargs):
        hashable_kwargs = _extract_hashable_kwargs(kwargs)
        core, key = _manager.get_core(), _generate_key(fn, namespace, args, hashable_kwargs)
        _manager.check_telemetry()

        val, is_leader, is_hit = core.get_or_entry(key)
        if is_hit:
            _manager.telemetry.increment("cache_hits_total")
            return val

        _manager.telemetry.increment("cache_misses_total")
        if not is_leader:
            return fn(*args, **kwargs)

        success = False
        res = None
        to_cache = None
        try:
            with DepsTracker():
                res = fn(*args, **kwargs)
                to_cache = _prepare_for_cache(res)

                with _manager.telemetry.time_operation("cache_set_duration_seconds"):
                    core.set(key, to_cache, _collect_deps(deps, args, kwargs), ttl=ttl)
            success = True
            return res
        except BaseException:
            _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
            raise
        finally:
            core.finish_flight(key, not success, to_cache if success else None)
            _resolve_flight_signals(key)

    return sync_wrapper


def cache_endpoint(
    func: Callable | None = None,
    *,
    namespace: str | None = None,
    deps: Callable | Iterable[str] | None = None,
    ttl: int | None = None,
):
    def decorator(fn: Callable):
        if inspect.iscoroutinefunction(fn):
            return _make_async_wrapper(fn, namespace, deps, ttl)
        return _make_sync_wrapper(fn, namespace, deps, ttl)

    if func is not None:
        return decorator(func)
    return decorator
