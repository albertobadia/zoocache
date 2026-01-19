from contextvars import ContextVar
from typing import Set, Optional

_DEPS_CONTEXT: ContextVar[Optional[Set[str]]] = ContextVar(
    "_DEPS_CONTEXT", default=None
)


def add_deps(deps: list[str]) -> None:
    """Register dynamic dependencies for the current @cacheable call."""
    ctx = _DEPS_CONTEXT.get()
    if ctx is not None:
        ctx.update(deps)


def get_current_deps() -> Optional[Set[str]]:
    """Get the dependency set for the current context."""
    return _DEPS_CONTEXT.get()


class DepsTracker:
    """Context manager to track dynamic dependencies."""

    def __init__(self):
        self.deps: Set[str] = set()
        self.token = None

    def __enter__(self):
        self.token = _DEPS_CONTEXT.set(self.deps)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        _DEPS_CONTEXT.reset(self.token)
