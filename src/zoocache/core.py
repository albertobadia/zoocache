import functools
import asyncio
import inspect
from typing import Any, Callable, Optional, Dict
from ._zoocache import Core
from .context import DepsTracker, get_current_deps


_core = Core()


class AsyncSingleFlight:
    def __init__(self):
        self._futures: Dict[str, asyncio.Future] = {}
        self._lock = asyncio.Lock()

    async def flight(self, key: str, coro_func: Callable):
        async with self._lock:
            if key in self._futures:
                fut = self._futures[key]
                is_leader = False
            else:
                # Double check cache inside lock to avoid post-flight race
                if (val := _core.get(key)) is not None:
                    return val
                fut = self._futures[key] = asyncio.get_running_loop().create_future()
                is_leader = True

        if is_leader:
            try:
                res = await coro_func()
                self._finish(key, res)
                return res
            except Exception as e:
                self._finish(key, None, exc=e)
                raise
        return await fut

    def _finish(self, key: str, result: Any, exc: Optional[Exception] = None):
        fut = self._futures.pop(key, None)
        if fut and not fut.done():
            fut.set_exception(exc) if exc else fut.set_result(result)


_async_flight = AsyncSingleFlight()


def _generate_key(
    func: Callable, namespace: Optional[str], args: tuple, kwargs: dict
) -> str:
    import pickle
    from ._zoocache import hash_key

    data = pickle.dumps(
        (func.__module__, func.__qualname__, args, sorted(kwargs.items()))
    )
    prefix = f"{namespace}:{func.__name__}" if namespace else func.__name__
    return hash_key(data, prefix)


def clear() -> None:
    _core.clear()


def _collect_deps(deps: Any, args: tuple, kwargs: dict) -> list[str]:
    base = list(get_current_deps() or [])
    extra = (deps(*args, **kwargs) if callable(deps) else deps) if deps else []
    return list(set(base + list(extra)))


def invalidate(tag: str) -> None:
    _core.invalidate(tag)


def cacheable(namespace: Optional[str] = None, deps: Any = None):
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            key = _generate_key(func, namespace, args, kwargs)
            if (val := _core.get(key)) is not None:
                return val
            return await _async_flight.flight(key, lambda: execute(key, args, kwargs))

        async def execute(key, args, kwargs):
            with DepsTracker():
                res = await func(*args, **kwargs)
                _core.set(key, res, _collect_deps(deps, args, kwargs))
            return res

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            key = _generate_key(func, namespace, args, kwargs)
            val, is_leader = _core.get_or_entry(key)
            if not is_leader:
                return val
            try:
                with DepsTracker():
                    res = func(*args, **kwargs)
                    _core.set(key, res, _collect_deps(deps, args, kwargs))
                _core.finish_flight(key, False, res)
                return res
            except Exception:
                _core.finish_flight(key, True, None)
                raise

        return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper

    return decorator


def version() -> str:
    """Return the version of the Rust core."""
    return _core.version()
