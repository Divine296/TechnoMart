# Unified Delivery Plan for Web Dashboard & Mobile App

## 1. Objectives

- Deliver a single source of truth for inventory, orders, payments, staff scheduling, and notifications by consolidating both clients on the Django backend + one relational database.
- Provide near real-time state parity between mobile and web without deploying to production yet; focus on local/staging readiness and developer productivity.
- Keep implementation pragmatic: reuse existing Django REST foundations, avoid unnecessary services, document hand-off clearly.

## 2. Current Snapshot & Assumptions

- Web dashboard: Vite + React 19 SPA already integrated with Django REST + JWT auth.
- Backend: Django API with role-based access and migrations; needs dedicated MySQL instance for shared data; supports CORS and notifications scaffolding.
- Mobile app: still under active development (assume React Native or Flutter); needs API parity and shared auth tokens; no current backend coupling.
- Environment targets: local developer machines and a shared staging environment (Docker or bare-metal) without external hosting.

## 3. Target Architecture Overview

- **Backend core**: Single Django project exposing REST endpoints + auth; continue to expand `backend/api` app for all features.
- **Database**: Standardize on MySQL 8 (local Docker + optional remote staging) for ACID compliance and familiar ops footprint.
- **Realtime layer**: Django Channels + Redis (via Docker) for WebSocket or Server-Sent Events broadcasts; same channel feeds both clients.
- **Clients**: Web SPA (existing) and Mobile app share API client, JWT auth, and subscribe to real-time events; mobile leverages push notifications (FCM/APNS) for out-of-app alerts.
- **Infrastructure**: Docker Compose stack (web dev server, Django API, MySQL, Redis, optional nginx) for consistent local/staging environment.

## 4. Database & Data Management Plan

1. Translate existing Django models to MySQL-safe schema (audit field types, indexes) and set `DJANGO_DB_ENGINE=mysql` with required credentials.
2. Provide Docker Compose service for MySQL + data volume; seed reference data (roles, default admin) via fixtures or migrations.
3. Establish naming/versioning rules for migrations (feature-based folder or timestamp) and document rollback strategy (snapshot/backup prior to each release).
4. Implement database access layer tests (pytest + Django test runner) to ensure data integrity (orders, inventory stock decrement, staff shifts) against MySQL.

## 5. API + Integration Workstream

1. Inventory, orders, payments, scheduling, notifications endpoints audited for completeness; fill gaps with serializers/viewsets.
2. Align response contracts for mobile vs web: reuse DTOs; add versioned `/api/v1` prefix.
3. Document authentication & refresh flow for mobile (JWT + refresh or rotating access token); share Postman/Insomnia collection.
4. Introduce contract tests (schemathesis or pytest API tests) that run against local API to prevent breaking clients.

## 6. Realtime Update Strategy

1. Add Django Channels, configure ASGI, Redis broker, and channel layers.
2. Define event topics: `inventory.updated`, `order.status_changed`, `payment.recorded`, `schedule.updated`, `notification.created`.
3. On model save/mutation, publish events via signal handlers or service layer; payload kept concise (ids + minimal metadata).
4. Web SPA uses React Query + WebSocket listener to invalidate caches; mobile uses WebSocket client (or fallback to polling) and optionally schedules push notifications via FCM when app backgrounded.
5. Provide dev tooling: local event simulator + logging to verify broadcasts.

## 7. Development Phases & Timeline (suggested sprints)

- **Sprint 0 - Alignment (1 week)**: Confirm mobile tech stack, enumerate API gaps, decide on MySQL + Redis tooling, write ADRs.
- **Sprint 1 - Database Unification (1 week)**: Stand up MySQL via Docker, update Django settings, run migrations, update CI to use MySQL, seed baseline data.
- **Sprint 2 - API Hardening (1-2 weeks)**: Close endpoint gaps, finalize auth flow, add serializer validations, ship API docs, add contract tests.
- **Sprint 3 - Realtime Enablement (1-2 weeks)**: Integrate Channels + Redis, emit events for critical flows, update web SPA to respond to events.
- **Sprint 4 - Mobile Integration (2 weeks)**: Implement mobile API client & session storage, connect to realtime events, build offline caching strategy, add push notifications for key events.
- **Sprint 5 - System QA & UAT (1 week)**: Run end-to-end test scripts across both clients, perform load smoke tests, capture feedback, address blockers.

## 8. Tooling, CI/CD, and Environment Strategy

- Extend existing npm + Django scripts with `docker compose` tasks (`docker compose up api web mysql redis`).
- Add Makefile/PowerShell helpers to bootstrap env (install deps, run migrations, start dev stack).
- Update CI (GitHub Actions) to run backend tests against MySQL + Redis service containers; trigger mobile lint/build pipeline if repo available.
- Use feature flags (.env toggles) for realtime features to allow gradual rollout.

## 9. Quality Assurance & Testing

- Automated: backend unit/integration tests, API contract tests, web Jest/component tests, mobile unit/UI tests (if RN -> Jest/Detox).
- Manual: smoke checklist per module (inventory, orders, payments, schedule, notifications) executed on both clients.
- Data validation: periodic scripts comparing derived metrics (eg. daily sales) across mobile/web views to ensure parity.
- Monitoring-in-dev: enable verbose logging + simple dashboard (Grafana optional) to observe Redis channel throughput during QA.

## 10. Risks & Mitigations

- **Mobile stack uncertainty**: Lock tech choice in Sprint 0; create adapter layer to isolate API consumption.
- **Realtime complexity**: Start with critical events only; provide polling fallback for unstable networks.
- **Database migration pain**: Perform full backup before each schema change and rehearse export/import to MySQL on shared staging.
- **Developer environment drift**: Enforce Docker Compose workflow + `.env.example` parity checks.

## 11. Immediate Next Actions

1. Schedule architecture sync with mobile & web leads to validate assumptions and confirm tech stack.
2. Draft ADR on moving to MySQL + Redis and circulate for approval.
3. Spin up Docker Compose prototype (Django + MySQL + Redis) and verify migrations + Channels hello-world endpoint.
4. Inventory current API coverage vs mobile requirements; create backlog of missing endpoints/events.
