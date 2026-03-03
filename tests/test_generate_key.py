import pytest

from zoocache.core import _generate_key


class NonSerializable:
    def __init__(self):
        self.data = "test"


def test_generate_key_with_serializable_args():
    def sample_func(x, y):
        return x + y

    key1 = _generate_key(sample_func, "namespace", (1, 2), {})
    key2 = _generate_key(sample_func, "namespace", (1, 2), {})
    key3 = _generate_key(sample_func, "namespace", (3, 4), {})

    assert key1 == key2
    assert key1 != key3


def test_generate_key_with_kwargs():
    def sample_func(x, y):
        return x + y

    key1 = _generate_key(sample_func, None, (1,), {"y": 2})
    key2 = _generate_key(sample_func, None, (1,), {"y": 2})
    key3 = _generate_key(sample_func, None, (1,), {"y": 3})

    assert key1 == key2
    assert key1 != key3


def test_generate_key_kwargs_order_independent():
    def sample_func(x, y):
        return x + y

    key1 = _generate_key(sample_func, None, (1,), {"a": 2, "b": 3})
    key2 = _generate_key(sample_func, None, (1,), {"b": 3, "a": 2})

    assert key1 == key2


def test_generate_key_with_non_serializable_raises():
    def sample_func(x):
        return x

    obj = NonSerializable()

    with pytest.raises(ValueError, match="zoocache failed to serialize"):
        _generate_key(sample_func, None, (obj,), {})


def test_generate_key_with_complex_serializable():
    def sample_func(x):
        return x

    complex_data = {
        "nested": {"list": [1, 2, 3], "tuple": (4, 5)},
        "string": "hello",
        "number": 42,
        "float": 3.14,
        "bool": True,
        "none": None,
    }

    key = _generate_key(sample_func, "complex", (complex_data,), {})
    assert key is not None
    assert len(key) > 0
