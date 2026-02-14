#!/bin/bash
set -e

cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
uv run ruff check . --fix
uv run ruff format .
