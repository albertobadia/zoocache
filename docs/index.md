<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.svg">
    <img alt="ZooCache Logo" src="assets/logo-light.svg" width="600">
  </picture>
</p>

**ZooCache** is a high-performance caching library with a Rust core, designed for applications where data consistency and read performance are critical.

---

## 🏗️ Documentation Structure

Our documentation is organized following the **Diátaxis** framework to help you find exactly what you need:

<div class="grid cards" markdown>

-   :material-school:{ .lg .middle } __Tutorials__

    For step-by-step guided learning. Ideal if you are new to ZooCache.

    ---

    [:octicons-arrow-right-24: Getting Started](setup.md)

-   :material-book-open-variant:{ .lg .middle } __How-to Guides__

    Practical recipes for solving specific problems and configurations.

    ---

    [:octicons-arrow-right-24: Django Integration](django.md) <br>
    [:octicons-arrow-right-24: FastAPI Integration](fastapi.md) <br>
    [:octicons-arrow-right-24: CLI Usage](cli.md)

-   :material-lightbulb-outline:{ .lg .middle } __Explanations__

    Clarifies key concepts, architecture, and design decisions.

    ---

    [:octicons-arrow-right-24: Architecture](architecture.md) <br>
    [:octicons-arrow-right-24: Semantic Invalidation](invalidation.md)

-   :material-api:{ .lg .middle } __Reference__

    Detailed technical information about classes and functions.

    ---

    [:octicons-arrow-right-24: API Reference](reference/api.md)

</div>

---

## ⚡ Why ZooCache?

Unlike traditional caches based purely on TTL (Time To Live), ZooCache uses a **PrefixTrie** to manage hierarchical dependencies. This allows for **instant and precise invalidation** based on data changes, not the passage of time.

- **Rust Performance**: Low latency and safe concurrency.
- **Causal Consistency**: Native support for Hybrid Logical Clocks (HLC).
- **Anti-Avalanche**: Native protection against the "thundering herd" effect.
- **Observability**: Integrated telemetry with Prometheus and OpenTelemetry.
