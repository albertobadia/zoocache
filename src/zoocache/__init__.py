from .core import (
    configure,
    cacheable,
    invalidate,
    prune,
    clear,
    version,
    reset,
    get_cache as get,
    set_cache as set,
)
from ._zoocache import InvalidTag
from .context import add_deps

__all__ = [
    "configure",
    "cacheable",
    "invalidate",
    "prune",
    "clear",
    "version",
    "reset",
    "add_deps",
    "get",
    "set",
    "InvalidTag",
]
