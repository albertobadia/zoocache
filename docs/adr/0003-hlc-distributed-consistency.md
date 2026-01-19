# ADR 0003: Hybrid Logical Clocks (HLC) for Distributed Consistency

## Status
Accepted

## Context
In a distributed environment, system clocks (wall clocks) are never perfecty synchronized. Relying on them for ordering invalidations leads to race conditions and stale data due to clock skew.

## Decision
Use **Hybrid Logical Clocks (HLC)** to version tags. HLC combines wall clock time with a logical counter to ensure causal ordering and monotonicity across nodes. Implement a **Ratchet** mechanism to sync local clocks with the highest seen version.

## Consequences
- **Positive**: Causal consistency is preserved even with skewed system clocks.
- **Positive**: Robustness against lost invalidation messages through "passive resync" (self-healing).
- **Negative**: Slightly larger storage requirements (64-bit timestamps per dependency segment).
