import pytest
from zoocache import cacheable, invalidate


@pytest.mark.asyncio
async def test_async_basic_caching():
    calls = {"count": 0}

    @cacheable(deps=["async_tag"])
    async def fetch_async(x):
        calls["count"] += 1
        return x

    res1 = await fetch_async(100)
    assert res1 == 100
    assert calls["count"] == 1

    res2 = await fetch_async(100)
    assert res2 == 100
    assert calls["count"] == 1

    invalidate("async_tag")
    res3 = await fetch_async(100)
    assert res3 == 100
    assert calls["count"] == 2
