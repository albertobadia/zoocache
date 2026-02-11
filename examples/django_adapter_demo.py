"""
Zoocache Django ORM Adapter Demo

Shows how to use ZooCacheManager for transparent query caching
with automatic invalidation on save/delete.

Requirements:
    pip install zoocache django

Run with:
    python examples/django_adapter_demo.py
"""

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

from django.db import connection, models  # noqa: E402
from zoocache.contrib.django import ZooCacheManager  # noqa: E402


# --- Model Definition ---


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    category = models.CharField(max_length=50)

    objects = models.Manager()
    cached = ZooCacheManager(ttl=300)

    class Meta:
        app_label = "shop"

    def __repr__(self):
        return f"Product({self.name}, ${self.price})"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    score = models.IntegerField()
    comment = models.CharField(max_length=200)

    objects = models.Manager()
    cached = ZooCacheManager(ttl=300)

    class Meta:
        app_label = "shop"

    def __repr__(self):
        return f"Review({self.comment}, {self.score}/5)"


# --- Create tables ---

with connection.schema_editor() as editor:
    editor.create_model(Product)
    editor.create_model(Review)


def run_demo():
    print("=" * 60)
    print("  ZooCache Django Adapter Demo")
    print("=" * 60)

    # --- 1. Basic Caching ---
    print("\n--- STEP 1: Basic Query Caching ---")

    Product.objects.create(name="Laptop", price=999, category="electronics")
    Product.objects.create(name="Phone", price=699, category="electronics")
    Product.objects.create(name="Book", price=15, category="books")

    electronics = list(Product.cached.filter(category="electronics"))
    print(f"  Query 1 (DB hit): {electronics}")

    electronics_again = list(Product.cached.filter(category="electronics"))
    print(f"  Query 2 (Cache hit): {electronics_again}")
    print(f"  Same results? {electronics[0].name == electronics_again[0].name}")

    # --- 2. Different queries = different cache keys ---
    print("\n--- STEP 2: Different Queries, Different Keys ---")

    books = list(Product.cached.filter(category="books"))
    print(f"  Books query (DB hit): {books}")

    all_products = list(Product.cached.all())
    print(f"  All products (DB hit): {all_products}")

    all_again = list(Product.cached.all())
    print(f"  All products (Cache hit): {all_again}")

    # --- 3. count() and exists() ---
    print("\n--- STEP 3: Aggregates are Cached Too ---")

    count = Product.cached.filter(category="electronics").count()
    print(f"  Electronics count (DB hit): {count}")

    count_cached = Product.cached.filter(category="electronics").count()
    print(f"  Electronics count (Cache hit): {count_cached}")

    exists = Product.cached.filter(name="Laptop").exists()
    print(f"  Laptop exists? (DB hit): {exists}")

    # --- 4. Auto-invalidation on save ---
    print("\n--- STEP 4: Automatic Invalidation on Save ---")

    before = list(Product.cached.all())
    print(f"  Before save (cached): {len(before)} products")

    Product.objects.create(name="Tablet", price=499, category="electronics")
    print("  >> Created 'Tablet' via objects.create()")

    after = list(Product.cached.all())
    print(f"  After save (cache invalidated, re-fetched): {len(after)} products")

    # --- 5. Auto-invalidation on delete ---
    print("\n--- STEP 5: Automatic Invalidation on Delete ---")

    before = list(Product.cached.all())
    print(f"  Before delete: {len(before)} products")

    tablet = Product.objects.get(name="Tablet")
    tablet.delete()
    print("  >> Deleted 'Tablet'")

    after = list(Product.cached.all())
    print(f"  After delete (cache invalidated): {len(after)} products")

    # --- 6. Normal manager is unaffected ---
    print("\n--- STEP 6: Normal Manager Unaffected ---")

    normal = list(Product.objects.all())
    print(f"  Product.objects.all() always hits DB: {len(normal)} products")

    # --- 7. JOIN dependency detection ---
    print("\n--- STEP 7: JOIN Dependency Detection ---")

    laptop = Product.objects.get(name="Laptop")
    Review.objects.create(product=laptop, score=5, comment="Great laptop!")
    Review.objects.create(product=laptop, score=4, comment="Good value")

    reviews = list(Review.cached.filter(product__name="Laptop"))
    print(f"  JOIN query (DB hit): {len(reviews)} reviews for Laptop")

    reviews_cached = list(Review.cached.filter(product__name="Laptop"))
    print(f"  JOIN query (Cache hit): {len(reviews_cached)} reviews")

    laptop.price = 899
    laptop.save()
    print("  >> Updated Laptop price (Product.save())")

    reviews_after = list(Review.cached.filter(product__name="Laptop"))
    print(
        f"  JOIN query after Product save (invalidated!): {len(reviews_after)} reviews"
    )
    print("  The JOIN dependency on Product was detected automatically.")

    # Non-JOIN query stays cached
    simple = list(Review.cached.filter(score=5))
    print(f"  Non-JOIN query (DB hit): {len(simple)} reviews with score=5")

    laptop.price = 799
    laptop.save()
    print("  >> Updated Laptop price again")

    simple_cached = list(Review.cached.filter(score=5))
    print(f"  Non-JOIN query (still cached!): {len(simple_cached)} reviews")
    print("  No JOIN on Product, so Product.save() doesn't invalidate it.")

    print("\n" + "=" * 60)
    print("  Demo complete!")
    print("=" * 60)


if __name__ == "__main__":
    run_demo()
