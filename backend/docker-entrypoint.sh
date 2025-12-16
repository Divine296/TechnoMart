#!/bin/sh
set -e

# Optional socket-level wait for the database service.
if [ "${DJANGO_WAIT_FOR_DB:-1}" = "1" ]; then
  DB_HOST="${DJANGO_DB_HOST:-mysql}"
  DB_PORT="${DJANGO_DB_PORT:-3306}"
  MAX_ATTEMPTS="${DJANGO_WAIT_FOR_DB_MAX_ATTEMPTS:-60}"
  SLEEP_SECONDS="${DJANGO_WAIT_FOR_DB_SLEEP_SECONDS:-1}"

  echo "Waiting for database at ${DB_HOST}:${DB_PORT} (attempts: ${MAX_ATTEMPTS})"
  ATTEMPT=1
  while [ "${ATTEMPT}" -le "${MAX_ATTEMPTS}" ]; do
    if python - <<'PY'
import os
import socket

host = os.environ.get("DJANGO_DB_HOST", "mysql")
port = int(os.environ.get("DJANGO_DB_PORT", "3306"))

try:
    with socket.create_connection((host, port), timeout=1):
        pass
except OSError:
    raise SystemExit(1)
PY
    then
      echo "Database is reachable."
      break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    if [ "${ATTEMPT}" -le "${MAX_ATTEMPTS}" ]; then
      sleep "${SLEEP_SECONDS}"
    else
      echo "Database still unavailable after ${MAX_ATTEMPTS} attempts." >&2
      exit 1
    fi
  done
fi

# Run pending migrations before starting the application server.
python manage.py migrate --noinput

exec "$@"
