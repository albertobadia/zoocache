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
    read_extend_ttl: bool = True,
    max_entries: Optional[int] = None,
) -> None:
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
        "read_extend_ttl": read_extend_ttl,
        "max_entries": max_entries,
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

            val, is_leader, fut = _get_core().get_or_entry_async(key)
            if val is not None:
                return val

            if is_leader:
                leader_fut = asyncio.get_running_loop().create_future()
                _get_core().register_flight_future(key, leader_fut)
                try:
                    res = await execute(key, args, kwargs)
                    _get_core().finish_flight(key, False, res)
                    leader_fut.set_result(res)
                    return res
                except Exception as e:
                    _get_core().finish_flight(key, True, None)
                    leader_fut.set_exception(e)
                    raise

            if fut is not None:
                return await fut

            # Fallback if flight was already finished before we could wait
            return await execute(key, args, kwargs)

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
