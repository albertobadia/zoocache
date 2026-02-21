import datetime

import redis.asyncio as redis
from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll
from textual.screen import ModalScreen
from textual.widgets import Collapsible, Footer, Header, Input, Sparkline, Static


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
    def __init__(self, title: str, metric_key: str, redis_client: redis.Redis, css_class: str = "", **kwargs):
        if css_class:
            cls = kwargs.get("classes", "")
            kwargs["classes"] = f"{cls} metric-{css_class}".strip()
        super().__init__(**kwargs)
        self.title = title
        self.metric_key = metric_key
        self.redis_client = redis_client
        self.css_class = css_class
        self.value = 0.0
        self._initialized = False
        self.history = [0.0] * 60

    def compose(self) -> ComposeResult:
        self.label = Static()
        self.sparkline = Sparkline(data=self.history, summary_function=max, classes=f"spark-{self.css_class}")
        yield self.label
        yield self.sparkline

    async def on_mount(self) -> None:
        self._refresh_content()
        self.set_interval(1.0, self.update_metric)
        await self.update_metric()

    async def update_metric(self) -> None:
        try:
            val = await self.redis_client.get(self.metric_key)
            if val is not None:
                current_val = float(val)
                self.value = current_val

                if not self._initialized:
                    self.history = [current_val] * 60
                    self._initialized = True
                else:
                    delta = current_val - self.history[-1]
                    if delta > 0 and hasattr(self.app, "log_event"):
                        self.app.log_event(
                            f"Metric Pulse: {self.title}", f"Registered +{delta:,.0f} (Global count: {current_val:,.0f})"
                        )
                    self.history.pop(0)
                    self.history.append(current_val)
        except Exception:
            pass
        self._refresh_content()

    def _refresh_content(self) -> None:
        formatted_val = f"{self.value:,.0f}"
        self.label.update(f"[#c8c2a7]{self.title}[/] [bold]{formatted_val}[/]")
        self.sparkline.data = [0.0] + list(self.history)


class ZooCacheCLI(App):
    CSS = """
    Screen {
        layout: vertical;
        background: #26201b;
        color: #c8c2a7;
    }

    #metrics-panel {
        layout: grid;
        grid-size: 3 2;
        grid-gutter: 1;
        height: 11;
        padding: 0 1;
        border: solid #c8c2a7;
        background: #332d26;
        margin-bottom: 1;
    }

    MetricDisplay {
        layout: vertical;
        border: solid #c8c2a7;
        background: #26201b;
        height: 4;
        padding: 0;
    }

    MetricDisplay > Static {
        height: 1;
        padding: 0 1;
        margin-bottom: 0;
    }

    MetricDisplay > Sparkline {
        height: 1;
        padding: 0 1;
        margin-top: 0;
    }

    .spark-hits > .sparkline--max-color, .spark-hits > .sparkline--min-color { color: #88c0d0; }
    .spark-misses > .sparkline--max-color, .spark-misses > .sparkline--min-color { color: #ebcb8b; }
    .spark-invalidations > .sparkline--max-color, .spark-invalidations > .sparkline--min-color { color: #b48ead; }
    .spark-errors > .sparkline--max-color, .spark-errors > .sparkline--min-color { color: #bf616a; }
    .spark-timeouts > .sparkline--max-color, .spark-timeouts > .sparkline--min-color { color: #d08770; }
    .spark-overflows > .sparkline--max-color, .spark-overflows > .sparkline--min-color { color: #a3be8c; }

    #logs-panel {
        height: 1fr;
        border: solid #c8c2a7;
        background: #26201b;
        margin: 0 1;
        padding: 1;
    }

    #event-list {
        height: 1fr;
        background: #26201b;
    }

    Collapsible {
        background: #332d26;
        color: #c8c2a7;
        margin-bottom: 1;
        height: auto;
    }

    CollapsibleTitle {
        background: #332d26;
        color: #dcd8c0;
        text-style: bold;
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

        with Container(id="metrics-panel"):
            yield MetricDisplay("Hits", f"{self.prefix}:metrics:cache_hits_total", self.redis_client, "hits")
            yield MetricDisplay("Misses", f"{self.prefix}:metrics:cache_misses_total", self.redis_client, "misses")
            yield MetricDisplay(
                "Invalidations", f"{self.prefix}:metrics:cache_invalidations_total", self.redis_client, "invalidations"
            )
            yield MetricDisplay("Errors", f"{self.prefix}:metrics:cache_errors_total", self.redis_client, "errors")
            yield MetricDisplay(
                "SF Timeouts", f"{self.prefix}:metrics:singleflight_timeouts_total", self.redis_client, "timeouts"
            )
            yield MetricDisplay(
                "TTI Overflows", f"{self.prefix}:metrics:cache_tti_overflows_total", self.redis_client, "overflows"
            )

        with Container(id="logs-panel"):
            self.event_list = VerticalScroll(id="event-list")
            yield self.event_list

        with Container(id="command-panel"):
            self.command_input = Input(placeholder="Enter command (e.g. :invalidate user:123, :prune 3600)")
            yield self.command_input

        yield Footer()

    def log_event(self, summary: str, details: str = "") -> None:
        if not details:
            details = summary
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        col = Collapsible(Static(details), title=f"[{ts}] {summary}", collapsed=True)

        children = self.event_list.query("Collapsible")
        if children:
            self.event_list.mount(col, before=children.first())
        else:
            self.event_list.mount(col)

        # Optional: Force view to top if we always want to see the newest
        self.event_list.scroll_home(animate=False)

        # Refresh children query and cap to max 100 (delete oldest at the bottom)
        current_children = self.event_list.query("Collapsible")
        if len(current_children) > 100:
            # We remove from the end now, as new ones are at the top
            current_children.last().remove()

    async def on_mount(self) -> None:
        self.log_event(
            "System Boot: Redis Connection Secured", f"Endpoint connected successfully at: {self.redis_url}"
        )
        self.log_event(
            "PubSub Active: Monitoring Invalidation Channel", f"Subscribed to cluster channel: {self.prefix}:invalidate"
        )

        await self.pubsub.subscribe(f"{self.prefix}:invalidate")
        self.set_interval(0.1, self.check_pubsub)

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
        self.event_list.query("Collapsible").remove()

    async def on_unmount(self) -> None:
        await self.pubsub.close()
        await self.redis_client.aclose()
