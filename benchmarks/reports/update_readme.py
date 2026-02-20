import json
import os


def format_time(ns):
    if ns < 1000:
        return f"{ns:.2f} ns"
    if ns < 1_000_000:
        return f"{ns / 1000:.2f} µs"
    if ns < 1_000_000_000:
        return f"{ns / 1_000_000:.2f} ms"
    return f"{ns / 1_000_000_000:.2f} s"


def format_ops(ops):
    if ops >= 1_000_000:
        return f"{ops / 1_000_000:.2f}M"
    if ops >= 1_000:
        return f"{ops / 1_000:.2f}K"
    return f"{ops:.0f}"


def generate_report():
    json_path = "benchmarks/output.json"
    hardware_path = "benchmarks/reports/hardware.md"
    results_path = "benchmarks/reports/benchmarks_summary.md"

    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found")
        return

    with open(json_path) as f:
        data = json.load(f)

    benchmarks = data.get("benchmarks", [])

    targets = {
        "test_hit_latency": "Core Hit Latency",
        "test_invalidation_efficiency_prefix": "Prefix Invalidation (1k)",
        "test_massive_dependencies_get": "Scaling (10k deps)",
        "test_thundering_herd": "SingleFlight Protection",
        "test_deep_hierarchy_validation": "Deep Hierarchy (15 lvls)",
        "test_high_concurrency_throughput": "Max Throughput (Concurrent)",
        "test_django_cached_count_hit": "Django Count Speedup",
        "test_django_cached_hit": "Django Hit Overhead",
    }

    descriptions = {
        "Core Hit Latency": "Time to retrieve a single cached value (In-Memory).",
        "Prefix Invalidation (1k)": "Time to invalidate 1,000 keys using a prefix-based tag.",
        "Scaling (10k deps)": "Read latency when a single key depends on 10,000 different tags.",
        "SingleFlight Protection": "Prevents 'thundering herd' by coalescing concurrent expensive requests.",
        "Deep Hierarchy (15 lvls)": "Validation overhead for keys with deep nested dependencies.",
        "Max Throughput (Concurrent)": "Total operations per second under heavy parallel load (200 threads).",
        "Django Count Speedup": "Performance gain of .count() via cache vs raw DB QuerySet.",
        "Django Hit Overhead": "Total time to reconstruct a Django QuerySet from cache.",
    }

    perf_rows = [
        "| Metric | Mean | Min | Max | Median | StdDev |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |",
    ]

    found_targets = []
    for b in benchmarks:
        fullname = b["fullname"]
        name_only = fullname.split("::")[-1]

        match_key = None
        if name_only in targets:
            match_key = name_only
        else:
            base_name = name_only.split("[")[0]
            if base_name in targets:
                if ("10000" in name_only) or ("200" in name_only):
                    match_key = base_name

        if match_key:
            label = targets[match_key]
            found_targets.append(label)
            stats = b["stats"]

            mean_ns = stats["mean"] * 1_000_000_000
            min_ns = stats["min"] * 1_000_000_000
            max_ns = stats["max"] * 1_000_000_000
            median_ns = stats["median"] * 1_000_000_000
            stddev_ns = stats["stddev"] * 1_000_000_000

            if match_key == "test_high_concurrency_throughput":
                ops = 1000.0 / stats["mean"]
                min_ops = 1000.0 / stats["max"]
                max_ops = 1000.0 / stats["min"]
                med_ops = 1000.0 / stats["median"]
                perf_rows.append(
                    f"| {label} | {format_ops(ops)} ops/s | {format_ops(min_ops)} | "
                    f"{format_ops(max_ops)} | {format_ops(med_ops)} | - |"
                )
            else:
                perf_rows.append(
                    f"| {label} | {format_time(mean_ns)} | {format_time(min_ns)} | "
                    f"{format_time(max_ns)} | {format_time(median_ns)} | {format_time(stddev_ns)} |"
                )

    hw_rows = []
    if os.path.exists(hardware_path):
        with open(hardware_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("- **"):
                    parts = line.replace("- **", "").replace("**", "").split(":", 1)
                    if len(parts) == 2:
                        key, val = parts
                        hw_rows.append(f"| {key.strip()} | {val.strip()} |")

    desc_rows = [
        "",
        "#### Metrics Explanation",
        "| Metric | What it measures |",
        "| :--- | :--- |",
    ]
    for label in targets.values():
        if label in found_targets:
            desc_rows.append(f"| {label} | {descriptions[label]} |")

    new_content = "\n".join(
        ["#### Latest Performance Run", ""]
        + perf_rows
        + hw_rows
        + desc_rows
        + [
            "",
            "> [!NOTE]",
            "> Django benchmarks include a **5ms simulated DB latency** to represent real-world network/IO conditions.",
            "",
            f"*Last automated update: {data['datetime']}*",
        ]
    )

    os.makedirs(os.path.dirname(results_path), exist_ok=True)
    with open(results_path, "w") as f:
        f.write(new_content)

    print(f"Successfully generated {results_path}")


if __name__ == "__main__":
    generate_report()
