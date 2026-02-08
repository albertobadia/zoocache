# ADR 0009: Robust Synchronization and Error Handling

## Status
Accepted (Supersedes behavioral sections of ADR 0005)

## Context
As the system matured, several edge cases were identified:
1. **Panic Risk**: In high-concurrency scenarios, a panic in a leader thread could result in "mutex poisoning," causing all subsequent threads waiting for the same key to panic and crash the entire process.
2. **Silent Storage Failures**: Errors in LMDB transactions (e.g., oversized keys or disk full) were being logged but not propagated to the user, leading to data loss or confusing behavior.
3. **Brittle Invalidation**: The invalidation bus used a simple `tag|version` string format. If a tag contained a `|` character, it would break the distributed sync.
4. **Counter Drift**: In LMDB, the entry count was updated in-memory before the transaction committed, leading to desynchronization if the commit failed.

## Decision
1. **Safe Synchronization**: Replace all `.unwrap()` calls on mutexes and condition variables in `flight.rs`. Implement a 60-second timeout for waiting threads to prevent indefinite stalls. Detect poisoned mutexes and return `FlightStatus::Error` instead of panicking.
2. **Error Propagation**: Ensure all storage operations (`set`, `clear`, etc.) return a `PyResult`. Propagate LMDB errors to Python as a `RuntimeError`.
3. **Tag Validation**: Enforce a strict character set for dependency tags: `[a-zA-Z0-9_:]`. Introduce a custom `InvalidTag` exception raised on both `invalidate()` and `set()`.
4. **Post-Commit Updates**: For persistent storage (LMDB), update in-memory atomic counters ONLY after the transaction has successfully committed.

## Consequences
- **Positive**: Significantly improved system stability. A single failing request can no longer crash the entire node.
- **Positive**: Correctness and transparency. Users are immediately notified of storage-level issues.
- **Positive**: Robust distributed invalidation by preventing invalid characters in tags.
- **Negative**: Small performance overhead for character validation (nanoseconds).
