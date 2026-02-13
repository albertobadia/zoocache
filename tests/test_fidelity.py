import django
from django.conf import settings
import uuid
from decimal import Decimal
from datetime import datetime, date, timezone
import pytest
from django.db import connection, models
import zoocache
from zoocache.contrib.django import ZooCacheManager

# Setup settings for tests
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


class FidelityModel(models.Model):
    uuid_val = models.UUIDField(default=uuid.uuid4)
    decimal_val = models.DecimalField(max_digits=10, decimal_places=2)
    datetime_val = models.DateTimeField()
    date_val = models.DateField()
    json_val = models.JSONField(default=dict)

    objects = models.Manager()
    cached = ZooCacheManager()

    class Meta:
        app_label = "contenttypes"


@pytest.fixture(autouse=True)
def setup_db():
    zoocache.reset()
    zoocache.clear()
    with connection.schema_editor() as editor:
        editor.create_model(FidelityModel)
    yield
    with connection.schema_editor() as editor:
        editor.delete_model(FidelityModel)
    zoocache.reset()


def test_complex_types_roundtrip():
    dt = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    d = date(2023, 1, 1)
    u = uuid.uuid4()
    dec = Decimal("19.99")
    js = {"a": 1, "b": [2, 3]}

    obj = FidelityModel.objects.create(
        uuid_val=u, decimal_val=dec, datetime_val=dt, date_val=d, json_val=js
    )

    # First access to populate cache
    res1 = FidelityModel.cached.get(pk=obj.pk)
    assert res1.uuid_val == u
    assert res1.decimal_val == dec
    assert res1.datetime_val == dt
    assert res1.date_val == d
    assert res1.json_val == js

    # Simulate database change that wouldn't be seen if cache is used
    with connection.cursor() as cursor:
        cursor.execute("UPDATE contenttypes_fidelitymodel SET decimal_val = '0.00'")

    # Second access from cache
    res2 = FidelityModel.cached.get(pk=obj.pk)
    assert res2.uuid_val == u
    assert isinstance(res2.uuid_val, uuid.UUID)
    assert res2.decimal_val == dec
    assert isinstance(res2.decimal_val, Decimal)
    assert res2.datetime_val == dt
    assert isinstance(res2.datetime_val, datetime)
    assert res2.date_val == d
    assert isinstance(res2.date_val, date)
    assert res2.json_val == js
