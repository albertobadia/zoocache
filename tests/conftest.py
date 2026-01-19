import pytest
import zoocache


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear the Rust cache store and Trie before each test."""
    zoocache.clear()
    yield
