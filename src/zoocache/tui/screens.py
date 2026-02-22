import uuid

from rich.text import Text
from textual.app import ComposeResult
from textual.containers import Container
from textual.screen import ModalScreen
from textual.widgets import DataTable, Input, Static


class HelpScreen(ModalScreen):
    def compose(self) -> ComposeResult:
        with Container(id="help-dialog"):
            yield Static("[bold]ZooCache CLI Options[/bold]\n", classes="help-title")
            yield Static(
                "q           : Quit\n"
                "ctrl+c      : Double quit\n"
                "c           : Clear logs\n"
                "h           : Toggle this help screen\n\n"
                "[bold]Commands:[/bold]\n"
                "Syntax: [target] :command <args>\n"
                "Targets (optional): :all or specific node id\n\n"
                ":invalidate <tag> : Invalidate a tag\n"
                ":prune <secs>     : Prune old entries\n\n"
                "Examples:\n"
                ":invalidate user:123\n"
                ":node-123 :invalidate tag1\n\n"
                "Press any key to close this help window."
            )

    def on_key(self) -> None:
        self.app.pop_screen()


class InspectScreen(ModalScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.inspect_key = ""

    def compose(self) -> ComposeResult:
        with Container(id="inspect-dialog"):
            yield Static("[bold]Inspect Cache Key[/bold]\n", classes="help-title")
            yield Input(placeholder="Enter key to inspect...", id="inspect-input")

            self.results_table = DataTable(id="inspect-results")
            self.results_table.add_columns("Node ID", "Key", "TTL Rem", "Error")
            yield self.results_table

            yield Static("\nPress ESC to close.", classes="help-footer")

    def on_mount(self) -> None:
        input_widget = self.query_one("#inspect-input", Input)
        input_widget.focus()

    async def on_input_submitted(self, message: Input.Submitted) -> None:
        key = message.value.strip()
        if not key:
            return

        self.inspect_key = key
        self.results_table.clear()

        req_id = str(uuid.uuid4())
        self.current_req_id = req_id

        await self.app.send_inspect_request(key, req_id)

    def add_result(self, node_id: str, keys: list[dict], error: str = "") -> None:
        if error:
            self.results_table.add_row(node_id, Text("ERROR", style="red"), "-", error)
            return

        if not keys:
            self.results_table.add_row(node_id, Text("NO MATCHES", style="yellow"), "-", "")
            return

        for match in keys:
            key_name = match.get("key", "unknown")
            ttl_rem = match.get("ttl_remaining")
            ttl_text = str(ttl_rem) if ttl_rem is not None else "-"
            self.results_table.add_row(node_id, Text(key_name, style="green"), ttl_text, "")

    def key_escape(self) -> None:
        self.app.pop_screen()
