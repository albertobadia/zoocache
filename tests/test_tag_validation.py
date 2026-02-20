import pytest

from zoocache import InvalidTag, cacheable, configure, invalidate, reset


def test_tag_validation_simple():
    reset()
    configure()  # Default InMemory

    # Valid tags
    invalidate("valid_tag")
    invalidate("tag:with:colons")
    invalidate("tag123")

    # Invalid tags
    with pytest.raises(InvalidTag) as excinfo:
        invalidate("tag|with|pipe")
    assert "Invalid character '|'" in str(excinfo.value)

    with pytest.raises(InvalidTag):
        invalidate("tag spaces")

    with pytest.raises(InvalidTag):
        invalidate("")


def test_dependency_validation():
    reset()
    configure()

    @cacheable(deps=["valid_dep", "another:valid"])
    def get_data():
        return 42

    assert get_data() == 42

    @cacheable(deps=["invalid|dep"])
    def get_bad_data():
        return 0

    with pytest.raises(InvalidTag):
        get_bad_data()


if __name__ == "__main__":
    pytest.main([__file__])
