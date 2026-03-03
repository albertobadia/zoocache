from zoocache import configure, get_tag_version, invalidate, reset, set as set_cache


def test_get_tag_version_initial():
    reset()
    configure()

    version = get_tag_version("nonexistent_tag")
    assert version == 0


def test_get_tag_version_after_invalidation():
    reset()
    configure()

    initial_version = get_tag_version("test_tag")

    invalidate("test_tag")

    new_version = get_tag_version("test_tag")
    assert new_version > initial_version


def test_get_tag_version_multiple_invalidations():
    reset()
    configure()

    invalidate("multi_tag")
    v1 = get_tag_version("multi_tag")

    invalidate("multi_tag")
    v2 = get_tag_version("multi_tag")

    invalidate("multi_tag")
    v3 = get_tag_version("multi_tag")

    assert v1 < v2 < v3


def test_get_tag_version_different_tags():
    reset()
    configure()

    invalidate("tag_a")
    invalidate("tag_b")

    va = get_tag_version("tag_a")
    vb = get_tag_version("tag_b")

    assert va > 0
    assert vb > 0


def test_get_tag_version_with_set_cache():
    reset()
    configure()

    set_cache("key1", "value", deps=["mytag"])
    version_after_set = get_tag_version("mytag")
    assert version_after_set >= 0
