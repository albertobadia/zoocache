import functools
import asyncio
import inspect
from typing import Any, Callable, Optional, Dict, Union, Iterable
from ._zoocache import Core, hash_key
from .context import DepsTracker, get_current_deps


PRUNE_CHECK_INTERVAL = 1000


class CacheManager:
    def __init__(self):
        self.core: Optional[Core] = None
        self.config: Dict[str, Any] = {}
        self._op_count: int = 0

    def configure(self, **kwargs) -> None:
        if self.core is not None:
            raise RuntimeError("zoocache already initialized")
        self.config = kwargs

    def get_core(self) -> Core:
        if self.core is None:
            core_args = {k: v for k, v in self.config.items() if k != "prune_after"}
            self.core = Core(**core_args)
        return self.core

    def maybe_prune(self) -> None:
        self._op_count += 1
        if self._op_count >= PRUNE_CHECK_INTERVAL:
            self._op_count = 0
            if age := self.config.get("prune_after"):
                core = self.get_core()
                core.request_prune(age)

    def reset(self) -> None:
        self.core = None
        self.config = {}
        self._op_count = 0


_manager = CacheManager()


def configure(
    storage_url: Optional[str] = None,
    bus_url: Optional[str] = None,
    prefix: Optional[str] = None,
    prune_after: Optional[int] = None,
    default_ttl: Optional[int] = None,
    read_extend_ttl: bool = True,
    max_entries: Optional[int] = None,
) -> None:
    _manager.configure(
        storage_url=storage_url,
        bus_url=bus_url,
        prefix=prefix,
        prune_after=prune_after,
        default_ttl=default_ttl,
        read_extend_ttl=read_extend_ttl,
        max_entries=max_entries,
    )


def prune(max_age_secs: int = 3600) -> None:
    _manager.get_core().prune(max_age_secs)


def clear() -> None:
    _manager.get_core().clear()


def invalidate(tag: str) -> None:
    _manager.get_core().invalidate(tag)


def version() -> str:
    return _manager.get_core().version()


def _generate_key(
    func: Callable, namespace: Optional[str], args: tuple, kwargs: dict
) -> str:
    obj = (func.__module__, func.__qualname__, args, sorted(kwargs.items()))
    prefix = f"{namespace}:{func.__name__}" if namespace else func.__name__
    return hash_key(obj, prefix)


def _collect_deps(
    deps: Optional[Union[Callable, Iterable[str]]], args: tuple, kwargs: dict
) -> list[str]:
    base = list(get_current_deps() or [])
    extra = (deps(*args, **kwargs) if callable(deps) else deps) if deps else []
    return list(set(base + list(extra)))


def cacheable(
    namespace: Optional[str] = None,
    deps: Optional[Union[Callable, Iterable[str]]] = None,
    ttl: Optional[int] = None,
):
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            core = _manager.get_core()
            key = _generate_key(func, namespace, args, kwargs)
            _manager.maybe_prune()

            val, is_leader, fut = core.get_or_entry_async(key)
            if val is not None:
                return val

            if is_leader:
                leader_fut = asyncio.get_running_loop().create_future()
                core.register_flight_future(key, leader_fut)
                try:
                    with DepsTracker():
                        res = await func(*args, **kwargs)
                        core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                    core.finish_flight(key, False, res)
                    leader_fut.set_result(res)
                    return res
                except Exception as e:
                    core.finish_flight(key, True, None)
                    leader_fut.set_exception(e)
                    raise

            if fut is not None:
                return await fut

            with DepsTracker():
                res = await func(*args, **kwargs)
                core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
            return res

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            core = _manager.get_core()
            key = _generate_key(func, namespace, args, kwargs)
            _manager.maybe_prune()

            val, is_leader = core.get_or_entry(key)
            if not is_leader:
                return val

            try:
                with DepsTracker():
                    res = func(*args, **kwargs)
                    core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                core.finish_flight(key, False, res)
                return res
            except Exception:
                core.finish_flight(key, True, None)
                raise

        return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper

    return decorator


def _reset() -> None:
    _manager.reset()
