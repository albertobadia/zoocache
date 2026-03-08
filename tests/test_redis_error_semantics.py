from zoocache import configure, reset
from zoocache.core import _manager


def test_redis_get_connection_error_returns_miss_instead_of_error():
    reset()
    try:
        configure(storage_url="redis://127.0.0.1:1")
        core = _manager.get_core()

        result = core.get_or_entry_sync("redis-error-semantics")

        assert result == (None, False, False)
    finally:
        reset()
