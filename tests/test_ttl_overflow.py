"""Test for TTL integer overflow protection - Issue #1 from CODE_REVIEW.md"""

import time

from zoocache import configure, reset


def test_large_ttl_no_overflow():
    """Test that large TTL values don't cause immediate expiration due to overflow.

    This tests the fix for the critical bug where `now_secs() + t` would overflow
    when t is large enough, causing entries to expire immediately.
    """
    reset()
    configure()  # Uses InMemoryStorage by default

    try:
        from zoocache.core import _manager

        core = _manager.get_core()

        now = int(time.time())
        max_u64 = 2**64 - 1

        large_ttl = max_u64 - now + 1

        core.set("overflow_key", "overflow_value", [], ttl=large_ttl)
        result = core.get("overflow_key")

        assert result is not None, "BUG: Large TTL caused overflow - value should not be None"
        assert result == "overflow_value", f"Expected 'overflow_value', got {result}"
    finally:
        reset()


def test_normal_ttl_still_works():
    """Verify normal TTL values still work correctly after the fix."""
    reset()
    configure()

    try:
        from zoocache.core import _manager

        core = _manager.get_core()

        core.set("normal_key", "normal_value", [], ttl=60)
        result = core.get("normal_key")

        assert result == "normal_value"
    finally:
        reset()


def test_very_large_but_safe_ttl():
    """Test that large but safe TTL values work correctly."""
    reset()
    configure()

    try:
        from zoocache.core import _manager

        core = _manager.get_core()

        large_ttl = 2**63  # Well within u64 range but large

        core.set("large_ttl_key", "large_ttl_value", [], ttl=large_ttl)
        result = core.get("large_ttl_key")

        assert result == "large_ttl_value"
    finally:
        reset()
