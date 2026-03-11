import logging
import threading
import time
from collections import defaultdict

from zoocache._zoocache import Core
from zoocache.telemetry.base import TelemetryAdapter

logger = logging.getLogger("zoocache.telemetry")


class RedisTelemetryAdapter(TelemetryAdapter):
    def __init__(self, core: Core | None = None, flush_interval: float = 1.0):
        self.core = core
        self.flush_interval = flush_interval

        self._counters: dict[str, float] = defaultdict(float)
        self._lock = threading.Lock()
        self._shutdown_event = threading.Event()
        self._flush_thread = threading.Thread(target=self._flush_loop, daemon=True)
        self._flush_thread.start()

    def bind_core(self, core: Core) -> None:
        self.core = core

    def _flush_loop(self) -> None:
        while not self._shutdown_event.is_set():
            time.sleep(self.flush_interval)
            self._flush()

    def _flush(self) -> None:
        if self.core is None:
            return

        with self._lock:
            if not self._counters:
                return
            snapshot = self._counters
            self._counters = defaultdict(float)

        try:
            self.core.flush_metrics(snapshot)
        except Exception as e:
            logger.debug(f"Failed to flush metrics to Redis: {e}")
            with self._lock:
                for key, value in snapshot.items():
                    self._counters[key] += value

    def _build_metric_name(self, name: str, labels: dict[str, str] | None) -> str:
        if not labels:
            return name
        label_str = "_".join(f"{k}={v}" for k, v in sorted(labels.items()))
        return f"{name}_{label_str}"

    def increment(self, name: str, value: float = 1.0, labels: dict[str, str] | None = None) -> None:
        metric_name = self._build_metric_name(name, labels)
        with self._lock:
            self._counters[metric_name] += value

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        sum_name = self._build_metric_name(f"{name}_sum", labels)
        count_name = self._build_metric_name(f"{name}_count", labels)
        with self._lock:
            self._counters[sum_name] += value
            self._counters[count_name] += 1.0

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        pass

    def close(self) -> None:
        self._shutdown_event.set()
        if self._flush_thread.is_alive():
            self._flush_thread.join(timeout=2.0)
        self._flush()
