from textual.app import ComposeResult
from textual.containers import Container
from textual.screen import ModalScreen
from textual.widgets import Static


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
