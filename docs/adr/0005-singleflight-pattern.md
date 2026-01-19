# ADR 0005: SingleFlight Pattern for Thundering Herd Protection

## Status
Accepted

## Context
Under high concurrency, many requests for the same stale/missing key can hit the backend simultaneously, potentially causing a service collapse.

## Decision
Implement the **SingleFlight** pattern. For any given key, only one execution (the leader) is allowed to fetch and cache the data. All other concurrent requests wait for the leader's result.

## Consequences
- **Positive**: Dramatically reduces load on upstream data sources.
- **Positive**: Unified behavior for both sync and async Python functions.
- **Negative**: Complexity in managing "flights" and potential for leader stalls to affect concurrent waiters.
