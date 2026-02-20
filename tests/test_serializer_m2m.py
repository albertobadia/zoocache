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

from zoocache import clear, configure, get as zoo_get, reset
from zoocache.contrib.django import cacheable_serializer


# Models for M2M test
class M2MTag(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        app_label = "contenttypes"


class M2MPost(models.Model):
    title = models.CharField(max_length=100)
    tags = models.ManyToManyField(M2MTag)

    class Meta:
        app_label = "contenttypes"


class BaseSerializer:
    def __init__(self, instance=None, many=False):
        self.instance = instance
        self.many = many

    def to_representation(self, instance):
        return {
            "id": instance.pk,
            "title": instance.title,
            "tags": [t.name for t in instance.tags.all()],
        }


@cacheable_serializer
class PostSerializer(BaseSerializer):
    class Meta:
        model = M2MPost


@pytest.fixture(autouse=True)
def setup_db():
    reset()
    configure()
    clear()
    with connection.schema_editor() as editor:
        editor.create_model(M2MTag)
        editor.create_model(M2MPost)
    yield
    with connection.schema_editor() as editor:
        editor.delete_model(M2MPost)
        editor.delete_model(M2MTag)
    reset()


def test_serializer_m2m_invalidation():
    post = M2MPost.objects.create(title="Hello M2M")
    tag1 = M2MTag.objects.create(name="tag1")
    post.tags.add(tag1)

    serializer = PostSerializer(instance=post)

    # 1. Warm up cache
    res1 = serializer.to_representation(post)
    assert res1["tags"] == ["tag1"]

    # Check key exists
    key = serializer._get_cache_key(post)
    assert zoo_get(key) is not None

    # 2. Add another tag -> should invalidate
    tag2 = M2MTag.objects.create(name="tag2")
    post.tags.add(tag2)

    # Should be None now thanks to M2M signal
    assert zoo_get(key) is None

    # 3. Fresh representation
    res2 = serializer.to_representation(post)
    assert "tag2" in res2["tags"]
    assert zoo_get(key) is not None

    # 4. Remove tag -> should invalidate
    post.tags.remove(tag1)
    assert zoo_get(key) is None

    res3 = serializer.to_representation(post)
    assert res3["tags"] == ["tag2"]
