#!/bin/bash
set -e

cargo test

uv run pytest --ignore=benchmarks/ --ignore=tests/integration/ -v
