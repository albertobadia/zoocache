import django
from django.conf import settings

# 1. Setup Django
if not settings.configured:
    settings.configure(
        DATABASES={
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": ":memory:",
            }
        },
        INSTALLED_APPS=["django.contrib.contenttypes"],
    )
    django.setup()

from django.db import models, connection
from zoocache import configure, clear
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


# 3. Serializers (Mimicking DRF structure)
class BaseSerializer:
    def __init__(self, instance=None, many=False, **kwargs):
        self.instance = instance
        self.many = many
        self.fields = {}  # Mimic DRF fields dict


@cacheable_serializer
class BookSerializer(BaseSerializer):
    class Meta:
        model = Book

    def to_representation(self, instance):
        return {"id": instance.pk, "title": instance.title}


@cacheable_serializer
class AuthorDetailSerializer(BaseSerializer):
    class Meta:
        model = Author

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Registering nested serializer to trigger introspection
        self.fields = {"books": BookSerializer(many=True)}

    def to_representation(self, instance):
        print(f"--- [DEBUG] Serializing Author: {instance.name} ---")
        return {
            "name": instance.name,
            "books": [
                BookSerializer().to_representation(b) for b in instance.books.all()
            ],
        }


# 4. Scenario
def run_complex_example():
    configure()
    clear()
    with connection.schema_editor() as editor:
        editor.create_model(Author)
        editor.create_model(Book)

    # Data
    author = Author.objects.create(name="J.K. Rowling")
    Book.objects.create(title="Harry Potter 1", author=author)

    print("\n1. Initial Serialization (MISS):")
    ser = AuthorDetailSerializer(instance=author)
    print(ser.to_representation(author))

    print("\n2. Second Access (HIT):")
    print(ser.to_representation(author))

    print("\n3. Adding a Book (Automatic Invalidation via Relationship):")
    # Even though we don't save the Author, saving a Book will invalidate the Author's cache
    # because AuthorDetailSerializer introspected that it depends on the Book model.
    Book.objects.create(title="Harry Potter 2", author=author)

    print("\n4. Third Access (MISS - should show both books):")
    # Refreshing or fetching from DB to ensure we don't use the Python-cached relation
    fresh_author = Author.objects.get(pk=author.pk)
    print(AuthorDetailSerializer(instance=fresh_author).to_representation(fresh_author))


if __name__ == "__main__":
    run_complex_example()
