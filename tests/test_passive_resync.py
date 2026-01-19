from zoocache._zoocache import Core


def test_passive_resync_with_redis():
    """
    Simulates two processes (Core A and Core B) sharing a Redis storage.
    Verifies that Core B 'catches up' to versions it missed by reading
    data from Redis that was written by another process.
    """
    redis_url = "redis://127.0.0.1:6379/0"

    # Core A and Core B share storage, but have SEPARATE internal Tries
    core_a = Core(storage_url=redis_url)
    core_b = Core(storage_url=redis_url)

    core_a.clear()  # Clean start

    # 1. Core A invalidates a tag to get a high timestamp
    core_a.invalidate("user:123")
    v_high = core_a.tag_version("user:123")
    assert v_high > 0

    # 2. Core A caches something. The entry in Redis will have v_high.
    key = "test_key"
    data = {"foo": "bar"}
    tags = ["user:123"]
    core_a.set(key, data, tags)

    # 3. Core B (which has user:123 at version 0) reads the key.
    # It should catch up to v_high.
    assert core_b.tag_version("user:123") == 0

    val_b = core_b.get(key)
    assert val_b == data

    # CRITICAL: Core B's internal Trie should have caught up to v_high!
    assert core_b.tag_version("user:123") == v_high


def test_passive_resync_invalidation_discovery():
    """
    Verifies that if Core B reads an entry that was invalidated in Core A,
    Core B discovers the invalidation.
    """
    redis_url = "redis://127.0.0.1:6379/0"
    core_a = Core(storage_url=redis_url)
    core_b = Core(storage_url=redis_url)
    core_a.clear()

    # 1. Store at v0
    core_a.set("k1", "v1", ["tag1"])
    assert core_b.get("k1") == "v1"

    # 2. Invalidate at v_new
    core_a.invalidate("tag1")
    v_new = core_a.tag_version("tag1")

    # 3. Core A sets new value (this happens in real apps often)
    # Redis now has an entry for k1 with tag1=v_new
    core_a.set("k1", "v2", ["tag1"])

    # 4. Core B reads. It should see v_new and update its Trie.
    assert core_b.get("k1") == "v2"
    assert core_b.tag_version("tag1") == v_new
