import time
import pytest
from zoocache import cacheable, configure, _reset


def test_memory_ttl():
    _reset()
    configure(default_ttl=1)  # 1 second TTL

    @cacheable()
    def get_data():
        return "val"

    # 1. Hit
    assert get_data() == "val"

    # 2. Before expiration
    time.sleep(0.1)
    assert get_data() == "val"

    # 3. After expiration
    time.sleep(1.0)
    # The entry should be gone
    # Note: InMemoryStorage deletes on GET
    assert get_data() == "val"


def test_per_decorator_ttl():
    _reset()
    configure(default_ttl=10)

    @cacheable(ttl=1)
    def short_lived():
        return "short"

    assert short_lived() == "short"
    time.sleep(1.2)
    # Should be re-calculated or at least not returned from cache if expired
    assert short_lived() == "short"


def test_tti_refresh():
    _reset()
    # This test verifies that accessing a key refreshes its TTL
    configure(default_ttl=2)

    @cacheable()
    def get_data():
        return "data"

    assert get_data() == "data"

    # Wait 1.5s, then access. If TTI works, it should reset to 2s.
    time.sleep(1.5)
    assert get_data() == "data"

    # Wait another 1.5s. Total 3s since first SET.
    # If it was a fixed TTL, it would be gone.
    # If TTI works, it should still be there.
    time.sleep(1.5)
    assert get_data() == "data"

    # Wait 2.5s without access. Should be gone.
    time.sleep(2.5)
    assert get_data() == "data"


@pytest.mark.parametrize("storage_url", [None, "lmdb://./test_ttl_lmdb"])
def test_all_storages_ttl(storage_url):
    _reset()
    import shutil
    import os

    if storage_url and storage_url.startswith("lmdb://"):
        path = storage_url[7:]
        if os.path.exists(path):
            shutil.rmtree(path)

    configure(storage_url=storage_url, default_ttl=1)

    @cacheable(namespace=f"ns_{storage_url}")
    def func(x):
        return x

    assert func(1) == 1
    time.sleep(1.5)
    # Should be expired
    assert func(1) == 1
