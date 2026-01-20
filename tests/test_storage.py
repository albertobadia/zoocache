from zoocache import cacheable, invalidate


def test_large_data_objects():
    large_data = {f"key_{i}": list(range(100)) for i in range(100)}

    @cacheable(deps=["large"])
    def get_large():
        return large_data

    get_large()

    fetched = get_large()
    assert fetched == large_data

    invalidate("large")
    get_large()


def test_various_types():
    @cacheable(deps=["types"])
    def get_value(val):
        return val

    assert get_value(42) == 42
    assert get_value("string") == "string"
    assert get_value([1, 2, 3]) == [1, 2, 3]
    assert get_value({"a": 1}) == {"a": 1}
    assert get_value(None) is None
