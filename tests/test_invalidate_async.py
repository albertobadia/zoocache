import pytest

from zoocache import configure, invalidate, invalidate_async, reset, set as set_cache


@pytest.mark.asyncio
async def test_invalidate_async_basic():
    reset()
    configure()

    set_cache("key1", "value1", deps=["tag1"])
    set_cache("key2", "value2", deps=["tag2"])

    await invalidate_async("tag1")

    from zoocache import get as get_cache

    result1 = get_cache("key1")
    assert result1 is None

    result2 = get_cache("key2")
    assert result2 == "value2"


@pytest.mark.asyncio
async def test_invalidate_async_multiple_tags():
    reset()
    configure()

    set_cache("key1", "value1", deps=["tag1", "tag2"])
    set_cache("key2", "value2", deps=["tag1"])
    set_cache("key3", "value3", deps=["tag3"])

    await invalidate_async("tag1")

    from zoocache import get as get_cache

    assert get_cache("key1") is None
    assert get_cache("key2") is None
    assert get_cache("key3") == "value3"


def test_invalidate_basic():
    reset()
    configure()

    set_cache("key1", "value1", deps=["tag1"])

    invalidate("tag1")

    from zoocache import get as get_cache

    assert get_cache("key1") is None


def test_invalidate_with_prefix():
    reset()
    configure()

    set_cache("key1", "value1", deps=["user:1:profile"])
    set_cache("key2", "value2", deps=["user:2:profile"])

    invalidate("user:1")

    from zoocache import get as get_cache

    assert get_cache("key1") is None
    assert get_cache("key2") == "value2"
