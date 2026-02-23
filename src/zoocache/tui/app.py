import json

import redis.asyncio as redis
from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll
from textual.widgets import Footer, Header, Input, Static

from zoocache.tui.commands import CommandHandler
from zoocache.tui.screens import HelpScreen, InspectScreen
from zoocache.tui.sync import ClusterSynchronizer
from zoocache.tui.widgets import EventLog, MetricDisplay, NodeCard


class ZooCacheCLI(App):
    CSS_PATH = "app.tcss"

    BINDINGS = [
        ("q", "quit", "Quit"),
        ("ctrl+c", "double_quit", "Quit"),
        ("c", "clear_logs", "Clear Logs"),
        ("i", "inspect_key", "Inspect Key"),
        ("h", "toggle_help", "Help"),
    ]

    def __init__(self, redis_url: str, prefix: str = "zoocache", **kwargs):
        super().__init__(**kwargs)
        self.redis_url = redis_url
        self.prefix = prefix
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.pubsub = self.redis_client.pubsub()
        self.syncer = ClusterSynchronizer(self.redis_client, self.pubsub, self.prefix)
        self.commander = CommandHandler(self.redis_client, self.prefix)
        self._ctrl_c_pressed = False

    def action_double_quit(self) -> None:
        if self._ctrl_c_pressed:
            self.exit()
        else:
            self._ctrl_c_pressed = True
            self.notify("Press Ctrl+C again to quit", severity="warning", timeout=2.0)
            self.set_timer(2.0, self._reset_ctrl_c)

    def _reset_ctrl_c(self) -> None:
        self._ctrl_c_pressed = False

    def action_toggle_help(self) -> None:
        self.push_screen(HelpScreen())

    def action_inspect_key(self) -> None:
        self.push_screen(InspectScreen())

    async def send_inspect_request(self, key: str, req_id: str) -> None:
        # Backend expects "key|req_id" and uses rsplit_once('|')
        payload = f"{key}|{req_id}"
        await self.redis_client.publish(f"{self.prefix}:inspect:request", payload)

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)

        with Container(id="left-panel"):
            with Container(id="metrics-panel"):
                self.m_hits = MetricDisplay("Hits", "cache_hits_total", "hits")
                self.m_misses = MetricDisplay("Misses", "cache_misses_total", "misses")
                self.m_invs = MetricDisplay("Invalidations", "cache_invalidations_total", "invalidations")
                self.m_errs = MetricDisplay("Errors", "cache_errors_total", "errors")
                self.m_times = MetricDisplay("SF Timeouts", "singleflight_timeouts_total", "timeouts")
                self.m_overflows = MetricDisplay("TTI Overflows", "cache_tti_overflows_total", "overflows")

                yield self.m_hits
                yield self.m_misses
                yield self.m_invs
                yield self.m_errs
                yield self.m_times
                yield self.m_overflows

            with Container(id="logs-panel"):
                self.event_log = EventLog(id="event-list")
                yield self.event_log

            with Container(id="command-panel"):
                self.command_input = Input(placeholder="Enter command (e.g. :invalidate user:123, :prune 3600)")
                yield self.command_input

        with Container(id="right-panel"):
            yield Static("[bold]Active Nodes[/bold]\n", id="nodes-title")
            self.nodes_list = VerticalScroll(id="nodes-list")
            yield self.nodes_list

        yield Footer()

    async def on_mount(self) -> None:
        self.event_log.log_event(
            "System Boot: Redis Connection Secured", f"Endpoint connected successfully at: {self.redis_url}"
        )
        self.event_log.log_event(
            "PubSub Active: Monitoring Invalidation Channel", f"Subscribed to cluster channel: {self.prefix}:invalidate"
        )
        self.event_log.log_event(
            "PubSub Active: Monitoring Inspect Reply Channel",
            f"Subscribed to cluster channel: {self.prefix}:inspect:reply",
        )

        await self.pubsub.subscribe(f"{self.prefix}:invalidate", f"{self.prefix}:inspect:reply")
        self.set_interval(0.1, self.check_pubsub)
        self.set_interval(1.0, self.refresh_ui_state)

    async def refresh_ui_state(self) -> None:
        try:
            state = await self.syncer.fetch_state()

            for summary, details in state.pulses:
                self.event_log.log_event(summary, details)

            active_node_ids = set()
            for node_data in state.active_nodes:
                node_id = node_data.get("uuid", "unknown")

                existing_card = self.nodes_list.query(f"#node-{node_id}")
                if existing_card:
                    existing_card.first().update_data(node_data)
                else:
                    self.nodes_list.mount(NodeCard(node_data))

                active_node_ids.add(f"node-{node_id}")

            # Remove dead nodes
            for card in self.nodes_list.query(".node-card"):
                if card.id not in active_node_ids:
                    card.remove()

            self.m_hits.set_val(state.totals["cache_hits_total"])
            self.m_misses.set_val(state.totals["cache_misses_total"])
            self.m_invs.set_val(state.totals["cache_invalidations_total"])
            self.m_errs.set_val(state.totals["cache_errors_total"])
            self.m_times.set_val(state.totals["singleflight_timeouts_total"])
            self.m_overflows.set_val(state.totals["cache_tti_overflows_total"])

        except Exception:
            pass

    async def check_pubsub(self) -> None:
        events = await self.syncer.get_pubsub_events()
        for msg in events:
            channel = msg["channel"]
            data = msg["data"]

            if channel == f"{self.prefix}:invalidate":
                self.event_log.log_event(
                    "Cluster Event: Invalidation Broadcast",
                    f"Detected invalidation pulse. Raw payload: {data}",
                )
            elif channel == f"{self.prefix}:inspect:reply":
                try:
                    payload = json.loads(data)
                    node_id = payload.get("node_id", "unknown")
                    keys = payload.get("keys", [])
                    req_id = payload.get("req_id")

                    is_inspect = isinstance(self.screen, InspectScreen)
                    has_req_id = hasattr(self.screen, "current_req_id")

                    if is_inspect and has_req_id and self.screen.current_req_id == req_id:
                        self.screen.add_result(node_id, keys)
                except Exception as e:
                    if isinstance(self.screen, InspectScreen):
                        self.screen.add_result("unknown", [], error=str(e))

    async def on_input_submitted(self, message: Input.Submitted) -> None:
        cmd_str = message.value.strip()
        self.command_input.value = ""

        if not cmd_str:
            return

        summary, details = await self.commander.execute(cmd_str)
        if summary:
            self.event_log.log_event(summary, details)

    def action_clear_logs(self) -> None:
        self.event_log.clear()

    async def on_unmount(self) -> None:
        await self.pubsub.close()
        await self.redis_client.aclose()
