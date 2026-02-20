import logging

from zoocache.telemetry.adapters.logs import LogAdapter


def test_log_adapter_plain(caplog):
    adapter = LogAdapter(name="test_log", level="INFO")
    with caplog.at_level(logging.INFO, logger="test_log"):
        adapter.increment("hits", 2.0, {"tag": "val"})
        adapter.observe("latency", 0.1)
        adapter.set_gauge("size", 50)

    assert "[INCREMENT] hits: 2.0 {'tag': 'val'}" in caplog.text
    assert "[OBSERVE] latency: 0.1" in caplog.text
    assert "[GAUGE] size: 50" in caplog.text


def test_log_adapter_json(caplog):
    import json

    adapter = LogAdapter(name="test_json", level="INFO", format_json=True)
    with caplog.at_level(logging.INFO, logger="test_json"):
        adapter.increment("hits", 1.0, {"tag": "val"})

    last_record = caplog.records[-1]
    data = json.loads(last_record.message)
    assert data["telemetry_type"] == "increment"
    assert data["metric_name"] == "hits"
    assert data["value"] == 1.0
    assert data["labels"] == {"tag": "val"}


def test_log_adapter_external_logger(caplog):
    my_logger = logging.getLogger("external_logger")
    adapter = LogAdapter(logger=my_logger, level="INFO")

    with caplog.at_level(logging.INFO, logger="external_logger"):
        adapter.increment("external_hit", 1.0)

    assert "[INCREMENT] external_hit: 1.0" in caplog.text
