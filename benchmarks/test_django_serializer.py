import time

import django
from django.conf import settings

# 1. Setup Django
if not settings.configured:
    settings.configure(
        DEBUG=False,
        DATABASES={
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": ":memory:",
            }
        },
        INSTALLED_APPS=[
            "django.contrib.contenttypes",
            "django.contrib.auth",
            "rest_framework",
        ],
        SECRET_KEY="bench-key",
    )
    django.setup()

from django.db import connection, models
from rest_framework import serializers

from zoocache import clear, configure, reset
from zoocache.contrib.django import cacheable_serializer


# 2. Models
class Author(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        app_label = "contenttypes"


class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(Author, related_name="books", on_delete=models.CASCADE)

    class Meta:
        app_label = "contenttypes"


# 3. Serializers
class NormalBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title"]


class NormalAuthorSerializer(serializers.ModelSerializer):
    books = NormalBookSerializer(many=True, read_only=True)

    class Meta:
        model = Author
        fields = ["id", "name", "books"]


@cacheable_serializer
class CachedBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title"]


@cacheable_serializer
class CachedAuthorSerializer(serializers.ModelSerializer):
    books = CachedBookSerializer(many=True, read_only=True)

    class Meta:
        model = Author
        fields = ["id", "name", "books"]


# 4. Benchmarking
def run_benchmark():
    reset()
    configure()
    clear()

    with connection.schema_editor() as editor:
        editor.create_model(Author)
        editor.create_model(Book)

    # Generate Data
    print("Generating data (100 authors, 10 books each)...")
    authors = []
    for i in range(100):
        author = Author.objects.create(name=f"Author {i}")
        authors.append(author)
        for j in range(10):
            Book.objects.create(title=f"Book {i}-{j}", author=author)

    def measure(label, func, iterations=5):
        # Warmup
        func()

        start = time.perf_counter()
        for _ in range(iterations):
            func()
        end = time.perf_counter()
        avg = (end - start) / iterations
        print(f"{label:40}: {avg * 1000:8.2f} ms")
        return avg

    print("\n--- Benchmark Results (Average of 5 runs) ---\n")

    # Single Author (with nested books)
    author = Author.objects.get(id=1)

    def normal_single():
        return NormalAuthorSerializer(author).data

    def cached_single():
        return CachedAuthorSerializer(author).data

    t_norm_s = measure("Single Author (Normal)", normal_single)
    t_cach_s = measure("Single Author (Cached)", cached_single)
    print(f"Speedup: {t_norm_s / t_cach_s:.1f}x")

    # List of Authors (many=True)
    author_qs = Author.objects.all()

    def normal_list():
        # Force evaluation
        return list(NormalAuthorSerializer(author_qs, many=True).data)

    def cached_list():
        # This uses Zero-SQL optimization
        return list(CachedAuthorSerializer(author_qs, many=True).data)

    print("-" * 50)
    t_norm_l = measure("List of 100 Authors (Normal)", normal_list)
    t_cach_l = measure("List of 100 Authors (Cached)", cached_list)
    print(f"Speedup: {t_norm_l / t_cach_l:.1f}x")


if __name__ == "__main__":
    run_benchmark()
