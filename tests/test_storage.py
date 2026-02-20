import os
import shutil
import tempfile

from zoocache import cacheable, configure, invalidate, reset


def test_large_data_objects():
    large_data = {f"key_{i}": list(range(100)) for i in range(100)}

    @cacheable(deps=["large"])
    def get_large():
        return large_data

    get_large()

    fetched = get_large()
    assert fetched == large_data

    invalidate("large")
    get_large()


def test_various_types():
    @cacheable(deps=["types"])
    def get_value(val):
        return val

    assert get_value(42) == 42
    assert get_value("string") == "string"
    assert get_value([1, 2, 3]) == [1, 2, 3]
    assert get_value({"a": 1}) == {"a": 1}
    assert get_value(None) is None


def test_lazy_configuration():
    """
    Verify that decorators defined BEFORE configure() still respect the configuration.
    This tests the fix for the 'premature capture of Core' bug.
    """
    reset()
    temp_dir = tempfile.mkdtemp()
    lmdb_path = os.path.join(temp_dir, "test_db_lazy")

    try:
        # 1. Define decorator BEFORE configuring
        @cacheable(namespace="test_lazy")
        def early_decorated_func(x):
            return x * 2

        # 2. Configure LMDB (non-default storage)
        lmdb_url = f"lmdb://{lmdb_path}"
        configure(storage_url=lmdb_url)

        # 3. Use the function
        assert early_decorated_func(10) == 20

        # 4. Verify that data ended up in LMDB, not Memory
        assert os.path.exists(lmdb_path)
        assert os.path.exists(os.path.join(lmdb_path, "data.mdb"))
    finally:
        reset()
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


def test_lmdb_counter_consistency():
    """
    Verify that LMDB correctly tracks the number of items (len).
    This tests the fix for the 'LMDB count reporting 0' bug.
    """
    reset()
    temp_dir = tempfile.mkdtemp()
    lmdb_path = os.path.join(temp_dir, "test_db_count")
    lmdb_url = f"lmdb://{lmdb_path}"

    try:
        configure(storage_url=lmdb_url)

        @cacheable(namespace="count_consistency")
        def store_item(i):
            return i

        # Insert 100 items
        for i in range(100):
            store_item(i)

        # Force a check of the storage length
        from zoocache.core import _manager

        idx = _manager.get_core().len()
        assert idx == 100

        # Verify persistence of count
        reset()
        configure(storage_url=lmdb_url)
        idx_reopen = _manager.get_core().len()
        assert idx_reopen == 100
    finally:
        reset()
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
