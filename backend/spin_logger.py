"""
Fire-and-forget helpers for writing to the core platform's log endpoints.

All functions swallow exceptions so a log failure never aborts a user request.
Set CORE_API_URL in the environment (default: http://backend:8000).
"""

import asyncio
import os

import httpx

CORE_API_URL = os.getenv("CORE_API_URL", "http://backend:8000")  # core backend on the Docker network
MODULE_SCOPE = "cloudInsightAI"  # Webpack federation scope — accepted as module_id by the core log endpoint


async def _post(authorization: str, path: str, body: dict) -> None:
    """Send a single POST to the core API; errors are silently discarded."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            await client.post(
                f"{CORE_API_URL}{path}",
                json=body,
                headers={"Authorization": authorization},
            )
    except Exception:
        pass  # best-effort — never propagate log errors to the caller


def log_module(authorization: str, event_type: str, details: dict | None = None) -> None:
    """Schedule a module log entry as a background task (non-blocking)."""
    asyncio.ensure_future(
        _post(authorization, f"/api/module-logs/{MODULE_SCOPE}", {"event_type": event_type, "details": details or {}})
    )


def log_bot(
    authorization: str,
    bot_uuid: str,
    event_type: str,
    details: dict | None = None,
    *,
    message: str = "",
    level: str = "INFO",
) -> None:
    """Schedule a custom bot log entry as a background task (non-blocking)."""
    asyncio.ensure_future(
        _post(
            authorization,
            f"/api/bot-logs/custom/{bot_uuid}",
            {"event_type": event_type, "details": details or {}, "message": message, "level": level},
        )
    )
