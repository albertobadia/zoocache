import django
from django.conf import settings

# 1. Setup Django with DRF support
if not settings.configured:
    settings.configure(
        DEBUG=True,
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
        SECRET_KEY="secret-key-for-examples",
    )
    django.setup()

from django.db import connection, models
from rest_framework import serializers

from zoocache import clear, configure
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


# 3. Real DRF Serializers
@cacheable_serializer
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title"]


@cacheable_serializer
class AuthorDetailSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Author
        fields = ["name", "books"]

    def to_representation(self, instance):
        print(f"--- [DEBUG] Serializing Author: {instance.name} (Computing representation) ---")
        return super().to_representation(instance)


# 4. Scenario
def run_drf_example():
    # Configure ZooCache to use memory
    configure()
    clear()

    # Create database tables
    with connection.schema_editor() as editor:
        editor.create_model(Author)
        editor.create_model(Book)

    # Data
    author = Author.objects.create(name="J.K. Rowling")
    Book.objects.create(title="Harry Potter and the Philosopher's Stone", author=author)

    print("\n1. Initial Serialization (Cache MISS):")
    ser1 = AuthorDetailSerializer(author)
    print(f"Result: {ser1.data}")

    print("\n2. Second Access (Cache HIT):")
    # Notice the print inside to_representation won't show up
    ser2 = AuthorDetailSerializer(author)
    print(f"Result (from cache): {ser2.data}")

    print("\n3. Adding a new Book (Automatic Invalidation):")
    # This invokes a signal that AuthorDetailSerializer is watching
    Book.objects.create(title="Harry Potter and the Chamber of Secrets", author=author)

    print("\n4. Third Access after relation update (Cache MISS):")
    # We refresh from DB to get the new books
    fresh_author = Author.objects.get(pk=author.pk)
    ser3 = AuthorDetailSerializer(fresh_author)
    print(f"Result (refreshed): {ser3.data}")

    print("\n5. List Serialization (many=True) with Zero-SQL:")
    print("Populating cache for Author list...")
    # Fetch all authors
    authors_qs = Author.objects.all()
    list_ser = AuthorDetailSerializer(authors_qs, many=True)
    _ = list_ser.data  # Populate

    print("Accessing list again (Should be Cache HIT with 0 database queries)...")
    # Using a fresh query but exactly same SQL
    authors_qs_2 = Author.objects.all()
    list_ser_2 = AuthorDetailSerializer(authors_qs_2, many=True)

    # In a real environment with CaptureQueriesContext, we could prove 0 queries here.
    print(f"List Result: {list_ser_2.data}")


if __name__ == "__main__":
    run_drf_example()
