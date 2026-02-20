#!/bin/bash
set -e

echo "Starting Docker services..."
docker compose up -d

# Wait for Redis and others
echo "Waiting for services to be ready (5s)..."
sleep 5

echo "Running Integration Tests..."
uv run pytest tests/integration/test_telemetry_comparison.py -s

echo "Cleaning up Docker..."
docker compose down

echo "Done!"
