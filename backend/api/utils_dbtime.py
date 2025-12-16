from __future__ import annotations

from datetime import datetime, timezone

from django.db import connection


def db_now() -> datetime:
    """Return the MySQL server timestamp as an aware UTC datetime."""
    with connection.cursor() as cur:
        cur.execute("SELECT UTC_TIMESTAMP()")
        row = cur.fetchone()
        value = row[0]
        if isinstance(value, datetime):
            return value.replace(tzinfo=timezone.utc)
        return datetime.fromisoformat(str(value).replace(" ", "T")).replace(tzinfo=timezone.utc)


__all__ = ["db_now"]
