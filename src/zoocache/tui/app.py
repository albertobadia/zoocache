import datetime
import json

import redis.asyncio as redis
from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll
from textual.screen import ModalScreen
from textual.widgets import Footer, Header, Input, Static
from textual_plotext import PlotextPlot


class HelpScreen(ModalScreen):
    CSS = """
    HelpScreen {
        align: center middle;
    }
    #help-dialog {
        padding: 1 2;
        width: 60;
        height: auto;
        border: solid #c8c2a7;
        background: #111111;
        color: #c8c2a7;
    }
    """

    def compose(self) -> ComposeResult:
        with Container(id="help-dialog"):
            yield Static("[bold]ZooCache CLI Options[/bold]\n", classes="help-title")
            yield Static(
                "q           : Ouit\n"
                "ctrl+c      : Double quit\n"
                "c           : Clear logs\n"
                "h           : Toggle this help screen\n\n"
                "[bold]Commands:[/bold]\n"
                ":invalidate <tag> : Invalidate a tag in the cluster\n"
                ":prune <secs>     : (Not fully supported cluster-wide)\n\n"
                "Press any key to close this help window."
            )

    def on_key(self) -> None:
        self.app.pop_screen()


class MetricDisplay(Container):
    def __init__(self, title: str, metric_name: str, css_class: str = "", **kwargs):
        if css_class:
            cls = kwargs.get("classes", "")
            kwargs["classes"] = f"{cls} metric-{css_class}".strip()
        super().__init__(**kwargs)
        self.title = title
        self.metric_name = metric_name
        self.css_class = css_class
        self.value = 0.0
        self.last_value = 0.0
        self._initialized = False
        self.history = [0.0] * 60

    def compose(self) -> ComposeResult:
        self.label = Static()
        self.plot = PlotextPlot(classes=f"spark-{self.css_class}")
        yield self.label
        yield self.plot

    def on_mount(self) -> None:
        self._refresh_content()
        plt = self.plot.plt
        plt.theme("clear")
        plt.clf()
        plt.subplots(1, 1)

    def set_val(self, current_val: float) -> None:
        if not self._initialized:
            self.value = current_val
            self.last_value = current_val
            self.history = [0.0] * 60
            self._initialized = True
        else:
            delta = max(0, current_val - self.last_value)
            rate_per_min = delta * 60
            self.value = current_val
            self.last_value = current_val
            self.history.pop(0)
            self.history.append(rate_per_min)

        self._refresh_content()

    def _refresh_content(self) -> None:
        total_val = f"{self.value:,.0f}"
        current_rate = self.history[-1]
        rate_val = f"{current_rate:,.0f}" if current_rate < 1000 else f"{current_rate / 1000:,.1f}k"

        self.label.update(f"[#c8c2a7]{self.title}[/] [bold]{rate_val}/m[/] [#888888]({total_val} total)[/]")

        plt = self.plot.plt
        plt.clf()

        # Color mapping
        color = "white"
        if self.css_class == "hits":
            color = "blue"
        elif self.css_class == "misses":
            color = "yellow"
        elif self.css_class == "invalidations":
            color = "magenta"
        elif self.css_class == "errors":
            color = "red"
        elif self.css_class == "timeouts":
            color = "orange"
        elif self.css_class == "overflows":
            color = "green"

        plt.scatter(self.history, color=color, marker="braille")
        plt.xticks([])
        plt.yticks([])
        plt.xaxes(False, False)
        plt.yaxes(False, False)
        plt.frame(False)
        plt.canvas_color("none")
        plt.axes_color("none")
        plt.ticks_color("none")
        self.plot.refresh()


class ZooCacheCLI(App):
    CSS = """
    Screen {
        layout: horizontal;
        background: #26201b;
        color: #c8c2a7;
    }

    #left-panel {
        width: 3fr;
        height: 100%;
        layout: vertical;
    }

    #right-panel {
        width: 1fr;
        height: 100%;
        layout: vertical;
        border-left: solid #c8c2a7;
        background: #221c17;
        padding: 1;
    }

    #nodes-list {
        height: 1fr;
        layout: vertical;
    }

    .node-card {
        background: #332d26;
        border: solid #c8c2a7;
        padding: 0 1;
        margin: 0;
        height: auto;
    }

    #metrics-panel {
        layout: grid;
        grid-size: 3 2;
        grid-gutter: 0 1;
        height: 1fr;
        padding: 0;
        margin-bottom: 1;
    }

    MetricDisplay {
        layout: vertical;
        border: solid #c8c2a7;
        background: #26201b;
        height: 1fr;
        padding: 0;
    }

    MetricDisplay > Static {
        height: 1;
        padding: 0 1;
        margin-bottom: 0;
    }

    MetricDisplay > PlotextPlot {
        height: 1fr;
        padding: 0 1;
        margin-top: 0;
    }



    #logs-panel {
        height: 1fr;
        border: solid #c8c2a7;
        background: #26201b;
        margin: 0;
        padding: 0 1;
    }

    #event-list {
        height: 1fr;
        background: #26201b;
    }

    .log-entry {
        background: #26201b;
        color: #c8c2a7;
        height: auto;
    }

    #command-panel {
        height: auto;
        dock: bottom;
        border: solid #c8c2a7;
        background: #332d26;
    }

    Input {
        width: 1fr;
        color: #c8c2a7;
        background: #332d26;
        border: none;
    }

    Input:focus {
        border: none;
    }
    """

    BINDINGS = [
        ("q", "quit", "Quit"),
        ("ctrl+c", "double_quit", "Quit"),
        ("c", "clear_logs", "Clear Logs"),
        ("h", "toggle_help", "Help"),
    ]

    def __init__(self, redis_url: str, prefix: str = "zoocache", **kwargs):
        super().__init__(**kwargs)
        self.redis_url = redis_url
        self.prefix = prefix
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.pubsub = self.redis_client.pubsub()
        self._ctrl_c_pressed = False
        self.node_metric_state = {}
        self._initialized_polling = False

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
                self.event_list = VerticalScroll(id="event-list")
                yield self.event_list

            with Container(id="command-panel"):
                self.command_input = Input(placeholder="Enter command (e.g. :invalidate user:123, :prune 3600)")
                yield self.command_input

        with Container(id="right-panel"):
            yield Static("[bold]Active Nodes[/bold]\n", id="nodes-title")
            self.nodes_list = VerticalScroll(id="nodes-list")
            yield self.nodes_list

        yield Footer()

    def log_event(self, summary: str, details: str = "") -> None:
        if not details:
            details = summary
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        log_text = f"[{ts}] [bold]{summary}[/] - {details}"
        col = Static(log_text, classes="log-entry")

        children = self.event_list.query("Static.log-entry")
        if children:
            self.event_list.mount(col, before=children.first())
        else:
            self.event_list.mount(col)

        self.event_list.scroll_home(animate=False)

        current_children = self.event_list.query("Static.log-entry")
        if len(current_children) > 100:
            current_children.last().remove()

    async def on_mount(self) -> None:
        self.log_event("System Boot: Redis Connection Secured", f"Endpoint connected successfully at: {self.redis_url}")
        self.log_event(
            "PubSub Active: Monitoring Invalidation Channel", f"Subscribed to cluster channel: {self.prefix}:invalidate"
        )

        await self.pubsub.subscribe(f"{self.prefix}:invalidate")
        self.set_interval(0.1, self.check_pubsub)
        self.set_interval(1.0, self.poll_cluster_nodes)

    async def poll_cluster_nodes(self) -> None:
        try:
            node_keys = await self.redis_client.keys(f"{self.prefix}:node:*")
            active_node_ids = set()

            totals = {
                "cache_hits_total": 0.0,
                "cache_misses_total": 0.0,
                "cache_invalidations_total": 0.0,
                "cache_errors_total": 0.0,
                "singleflight_timeouts_total": 0.0,
                "cache_tti_overflows_total": 0.0,
            }

            for key in node_keys:
                raw_data = await self.redis_client.get(key)
                if raw_data:
                    data = json.loads(raw_data)
                    node_metrics = data.get("metrics", {})
                    node_id = data.get("uuid", "unknown")
                    hostname = data.get("hostname", "unknown")

                    prev_metrics = self.node_metric_state.get(node_id, {})
                    pulses = [
                        ("cache_hits_total", "Hits"),
                        ("cache_misses_total", "Misses"),
                        ("cache_invalidations_total", "Invalidations"),
                        ("cache_errors_total", "Errors"),
                        ("singleflight_timeouts_total", "SF Timeouts"),
                        ("cache_tti_overflows_total", "TTI Overflows"),
                    ]

                    for m_key, m_title in pulses:
                        curr_v = node_metrics.get(m_key, 0.0)
                        prev_v = prev_metrics.get(m_key, 0.0)
                        if self._initialized_polling and curr_v > prev_v:
                            delta = curr_v - prev_v
                            self.log_event(
                                f"Node Pulse: {m_title}",
                                f"{hostname} ({node_id}) registered +{delta:,.0f} "
                                f"{m_title} (Local total: {curr_v:,.0f})",
                            )

                    self.node_metric_state[node_id] = node_metrics

                    for metric_name in totals:
                        totals[metric_name] += node_metrics.get(metric_name, 0.0)

                    # Update Node cards
                    node_id = data.get("uuid", "unknown")
                    uptime = data.get("uptime", 0)
                    if uptime < 3600:
                        uptime_str = f"{uptime // 60}m {uptime % 60}s"
                    else:
                        uptime_str = f"{uptime // 3600}h {(uptime % 3600) // 60}m"
                    card_content = (
                        f"[bold]{data.get('hostname', 'unknown')}[/] ({node_id})\n"
                        f"CPU: {data.get('cpu', 0.0):.1f}% | RAM: {data.get('ram', 0.0):.1f}% | Up: {uptime_str}\n"
                        f"[#888888]H:{node_metrics.get('cache_hits_total', 0):,.0f} "
                        f"M:{node_metrics.get('cache_misses_total', 0):,.0f} "
                        f"I:{node_metrics.get('cache_invalidations_total', 0):,.0f} "
                        f"E:{node_metrics.get('cache_errors_total', 0):,.0f} "
                        f"SF:{node_metrics.get('singleflight_timeouts_total', 0):,.0f} "
                        f"TTI:{node_metrics.get('cache_tti_overflows_total', 0):,.0f}[/]"
                    )

                    existing_card = self.nodes_list.query(f"#node-{node_id}")
                    if existing_card:
                        existing_card.first().update(card_content)
                    else:
                        self.nodes_list.mount(Static(card_content, id=f"node-{node_id}", classes="node-card"))

                    active_node_ids.add(f"node-{node_id}")

            # Remove dead nodes
            for card in self.nodes_list.query(".node-card"):
                if card.id not in active_node_ids:
                    card.remove()

            self.m_hits.set_val(totals["cache_hits_total"])
            self.m_misses.set_val(totals["cache_misses_total"])
            self.m_invs.set_val(totals["cache_invalidations_total"])
            self.m_errs.set_val(totals["cache_errors_total"])
            self.m_times.set_val(totals["singleflight_timeouts_total"])
            self.m_overflows.set_val(totals["cache_tti_overflows_total"])

            self._initialized_polling = True

        except Exception:
            pass

    async def check_pubsub(self) -> None:
        try:
            message = await self.pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                self.log_event(
                    "Cluster Event: Invalidation Broadcast",
                    f"Detected invalidation pulse. Raw payload: {message['data']}",
                )
        except Exception:
            pass

    async def on_input_submitted(self, message: Input.Submitted) -> None:
        cmd_str = message.value.strip()
        self.command_input.value = ""

        if not cmd_str.startswith(":"):
            self.log_event(
                "CLI Warning: Missing Command Prefix",
                f"Input '{cmd_str}' was ignored. System commands must begin with a colon (:)",
            )
            return

        parts = cmd_str[1:].split()
        if not parts:
            return

        command = parts[0].lower()
        args = parts[1:]

        try:
            if command == "invalidate":
                if not args:
                    self.log_event(
                        "CLI Error: Missing Arguments",
                        "The invalidate command requires a target tag. Usage: :invalidate <tag>",
                    )
                    return
                tag = args[0]
                import time

                await self.redis_client.publish(f"{self.prefix}:invalidate", f"{tag}:{int(time.time() * 10)}")
                self.log_event(
                    "Command Executed: Invalidation Sent", f"Cluster broadcast sent to forcefully evict tag: {tag}"
                )

            elif command == "prune":
                self.log_event(
                    "CLI Notice: Feature Not Implemented",
                    "Cluster-wide prune operations are not currently supported by this node.",
                )

            else:
                self.log_event(
                    "CLI Error: Unknown Command", f"The command '{command}' is not recognized by the system."
                )

        except Exception as e:
            self.log_event("CLI Error: Exception Occurred", f"Command execution failed internally: {str(e)}")

    def action_clear_logs(self) -> None:
        self.event_list.query("Static.log-entry").remove()

    async def on_unmount(self) -> None:
        await self.pubsub.close()
        await self.redis_client.aclose()
