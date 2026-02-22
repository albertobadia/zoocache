import time
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from zoocache.telemetry.manager import TelemetryManager


class TimerContext:
    __slots__ = ("_manager", "_name", "_labels", "_start_time")

    def __init__(
        self,
        manager: "TelemetryManager",
        name: str,
        labels: dict[str, str] | None = None,
    ):
        self._manager = manager
        self._name = name
        self._labels = labels
        self._start_time: float | None = None

    def __enter__(self) -> "TimerContext":
        self._start_time = time.perf_counter()
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._start_time is not None:
            duration = time.perf_counter() - self._start_time
            self._manager.observe(self._name, duration, self._labels)


class TelemetryAdapter(ABC):
    @abstractmethod
    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        pass

    @abstractmethod
    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        pass

    @abstractmethod
    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        pass

    @abstractmethod
    def close(self) -> None:
        pass
