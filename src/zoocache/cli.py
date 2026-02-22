import argparse
import os
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="zoocache",
        description="ZooCache 🐾 - Command Line Interface",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    cli_parser = subparsers.add_parser("cli", aliases=["dashboard"], help="Launch the TUI CLI")
    cli_parser.add_current_env_var = "REDIS_URL"
    cli_parser.add_argument(
        "--redis",
        type=str,
        default=os.getenv("REDIS_URL"),
        help="Redis connection URL (e.g. redis://localhost:6379). Defaults to REDIS_URL env var.",
    )
    cli_parser.add_argument(
        "--prefix",
        type=str,
        default="zoocache",
        help="ZooCache prefix used in Redis. Defaults to 'zoocache'.",
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command in ("cli", "dashboard"):
        run_cli(args)


def run_cli(args: argparse.Namespace) -> None:
    if not args.redis:
        print("Error: A Redis URL is required to launch the CLI.", file=sys.stderr)
        print("Provide it via --redis or the REDIS_URL environment variable.", file=sys.stderr)
        print("\nNote: The application being monitored MUST have ZooCache configured", file=sys.stderr)
        print("with storage_url pointing to this Redis instance to receive telemetry.", file=sys.stderr)
        sys.exit(1)

    try:
        from zoocache.tui.app import ZooCacheCLI
    except ImportError:
        print("Error: The 'textual' package is required for the CLI.", file=sys.stderr)
        print("Please install ZooCache with the cli extras: pip install zoocache[cli]", file=sys.stderr)
        sys.exit(1)

    app = ZooCacheCLI(redis_url=args.redis, prefix=args.prefix)
    app.run()


if __name__ == "__main__":
    main()
