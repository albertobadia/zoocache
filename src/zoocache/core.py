import functools
import asyncio
import inspect
from typing import Any, Callable, Optional, Dict
from ._zoocache import Core
from .context import DepsTracker, get_current_deps


_core: Optional[Core] = None
_config: Dict[str, Any] = {}
_op_counter: int = 0


def _reset() -> None:
    """Internal use only: reset the global state for testing."""
    global _core, _config, _op_counter
    _core = None
    _config = {}
    _op_counter = 0


def configure(
    storage_url: Optional[str] = None,
    bus_url: Optional[str] = None,
    prefix: Optional[str] = None,
    prune_after: Optional[int] = None,
    default_ttl: Optional[int] = None,
) -> None:
    """
    Configure the global zoocache instance.

    :param storage_url: URL for storage. redis://host:port or lmdb://path
    :param bus_url: URL for invalidation bus. redis://host:port
    :param prefix: Optional prefix for keys and bus channels.
    :param prune_after: Automatically prune Trie nodes unused for this many seconds.
    :param default_ttl: Default security TTL/TTI in seconds for all entries.
    """
    global _core, _config
    if _core is not None:
        raise RuntimeError(
            "zoocache already initialized, call configure() before any cache operation"
        )
    _config = {
        "storage_url": storage_url,
        "bus_url": bus_url,
        "prefix": prefix,
        "prune_after": prune_after,
        "default_ttl": default_ttl,
    }


def _get_core() -> Core:
    global _core
    if _core is None:
        # Filter config for Rust Core.__init__
        core_args = {k: v for k, v in _config.items() if k != "prune_after"}
        _core = Core(**core_args)
    return _core


def _maybe_prune() -> None:
    global _op_counter
    _op_counter += 1
    if _op_counter >= 1000:
        _op_counter = 0
        if age := _config.get("prune_after"):
            prune(age)


def prune(max_age_secs: int = 3600) -> None:
    """Manually trigger pruning of the PrefixTrie."""
    _get_core().prune(max_age_secs)


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
                if (val := _get_core().get(key)) is not None:
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
    from ._zoocache import hash_key

    obj = (func.__module__, func.__qualname__, args, sorted(kwargs.items()))
    prefix = f"{namespace}:{func.__name__}" if namespace else func.__name__
    return hash_key(obj, prefix)


def clear() -> None:
    _get_core().clear()


def _collect_deps(deps: Any, args: tuple, kwargs: dict) -> list[str]:
    base = list(get_current_deps() or [])
    extra = (deps(*args, **kwargs) if callable(deps) else deps) if deps else []
    return list(set(base + list(extra)))


def invalidate(tag: str) -> None:
    _get_core().invalidate(tag)


def cacheable(
    namespace: Optional[str] = None, deps: Any = None, ttl: Optional[int] = None
):
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            key = _generate_key(func, namespace, args, kwargs)
            _maybe_prune()
            if (val := _get_core().get(key)) is not None:
                return val
            return await _async_flight.flight(key, lambda: execute(key, args, kwargs))

        async def execute(key, args, kwargs):
            with DepsTracker():
                res = await func(*args, **kwargs)
                _get_core().set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
            return res

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            key = _generate_key(func, namespace, args, kwargs)
            _maybe_prune()
            val, is_leader = _get_core().get_or_entry(key)
            if not is_leader:
                return val
            try:
                with DepsTracker():
                    res = func(*args, **kwargs)
                    _get_core().set(
                        key, res, _collect_deps(deps, args, kwargs), ttl=ttl
                    )
                _get_core().finish_flight(key, False, res)
                return res
            except Exception:
                _get_core().finish_flight(key, True, None)
                raise

        return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper

    return decorator


def version() -> str:
    """Return the version of the Rust core."""
    return _get_core().version()
