from zoocache.context import DepsTracker, add_deps, get_current_deps


def test_deps_tracker_context_manager():
    tracker = DepsTracker()

    assert get_current_deps() is None

    with tracker as t:
        assert get_current_deps() is t.deps
        assert isinstance(get_current_deps(), set)

    assert get_current_deps() is None


def test_deps_tracker_accumulates_deps():
    tracker = DepsTracker()

    with tracker:
        add_deps(["tag1", "tag2"])
        assert "tag1" in tracker.deps
        assert "tag2" in tracker.deps


def test_deps_tracker_nested():
    tracker1 = DepsTracker()
    tracker2 = DepsTracker()

    with tracker1:
        add_deps(["tag1"])
        with tracker2:
            add_deps(["tag2"])
            assert "tag1" in tracker1.deps
            assert "tag2" in tracker2.deps
        assert "tag2" in tracker2.deps


def test_get_current_deps_no_context():
    assert get_current_deps() is None


def test_add_deps_without_context():
    add_deps(["tag1"])
