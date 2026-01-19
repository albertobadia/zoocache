"""
Zoocache Usage Demo
This script demonstrates the core features:
1. Basic @cacheable
2. Static & Dynamic dependencies
3. Hierarchical (Prefix) Invalidation
"""

import time
from zoocache import cacheable, invalidate, add_deps


# --- 1. Basic Caching ---
@cacheable(namespace="users")
def get_user_profile(user_id: int):
    print(f"  [DB] Fetching profile for user {user_id}...")
    time.sleep(0.5)  # Simulate latency
    return {"id": user_id, "name": f"User {user_id}", "status": "active"}


# --- 2. Hierarchical Dependencies ---
# Dependencies are "tags" that can be nested using ":"
# Invalidation follows prefixes: invalidating "org:1" will invalidate "org:1:user:X"
# You only need to list the most specific tag!
@cacheable(deps=lambda org_id, user_id: [f"org:{org_id}:user:{user_id}"])
def get_org_user_settings(org_id: int, user_id: int):
    print(f"  [DB] Fetching settings for org {org_id}, user {user_id}...")
    return {"theme": "dark", "notifications": True}


# --- 3. Dynamic Dependencies ---
@cacheable(deps=["global_settings"])
def compute_dashboard_stats():
    print("  [CALC] Computing expensive stats...")
    # Imagine we discover a dependency during execution
    # For example, we read a specific shared resource:
    add_deps(["resource:shared_pool"])
    return {"stats": [10, 20, 30]}


def run_demo():
    print("--- STEP 1: Basic Caching ---")
    start = time.time()
    p1 = get_user_profile(1)  # Miss
    print(f"Call 1 took: {time.time() - start:.2f}s")

    start = time.time()
    p2 = get_user_profile(1)  # Hit!
    print(f"Call 2 (Cached) took: {time.time() - start:.2f}s")
    assert p1 == p2

    print("\n--- STEP 2: Hierarchical Invalidation ---")
    # This depends on "org:1" AND "org:1:user:42"
    get_org_user_settings(1, 42)  # Save to cache

    print("Invalidating 'org:1:user:42' specifically...")
    invalidate("org:1:user:42")
    get_org_user_settings(1, 42)  # Miss (invalidated by specific tag)

    print("Invalidating 'org:1' (Nuclear Invalidation)...")
    get_org_user_settings(1, 42)  # Fill cache
    invalidate("org:1")  # This prefix matches "org:1:user:42"

    start = time.time()
    get_org_user_settings(1, 42)  # Miss! (Invalidated by parent)
    print("  The parent 'org:1' invalidated the child 'org:1:user:42' efficiently.")

    print("\n--- STEP 3: Dynamic Dependencies ---")
    compute_dashboard_stats()  # Miss

    print("Invalidating dynamic dependency 'resource:shared_pool'...")
    invalidate("resource:shared_pool")

    start = time.time()
    compute_dashboard_stats()  # Miss! (It remembered the dependency from add_deps)
    print("  The dynamic dependency was correctly tracked.")


if __name__ == "__main__":
    run_demo()
