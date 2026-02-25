# 🧠 Core Concepts

ZooCache is based on the concept of **Semantic Invalidation**. Here we explain how to manage your data dependencies.

## Dependencies (Tags)

Dependencies are labels (tags) that represent what data a cached function depends on:

### Static Dependencies
Defined once and do not change between calls:

```python
@cacheable(deps=["global:settings", "feature:flags"])
def get_config():
    return load_config()
```

### Dynamic Dependencies
Based on the function arguments:

```python
@cacheable(deps=lambda pid: [f"product:{pid}", f"store:{get_current_store()}"])
def get_product(pid: int):
    return db.get_product(pid)
```

## Hierarchical Tags

ZooCache uses the `:` separator to create hierarchies. Invalidating a parent automatically invalidates all children:

```text
org:1                  ← invalidate("org:1") kills EVERYTHING below
├── org:1:team:a
│   ├── org:1:team:a:user:1
│   └── org:1:team:a:user:2
└── org:1:team:b
    └── org:1:team:b:user:3
```

> [!IMPORTANT]
> Tags are restricted to **alphanumeric characters, `_`, `:`, and `.`**.
> Using any other character will throw an `InvalidTag` exception.

## `add_deps()` for Runtime Dependencies

Sometimes you don't know what a function depends on until you execute it. Use `add_deps()` inside the function:

```python
from zoocache import cacheable, add_deps

@cacheable()
def get_dashboard(user_id: int):
    user = db.get_user(user_id)
    add_deps([f"user:{user_id}"]) # Register dependency dynamically
    
    if user.is_admin:
        reports = db.get_admin_reports()
        add_deps(["reports:admin"])
        return {"user": user, "reports": reports}
    
    return {"user": user}
```
