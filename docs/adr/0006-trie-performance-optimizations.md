# ADR 0006: Trie Performance Optimizations (Short-circuit & Lazy Update)

## Status
Accepted

## Context
The hierarchical invalidation via PrefixTrie (ADR 0001) is fast for tag lookup ($O(Depth)$), but cache hit validation becomes slow ($O(N \times Depth)$) for entries with thousands of dependencies. Large-scale invalidations also trigger repeated heavy validations across all reading clients.

## Decision
1. **Global Version Counter**: Introduce a global atomic counter in the `PrefixTrie` that increments on every invalidation.
2. **O(1) Short-circuit**: Cache entries store the global version at creation time. During retrieval, if the entry's version matches the current global version, we skip the full dependency validation.
3. **Lazy Update (Self-Healing)**: If an entry's version is outdated but the full validation passes, we re-save the entry with the current global version. This restores $O(1)$ performance for subsequent hits.

## Consequences
- **Positive**: Near-instant cache hit validation (2µs) regardless of dependency count.
- **Positive**: Drastically reduced CPU load on reading nodes after global invalidations.
- **Negative**: Small write overhead in `get()` during the self-healing phase.
- **Negative**: The optimization is conservative; any irrelevant invalidation resets the global version, forcing a single re-validation per active entry.
