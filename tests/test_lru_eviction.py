from zoocache import cacheable, configure, _reset


def test_eviction_triggers_at_max():
    _reset()
    configure(max_entries=10)

    call_count = {"value": 0}

    @cacheable(deps=lambda i: [f"item:{i}"])
    def get_item(i):
        call_count["value"] += 1
        return {"id": i, "data": f"value_{i}"}

    for i in range(15):
        get_item(i)

    assert call_count["value"] == 15

    for i in range(15):
        get_item(i)

    assert call_count["value"] > 15


def test_lru_evicts_oldest_entries():
    import time

    _reset()
    configure(max_entries=5)

    call_count = {"value": 0}

    @cacheable(deps=lambda i: [f"item:{i}"])
    def get_item(i):
        call_count["value"] += 1
        return i

    for i in range(5):
        get_item(i)
        time.sleep(0.01)
    assert call_count["value"] == 5

    time.sleep(0.02)
    get_item(0)
    assert call_count["value"] == 5

    time.sleep(0.02)
    get_item(5)
    get_item(6)

    old_count = call_count["value"]

    get_item(0)
    assert call_count["value"] <= old_count + 1


def test_eviction_with_lmdb():
    _reset()
    import os
    import shutil

    path = "./test_lru_lmdb"
    if os.path.exists(path):
        shutil.rmtree(path)

    configure(storage_url=f"lmdb://{path}", max_entries=10)

    @cacheable(deps=lambda i: [f"item:{i}"])
    def get_item(i):
        return {"id": i}

    for i in range(15):
        get_item(i)

    for i in range(5):
        result = get_item(i)
        assert result["id"] == i

    if os.path.exists(path):
        shutil.rmtree(path)
