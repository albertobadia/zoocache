# ADR 0002: Rust Core with Python Wrapper (PyO3)

## Status
Accepted

## Context
The performance overhead of pure Python for complex data structures (like a PrefixTrie) and high-throughput serialization would be significant. We need the speed of a compiled language while maintaining the ease of use of a Python library.

## Decision
Implement the core engine (Trie, Flight management, Serialization, Storage interfaces) in **Rust** and provide Python bindings using **PyO3**.

## Consequences
- **Positive**: Near-native performance for cache logic and data processing.
- **Positive**: Memory safety and strict concurrency guarantees.
- **Negative**: Build complexity increases (requires Rust toolchain and `maturin`).
- **Negative**: FFI overhead when crossing the boundary between Python and Rust.
