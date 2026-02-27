"""
Test for Django M2M signal handler to verify correct kwargs usage.

This test ensures the fix for the bug where kwargs.get("model") was used
instead of kwargs.get("sender") for m2m_changed signals.
"""

import django
from django.conf import settings

if not settings.configured:
    settings.configure(
        DATABASES={
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": ":memory:",
            }
        },
        INSTALLED_APPS=["django.contrib.contenttypes"],
        DEFAULT_AUTO_FIELD="django.db.models.BigAutoField",
    )
    django.setup()

from unittest.mock import MagicMock, patch

import pytest
from django.db import connection, models

from zoocache.contrib.django.model import _invalidate_m2m


class ZooCacheM2MTag(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        app_label = "contenttypes"


class ZooCacheM2MPost(models.Model):
    title = models.CharField(max_length=100)
    tags = models.ManyToManyField(ZooCacheM2MTag)

    class Meta:
        app_label = "contenttypes"


@pytest.fixture(autouse=True)
def setup_db():
    with connection.schema_editor() as editor:
        editor.create_model(ZooCacheM2MTag)
        editor.create_model(ZooCacheM2MPost)
    yield
    with connection.schema_editor() as editor:
        editor.delete_model(ZooCacheM2MPost)
        editor.delete_model(ZooCacheM2MTag)


def test_m2m_signal_uses_sender_not_model():
    """
    Test that _invalidate_m2m uses kwargs.get('sender') not kwargs.get('model').

    The m2m_changed signal provides the related model via 'sender' kwarg, not 'model'.
    This test verifies the fix works correctly.
    """
    instance = ZooCacheM2MPost(title="Test Post")

    # Mock the _manager to capture what's invalidated
    with patch("zoocache.contrib.django.model._manager") as mock_manager:
        mock_core = MagicMock()
        mock_manager.get_core.return_value = mock_core

        # Simulate m2m_changed signal with sender=ZooCacheM2MTag (correct way)
        # The old buggy code used kwargs.get("model") which is always None
        # The fix uses kwargs.get("sender") which is the correct approach
        _invalidate_m2m(instance, sender=ZooCacheM2MTag, action="post_add")

        # This will fail with the old buggy code because kwargs.get("model") returns None
        mock_core.invalidate.assert_called()


def test_m2m_signal_invalidation_called():
    """
    Test that invalidate is called when M2M changes occur.
    """
    instance = ZooCacheM2MPost(title="Test")
    related_model = ZooCacheM2MTag

    with patch("zoocache.contrib.django.model._manager") as mock_manager:
        mock_core = MagicMock()
        mock_manager.get_core.return_value = mock_core

        # Call with sender present (as Django provides)
        _invalidate_m2m(instance, sender=related_model, action="post_add")

        # Verify invalidate was called at least once
        assert mock_core.invalidate.call_count >= 1
