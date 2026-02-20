import time
from unittest.mock import MagicMock

from zoocache.telemetry.base import TimerContext


def test_timer_context():
    manager = MagicMock()
    with TimerContext(manager, "op_duration", {"label": "test"}):
        time.sleep(0.01)

    manager.observe.assert_called_once()
    name, value, labels = manager.observe.call_args[0]
    assert name == "op_duration"
    assert value >= 0.01
    assert labels == {"label": "test"}
