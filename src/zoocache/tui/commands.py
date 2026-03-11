import time
from collections.abc import Awaitable, Callable

import redis.asyncio as redis


class CommandHandler:
    def __init__(self, redis_client: redis.Redis, prefix: str):
        self.redis_client = redis_client
        self.prefix = prefix
        self._handlers: dict[str, Callable[[list[str], str], Awaitable[tuple[str, str]]]] = {
            "invalidate": self._handle_invalidate,
            "prune": self._handle_prune,
        }

    async def execute(self, cmd_str: str) -> tuple[str, str]:
        parts = cmd_str.split()
        if not parts:
            return ("", "")

        target = "all"
        command = parts[0].lower()
        args = parts[1:]

        if command not in self._handlers and len(parts) > 1:
            target = parts[0]
            command = parts[1].lower()
            args = parts[2:]

        if command.startswith(":"):
            command = command[1:]

        handler = self._handlers.get(command)
        if not handler:
            return ("CLI Error: Unknown Command", f"Unknown command: {command}")

        try:
            return await handler(args, target)
        except Exception as e:
            return ("CLI Error: Exception", f"Command failed: {e}")

    async def _handle_invalidate(self, args: list[str], target: str) -> tuple[str, str]:
        if not args:
            return (
                "CLI Error: Missing Arguments",
                "Usage: [target] invalidate <tag>",
            )
        tag = args[0]

        channel = f"{self.prefix}:invalidate" if target == "all" else f"{self.prefix}:node:{target}:invalidate"

        payload = f"{tag}|{int(time.time() * 10)}"

        await self.redis_client.publish(channel, payload)

        target_display = "Cluster-wide" if target == "all" else f"Node {target}"
        return (
            f"Command Executed: Invalidation Sent ({target_display})",
            f"Published invalidation for tag: {tag}",
        )

    async def _handle_prune(self, args: list[str], target: str) -> tuple[str, str]:
        return (
            "CLI Notice: Feature Not Implemented",
            "Prune operation is not supported by this node.",
        )
