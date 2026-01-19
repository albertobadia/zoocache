from zoocache import cacheable, invalidate, add_deps


def test_basic_invalidation():
    calls = []

    @cacheable(namespace="users", deps=lambda uid: [f"user:{uid}"])
    def get_user_profile(uid: int):
        calls.append(uid)
        return {"id": uid, "name": f"User {uid}"}

    get_user_profile(1)
    get_user_profile(2)
    assert len(calls) == 2

    get_user_profile(1)
    assert len(calls) == 2

    invalidate("user:1")

    get_user_profile(1)
    assert len(calls) == 3
    get_user_profile(2)
    assert len(calls) == 3


def test_prefix_invalidation():
    calls = []

    @cacheable(deps=["org:1:user:1"])
    def fetch_scoped_data():
        calls.append(1)
        return "scoped"

    fetch_scoped_data()
    assert len(calls) == 1
    fetch_scoped_data()
    assert len(calls) == 1

    invalidate("org:1")

    fetch_scoped_data()
    assert len(calls) == 2


def test_add_deps_at_runtime():
    calls = []

    @cacheable()
    def my_dynamic(x):
        calls.append(x)
        add_deps([f"tag:{x}"])
        return x

    my_dynamic(10)
    assert len(calls) == 1
    my_dynamic(10)
    assert len(calls) == 1

    invalidate("tag:10")
    my_dynamic(10)
    assert len(calls) == 2


def test_nested_cacheable_independent():
    calls = {"child": 0, "parent": 0}

    @cacheable(deps=["child_tag"])
    def child():
        calls["child"] += 1
        return "child_data"

    @cacheable(deps=["parent_tag"])
    def parent():
        calls["parent"] += 1
        return child()

    parent()
    assert calls["parent"] == 1
    assert calls["child"] == 1

    invalidate("child_tag")

    parent()
    assert calls["parent"] == 1
    assert calls["child"] == 1
