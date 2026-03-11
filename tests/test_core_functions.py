import time
from unittest.mock import MagicMock

from zoocache import configure, prune, reset, version
from zoocache.core import _manager
from zoocache.telemetry import TelemetryManager
from zoocache.telemetry.base import TelemetryAdapter


def test_version_returns_string():
    reset()
    configure()

    v = version()
    assert isinstance(v, str)
    assert len(v) > 0


def test_prune_calls_core(tmp_path):
    reset()
    storage_path = tmp_path / "prune_test"
    storage_url = f"lmdb://{storage_path}"
    configure(storage_url=storage_url)

    mock_core = MagicMock()
    _manager.core = mock_core

    prune(max_age_secs=3600)

    mock_core.prune.assert_called_once_with(3600)


def test_check_telemetry_no_core():
    reset()
    _manager.core = None
    _manager.check_telemetry()


def test_check_telemetry_with_core():
    reset()
    storage_path = "/tmp/zoocache_test_telemetry"
    configure(storage_url=storage_path)

    mock_core = MagicMock()
    mock_core.tti_dropped_messages.return_value = 0
    mock_core.silent_errors.return_value = 0
    _manager.core = mock_core
    _manager._last_telemetry_check = 0

    _manager.check_telemetry()


def test_check_telemetry_increments_dropped():
    reset()
    storage_path = "/tmp/zoocache_test_telemetry2"
    configure(storage_url=storage_path)

    mock_core = MagicMock()
    mock_core.tti_dropped_messages.return_value = 5
    mock_core.silent_errors.return_value = 0
    _manager.core = mock_core
    _manager._last_tti_dropped = 0
    _manager._last_silent_errors = 0
    _manager._last_telemetry_check = 0

    _manager.check_telemetry()

    assert _manager._last_tti_dropped == 5


def test_check_telemetry_increments_silent_errors():
    reset()
    storage_path = "/tmp/zoocache_test_telemetry3"
    configure(storage_url=storage_path)

    mock_core = MagicMock()
    mock_core.tti_dropped_messages.return_value = 0
    mock_core.silent_errors.return_value = 10
    _manager.core = mock_core
    _manager._last_tti_dropped = 0
    _manager._last_silent_errors = 0
    _manager._last_telemetry_check = 0

    _manager.check_telemetry()

    assert _manager._last_silent_errors == 10


def test_check_telemetry_rate_limited():
    reset()
    storage_path = "/tmp/zoocache_test_telemetry4"
    configure(storage_url=storage_path)

    mock_core = MagicMock()
    mock_core.tti_dropped_messages.return_value = 100
    mock_core.silent_errors.return_value = 100
    _manager.core = mock_core
    _manager._last_tti_dropped = 0
    _manager._last_silent_errors = 0
    _manager._last_telemetry_check = time.monotonic()

    _manager.check_telemetry()

    mock_core.tti_dropped_messages.assert_not_called()
    mock_core.silent_errors.assert_not_called()


class _CloseTrackingAdapter(TelemetryAdapter):
    def __init__(self):
        self.closed = False

    def increment(self, name, value=1.0, labels=None):
        return None

    def observe(self, name, value, labels=None):
        return None

    def set_gauge(self, name, value, labels=None):
        return None

    def bind_core(self, core):
        return None

    def close(self):
        self.closed = True


def test_reset_closes_previous_telemetry_adapters():
    reset()
    adapter = _CloseTrackingAdapter()
    configure(telemetry=TelemetryManager([adapter]))

    reset()

    assert adapter.closed is True


def test_configure_should_be_idempotent_with_partial_same_values():
    reset()
    configure(prefix="audit", default_ttl=10)

    configure(prefix="audit")
