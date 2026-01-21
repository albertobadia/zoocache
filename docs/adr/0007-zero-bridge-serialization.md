# ADR 0007: Zero-Bridge Serialization (Direct Python-to-MsgPack)

## Status
Accepted (Supersedes ADR 0004)

## Context
ADR 0004 used `serde_json` as a bridge between Python and MsgPack. This introduced unnecessary allocations, CPU overhead, and a dependency on JSON's type system limitations.

## Decision
1. **Eliminate `serde_json`**: Remove all intermediate JSON conversions.
2. **Direct Transcoding**: Use `serde-transcode` to stream directly between `pythonize` (Python objects) and `rmp_serde` (MsgPack bytes).
3. **Rust-native Hashing**: Key generation now uses the same transcode path to hash data directly from Python objects.

## Consequences
- **Positive**: Significantly lower latency at the Python-Rust boundary.
- **Positive**: Reduced binary size and dependency complexity by removing `serde_json`.
- **Positive**: Better support for binary data or types that might be lossy in JSON.
- **Negative**: Tight coupling between `pythonize`, `rmp-serde`, and `serde-transcode`.
