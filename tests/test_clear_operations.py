import pytest

from zoocache import clear, configure, reset, set as set_cache


def test_clear_removes_all_keys():
    reset()
    configure()

    set_cache("key1", "value1")
    set_cache("key2", "value2")

    clear()

    from zoocache import get as get_cache

    assert get_cache("key1") is None
    assert get_cache("key2") is None


def test_clear_idempotent():
    reset()
    configure()

    clear()
    clear()


@pytest.mark.asyncio
async def test_clear_async():
    reset()
    configure()

    set_cache("key1", "value1")
    set_cache("key2", "value2")

    from zoocache import clear_async

    await clear_async()

    from zoocache import get as get_cache

    assert get_cache("key1") is None
    assert get_cache("key2") is None


def test_clear_with_deps():
    reset()
    configure()

    set_cache("key1", "value1", deps=["tag1", "tag2"])

    clear()

    from zoocache import get as get_cache

    assert get_cache("key1") is None
