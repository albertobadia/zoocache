import pytest
from zoocache.core import _core


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear the Rust cache store and Trie before each test."""
    _core.clear()
    yield
