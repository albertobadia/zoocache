import asyncio
import functools
import inspect
from collections.abc import Callable, Iterable
from contextlib import nullcontext
from typing import Any

from fastapi import BackgroundTasks, Request, Response
from pydantic import BaseModel

from zoocache.context import DepsTracker
from zoocache.core import (
    _collect_deps,
    _generate_key,
    _manager,
    _resolve_flight_signals,
)


def _prepare_for_cache(res: Any) -> Any:
    return res.model_dump() if isinstance(res, BaseModel) else res


def _extract_hashable_kwargs(kwargs: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in kwargs.items() if not isinstance(v, (Request, Response, BackgroundTasks))}


def _timed(metric_name: str):
    telemetry = _manager.telemetry
    if telemetry.enabled:
        return telemetry.time_operation(metric_name)
    return nullcontext()


def _make_async_wrapper(fn: Callable, namespace: str | None, deps: Callable | Iterable[str] | None, ttl: int | None):
    @functools.wraps(fn)
    async def async_wrapper(*args, **kwargs):
        hashable_kwargs = _extract_hashable_kwargs(kwargs)
        core, key = _manager.get_core(), _generate_key(fn, namespace, args, hashable_kwargs)
        _manager.check_telemetry()

        while True:
            with _timed("cache_get_duration_seconds"):
                val, is_leader, is_hit = await core.get_or_entry_async(key)

            if is_hit:
                _manager.telemetry.increment("cache_hits_total")
                return val

            _manager.telemetry.increment("cache_misses_total")
            if is_leader:
                break

            await asyncio.sleep(0.01)

        success = False
        try:
            with DepsTracker():
                res = await fn(*args, **kwargs)
                to_cache = _prepare_for_cache(res)

                with _timed("cache_set_duration_seconds"):
                    await core.set_async(key, to_cache, _collect_deps(deps, args, kwargs), ttl=ttl)

            success = True
            return res
        except BaseException:
            _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
            raise
        finally:
            core.finish_flight(key, not success)
            _resolve_flight_signals(key)

    return async_wrapper


def _make_sync_wrapper(fn: Callable, namespace: str | None, deps: Callable | Iterable[str] | None, ttl: int | None):
    @functools.wraps(fn)
    def sync_wrapper(*args, **kwargs):
        hashable_kwargs = _extract_hashable_kwargs(kwargs)
        core, key = _manager.get_core(), _generate_key(fn, namespace, args, hashable_kwargs)
        _manager.check_telemetry()

        with _timed("cache_get_duration_seconds"):
            val, is_leader, is_hit = core.get_or_entry(key)

        if is_hit:
            _manager.telemetry.increment("cache_hits_total")
            return val

        _manager.telemetry.increment("cache_misses_total")
        if not is_leader:
            return fn(*args, **kwargs)

        success = False
        try:
            with DepsTracker():
                res = fn(*args, **kwargs)
                to_cache = _prepare_for_cache(res)

                with _timed("cache_set_duration_seconds"):
                    core.set(key, to_cache, _collect_deps(deps, args, kwargs), ttl=ttl)
            success = True
            return res
        except BaseException:
            _manager.telemetry.increment("cache_errors_total", labels={"error_type": "exception"})
            raise
        finally:
            core.finish_flight(key, not success)
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
