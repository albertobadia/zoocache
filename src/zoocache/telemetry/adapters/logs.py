import json
import logging

from zoocache.telemetry.base import TelemetryAdapter


class LogAdapter(TelemetryAdapter):
    __slots__ = ("_logger", "_level", "_format_json")

    def __init__(
        self,
        logger: logging.Logger | None = None,
        name: str = "zoocache.telemetry",
        level: int | str = logging.INFO,
        format_json: bool = False,
    ):
        self._logger = logger or logging.getLogger(name)
        self._level = level if isinstance(level, int) else getattr(logging, level.upper())
        self._format_json = format_json

    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        self._log("increment", name, value, labels)

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._log("observe", name, value, labels)

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._log("gauge", name, value, labels)

    def close(self) -> None:
        pass

    def _log(self, type_: str, name: str, value: float, labels: dict[str, str] | None) -> None:
        if not self._logger.isEnabledFor(self._level):
            return

        if self._format_json:
            msg = json.dumps(
                {
                    "telemetry_type": type_,
                    "metric_name": name,
                    "value": value,
                    "labels": labels or {},
                }
            )
        else:
            labels_str = f" {labels}" if labels else ""
            msg = f"[{type_.upper()}] {name}: {value}{labels_str}"

        self._logger.log(self._level, msg)
