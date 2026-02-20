import redis.asyncio as redis
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal
from textual.widgets import Footer, Header, Input, Log, Static


class MetricDisplay(Static):
    def __init__(self, title: str, metric_key: str, redis_client: redis.Redis, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.metric_key = metric_key
        self.redis_client = redis_client
        self.value = 0.0

    async def update_metric(self) -> None:
        try:
            val = await self.redis_client.get(self.metric_key)
            if val is not None:
                self.value = float(val)
        except Exception:
            pass
        self.update(f"{self.title}\n{self.value:,.0f}")

    def on_mount(self) -> None:
        self.update(f"{self.title}\n{self.value:,.0f}")
        self.set_interval(1.0, self.update_metric)


class ZooCacheDashboard(App):
    CSS = """
    Screen {
        layout: vertical;
    }

    #metrics-panel {
        height: auto;
        padding: 1;
        border: solid green;
    }

    MetricDisplay {
        width: 1fr;
        content-align: center middle;
        text-style: bold;
    }

    #logs-panel {
        height: 1fr;
        border: solid blue;
    }

    #command-panel {
        height: auto;
        dock: bottom;
        border: solid yellow;
    }

    Input {
        width: 1fr;
    }
    """

    BINDINGS = [
        ("q", "quit", "Quit"),
        ("ctrl+c", "double_quit", "Quit"),
        ("c", "clear_logs", "Clear Logs"),
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

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)

        with Container(id="metrics-panel"):
            yield Horizontal(
                MetricDisplay("Cache Hits", f"{self.prefix}:metrics:cache_hits_total", self.redis_client),
                MetricDisplay("Cache Misses", f"{self.prefix}:metrics:cache_misses_total", self.redis_client),
                MetricDisplay("Invalidations", f"{self.prefix}:metrics:cache_invalidations_total", self.redis_client),
            )

        with Container(id="logs-panel"):
            self.event_log = Log(highlight=True)
            yield self.event_log

        with Container(id="command-panel"):
            self.command_input = Input(placeholder="Enter command (e.g. :invalidate user:123, :prune 3600)")
            yield self.command_input

        yield Footer()

    async def on_mount(self) -> None:
        self.event_log.write(f"Connected to Redis: {self.redis_url}")
        self.event_log.write(f"Listening for invalidations on channel: {self.prefix}:invalidate")

        await self.pubsub.subscribe(f"{self.prefix}:invalidate")
        self.set_interval(0.1, self.check_pubsub)

    async def check_pubsub(self) -> None:
        try:
            message = await self.pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                self.event_log.write(f"[PubSub] Invalidation event: {message['data']}")
        except Exception:
            pass

    async def on_input_submitted(self, message: Input.Submitted) -> None:
        cmd_str = message.value.strip()
        self.command_input.value = ""

        if not cmd_str.startswith(":"):
            self.event_log.write(f"[Client] Unknown command: {cmd_str}. Commands must start with ':'")
            return

        parts = cmd_str[1:].split()
        if not parts:
            return

        command = parts[0].lower()
        args = parts[1:]

        try:
            if command == "invalidate":
                if not args:
                    self.event_log.write("[Error] Usage: :invalidate <tag>")
                    return
                tag = args[0]
                import time

                await self.redis_client.publish(f"{self.prefix}:invalidate", f"{tag}:{int(time.time() * 10)}")
                self.event_log.write(f"[Command] Issued invalidation for tag: {tag}")

            elif command == "prune":
                self.event_log.write("[Notice] Prune is not yet supported as a cluster-wide command.")

            else:
                self.event_log.write(f"[Error] Unknown command: {command}")

        except Exception as e:
            self.event_log.write(f"[Error] Command failed: {e}")

    def action_clear_logs(self) -> None:
        self.event_log.clear()

    async def on_unmount(self) -> None:
        await self.pubsub.close()
        await self.redis_client.aclose()
