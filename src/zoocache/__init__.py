from ._zoocache import InvalidTag
from .context import add_deps
from .core import (
    cacheable,
    clear,
    configure,
    get_cache as get,
    invalidate,
    prune,
    reset,
    set_cache as set,
    version,
)

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
