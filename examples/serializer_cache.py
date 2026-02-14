import django
from django.conf import settings

# 1. Setup minimal Django environment
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
from zoocache import configure
from zoocache.contrib.django import cacheable_serializer


# 2. Define a Model
class UserProfile(models.Model):
    username = models.CharField(max_length=50)
    bio = models.TextField()

    class Meta:
        app_label = "contenttypes"


# 3. Define a Serializer with Cache
@cacheable_serializer
class UserProfileSerializer:
    """
    A generic serializer (could be DRF or anything following the pattern).
    We decorate it with @cacheable_serializer to enable automatic caching.
    """

    class Meta:
        model = UserProfile

    def __init__(self, instance):
        self.instance = instance

    def to_representation(self, instance):
        print(f"--- [DEBUG] Computing representation for {instance.username} ---")
        return {"username": instance.username, "bio": instance.bio, "version": "1.0"}


# 4. Run Example
def run_example():
    # Configure ZooCache to use memory for this example
    configure()

    # Create database table
    with connection.schema_editor() as editor:
        editor.create_model(UserProfile)

    # Create a user
    user = UserProfile.objects.create(username="alberto", bio="Coding AI assistants")

    print("\n1. First access (Cache MISS):")
    serializer = UserProfileSerializer(instance=user)
    data1 = serializer.to_representation(user)
    print(f"Data: {data1}")

    print("\n2. Second access (Cache HIT):")
    # Notice the print inside to_representation won't trigger
    data2 = serializer.to_representation(user)
    print(f"Data (from cache): {data2}")

    print("\n3. Updating the user (Auto INVALIDATION):")
    user.bio = "Advanced Agentic Coding"
    user.save()  # This triggers the signal that invalidates the cache

    print("\n4. Third access after update (Cache MISS):")
    data3 = serializer.to_representation(user)
    print(f"Data (freshly computed): {data3}")


if __name__ == "__main__":
    run_example()
