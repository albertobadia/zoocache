import pytest

from zoocache import configure, reset
from zoocache.core import _manager


def test_lmdb_error_propagation(tmp_path):
    """
    Verify that LMDB errors (like MDB_BAD_VALSIZE) are correctly propagated
    from Rust to Python as Exceptions.
    """
    reset()
    storage_path = tmp_path / "test_error_db"
    storage_url = f"lmdb://{storage_path}"

    # Configure with LMDB
    configure(storage_url=storage_url)
    core = _manager.get_core()

    # Trigger an error: LMDB usually has a max key size of ~511 bytes.
    # We call core.set directly to bypass the hashing logic in the decorator.
    oversized_key = "a" * 3000

    with pytest.raises(RuntimeError) as excinfo:
        core.set(oversized_key, "value", [], None)

    assert "MDB_BAD_VALSIZE" in str(excinfo.value)


if __name__ == "__main__":
    pytest.main([__file__])
