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
        self._flight_signals: Dict[
            str, list[tuple[asyncio.AbstractEventLoop, asyncio.Event]]
        ] = {}

    def is_configured(self) -> bool:
        return self.core is not None or bool(self.config)

    def configure(self, **kwargs) -> None:
        if self.is_configured() and any(
            self.config.get(k) != v for k, v in kwargs.items()
        ):
            raise RuntimeError("zoocache already initialized with different settings")
        self.config = kwargs

    def get_core(self) -> Core:
        if self.core is None:
            exclude = ("prune_after", "flight_timeout", "tti_flush_secs")
            core_args = {k: v for k, v in self.config.items() if k not in exclude}

            if timeout := self.config.get("flight_timeout"):
                core_args["flight_timeout"] = timeout
            if tti_flush := self.config.get("tti_flush_secs"):
                core_args["tti_flush_secs"] = tti_flush
            if auto_prune_secs := self.config.get("auto_prune_secs"):
                core_args["auto_prune_secs"] = auto_prune_secs
            if auto_prune_interval := self.config.get("auto_prune_interval"):
                core_args["auto_prune_interval"] = auto_prune_interval

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
        self._flight_signals.clear()


_manager = CacheManager()


def configure(
    storage_url: Optional[str] = None,
    bus_url: Optional[str] = None,
    prefix: Optional[str] = None,
    prune_after: Optional[int] = None,
    default_ttl: Optional[int] = None,
    read_extend_ttl: bool = True,
    max_entries: Optional[int] = None,
    lmdb_map_size: Optional[int] = None,
    flight_timeout: int = 60,
    tti_flush_secs: int = 30,
    auto_prune_secs: Optional[int] = None,
    auto_prune_interval: Optional[int] = None,
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
    )


def prune(max_age_secs: int = 3600) -> None:
    _manager.get_core().prune(max_age_secs)


def clear() -> None:
    _manager.get_core().clear()


def invalidate(tag: str) -> None:
    _manager.get_core().invalidate(tag)


def version() -> str:
    return _manager.get_core().version()


def _resolve_flight_signals(key: str) -> None:
    signals = _manager._flight_signals.pop(key, [])
    for evt_loop, sig in signals:
        if not evt_loop.is_closed():
            evt_loop.call_soon_threadsafe(sig.set)


def _generate_key(
    func: Callable, namespace: Optional[str], args: tuple, kwargs: dict
) -> str:
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


def _collect_deps(
    deps: Optional[Union[Callable, Iterable[str]]], args: tuple, kwargs: dict
) -> list[str]:
    base = list(get_current_deps() or [])
    extra = (deps(*args, **kwargs) if callable(deps) else deps) if deps else []
    return list(set(base + list(extra)))


def cacheable(
    func: Optional[Callable] = None,
    *,
    namespace: Optional[str] = None,
    deps: Optional[Union[Callable, Iterable[str]]] = None,
    ttl: Optional[int] = None,
):
    def decorator(fn: Callable):
        @functools.wraps(fn)
        async def async_wrapper(*args, **kwargs):
            core = _manager.get_core()
            key = _generate_key(fn, namespace, args, kwargs)
            _manager.maybe_prune()

            while True:
                val, is_leader, fut = core.get_or_entry_async(key)
                if val is not None:
                    return val

                if is_leader:
                    break

                if fut is not None:
                    timeout = _manager.config.get("flight_timeout", 60)
                    try:
                        return await asyncio.wait_for(
                            asyncio.shield(fut), timeout=timeout
                        )
                    except asyncio.TimeoutError:
                        raise RuntimeError("Thundering herd leader failed") from None

                loop = asyncio.get_running_loop()
                sig = asyncio.Event()
                _manager._flight_signals.setdefault(key, []).append((loop, sig))
                await sig.wait()

            try:
                leader_fut = asyncio.get_running_loop().create_future()
                core.register_flight_future(key, leader_fut)
            finally:
                _resolve_flight_signals(key)
            try:
                with DepsTracker():
                    res = await fn(*args, **kwargs)
                    core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                core.finish_flight(key, False, res)
                if not leader_fut.done():
                    leader_fut.set_result(res)
                return res
            except Exception as e:
                core.finish_flight(key, True, None)
                if not leader_fut.done():
                    leader_fut.set_exception(e)
                raise

        @functools.wraps(fn)
        def sync_wrapper(*args, **kwargs):
            core = _manager.get_core()
            key = _generate_key(fn, namespace, args, kwargs)
            _manager.maybe_prune()

            val, is_leader = core.get_or_entry(key)
            if not is_leader:
                return val

            try:
                with DepsTracker():
                    res = fn(*args, **kwargs)
                    core.set(key, res, _collect_deps(deps, args, kwargs), ttl=ttl)
                core.finish_flight(key, False, res)
                _resolve_flight_signals(key)
                return res
            except Exception:
                core.finish_flight(key, True, None)
                _resolve_flight_signals(key)
                raise

        return async_wrapper if inspect.iscoroutinefunction(fn) else sync_wrapper

    if func is not None:
        return decorator(func)
    return decorator


def reset() -> None:
    _manager.reset()


def get_cache(key: str) -> Any:
    return _manager.get_core().get(key)


def set_cache(
    key: str, value: Any, deps: Iterable[str] = (), ttl: Optional[int] = None
) -> None:
    _manager.get_core().set(key, value, list(deps), ttl=ttl)
