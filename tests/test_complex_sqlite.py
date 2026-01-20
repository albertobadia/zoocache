import sqlite3
import pytest
import os
from zoocache import cacheable, invalidate, clear, add_deps

# Configure for local testing
DB_PATH = "test_complex.db"


@pytest.fixture(autouse=True)
def setup_teardown():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    clear()
    yield
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE organizations (id INTEGER PRIMARY KEY, name TEXT)")
    cursor.execute(
        "CREATE TABLE projects (id INTEGER PRIMARY KEY, org_id INTEGER, name TEXT)"
    )
    cursor.execute(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, org_id INTEGER, name TEXT)"
    )
    cursor.execute(
        "CREATE TABLE tasks (id INTEGER PRIMARY KEY, project_id INTEGER, user_id INTEGER, title TEXT, status TEXT)"
    )

    # Populate with some data
    cursor.execute("INSERT INTO organizations (name) VALUES ('Acme Corp')")  # id 1
    cursor.execute("INSERT INTO organizations (name) VALUES ('Globex')")  # id 2

    for org_id in [1, 2]:
        for i in range(5):
            cursor.execute(
                "INSERT INTO projects (org_id, name) VALUES (?, ?)",
                (org_id, f"Project {org_id}-{i}"),
            )
            cursor.execute(
                "INSERT INTO users (org_id, name) VALUES (?, ?)",
                (org_id, f"User {org_id}-{i}"),
            )

    # Create tasks (Cross dependencies)
    # Task belongs to a project, but is assigned to a user (who might be in same org)
    for p_id in range(1, 11):
        for u_id in range(1, 11):
            cursor.execute(
                "INSERT INTO tasks (project_id, user_id, title, status) VALUES (?, ?, ?, ?)",
                (p_id, u_id, f"Task P{p_id}-U{u_id}", "pending"),
            )

    conn.commit()
    conn.close()


# --- Cacheable Functions ---


@cacheable(deps=lambda org_id: [f"org:{org_id}"])
def get_organization(org_id: int):
    conn = get_db()
    res = conn.execute("SELECT * FROM organizations WHERE id = ?", (org_id,)).fetchone()
    conn.close()
    return dict(res) if res else None


@cacheable(deps=lambda org_id: [f"org:{org_id}:projects"])
def list_projects(org_id: int):
    conn = get_db()
    res = conn.execute("SELECT * FROM projects WHERE org_id = ?", (org_id,)).fetchall()
    conn.close()
    return [dict(r) for r in res]


@cacheable(deps=lambda project_id: [f"project:{project_id}"])
def get_project_details(project_id: int):
    conn = get_db()
    project = conn.execute(
        "SELECT * FROM projects WHERE id = ?", (project_id,)
    ).fetchone()
    if not project:
        conn.close()
        return None

    # Add dependency to parent org automatically
    add_deps([f"org:{project['org_id']}"])

    tasks = conn.execute(
        "SELECT * FROM tasks WHERE project_id = ?", (project_id,)
    ).fetchall()
    conn.close()
    return {"project": dict(project), "tasks": [dict(t) for t in tasks]}


@cacheable(deps=lambda task_id: [f"task:{task_id}"])
def get_task_with_deps(task_id: int):
    conn = get_db()
    task = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if not task:
        conn.close()
        return None

    # A task has cross-dependencies:
    # 1. Its specific ID
    # 2. Its containing project
    # 3. Its assigned user
    add_deps([f"project:{task['project_id']}", f"user:{task['user_id']}"])

    conn.close()
    return dict(task)


def test_sqlite_complex_hierarchy():
    init_db()

    # 1. Initial hits
    get_organization(1)
    list_projects(1)
    # project 1 belongs to org 1
    get_project_details(1)

    # Verify we hit cache (simulated by checking if we still get same data after DB change without invalidation)
    conn = get_db()
    conn.execute("UPDATE organizations SET name = 'Modified' WHERE id = 1")
    conn.commit()
    conn.close()

    assert get_organization(1)["name"] == "Acme Corp"  # Still old name (Cache Hit)

    # 2. Invalidate Parent (Organization)
    # This should kill get_organization AND get_project_details (because of add_deps)
    invalidate("org:1")

    assert get_organization(1)["name"] == "Modified"  # Cache Miss, new name

    # 3. Cross-dependency test
    # Task 1: project_id=1, user_id=1
    get_task_with_deps(1)

    # Change task title in DB
    conn = get_db()
    conn.execute("UPDATE tasks SET title = 'New Title' WHERE id = 1")
    conn.commit()
    conn.close()

    assert get_task_with_deps(1)["title"] == "Task P1-U1"  # Cache Hit

    # Invalidate USER 1
    # Task 1 depends on User 1, so it should be invalidated
    invalidate("user:1")
    assert get_task_with_deps(1)["title"] == "New Title"  # Cache Miss


def test_sqlite_thundering_herd_stress():
    init_db()
    import threading

    call_count = 0

    def side_effect_func():
        nonlocal call_count
        call_count += 1
        return get_organization(1)

    # Wrap get_organization to track real executions
    @cacheable(deps=["org:1"])
    def tracked_get_org(org_id):
        nonlocal call_count
        call_count += 1
        conn = get_db()
        res = conn.execute(
            "SELECT * FROM organizations WHERE id = ?", (org_id,)
        ).fetchone()
        conn.close()
        import time

        time.sleep(0.1)  # Simulate slow query
        return dict(res)

    threads = []
    for _ in range(20):
        t = threading.Thread(target=lambda: tracked_get_org(1))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    assert call_count == 1  # Only 1 DB hit for 20 concurrent threads


def test_bulk_invalidation_performance():
    init_db()
    # Populate cache for 50 tasks
    for i in range(1, 51):
        get_task_with_deps(i)

    # All these tasks belong to projects 1-5 (roughly)
    # Invalidating project:1 should kill all tasks assigned to it
    import time

    start = time.perf_counter()
    invalidate("project:1")
    end = time.perf_counter()

    # Invalidation itself is O(1) in the trie regardless of how many items it "affects"
    assert (end - start) < 0.01
