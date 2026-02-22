# ruff: noqa: E501, E701
import asyncio
import os
import platform
import shutil
import subprocess
import time

from cashews import cache as cashews_cache
from diskcache import Cache as DiskCache

from zoocache import (
    clear as zc_clear,
    clear_async as zc_clear_async,
    configure,
    get as zc_get,
    get_async as zc_get_async,
    invalidate as zc_inv,
    invalidate_async as zc_inv_async,
    reset as zc_reset,
    set as zc_set,
    set_async as zc_set_async,
)
from zoocache._zoocache import Core

NUM_ITEMS = 5000
TAG = "semantic_tag"
REDIS_URL = "redis://localhost:6379/2"


def get_hardware_info():
    try:
        import psutil

        system = platform.system()
        cpu = platform.processor()
        if system == "Darwin":
            try:
                cpu = subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"], text=True).strip()
            except Exception:
                pass
        elif system == "Linux":
            try:
                line = subprocess.check_output("lscpu | grep 'Model name'", shell=True, text=True)
                cpu = line.split(":")[1].strip()
            except Exception:
                pass

        ram_gb = round(psutil.virtual_memory().total / (1024**3))
        return f"{cpu} | {ram_gb} GB RAM | {system}"
    except Exception:
        return "Unknown Hardware"


async def bench_cashews(backend="mem"):
    if backend == "redis":
        cashews_cache.setup(REDIS_URL)
    else:
        cashews_cache.setup("mem://")
    for i in range(100):
        await cashews_cache.set(f"warm_{i}", "1")
        await cashews_cache.get(f"warm_{i}")

    w_times, r_times, i_times = [], [], []
    for _ in range(3):
        await cashews_cache.clear()

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            await cashews_cache.set(f"cas_ch_{i}", "val", tags=[TAG])
        w_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            await cashews_cache.get(f"cas_ch_{i}")
        r_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        await cashews_cache.delete_tags(TAG)
        i_times.append((time.perf_counter() - t0) * 1000)

    return sum(w_times) / 3, sum(r_times) / 3, sum(i_times) / 3


def bench_diskcache():
    path = "/tmp/dc_comp_test"
    if os.path.exists(path):
        shutil.rmtree(path)
    dc = DiskCache(path)
    dc.clear()
    for i in range(100):
        dc.set(f"warm_{i}", "1")
        dc.get(f"warm_{i}")

    w_times, r_times, i_times = [], [], []
    for _ in range(3):
        if os.path.exists(path):
            shutil.rmtree(path)
        dc = DiskCache(path)

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            dc.set(f"dc_{i}", "val", tag=TAG)
        w_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            dc.get(f"dc_{i}")
        r_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        dc.evict(TAG)
        i_times.append((time.perf_counter() - t0) * 1000)

    return sum(w_times) / 3, sum(r_times) / 3, sum(i_times) / 3


async def bench_zoocache_propagation():
    """
    Measure real invalidation propagation latency between two ZooCache nodes.

    This benchmark creates two separate nodes connected to the same Redis:
    - Node 1 (primary): Performs invalidations
    - Node 2 (secondary): Receives invalidations via Redis pub/sub

    Measures the time from invalidation on Node 1 until Node 2 receives it.
    """
    zc_reset()

    # Node 1: Primary node that performs invalidations
    configure(storage_url=REDIS_URL, bus_url=REDIS_URL, prefix="bench_prop")
    await zc_clear_async()

    # Node 2: Secondary node that only receives invalidations
    node2 = Core(storage_url=REDIS_URL, bus_url=REDIS_URL, prefix="bench_prop", node_id="node2")

    # Wait for node2's Redis subscriber to be ready
    await asyncio.sleep(0.5)

    # Warm up both nodes and verify propagation works
    for i in range(100):
        await zc_set_async(f"warm_{i}", b"1")
        await zc_get_async(f"warm_{i}")

    # Verify propagation is working before measuring
    test_tag = "test_propagation_verify"
    initial = node2.get_tag_version(test_tag)
    await zc_inv_async(test_tag)
    await asyncio.sleep(0.1)  # Wait for propagation
    final = node2.get_tag_version(test_tag)
    print(f"  Propagation verify: {initial} -> {final}")
    if final == initial:
        print("  WARNING: Propagation not working, Redis pub/sub may not be connected")

    propagation_times = []

    for iteration in range(3):
        await zc_clear_async()

        # Write items with tag
        for i in range(NUM_ITEMS):
            await zc_set_async(f"zc_{i}", b"val", deps=[TAG])

        # Get initial version on node 2
        initial_version = node2.get_tag_version(TAG)
        print(f"  Iteration {iteration + 1}: Initial version on node2 = {initial_version}")

        # Invalidate on node 1 and measure propagation to node 2
        t0 = time.perf_counter()
        await zc_inv_async(TAG)

        # Poll node 2 until it receives the invalidation (with timeout)
        timeout_secs = 5.0
        while True:
            current_version = node2.get_tag_version(TAG)
            if current_version > initial_version:
                elapsed = (time.perf_counter() - t0) * 1000
                propagation_times.append(elapsed)
                print(
                    f"  Iteration {iteration + 1}: Received! {initial_version} -> {current_version} in {elapsed:.2f}ms"
                )
                break
            if (time.perf_counter() - t0) > timeout_secs:
                propagation_times.append(timeout_secs * 1000)  # Timeout
                print(f"  Iteration {iteration + 1}: TIMEOUT after {timeout_secs}s")
                break
            await asyncio.sleep(0.0001)  # 0.1ms polling interval

    return sum(propagation_times) / len(propagation_times)


def bench_zoocache(storage_url=None):
    zc_reset()
    if storage_url:
        configure(storage_url=storage_url, prefix="bench")
    else:
        configure(prefix="bench")
    zc_clear()
    for i in range(100):
        zc_set(f"warm_{i}", b"1")
        zc_get(f"warm_{i}")

    w_times, r_times, i_times = [], [], []
    for _ in range(3):
        zc_clear()

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            zc_set(f"zc_{i}", b"val", deps=[TAG])
        w_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            zc_get(f"zc_{i}")
        r_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        zc_inv(TAG)
        i_times.append((time.perf_counter() - t0) * 1000)

    return sum(w_times) / 3, sum(r_times) / 3, sum(i_times) / 3


async def bench_zoocache_async(storage_url=None, bus_url=None):
    zc_reset()
    if storage_url:
        configure(storage_url=storage_url, bus_url=bus_url, prefix="bench")
    else:
        configure(prefix="bench")
    await zc_clear_async()
    for i in range(100):
        await zc_set_async(f"warm_{i}", b"1")
        zc_get(f"warm_{i}")

    w_times, r_times, i_times = [], [], []
    for _ in range(3):
        await zc_clear_async()

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            await zc_set_async(f"zc_{i}", b"val", deps=[TAG])
        w_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        for i in range(NUM_ITEMS):
            zc_get(f"zc_{i}")
        r_times.append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        await zc_inv_async(TAG)
        i_times.append((time.perf_counter() - t0) * 1000)

    return sum(w_times) / 3, sum(r_times) / 3, sum(i_times) / 3


def generate_svg(results, title, output_path, theme="dark"):
    # results = { "Lib (Store)": (w, r, i), ... }

    # Categorize items
    local_libs = []
    redis_libs = []
    for lib in results.keys():
        if "Redis" in lib:
            redis_libs.append(lib)
        else:
            local_libs.append(lib)

    # Sections: (Title, Libs, MetricIdx)
    sections = [
        ("Write Latency (Redis)", redis_libs, 0),
        ("Read Latency (Redis)", redis_libs, 1),
        ("Semantic Invalidation Latency (Redis)", redis_libs, 2),
        ("Write Latency (Local)", local_libs, 0),
        ("Read Latency (Local)", local_libs, 1),
        ("Semantic Invalidation Latency (Local)", local_libs, 2),
    ]

    width = 830
    margin = 40
    bar_height = 22
    group_padding = 45

    total_sections_height = 0
    visible_sections = []
    for op_name, libs, idx in sections:
        if not libs:
            continue
        visible_sections.append((op_name, libs, idx))
        total_sections_height += 25 + (len(libs) * bar_height)

    if visible_sections:
        total_sections_height += (len(visible_sections) - 1) * group_padding

    svg_height = margin + total_sections_height + margin

    if theme == "dark":
        bg = "#000000"
        text = "#E0E0E0"
        grid = "#333333"
        zc_color = "#FF9800"
        other_color = "#555555"
    else:
        bg = "#FFFFFF"
        text = "#3E2723"
        grid = "#E0E0E0"
        zc_color = "#E65100"
        other_color = "#BDBDBD"

    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{svg_height}" viewBox="0 0 {width} {svg_height}">',
        "  <style>",
        f"    .op-title {{ font-family: sans-serif; font-size: 16px; font-weight: bold; fill: {zc_color}; }}",
        "    .better-label { font-family: sans-serif; font-size: 11px; font-style: italic; fill: #888; }",
        f"    .axis-label {{ font-family: monospace; font-size: 11px; fill: {text}; }}",
        f"    .lib-label {{ font-family: sans-serif; font-size: 13px; fill: {text}; }}",
        f"    .zc-label {{ font-family: sans-serif; font-size: 13px; font-weight: bold; fill: {zc_color}; }}",
        "    .footer { font-family: sans-serif; font-size: 12px; fill: #888; }",
        "  </style>",
        f'  <rect width="{width}" height="{svg_height}" fill="{bg}" rx="15"/>',
    ]

    svg.append(
        f'  <text x="{width - margin}" y="40" class="better-label" text-anchor="end">Lower values denote lower latency (better)</text>'
    )

    chart_x = 180
    chart_w = width - chart_x - margin - 50
    current_y = margin

    for i, (op_name, libs, idx) in enumerate(visible_sections):
        scores = []
        for lib in libs:
            scores.append((lib, results[lib][idx]))
        scores.sort(key=lambda x: x[1])

        local_max = max(s[1] for s in scores)
        if local_max == 0:
            local_max = 1

        svg.append(f'  <text x="{margin}" y="{current_y}" class="op-title">{op_name}</text>')
        current_y += 15

        num_ticks = 4
        for j in range(num_ticks + 1):
            t = (local_max / num_ticks) * j
            x = chart_x + (j * chart_w / num_ticks)
            svg.append(
                f'  <line x1="{x}" y1="{current_y}" x2="{x}" y2="{current_y + (len(libs) * bar_height)}" stroke="{grid}" stroke-dasharray="2"/>'
            )
            svg.append(
                f'  <text x="{x}" y="{current_y + (len(libs) * bar_height) + 12}" class="axis-label" text-anchor="middle">{t:.1f}ms</text>'
            )

        for lib, val in scores:
            b_w = (val / local_max) * chart_w if local_max > 0 else 0
            if b_w < 3 and val > 0:
                b_w = 3
            if val <= 0.001 and val > 0:
                b_w = 2

            is_zc = "ZooCache" in lib
            color = zc_color if is_zc else other_color
            label_class = "zc-label" if is_zc else "lib-label"

            svg.append(
                f'  <text x="{margin}" y="{current_y + 15}" class="{label_class}" text-anchor="start">{lib}</text>'
            )
            svg.append(
                f'  <rect x="{chart_x}" y="{current_y + 2}" width="{b_w}" height="{bar_height - 4}" fill="{color}" rx="3">'
            )
            if is_zc:
                svg.append('    <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />')
            svg.append("  </rect>")

            val_str = f"{val:.4f}ms" if val < 0.01 else (f"{val:.2f}ms" if val < 10 else f"{int(val)}ms")
            svg.append(
                f'  <text x="{chart_x + b_w + 5}" y="{current_y + 15}" class="axis-label" style="fill: {color}; font-weight: bold;">{val_str}</text>'
            )

            current_y += bar_height

        if i < len(visible_sections) - 1:
            current_y += group_padding

    svg.append(f'  <text x="{margin}" y="{svg_height - 20}" class="footer">Hardware: {get_hardware_info()}</text>')
    svg.append("</svg>")

    with open(output_path, "w") as f:
        f.write("\n".join(svg))


def main():
    print("Running Comparison Benchmarks...")

    results = {}
    propagation_result = None

    print("- Cashews (Memory)")
    results["Cashews (Mem)"] = asyncio.run(bench_cashews("mem"))

    print("- Cashews (Redis)")
    results["Cashews (Redis)"] = asyncio.run(bench_cashews("redis"))

    print("- DiskCache (File)")
    results["DiskCache (File)"] = bench_diskcache()

    print("- ZooCache (Memory)")
    results["ZooCache (Mem)"] = bench_zoocache(None)

    print("- ZooCache (Redis)")
    results["ZooCache (Redis)"] = asyncio.run(bench_zoocache_async(REDIS_URL, REDIS_URL))

    print("- ZooCache (LMDB)")
    lmdb_path = "/tmp/zc_bench_lmdb"
    if os.path.exists(lmdb_path):
        shutil.rmtree(lmdb_path)
    results["ZooCache (LMDB)"] = bench_zoocache(f"lmdb://{lmdb_path}")

    print("- ZooCache (Redis Propagation)")
    propagation_result = asyncio.run(bench_zoocache_propagation())

    # Use propagation result for the main comparison if available
    if "ZooCache (Redis)" in results and propagation_result is not None:
        w, r, _ = results["ZooCache (Redis)"]
        results["ZooCache (Redis)"] = (w, r, propagation_result)

    generate_svg(results, "ZooCache Performance vs Alternatives", "benchmarks/reports/comparison-dark.svg", "dark")
    generate_svg(results, "ZooCache Performance vs Alternatives", "benchmarks/reports/comparison-light.svg", "light")

    print("\nBenchmark Complete.")
    for k, v in results.items():
        print(f"{k}: W={v[0]:.2f}ms, R={v[1]:.2f}ms, I={v[2]:.2f}ms")

    if propagation_result is not None:
        print(f"\nZooCache Redis Propagation Latency: {propagation_result:.2f}ms")
        print("  (Time from invalidation on Node 1 until received on Node 2 via Redis pub/sub)")


if __name__ == "__main__":
    main()
