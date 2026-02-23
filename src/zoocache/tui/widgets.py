import datetime
from typing import Any

from textual.app import ComposeResult
from textual.containers import Container, VerticalScroll
from textual.widgets import Static
from textual_plotext import PlotextPlot


class EventLog(VerticalScroll):
    def log_event(self, summary: str, details: str = "") -> None:
        if not details:
            details = summary
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        log_text = f"[{ts}] [bold]{summary}[/] - {details}"
        col = Static(log_text, classes="log-entry")

        children = self.query("Static.log-entry")
        if children:
            self.mount(col, before=children.first())
        else:
            self.mount(col)

        self.scroll_home(animate=False)

        current_children = self.query("Static.log-entry")
        if len(current_children) > 100:
            current_children.last().remove()

    def clear(self) -> None:
        self.query("Static.log-entry").remove()


class NodeCard(Static):
    def __init__(self, node_data: dict[str, Any], **kwargs):
        self.node_id = node_data.get("uuid", "unknown")
        super().__init__(id=f"node-{self.node_id}", classes="node-card", **kwargs)
        self.update_data(node_data)

    def update_data(self, node_data: dict[str, Any]) -> None:
        uptime = node_data.get("uptime", 0)
        if uptime < 3600:
            uptime_str = f"{uptime // 60}m {uptime % 60}s"
        else:
            uptime_str = f"{uptime // 3600}h {(uptime % 3600) // 60}m"

        node_metrics = node_data.get("metrics", {})
        card_content = (
            f"[bold]{node_data.get('hostname', 'unknown')}[/] ({self.node_id})\n"
            f"CPU: {node_data.get('cpu', 0.0):.1f}% | "
            f"RAM: {node_data.get('ram', 0.0):.1f}% | "
            f"Up: {uptime_str}\n"
            f"[#888888]H:{node_metrics.get('cache_hits_total', 0):,.0f} "
            f"M:{node_metrics.get('cache_misses_total', 0):,.0f} "
            f"I:{node_metrics.get('cache_invalidations_total', 0):,.0f} "
            f"E:{node_metrics.get('cache_errors_total', 0):,.0f} "
            f"SF:{node_metrics.get('singleflight_timeouts_total', 0):,.0f} "
            f"TTI:{node_metrics.get('cache_tti_overflows_total', 0):,.0f}[/]"
        )
        self.update(card_content)


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

        self.label.update(f"[#c8c2a7]{self.title}[/] [bold]{rate_val}/m[/] [#888888]({total_val})[/]")

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

        plt.plot(self.history, color=color, marker="braille")

        # Add internal padding at the top of the plot by setting y-axis limits 30% higher
        max_val = max(self.history) if self.history else 0
        upper_limit = (max_val * 1.3) if max_val > 0 else 1.0
        plt.ylim(0, upper_limit)

        plt.xticks([])
        plt.yticks([])
        plt.xaxes(False, False)
        plt.yaxes(False, False)
        plt.frame(False)
        plt.canvas_color("none")
        plt.axes_color("none")
        plt.ticks_color("none")
        self.plot.refresh()
