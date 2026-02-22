import json
from dataclasses import dataclass
from typing import Any

import redis.asyncio as redis


@dataclass
class ClusterState:
    totals: dict[str, float]
    active_nodes: list[dict[str, Any]]
    pulses: list[tuple[str, str]]


class ClusterSynchronizer:
    def __init__(self, redis_client: redis.Redis, pubsub: redis.client.PubSub, prefix: str = "zoocache"):
        self.redis_client = redis_client
        self.pubsub = pubsub
        self.prefix = prefix
        self.node_metric_state: dict[str, dict[str, float]] = {}
        self._initialized = False

    async def get_pubsub_events(self) -> list[tuple[str, str]]:
        events = []
        try:
            message = await self.pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                events.append(
                    (
                        "Cluster Event: Invalidation Broadcast",
                        f"Detected invalidation pulse. Raw payload: {message['data']}",
                    )
                )
        except Exception:
            pass
        return events

    async def fetch_state(self) -> ClusterState:
        node_keys = await self.redis_client.keys(f"{self.prefix}:node:*")

        totals = {
            "cache_hits_total": 0.0,
            "cache_misses_total": 0.0,
            "cache_invalidations_total": 0.0,
            "cache_errors_total": 0.0,
            "singleflight_timeouts_total": 0.0,
            "cache_tti_overflows_total": 0.0,
        }

        active_nodes = []
        pulses = []

        pulse_metrics = [
            ("cache_hits_total", "Hits"),
            ("cache_misses_total", "Misses"),
            ("cache_invalidations_total", "Invalidations"),
            ("cache_errors_total", "Errors"),
            ("singleflight_timeouts_total", "SF Timeouts"),
            ("cache_tti_overflows_total", "TTI Overflows"),
        ]

        for key in node_keys:
            raw_data = await self.redis_client.get(key)
            if not raw_data:
                continue

            data = json.loads(raw_data)
            active_nodes.append(data)

            node_metrics = data.get("metrics", {})
            node_id = data.get("uuid", "unknown")
            hostname = data.get("hostname", "unknown")

            prev_metrics = self.node_metric_state.get(node_id, {})

            for m_key, m_title in pulse_metrics:
                curr_v = node_metrics.get(m_key, 0.0)
                prev_v = prev_metrics.get(m_key, 0.0)
                if self._initialized and curr_v > prev_v:
                    delta = curr_v - prev_v
                    pulses.append(
                        (
                            f"Node Pulse: {m_title}",
                            f"{hostname} ({node_id}) registered +{delta:,.0f} {m_title} (Local total: {curr_v:,.0f})",
                        )
                    )

            self.node_metric_state[node_id] = node_metrics

            for metric_name in totals:
                totals[metric_name] += node_metrics.get(metric_name, 0.0)

        self._initialized = True
        return ClusterState(totals=totals, active_nodes=active_nodes, pulses=pulses)
