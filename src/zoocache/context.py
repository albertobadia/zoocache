from contextvars import ContextVar

_DEPS_CONTEXT: ContextVar[set[str] | None] = ContextVar("_DEPS_CONTEXT", default=None)


def add_deps(deps: list[str]) -> None:
    ctx = _DEPS_CONTEXT.get()
    if ctx is not None:
        ctx.update(deps)


def get_current_deps() -> set[str] | None:
    return _DEPS_CONTEXT.get()


class DepsTracker:
    def __init__(self):
        self.deps: set[str] = set()
        self.token = None

    def __enter__(self):
        self.token = _DEPS_CONTEXT.set(self.deps)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        _DEPS_CONTEXT.reset(self.token)
