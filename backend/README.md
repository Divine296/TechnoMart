# Backend (Django)

The Django service powers the REST API shared by the web dashboard and the upcoming mobile app. It is designed to run against MySQL 8 for every environment so data stays consistent across clients.

## Quick start (Docker Compose)

> To point the API at a different MySQL instance (e.g., one you manage in MySQL Workbench), edit `backend/.env` and set `DJANGO_DB_HOST`, `DJANGO_DB_NAME`, `DJANGO_DB_USER`, and `DJANGO_DB_PASSWORD` to your values. When using Docker on Windows/macOS, `host.docker.internal` lets the container reach your host MySQL server.

1. Copy environment templates
   - `cp backend/.env.example backend/.env`
   - Adjust credentials only if you do not want to use the default dev values.
2. Launch the stack
   - `docker compose up --build`
   - Services: `api` (Django dev server), `mysql` (MySQL 8), `redis` (Channels + caching), `frontend` (Vite dev server).
3. Apply database migrations (first run)
   - `docker compose exec api python manage.py migrate`
4. Bootstrap an admin account (optional)
   - `docker compose exec api python manage.py bootstrap_admin --email admin@example.com --password "change-me" --name "Admin"`
5. Access the API at http://localhost:8000/api/health/
6. WebSocket stream: ws://localhost:8000/ws/events/?token=<JWT>

## Manual setup (without Docker)

1. Install MySQL 8 locally (or use an existing instance) and create credentials
   - Create database `technomart` with UTF8MB4 collation
   - Create user `tm_user` with password `tm_password`
   - Grant the user full access to the database
2. Create and activate a virtual environment
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. Configure environment
   - Copy `.env.example` to `.env`
   - Ensure the MySQL credentials match your local setup
4. Run migrations and start the dev server
   ```powershell
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

## Core endpoints

Refer to `API_USAGE_GUIDE.md` for a catalogue of auth, ordering, inventory, payments, and reporting endpoints that both clients rely on.

## Notes

- The Django settings always resolve to MySQL; other database engines are not supported in this repo.
- Redis is required for background tasks and realtime updates once Django Channels is enabled.
- Use `python manage.py createsuperuser` if you also want access to the Django admin interface at `/admin`.
- Update `.env` values before deploying to any shared environment.

## Helper scripts

- `scripts/dev.ps1 -Command up` (Windows) / `scripts/dev.sh up` (macOS/Linux): build + start docker compose stack.
- `scripts/dev.ps1 -Command migrate` / `scripts/dev.sh migrate`: run Django migrations inside the container.
- `scripts/dev.ps1 -Command bootstrap-admin -Args "--email admin@example.com --password change-me"`: management helpers without typing docker compose commands.
