#### Latest Performance Run

| Metric | Mean | Min | Max | Median | StdDev |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Core Hit Latency | 1.45 µs | 1.33 µs | 9.71 µs | 1.42 µs | 498.84 ns |
| SingleFlight Protection | 107.23 ms | 105.99 ms | 108.80 ms | 106.76 ms | 1.25 ms |
| Prefix Invalidation (1k) | 996.24 ns | 665.98 ns | 8.96 µs | 750.01 ns | 934.99 ns |
| Django Hit Overhead | 342.83 µs | 292.87 µs | 1.02 ms | 301.92 µs | 110.16 µs |
| Django Count Speedup | 61.37 µs | 57.42 µs | 138.17 µs | 59.38 µs | 6.20 µs |
| Scaling (10k deps) | 1.43 µs | 1.36 µs | 11.76 µs | 1.42 µs | 130.64 ns |
| Max Throughput (Concurrent) | 120.33K ops/s | 119.03K | 121.16K | 120.61K | - |
| Deep Hierarchy (15 lvls) | 1.42 µs | 1.37 µs | 21.90 µs | 1.42 µs | 143.46 ns |
| CPU | Apple M1 |
| Cores | 8 |
| Memory | 8 GB |
| OS | Darwin arm64 |

#### Metrics Explanation
| Metric | What it measures |
| :--- | :--- |
| Core Hit Latency | Time to retrieve a single cached value (In-Memory). |
| Prefix Invalidation (1k) | Time to invalidate 1,000 keys using a prefix-based tag. |
| Scaling (10k deps) | Read latency when a single key depends on 10,000 different tags. |
| SingleFlight Protection | Prevents 'thundering herd' by coalescing 50 simultaneous expensive requests into 1 DB call. |
| Deep Hierarchy (15 lvls) | Validation overhead for keys with deep nested dependencies. |
| Max Throughput (Concurrent) | Total operations per second under heavy parallel load (200 threads). |
| Django Count Speedup | Performance gain of .count() via cache vs raw DB QuerySet. |
| Django Hit Overhead | Total time to reconstruct a Django QuerySet from cache. |

> [!NOTE]
> Django benchmarks include a **5ms simulated DB latency** to represent real-world network/IO conditions.

*Last automated update: 2026-02-11T18:43:38.557355+00:00*