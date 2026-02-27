import tempfile

import pytest

from zoocache import configure, get as get_cache, reset, set as set_cache
from zoocache.core import _manager


def test_get_cache_basic():
    reset()
    set_cache("test_key", {"name": "test_value"})
    result = get_cache("test_key")
    assert result == {"name": "test_value"}


def test_get_cache_nonexistent():
    reset()
    result = get_cache("nonexistent_key")
    assert result is None


def test_set_cache_with_deps():
    reset()
    set_cache("key_with_deps", "value", deps=["tag:dep1", "tag:dep2"])
    result = get_cache("key_with_deps")
    assert result == "value"


def test_set_cache_with_ttl(tmp_path):
    reset()
    storage_path = tmp_path / "ttl_test"
    storage_url = f"lmdb://{storage_path}"
    configure(storage_url=storage_url, default_ttl=1)
    set_cache("ttl_key", "ttl_value", ttl=3600)
    result = get_cache("ttl_key")
    assert result == "ttl_value"


@pytest.mark.asyncio
async def test_get_cache_async():
    reset()
    from zoocache import get_async, set_async

    await set_async("async_key", {"async": True})
    result = await get_async("async_key")
    assert result == {"async": True}


@pytest.mark.asyncio
async def test_get_cache_async_nonexistent():
    reset()
    from zoocache import get_async

    result = await get_async("async_nonexistent")
    assert result is None


def test_get_cache_different_types():
    reset()

    set_cache("str_key", "string_value")
    assert get_cache("str_key") == "string_value"

    set_cache("int_key", 42)
    assert get_cache("int_key") == 42

    set_cache("list_key", [1, 2, 3])
    assert get_cache("list_key") == [1, 2, 3]

    set_cache("dict_key", {"nested": {"key": "value"}})
    assert get_cache("dict_key") == {"nested": {"key": "value"}}


def test_cache_manager_is_configured():
    reset()
    assert _manager.is_configured() is False

    configure(storage_url="lmdb://" + str(tempfile.mkdtemp()))
    assert _manager.is_configured() is True


def test_cache_manager_reset():
    reset()
    configure(storage_url="lmdb://" + str(tempfile.mkdtemp()))
    _ = _manager.get_core()
    assert _manager.is_configured() is True

    _manager.reset()
    assert _manager.core is None
    assert _manager.config == {}
    assert _manager.is_configured() is False


def test_cache_manager_configure_twice_same_settings():
    reset()
    configure(default_ttl=60)
    configure(default_ttl=60)


def test_cache_manager_configure_different_settings_raises():
    reset()
    configure(default_ttl=60)

    with pytest.raises(RuntimeError, match="zoocache already initialized"):
        configure(storage_url="lmdb://" + str(tempfile.mkdtemp()), default_ttl=120)
