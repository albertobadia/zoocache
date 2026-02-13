import asyncio
import zoocache
import pytest


@pytest.mark.asyncio
async def test_flight_timeout_configurable():
    # Ensure fresh state
    zoocache.reset()
    # Configure with a very short timeout (1 second)
    zoocache.configure(flight_timeout=1)

    # Define a dependency function that takes 2 seconds (exceeds timeout)
    async def slow_func():
        await asyncio.sleep(2)
        return "slow"

    # Wrap it with cacheable
    cached_slow = zoocache.cacheable(slow_func)

    # First call will be the leader
    task1 = asyncio.create_task(cached_slow())

    # Wait a bit to ensure task1 is leader
    await asyncio.sleep(0.1)

    # Second call should wait for task1, but timeout after 1s
    with pytest.raises(RuntimeError, match="Thundering herd leader failed"):
        await cached_slow()

    # Clean up
    await task1
    zoocache.reset()
