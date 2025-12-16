"""Lightweight event publisher for broadcasting domain events over Channels."""

from __future__ import annotations

from typing import Iterable, Optional

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

_MAX_GROUP_LENGTH = 100
_ALLOWED_CHARS = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.")


def _normalize_group(name: str) -> str:
    safe = "".join(ch if ch in _ALLOWED_CHARS else "_" for ch in name)
    return safe[:_MAX_GROUP_LENGTH] or "broadcast"


def publish_event(
    event_type: str,
    payload: dict,
    *,
    audience: Optional[Iterable[str]] = None,
    user_ids: Optional[Iterable[str]] = None,
    roles: Optional[Iterable[str]] = None,
) -> None:
    """Broadcast an event to interested websocket subscribers."""
    layer = get_channel_layer()
    if not layer:
        return

    groups = {"broadcast"}
    if audience:
        groups.update(audience)
    if user_ids:
        groups.update({f"user_{uid}" for uid in user_ids})
    if roles:
        groups.update({f"role_{role.lower()}" for role in roles})

    normalized = {_normalize_group(group) for group in groups}

    message = {
        "type": "event.message",
        "event": event_type,
        "payload": payload,
    }

    for group in normalized:
        try:
            async_to_sync(layer.group_send)(group, message)
        except Exception:
            continue


__all__ = ["publish_event"]
