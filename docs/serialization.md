# Serialization & Compression

To achieve high throughput and low latency, Zoocache implements a specialized serialization pipeline in Rust.

## The Pipeline

![Serialization Pipeline](assets/serialization.svg)

### 1. MsgPack
We use MessagePack as the intermediate representation. It is more compact than JSON and faster to parse than Pickle for many common data structures.

### 2. LZ4 Compression
Before writing to the storage backend (LMDB, Redis, or RAM), data is compressed using LZ4. 
- **Why LZ4?**: It offers a very high decompression speed, which is critical for cache performance, while still providing decent compression ratios for JSON-like data.

### 3. `serde-transcode` Optimization
When reading from the cache, we use a technique called **streaming transcoding**. Instead of:
`Bytes -> MsgPack Value -> Rust Struct -> Python Object`

We do:
`Bytes -> Deserializer -> pythonize (via Transcoder) -> Python Object`

This avoids allocating temporary Rust structures for the cached data, significantly reducing the overhead of the FFI boundary.

## Trade-offs & Considerations
- **Compatibility**: We use `pythonize/depythonize`, which handles most standard Python types (dicts, lists, int, str, float, bool). However, custom classes or complex objects that aren't JSON-serializable might require custom handlers or won't work out of the box.
- **Compression Overhead**: LZ4 is fast, but for very small objects (e.g., a simple integer), the compression step might actually add a few nanoseconds of overhead that doesn't pay off in space savings.
