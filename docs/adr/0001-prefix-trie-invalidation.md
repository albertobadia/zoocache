# ADR 0001: PrefixTrie for Hierarchical Invalidation

## Status
Accepted

## Context
Traditional cache invalidation is either too granular (invalidating a single key) or too coarse (invalidating a whole namespace). We need a way to invalidate groups of related items hierarchicaly (e.g., all users under an organization) without scanning millions of keys.

## Decision
We will use a **PrefixTrie** structure where dependency tags are segments of a path. Each node in the Trie stores an atomic version number. Cache entries will store a snapshot of these versions along their dependency paths.

## Consequences
- **Positive**: Invalidation becomes $O(Depth)$, which is extremely fast and independent of the number of items in the cache.
- **Positive**: High consistency for hierarchical data structures.
- **Negative**: Increased memory usage as the number of unique tags grows (requires a pruning mechanism).
- **Negative**: Dependencies must follow a hierarchical string format (e.g., `a:b:c`).
