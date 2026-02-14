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
from unittest.mock import MagicMock
from django.db import models, connection
from zoocache.contrib.django import cacheable_serializer, instance_tag
from zoocache import configure, reset, clear, get as zoo_get


class Person(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        app_label = "contenttypes"


class BaseSerializer:
    def __init__(self, instance=None, many=False):
        self.instance = instance
        self.many = many

    def to_representation(self, instance):
        return {"id": instance.pk, "name": instance.name}


@cacheable_serializer
class UserSerializer(BaseSerializer):
    class Meta:
        model = Person


@pytest.fixture(autouse=True)
def setup_db():
    reset()
    configure()
    clear()
    with connection.schema_editor() as editor:
        editor.create_model(Person)
    yield
    with connection.schema_editor() as editor:
        editor.delete_model(Person)
    reset()


def test_serializer_real_model_caching():
    obj = Person.objects.create(name="Alice")
    serializer = UserSerializer(instance=obj)
    res1 = serializer.to_representation(obj)
    assert res1 == {"id": obj.pk, "name": "Alice"}

    key = serializer._get_cache_key(obj)
    assert zoo_get(key) == res1
    with MagicMock(side_effect=lambda x: {"id": obj.pk, "name": "ERROR"}):
        from zoocache import set as zoo_set

        zoo_set(key, {"id": obj.pk, "name": "Cached Alice"}, [instance_tag(obj)])
        assert serializer.to_representation(obj)["name"] == "Cached Alice"


def test_serializer_invalidation_on_save():
    obj = Person.objects.create(name="Bob")
    serializer = UserSerializer(instance=obj)

    serializer.to_representation(obj)
    key = serializer._get_cache_key(obj)
    assert zoo_get(key) is not None

    obj.name = "Bob Updated"
    obj.save()

    assert zoo_get(key) is None
    assert serializer.to_representation(obj)["name"] == "Bob Updated"
