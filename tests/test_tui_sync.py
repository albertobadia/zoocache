import json

import pytest

from zoocache.tui.sync import ClusterSynchronizer


class _FakeRedisClient:
    def __init__(self):
        self._payloads = {
            "zoocache:node:n1": json.dumps(
                {
                    "uuid": "n1",
                    "hostname": "node-1",
                    "metrics": {
                        "cache_hits_total": 10.0,
                        "cache_misses_total": 2.0,
                        "cache_invalidations_total": 1.0,
                        "cache_errors_total": 0.0,
                        "singleflight_timeouts_total": 0.0,
                        "cache_tti_overflows_total": 0.0,
                    },
                }
            )
        }

    async def keys(self, _pattern: str):
        raise AssertionError("Cluster sync must not use Redis KEYS in production paths")

    async def scan_iter(self, _pattern: str):
        for key in self._payloads:
            yield key

    async def get(self, key: str):
        return self._payloads.get(key)


class _FakePubSub:
    async def get_message(self, ignore_subscribe_messages=True):
        return None


@pytest.mark.asyncio
async def test_cluster_sync_should_not_use_redis_keys_command():
    sync = ClusterSynchronizer(
        _FakeRedisClient(),  # type: ignore[arg-type]
        _FakePubSub(),  # type: ignore[arg-type]
        prefix="zoocache",
    )

    state = await sync.fetch_state()

    assert state.totals["cache_hits_total"] == 10.0
    assert len(state.active_nodes) == 1
