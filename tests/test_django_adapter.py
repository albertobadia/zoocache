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
import django.test.utils  # noqa: E402
from django.db import connection, models, transaction  # noqa: E402

import zoocache  # noqa: E402
from zoocache.contrib.django import (  # noqa: E402
    ZooCacheManager,
    _model_to_raw,
    _raw_to_instance,
    _get_query_deps,
)


class Author(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField(default=0)

    objects = models.Manager()
    cached = ZooCacheManager()

    class Meta:
        app_label = "contenttypes"


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="books")
    published = models.BooleanField(default=False)

    objects = models.Manager()
    cached = ZooCacheManager(ttl=60)

    class Meta:
        app_label = "contenttypes"


class PrefixedItem(models.Model):
    value = models.CharField(max_length=50)

    objects = models.Manager()
    cached = ZooCacheManager(prefix="custom")

    class Meta:
        app_label = "contenttypes"


class Tag(models.Model):
    name = models.CharField(max_length=50)

    objects = models.Manager()
    cached = ZooCacheManager()

    class Meta:
        app_label = "contenttypes"


class Article(models.Model):
    title = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag)

    objects = models.Manager()
    cached = ZooCacheManager()

    class Meta:
        app_label = "contenttypes"


@pytest.fixture(autouse=True)
def setup_db():
    zoocache.reset()
    zoocache.clear()
    with connection.schema_editor() as editor:
        for model in [Author, Book, PrefixedItem, Tag, Article]:
            editor.create_model(model)
    yield
    with connection.schema_editor() as editor:
        for model in [Article, Tag, PrefixedItem, Book, Author]:
            editor.delete_model(model)
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

        self._insert_raw("contenttypes_author", name="Charlie", age=28)

        result2 = list(Author.cached.filter(age__gte=25))
        assert len(result2) == 2

    def test_all_caches_results(self):
        Author.objects.create(name="Alice", age=30)

        result1 = list(Author.cached.all())
        assert len(result1) == 1

        self._insert_raw("contenttypes_author", name="Bob", age=25)

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
                'UPDATE "contenttypes_author" SET "name" = %s WHERE "id" = %s',
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

        self._insert_raw("contenttypes_author", name="Charlie", age=28)

        count2 = Author.cached.all().count()
        assert count2 == 2

    def test_exists_caches_result(self):
        exists1 = Author.cached.filter(name="Ghost").exists()
        assert exists1 is False

        self._insert_raw("contenttypes_author", name="Ghost", age=99)

        exists2 = Author.cached.filter(name="Ghost").exists()
        assert exists2 is False

    def test_first_uses_cache(self):
        Author.objects.create(name="Alice", age=30)
        Author.objects.create(name="Bob", age=25)

        first1 = Author.cached.order_by("name").first()
        assert first1.name == "Alice"

        self._insert_raw("contenttypes_author", name="Aaron", age=20)

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
        assert key.startswith("django:contenttypes.author:")


class TestJoinDependencies:
    def test_join_query_detects_related_deps(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="Wonderland", author=author, published=True)

        qs = Book.cached.filter(author__name="Alice")
        deps = _get_query_deps(qs)
        assert "contenttypes.book" in deps
        assert "contenttypes.author" in deps

    def test_simple_query_only_has_own_dep(self):
        Author.objects.create(name="Alice", age=30)

        qs = Author.cached.filter(name="Alice")
        deps = _get_query_deps(qs)
        assert "contenttypes.author" in deps
        assert len([d for d in deps if d != "contenttypes.author"]) == 0

    def test_join_invalidated_by_related_model_save(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="Wonderland", author=author, published=True)

        result1 = list(Book.cached.filter(author__name="Alice"))
        assert len(result1) == 1

        author.name = "Alice Updated"
        author.save()

        result2 = list(Book.cached.filter(author__name="Alice"))
        assert len(result2) == 0

    def test_join_invalidated_by_related_model_delete(self):
        author = Author.objects.create(name="Alice", age=30)
        book = Book.objects.create(title="Wonderland", author=author, published=True)

        result1 = list(Book.cached.filter(author__name="Alice"))
        assert len(result1) == 1

        book.delete()
        author.delete()

        result2 = list(Book.cached.filter(author__name="Alice"))
        assert len(result2) == 0

    def test_join_count_invalidated_by_related_save(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="Wonderland", author=author, published=True)

        count1 = Book.cached.filter(author__name="Alice").count()
        assert count1 == 1

        author.name = "Alice Updated"
        author.save()

        count2 = Book.cached.filter(author__name="Alice").count()
        assert count2 == 0

    def test_non_join_query_not_affected_by_related_save(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="Wonderland", author=author, published=True)

        result1 = list(Book.cached.filter(title="Wonderland"))
        assert len(result1) == 1

        author.name = "Alice Updated"
        author.save()

        result2 = list(Book.cached.filter(title="Wonderland"))
        assert len(result2) == 1


class TestManyToMany:
    def test_m2m_add_invalidates_cache(self):
        article = Article.objects.create(title="Python Tips")
        tag = Tag.objects.create(name="python")

        result1 = list(Article.cached.all())
        assert len(result1) == 1

        article.tags.add(tag)

        result2 = list(Article.cached.all())
        assert len(result2) == 1
        assert result2[0].pk == article.pk

    def test_m2m_remove_invalidates_cache(self):
        article = Article.objects.create(title="Python Tips")
        tag = Tag.objects.create(name="python")
        article.tags.add(tag)

        tagged = list(Article.cached.filter(tags__name="python"))
        assert len(tagged) == 1

        article.tags.remove(tag)

        tagged_after = list(Article.cached.filter(tags__name="python"))
        assert len(tagged_after) == 0

    def test_m2m_clear_invalidates_cache(self):
        article = Article.objects.create(title="Python Tips")
        tag1 = Tag.objects.create(name="python")
        tag2 = Tag.objects.create(name="tips")
        article.tags.add(tag1, tag2)

        count = Article.cached.filter(tags__name="python").count()
        assert count == 1

        article.tags.clear()

        count_after = Article.cached.filter(tags__name="python").count()
        assert count_after == 0

    def test_m2m_join_detects_tag_dep(self):
        article = Article.objects.create(title="Python Tips")
        tag = Tag.objects.create(name="python")
        article.tags.add(tag)

        qs = Article.cached.filter(tags__name="python")
        deps = _get_query_deps(qs)
        assert "contenttypes.article" in deps
        assert "contenttypes.tag" in deps

    def test_m2m_invalidates_related_side(self):
        article = Article.objects.create(title="Python Tips")
        tag = Tag.objects.create(name="python")

        result1 = list(Tag.cached.all())
        assert len(result1) == 1

        article.tags.add(tag)

        # Adding a relation invalidates the related model's query too
        result2 = list(Tag.cached.all())
        assert len(result2) == 1

    def test_m2m_reverse_query_detects_deps(self):
        article = Article.objects.create(title="Python Tips")
        tag = Tag.objects.create(name="python")
        article.tags.add(tag)

        # Query Tags used in specific Articles (Reverse M2M)
        qs = Tag.cached.filter(article__title="Python Tips")
        deps = _get_query_deps(qs)
        assert "contenttypes.tag" in deps
        assert "contenttypes.article" in deps

    def test_m2m_reverse_invalidation(self):
        article = Article.objects.create(title="Python Tips")
        tag = Tag.objects.create(name="python")
        article.tags.add(tag)

        # Query tags for this article
        result1 = list(Tag.cached.filter(article__title="Python Tips"))
        assert len(result1) == 1

        # Modify article title -> should invalidate Tag query
        article.title = "Python Advanced"
        article.save()

        result2 = list(Tag.cached.filter(article__title="Python Tips"))
        assert len(result2) == 0

    def test_reverse_relation_query_detects_deps(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="Wonderland", author=author, published=True)

        # Query Authors who wrote "Wonderland" (Reverse relation from Author to Book)
        qs = Author.cached.filter(books__title="Wonderland")
        deps = _get_query_deps(qs)
        assert "contenttypes.author" in deps
        assert "contenttypes.book" in deps

    def test_reverse_relation_invalidation(self):
        author = Author.objects.create(name="Alice", age=30)
        book = Book.objects.create(title="Wonderland", author=author, published=True)

        result1 = list(Author.cached.filter(books__title="Wonderland"))
        assert len(result1) == 1

        # Modify the book title -> should invalidate the Author query
        book.title = "Wonderland Updated"
        book.save()

        result2 = list(Author.cached.filter(books__title="Wonderland"))
        assert len(result2) == 0


class TestTransactions:
    def test_rollback_does_not_invalidate(self):
        Author.objects.create(name="Alice", age=30)

        # Initial cache population
        assert len(list(Author.cached.all())) == 1

        try:
            with transaction.atomic():
                Author.objects.create(name="Bob", age=25)
                # Invalidation should be deferred until commit...
                # ...but we force a rollback
                raise ValueError("Rollback")
        except ValueError:
            pass

        # Should still be 1 (Bob was rolled back, invalidation never happened)
        # Note: In SQLite in-memory, if on_commit works, the cache remains valid.
        assert len(list(Author.cached.all())) == 1

    def test_commit_invalidates(self):
        Author.objects.create(name="Alice", age=30)
        assert len(list(Author.cached.all())) == 1

        with transaction.atomic():
            Author.objects.create(name="Bob", age=25)

        # Now committed -> invalidation should have run
        assert len(list(Author.cached.all())) == 2


class TestPrefetchRelated:
    def test_prefetch_restored_from_cache(self):
        author = Author.objects.create(name="Alice", age=30)
        Book.objects.create(title="B1", author=author)
        Book.objects.create(title="B2", author=author)

        with django.test.utils.CaptureQueriesContext(connection) as ctx:
            qs = Author.cached.prefetch_related("books")
            results = list(qs)
            assert len(results) == 1
            assert len(results[0].books.all()) == 2
            assert len(ctx) == 2

        with django.test.utils.CaptureQueriesContext(connection) as ctx:
            qs = Author.cached.prefetch_related("books")
            results = list(qs)
            assert len(results) == 1
            assert len(results[0].books.all()) == 2
            # 1 query for Books prefetch (0 for Author cache hit)
            assert len(ctx) == 1


class TestSelectRelated:
    def test_select_related_caches_related_object(self):
        author = Author.objects.create(name="Alice", age=30)
        book = Book.objects.create(title="Wonderland", author=author)

        with django.test.utils.CaptureQueriesContext(connection) as ctx:
            qs = Book.cached.select_related("author").filter(pk=book.pk)
            result = list(qs)[0]
            assert result.title == "Wonderland"
            assert result.author.name == "Alice"
            assert len(ctx) == 1

        with django.test.utils.CaptureQueriesContext(connection) as ctx:
            qs = Book.cached.select_related("author").filter(pk=book.pk)
            result = list(qs)[0]
            assert result.title == "Wonderland"
            assert result.author.name == "Alice"
            assert len(ctx) == 0
