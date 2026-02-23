import pytest

from zoocache import StorageIsFull, cacheable, configure, reset


@pytest.fixture(autouse=True)
def reset_cache():
    reset()
    yield
    reset()


def test_lmdb_default_map_size(tmp_path):
    storage_url = f"lmdb://{tmp_path / 'default'}"
    configure(storage_url=storage_url)

    @cacheable(deps=["test"])
    def get_data():
        return {"value": 42}

    assert get_data() == {"value": 42}


def test_lmdb_custom_map_size(tmp_path):
    storage_url = f"lmdb://{tmp_path / 'custom'}"
    configure(storage_url=storage_url, lmdb_map_size=10 * 1024 * 1024)

    @cacheable(deps=["test"])
    def get_data():
        return {"value": 100}

    assert get_data() == {"value": 100}


def test_lmdb_map_size_too_small_raises(tmp_path):
    storage_url = f"lmdb://{tmp_path / 'tiny'}"
    configure(storage_url=storage_url, lmdb_map_size=4096)

    @cacheable(deps=["test"])
    def get_data():
        return "fail"

    with pytest.raises(StorageIsFull, match="LMDB storage is full"):
        get_data()
