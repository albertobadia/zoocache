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

import zoocache
from zoocache.contrib.django import ZooCacheManager

from .utils import simulated_latency


class BAuthor(models.Model):
    name = models.CharField(max_length=100)
    objects = models.Manager()
    cached = ZooCacheManager()

    class Meta:
        app_label = "contenttypes"


class BBook(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(BAuthor, on_delete=models.CASCADE)
    objects = models.Manager()
    cached = ZooCacheManager()

    class Meta:
        app_label = "contenttypes"


@pytest.fixture(scope="module", autouse=True)
def setup_django_bench():
    with connection.schema_editor() as editor:
        editor.create_model(BAuthor)
        editor.create_model(BBook)

    author = BAuthor.objects.create(name="Author")
    for i in range(100):
        BBook.objects.create(title=f"Book {i}", author=author)

    yield


def test_django_manager_baseline(benchmark):
    """Benchmark raw Django manager performance with simulated 5ms latency."""

    @simulated_latency(ms=5)
    def run():
        return list(BBook.objects.filter(title__startswith="Book"))

    benchmark(run)


def test_django_manager_count_baseline(benchmark):
    """Benchmark raw Django count performance with simulated 5ms latency."""

    @simulated_latency(ms=5)
    def run():
        return BBook.objects.filter(title__startswith="Book").count()

    benchmark(run)


def test_django_manager_join_baseline(benchmark):
    """Benchmark raw Django join performance with simulated 5ms latency."""

    @simulated_latency(ms=5)
    def run():
        return BBook.objects.filter(author__name="Author").count()

    benchmark(run)


def test_django_cached_hit(benchmark):
    """Benchmark ZooCacheManager hit performance (No latency added)."""
    # Populate cache
    list(BBook.cached.filter(title__startswith="Book"))

    def run():
        # This hits ZooCache, no simulated latency here
        return list(BBook.cached.filter(title__startswith="Book"))

    benchmark(run)


def test_django_cached_miss(benchmark):
    """Benchmark ZooCacheManager miss performance (includes simulated 5ms DB latency)."""

    def setup():
        zoocache.clear()

    @simulated_latency(ms=5)
    def run():
        # This misses ZooCache and hits the DB
        return list(BBook.cached.filter(title__startswith="Book"))

    benchmark.pedantic(run, setup=setup, rounds=10, iterations=1)


def test_django_cached_count_hit(benchmark):
    """Benchmark ZooCacheManager hit performance for .count()."""
    BBook.cached.filter(title__startswith="Book").count()

    def run():
        return BBook.cached.filter(title__startswith="Book").count()

    benchmark(run)


def test_django_complex_join_hit(benchmark):
    """Benchmark ZooCacheManager hit performance for queries with JOINs."""
    BBook.cached.filter(author__name="Author").count()

    def run():
        return BBook.cached.filter(author__name="Author").count()

    benchmark(run)
