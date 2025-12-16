#!/usr/bin/env bash
set -euo pipefail

COMMAND="${1:-up}"
shift || true

compose() {
  echo "[docker compose] $*"
  docker compose "$@"
}

case "$COMMAND" in
  up)
    compose up --build
    ;;
  down)
    compose down -v
    ;;
  stop)
    compose stop
    ;;
  logs)
    service=${1:-api}
    compose logs -f "$service"
    ;;
  migrate)
    compose exec api python manage.py migrate
    ;;
  shell)
    compose exec api python manage.py shell
    ;;
  createsuperuser)
    compose exec api python manage.py createsuperuser
    ;;
  bootstrap-admin)
    compose exec api python manage.py bootstrap_admin "$@"
    ;;
  *)
    echo "Unsupported command: $COMMAND" >&2
    exit 1
    ;;
esac
