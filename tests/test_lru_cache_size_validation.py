import pytest

from zoocache import configure, reset
from zoocache.core import _manager


def test_lru_cache_size_zero_is_rejected():
    reset()
    try:
        configure(lru_cache_size=0)
        with pytest.raises(ValueError, match="lru_cache_size must be >= 1"):
            _manager.get_core()
    finally:
        reset()
