# Concurrency & SingleFlight

Zoocache is designed to be safe and efficient in highly concurrent environments, protecting your upstream data sources from spikes in traffic.

## Thundering Herd Protection (SingleFlight)

When a cache entry expires or is invalidated, and multiple requests for that same key arrive simultaneously, a "thundering herd" occurs.

### The Solution
Zoocache implements a **SingleFlight** pattern:
1. The first request to arrive for a missing key becomes the **leader**.
2. Subsequent requests for the same key are **parked** (waiting).
3. Once the leader finishes executing the function and populates the cache, it notifies all waiting requests.
4. All requests then return the same result from the cache.

### Implementation Details
- **Sync Functions**: Uses Rust's `Condvar` and `Mutex` to block and wake threads.
- **Async Functions**: Uses `asyncio.Future` in Python to manage waiters on the event loop.

## Internal Concurrency
The Rust core uses `DashMap`, which is a highly concurrent hash map that allows multiple threads to read and write to different "shards" of the map simultaneously without global locking.

## Trade-offs & Considerations
- **Impact on Latency**: While SingleFlight prevents overloading the backend, it does mean that the 2nd through 100th requests will have a latency equal to the time it takes the 1st request to finish.
- **Deadlock Potential**: Users should be careful not to create recursive `@cacheable` calls that might circular-depend on each other, as the locking mechanism (though designed to be safe) could lead to timeouts or stalls in complex circular graphs.
