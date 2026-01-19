# ADR 0004: Serialization Strategy (MsgPack + LZ4 + Streaming)

## Status
Accepted

## Context
Serializing Python objects to disk or over the network is often a bottleneck. Standard JSON or Pickle are either slow or insecure/bulky.

## Decision
1. Use **MsgPack** for binary efficiency.
2. Use **LZ4** for ultra-fast compression.
3. Use **serde-transcode** to stream MsgPack directly to Python objects via `pythonize`, avoiding intermediate Rust allocations.

## Consequences
- **Positive**: Extremely low serialization/deserialization latency.
- **Positive**: Reduced storage footprint.
- **Negative**: Dependency on `lz4_flex` and `rmp_serde` crates.
- **Negative**: Limited to types supported by `pythonize` (mostly standard JSON-like types).
