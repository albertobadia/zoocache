import django
from django.conf import settings

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

import pytest  # noqa: E402
from django.db import connection, models  # noqa: E402

import zoocache  # noqa: E402
from zoocache.contrib.django import ZooCacheManager, _model_to_raw, _raw_to_instance  # noqa: E402


class Author(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField(default=0)

    objects = models.Manager()
    cached = ZooCacheManager()

    class Meta:
        app_label = "tests"


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    published = models.BooleanField(default=False)

    objects = models.Manager()
    cached = ZooCacheManager(ttl=60)

    class Meta:
        app_label = "tests"


class PrefixedItem(models.Model):
    value = models.CharField(max_length=50)

    objects = models.Manager()
    cached = ZooCacheManager(prefix="custom")

    class Meta:
        app_label = "tests"


@pytest.fixture(autouse=True)
def setup_db():
    zoocache.reset()
    zoocache.clear()
    with connection.schema_editor() as editor:
        for model in [Author, Book, PrefixedItem]:
            try:
                editor.create_model(model)
            except Exception:
                pass
    yield
    with connection.schema_editor() as editor:
        for model in [PrefixedItem, Book, Author]:
            try:
                editor.delete_model(model)
            except Exception:
                pass
    zoocache.reset()


class TestQuerySetCaching:
    def _insert_raw(self, table, **fields):
        cols = ", ".join(f'"{k}"' for k in fields)
        placeholders = ", ".join(["%s"] * len(fields))
        sql = f'INSERT INTO "{table}" ({cols}) VALUES ({placeholders})'
        with connection.cursor() as cursor:
            cursor.execute(sql, list(fields.values()))

    def test_filter_caches_results(self):
        Author.objects.create(name="Alice", age=30)
        Author.objects.create(name="Bob", age=25)

        result1 = list(Author.cached.filter(age__gte=25))
        assert len(result1) == 2

        self._insert_raw("tests_author", name="Charlie", age=28)

        result2 = list(Author.cached.filter(age__gte=25))
        assert len(result2) == 2

    def test_all_caches_results(self):
        Author.objects.create(name="Alice", age=30)

        result1 = list(Author.cached.all())
        assert len(result1) == 1

        self._insert_raw("tests_author", name="Bob", age=25)

        result2 = list(Author.cached.all())
        assert len(result2) == 1

    def test_get_caches_single_object(self):
        author = Author.objects.create(name="Alice", age=30)

        cached_qs = Author.cached.filter(pk=author.pk)
        result1 = list(cached_qs)
        assert len(result1) == 1
        assert result1[0].name == "Alice"

        with connection.cursor() as cursor:
            cursor.execute(
                'UPDATE "tests_author" SET "name" = %s WHERE "id" = %s',
                ["Alice Updated", author.pk],
            )

        cached_qs2 = Author.cached.filter(pk=author.pk)
        result2 = list(cached_qs2)
        assert result2[0].name == "Alice"

    def test_count_caches_result(self):
        Author.objects.create(name="Alice", age=30)
        Author.objects.create(name="Bob", age=25)

        count1 = Author.cached.all().count()
        assert count1 == 2

        self._insert_raw("tests_author", name="Charlie", age=28)

        count2 = Author.cached.all().count()
        assert count2 == 2

    def test_exists_caches_result(self):
        exists1 = Author.cached.filter(name="Ghost").exists()
        assert exists1 is False

        self._insert_raw("tests_author", name="Ghost", age=99)

        exists2 = Author.cached.filter(name="Ghost").exists()
        assert exists2 is False

    def test_first_uses_cache(self):
        Author.objects.create(name="Alice", age=30)
        Author.objects.create(name="Bob", age=25)

        first1 = Author.cached.order_by("name").first()
        assert first1.name == "Alice"

        self._insert_raw("tests_author", name="Aaron", age=20)

        first2 = Author.cached.order_by("name").first()
        assert first2.name == "Alice"

    def test_different_queries_different_keys(self):
        Author.objects.create(name="Alice", age=30)
        Author.objects.create(name="Bob", age=25)

        young = list(Author.cached.filter(age__lt=28))
        assert len(young) == 1

        old = list(Author.cached.filter(age__gte=28))
        assert len(old) == 1


class TestInvalidation:
    def test_save_invalidates_cache(self):
        Author.objects.create(name="Alice", age=30)

        result1 = list(Author.cached.all())
        assert len(result1) == 1

        Author.cached.model.objects.create(name="Bob", age=25)

        result2 = list(Author.cached.all())
        assert len(result2) == 2

    def test_delete_invalidates_cache(self):
        a1 = Author.objects.create(name="Alice", age=30)
        Author.objects.create(name="Bob", age=25)

        result1 = list(Author.cached.all())
        assert len(result1) == 2

        a1.delete()

        result2 = list(Author.cached.all())
        assert len(result2) == 1

    def test_save_update_invalidates(self):
        author = Author.objects.create(name="Alice", age=30)

        result1 = list(Author.cached.filter(pk=author.pk))
        assert result1[0].name == "Alice"

        author.name = "Alice Updated"
        author.save()

        result2 = list(Author.cached.filter(pk=author.pk))
        assert result2[0].name == "Alice Updated"

    def test_invalidation_is_per_model(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="Wonderland", author=author, published=True)

        cached_authors = list(Author.cached.all())
        cached_books = list(Book.cached.all())
        assert len(cached_authors) == 1
        assert len(cached_books) == 1

        Book.objects.create(title="New Book", author=author, published=False)

        authors_after = list(Author.cached.all())
        books_after = list(Book.cached.all())
        assert len(authors_after) == 1
        assert len(books_after) == 2

    def test_count_invalidated_on_save(self):
        Author.objects.create(name="Alice", age=30)

        count1 = Author.cached.all().count()
        assert count1 == 1

        Author.objects.create(name="Bob", age=25)

        count2 = Author.cached.all().count()
        assert count2 == 2

    def test_exists_invalidated_on_save(self):
        exists1 = Author.cached.filter(name="Ghost").exists()
        assert exists1 is False

        Author.objects.create(name="Ghost", age=99)

        exists2 = Author.cached.filter(name="Ghost").exists()
        assert exists2 is True


class TestModelReconstruction:
    def test_reconstructed_instances_have_all_fields(self):
        author = Author.objects.create(name="Alice", age=30)

        cached = list(Author.cached.filter(pk=author.pk))
        assert len(cached) == 1

        obj = cached[0]
        assert obj.pk == author.pk
        assert obj.id == author.id
        assert obj.name == "Alice"
        assert obj.age == 30

    def test_reconstructed_instance_not_adding(self):
        Author.objects.create(name="Alice", age=30)

        list(Author.cached.all())

        from_cache = list(Author.cached.all())
        assert from_cache[0]._state.adding is False

    def test_foreign_key_preserved(self):
        author = Author.objects.create(name="Alice", age=30)
        book = Book.objects.create(title="Wonderland", author=author, published=True)

        cached_books = list(Book.cached.filter(pk=book.pk))
        assert cached_books[0].author_id == author.pk
        assert cached_books[0].title == "Wonderland"
        assert cached_books[0].published is True

    def test_model_to_raw_roundtrip(self):
        author = Author.objects.create(name="Alice", age=30)
        raw = _model_to_raw(author)
        restored = _raw_to_instance(Author, raw)

        assert restored.pk == author.pk
        assert restored.name == author.name
        assert restored.age == author.age


class TestNormalManagerUnaffected:
    def test_objects_manager_not_cached(self):
        Author.objects.create(name="Alice", age=30)

        result1 = list(Author.objects.all())
        assert len(result1) == 1

        Author.objects.create(name="Bob", age=25)

        result2 = list(Author.objects.all())
        assert len(result2) == 2


class TestManagerConfig:
    def test_custom_ttl_passed(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="Test", author=author, published=True)

        qs = Book.cached.all()
        assert qs._zoo_ttl == 60

    def test_custom_prefix(self):
        PrefixedItem.objects.create(value="test")

        qs = PrefixedItem.cached.all()
        assert qs._zoo_prefix == "custom"

        key = qs._get_cache_key()
        assert key.startswith("custom:django:")

    def test_no_prefix_default(self):
        Author.objects.create(name="Alice", age=30)

        qs = Author.cached.all()
        key = qs._get_cache_key()
        assert key.startswith("django:tests.author:")
