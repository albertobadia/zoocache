import asyncio
import logging
from collections import defaultdict

from zoocache._zoocache import Core
from zoocache.telemetry.base import TelemetryAdapter

logger = logging.getLogger("zoocache.telemetry")


class RedisTelemetryAdapter(TelemetryAdapter):
    def __init__(self, core: Core, flush_interval: float = 5.0):
        self.core = core
        self.flush_interval = flush_interval

        self._counters: dict[str, float] = defaultdict(float)
        self._flush_task: asyncio.Task | None = None
        self._start_flush_task()

    def _start_flush_task(self) -> None:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return

        if self._flush_task is None or self._flush_task.done():
            self._flush_task = loop.create_task(self._flush_loop())

    async def _flush_loop(self) -> None:
        while True:
            await asyncio.sleep(self.flush_interval)
            self._flush()

    def _flush(self) -> None:
        if not self._counters:
            return

        snapshot = self._counters
        self._counters = defaultdict(float)

        try:
            self.core.flush_metrics(snapshot)
        except Exception as e:
            logger.debug(f"Failed to flush metrics to Redis: {e}")
            for key, value in snapshot.items():
                self._counters[key] += value

    def _build_metric_name(self, name: str, labels: dict[str, str] | None) -> str:
        if not labels:
            return name
        label_str = "_".join(f"{v}" for k, v in sorted(labels.items()))
        return f"{name}_{label_str}"

    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        self._start_flush_task()
        metric_name = self._build_metric_name(name, labels)
        self._counters[metric_name] += value

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        self._start_flush_task()
        metric_name = self._build_metric_name(f"{name}_sum", labels)
        count_name = self._build_metric_name(f"{name}_count", labels)
        self._counters[metric_name] += value
        self._counters[count_name] += 1.0

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        pass

    def close(self) -> None:
        if self._flush_task and not self._flush_task.done():
            self._flush_task.cancel()
        self._flush()
