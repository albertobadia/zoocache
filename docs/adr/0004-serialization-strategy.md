# ADR 0004: Serialization Strategy (MsgPack + LZ4 + Streaming)

## Status
Superseded by [ADR 0007](0007-zero-bridge-serialization.md)

## Context
Serializing Python objects to disk or over the network is often a bottleneck. Standard JSON or Pickle are either slow or insecure/bulky.

## Decision
1. Use **MsgPack** for binary efficiency.
2. Use **LZ4** for ultra-fast compression.
3. Use **Zero-Bridge Serialization**: Direct Python-to-MsgPack transcoding via `serde-transcode`, removing `serde_json` and avoiding intermediate Rust/JSON allocations during both read and write.

## Consequences
- **Positive**: Extremely low serialization/deserialization latency.
- **Positive**: Reduced storage footprint.
- **Negative**: Dependency on `lz4_flex` and `rmp_serde` crates.
- **Negative**: Limited to types supported by `pythonize` (mostly standard JSON-like types).
