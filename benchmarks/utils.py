import time
import functools
from typing import Callable, Any


def simulated_latency(ms: float = 5.0):
    """
    Decorator to add a simulated network/IO delay to a function call.
    Useful for making micro-benchmarks more realistic and stable in CI.
    """

    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            if ms > 0:
                time.sleep(ms / 1000.0)
            return func(*args, **kwargs)

        return wrapper

    return decorator


class LatencySimulator:
    """
    Context manager to wrap blocks of code with a simulated delay.
    """

    def __init__(self, ms: float = 5.0):
        self.delay = ms / 1000.0

    def __enter__(self):
        if self.delay > 0:
            time.sleep(self.delay)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
