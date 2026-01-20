import time
from zoocache import cacheable, configure, _reset


def test_fixed_ttl_strict():
    """Verify that read_extend_ttl=False prevents TTI behavior."""
    _reset()
    # Configure with 2 seconds TTL, but DISABLE extension on read
    configure(default_ttl=2, read_extend_ttl=False)

    @cacheable()
    def get_data():
        return "fixed"

    # T=0
    assert get_data() == "fixed"

    # T=1.5 (Access should NOT extend life)
    time.sleep(1.5)
    assert get_data() == "fixed"

    # T=3.0 (If it was TTI, it would be alive until T=3.5. But it's Fixed, so it died at T=2.0)
    time.sleep(1.5)

    # We can't easily detect "expiry" without side effects or logging,
    # but we can rely on internal behavior or just trust that if we wait enough it's gone?
    # Actually, to verify it expired at T=2, we just need to ensure that subsequent check works?
    # No, that doesn't prove it expired.
    # To prove it expired, we'd need side effects.

    counter = 0

    @cacheable(namespace="counter")
    def get_counted():
        nonlocal counter
        counter += 1
        return counter

    # T=0. Count=1
    assert get_counted() == 1

    # T=1.5. Still 1. accessing SHOULD NOT EXTEND.
    time.sleep(1.5)
    assert get_counted() == 1

    # T=3.0. Should show 2 because T=2 expired.
    # If it extended, it would be valid until 1.5+2 = 3.5.
    time.sleep(1.5)
    assert get_counted() == 2
