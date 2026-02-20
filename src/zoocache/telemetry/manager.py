from typing import TYPE_CHECKING

from zoocache.telemetry.base import TimerContext

if TYPE_CHECKING:
    from zoocache.telemetry.base import TelemetryAdapter


class TelemetryManager:
    __slots__ = ("_adapters", "_enabled")

    def __init__(self, adapters: list["TelemetryAdapter"] | None = None):
        self._adapters = adapters or []
        self._enabled = bool(self._adapters)

    @property
    def enabled(self) -> bool:
        return self._enabled

    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        if not self._enabled:
            return
        for adapter in self._adapters:
            adapter.increment(name, value, labels)

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        if not self._enabled:
            return
        for adapter in self._adapters:
            adapter.observe(name, value, labels)

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        if not self._enabled:
            return
        for adapter in self._adapters:
            adapter.set_gauge(name, value, labels)

    def time_operation(self, name: str, labels: dict[str, str] | None = None) -> TimerContext:
        return TimerContext(self, name, labels)
