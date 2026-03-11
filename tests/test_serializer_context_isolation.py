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

import pytest
from django.db import connection, models

from zoocache import clear, configure, reset
from zoocache.contrib.django import cacheable_serializer


class ContextPerson(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        app_label = "contenttypes"


class _ContextAwareBaseSerializer:
    def __init__(self, instance=None, many=False, context=None):
        self.instance = instance
        self.many = many
        self.context = context or {}

    def to_representation(self, instance):
        role = self.context.get("role", "user")
        payload = {"id": instance.pk, "name": instance.name}
        if role == "admin":
            payload["secret"] = "only-admin"
        return payload


@cacheable_serializer
class ContextAwareSerializer(_ContextAwareBaseSerializer):
    class Meta:
        model = ContextPerson


@pytest.fixture(autouse=True)
def setup_db():
    reset()
    configure(prefix="serializer_ctx")
    clear()
    with connection.schema_editor() as editor:
        editor.create_model(ContextPerson)
    yield
    with connection.schema_editor() as editor:
        editor.delete_model(ContextPerson)
    reset()


def test_serializer_cache_key_must_isolate_contextual_output():
    person = ContextPerson.objects.create(name="Alice")

    admin = ContextAwareSerializer()
    admin.context = {"role": "admin"}
    user = ContextAwareSerializer()
    user.context = {"role": "user"}

    assert admin._get_cache_key(person) != user._get_cache_key(person)

    admin_payload = admin.to_representation(person)
    assert "secret" in admin_payload

    user_payload = user.to_representation(person)
    assert "secret" not in user_payload
