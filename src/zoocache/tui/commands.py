import time
from collections.abc import Awaitable, Callable

import redis.asyncio as redis


class CommandHandler:
    """Handles commands submitted via the TUI Input box."""

    def __init__(self, redis_client: redis.Redis, prefix: str):
        self.redis_client = redis_client
        self.prefix = prefix
        self._handlers: dict[str, Callable[[list[str]], Awaitable[tuple[str, str]]]] = {
            "invalidate": self._handle_invalidate,
            "prune": self._handle_prune,
        }

    async def execute(self, cmd_str: str) -> tuple[str, str]:
        """
        Executes a command and returns a tuple of (summary, details) for logging.
        """
        parts = cmd_str.split()
        if not parts:
            return ("", "")

        # Default assumption: target is 'all', and the first word is the command
        target = "all"
        command = parts[0].lower()
        args = parts[1:]

        # If the first word is NOT a known command, assume it's a target
        if command not in self._handlers and len(parts) > 1:
            target = parts[0]
            command = parts[1].lower()
            args = parts[2:]

        # Strip colon prefix if the user still types it out of habit
        if command.startswith(":"):
            command = command[1:]

        handler = self._handlers.get(command)
        if not handler:
            return ("CLI Error: Unknown Command", f"The command '{command}' is not recognized by the system.")

        try:
            return await handler(args, target)
        except Exception as e:
            return ("CLI Error: Exception Occurred", f"Command execution failed internally: {str(e)}")

    async def _handle_invalidate(self, args: list[str], target: str) -> tuple[str, str]:
        if not args:
            return (
                "CLI Error: Missing Arguments",
                "The invalidate command requires a target tag. Usage: [target] invalidate <tag>",
            )
        tag = args[0]

        channel = f"{self.prefix}:invalidate" if target == "all" else f"{self.prefix}:node:{target}:invalidate"

        # Rust core expects tag|timestamp (not colon)
        payload = f"{tag}|{int(time.time() * 10)}"

        await self.redis_client.publish(channel, payload)

        target_display = "Cluster-wide" if target == "all" else f"Node {target}"
        return (
            f"Command Executed: Invalidation Sent ({target_display})",
            f"Broadcast sent to forcefully evict tag: {tag}",
        )

    async def _handle_prune(self, args: list[str], target: str) -> tuple[str, str]:
        return (
            "CLI Notice: Feature Not Implemented",
            "Cluster-wide prune operations are not currently supported by this node.",
        )
