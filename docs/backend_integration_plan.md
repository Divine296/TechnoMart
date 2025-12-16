# Backend Integration Blueprint

This document captures the plan to evolve the Expo mobile frontend and Django backend into a cohesive, production-ready full-stack platform.

## 1. Mobile Requirements ↔ Backend Alignment

- **Account Management** (login, password updates, biometric login, profile edits): Django `accounts` app exposing DRF endpoints for authentication, credential management, profile data, and device-bound biometric tokens. Data entities: `User`, `StaffProfile`, `BiometricCredential`.
- **Inventory Management** (stock levels, updates, expiry tracking, menu management, alerts, restocking schedule): `inventory` app storing `InventoryItem`, `StockLedger`, `ExpiryWatch`, `MenuItem`, `RestockPlan`. Supports staff read/write and manager-level controls.
- **Order Handling** (placements, queue processing, status updates, bulk tracking): `orders` app with `Order`, `OrderLine`, `OrderWorkflowEvent`, `BulkOrder`. Real-time queue updates via WebSocket/SignalR alternative (Django Channels) or expo push notifications.
- **Payments & Transactions** (cash/online processing, history, refunds, records): `payments` app with `Transaction`, `PaymentMethod`, `RefundRequest`, integrated with external payment gateway; audit all financial events.
- **Staff & Scheduling** (profiles, shifts, attendance, leave): `scheduling` app managing `Shift`, `AttendanceRecord`, `LeaveRequest`, tied to `StaffProfile`.
- **Reports & Analytics**: reporting service (could be `reports` app) aggregating sales, inventory, order, attendance, customer purchase history; leverages background tasks for heavy queries.
- **Notifications** (send/receive/view updates): `notifications` app storing `Notification`, linking to Expo push tokens, email/SMS providers; used across modules.

### Data Flow Overview

`React Native (Expo) client → HTTPS (REST/JSON) → Django REST Framework API Layer → Service Layer / Celery Tasks → MySQL (primary data store) + Redis (cache/queue) → External integrations (Payment gateway, biometric provider, push notifications)`

- Mobile app authenticates with JWT (short-lived access, refresh token rotation) and includes role info (Staff vs Manager) for feature gating.
- DRF serializers handle validation, convert to service calls, and persist via Django ORM to MySQL.
- Celery workers (with Redis broker) handle asynchronous jobs: stock alerts, daily reports, notification fan-out, biometric verification callbacks.
- WebSockets (Django Channels) or Expo push deliver near real-time order/notification updates to the mobile app.

### Non-Functional Targets

- **Availability**: API uptime ≥ 99.5%; schedule maintenance windows; leverage blue/green deploys.
- **Performance**: P95 API latency < 300 ms for read operations; queue-driven writes tolerate 1–2 s; background reports within 5 min.
- **Security & Compliance**: Enforce TLS, encrypt sensitive data at rest (MySQL TDE or column-level encryption), audit trails for financial/staff actions; comply with local data privacy regulations.
- **Scalability**: Horizontal scaling via containerized services; use connection pooling (e.g., PgBouncer equivalent for MySQL such as ProxySQL).
- **Observability**: Centralized logging (JSON structured), metrics (Prometheus-compatible), alerting on error rates, latency, queue depth.
- **Reliability**: Automated nightly backups with point-in-time recovery; DR plan with <= 4 hour RTO.

## 2. Architecture Choices

### Core Stack

- **Backend Framework**: Django 5 with Django REST Framework (DRF) for API endpoints, schema generation, and browsable admin tooling.
- **Database Tier**: MySQL 8 (InnoDB) as the system-of-record. Primary/replica topology: single writer, optional read replica for analytics/reporting workloads; automated failover managed by cloud provider.
- **Caching & Message Broker**: Redis 7 operating as both Celery broker/result backend and low-latency cache for frequent lookups (e.g., inventory summaries, role permissions).
- **Async & Scheduled Jobs**: Celery workers containerized separately from the web app; Celery Beat schedules recurring jobs (stock alerts, report generation, data cleanup).
- **Real-time Updates**: Django Channels with Redis channel layer for live order queue updates; Expo push notifications leveraged for background delivery to devices.
- **Authentication & Authorization**: `djangorestframework-simplejwt` issuing short-lived access tokens and refresh tokens; custom RBAC middleware consulting role/permission tables; biometric logins stored as device-signed public keys associated to user accounts.

### Deployment & Environments

- **Local Development**: Docker Compose stack (`web`, `worker`, `redis`, `mysql`, `celery-beat`) with hot reload for Django and Expo Metro bundler for the mobile client.
- **Staging**: Container images pushed to registry; deployed to managed Kubernetes (AKS/EKS/GKE) with separate MySQL instance, Redis, and object storage bucket; feature flags enabled for beta users.
- **Production**: Autoscaled Kubernetes deployment with horizontal pod autoscaler on both web and worker pools; managed MySQL (Amazon RDS/Azure Database for MySQL) with automated backups and multizone replicas; Redis via managed service (Elasticache/Azure Cache).
- **Networking**: API fronted by application load balancer + WAF; TLS termination at ingress; internal VPC/virtual network isolating database/Redis; outbound NAT for external integrations.
- **Secrets & Config**: Managed secrets (AWS Secrets Manager/Azure Key Vault) injected as environment variables; segregation of config per environment via `.env` templates.

### Supporting Services

- **CI/CD Pipeline**: GitHub Actions workflow stages: linting/tests -> build Docker images -> push to registry -> deploy via Helm/Terraform. Rollbacks handled via Helm release history.
- **Observability Stack**: OpenTelemetry instrumentation emitting traces/metrics/logs; aggregated in Grafana stack (Prometheus + Loki + Tempo) with alerting rules for SLA breaches.
- **File Storage**: S3-compatible bucket for receipts, report exports, biometric reference files; signed URLs for secure access.
- **Third-Party Integrations**: Payment gateway SDK (e.g., Stripe) wrapped in service class; biometric provider (FaceTec) integrated via webhook callbacks; notification providers (Expo push, email/SMS) abstracted behind Celery tasks.

## 3. Domain Modeling & Security Posture

### Core Entities

- **Accounts**
  - `User` (extends Django auth user) with roles (`Staff`, `Manager`, `Admin`), MFA flags, biometric enrollment status.
  - `StaffProfile`: personal info, employment data, biometric linkage, assigned store/branch.
  - `Role` & `Permission`: granular RBAC mapping; migrations seed default role-permission sets.
- **Inventory**
  - `InventoryItem`: product metadata, SKU, category, cost, supplier.
  - `StockBatch`: quantity, lot number, expiry date, storage location.
  - `StockMovement`: adjustments (inbound/outbound), user reference, movement type.
  - `MenuItem`: published products linked to `InventoryItem` and pricing.
  - `RestockPlan`: preferred reorder levels, supplier schedule.
- **Orders**
  - `Order`: header with status lifecycle (`draft`, `queued`, `preparing`, `ready`, `completed`, `cancelled`).
  - `OrderLine`: quantity, linked `MenuItem`, modifiers.
  - `OrderWorkflowEvent`: timestamped transitions with actor + channel (mobile, kiosk, manager override).
  - `BulkOrder`: collection of orders grouped by organization or event.
- **Payments**
  - `PaymentMethod`: cash, card token, digital wallet info.
  - `Transaction`: amount, currency, status, gateway reference, reconciliation flag.
  - `Refund`: ties to original transaction, approval status, processed-by user.
  - `Receipt`: generated media stored in object storage, metadata in DB.
- **Scheduling**
  - `Shift`: date, time span, assigned staff, status.
  - `AttendanceRecord`: clock-in/out times, method (manual, biometric).
  - `LeaveRequest`: type, approval chain, balance tracking.
- **Notifications**
  - `Notification`: message payload, category, severity, read status.
  - `NotificationChannel`: Expo push token, email, SMS endpoint.
  - `NotificationDispatch`: send attempts, status, error logs.
- **Reports**
  - `ReportJob`: type (sales, inventory, order, attendance, customer history), parameters, generation status.
  - `ReportSnapshot`: generated file link, retention policy metadata.

### Relationships & Integrity

- Use foreign keys with cascading rules mindful of audit; soft-delete sensitive rows via `is_active` flags or archival tables.
- Unique constraints on (`Order.id`), (`InventoryItem.sku`), (`StaffProfile.user_id`), (`NotificationChannel.device_id`).
- Index high-read columns (order status, inventory SKU, report job type).
- Implement history tables (`django-simple-history`) for critical models (orders, transactions, attendance).

### Security Architecture

- **Authentication**: OAuth2 password grant/JWT for mobile; refresh tokens stored server-side whitelist for revocation; device fingerprinting for biometric-required actions.
- **Authorization**: RBAC tables with permission slugs mapping to DRF custom permissions; per-object checks for branch-specific data.
- **Data Protection**:
  - Encrypt sensitive columns (PII, payment tokens) using Django `FernetFields` or MySQL `AES_ENCRYPT`.
  - Enforce HTTPS, HSTS, and strict CSP for any web-admin surfaces.
- **Audit & Compliance**:
  - Central audit log capturing login attempts, permission changes, financial operations.
  - Retention rules per data class (financial >= 7 years, attendance >= 3 years, biometrics minimal).
- **Secrets Management**: No secrets in repo; rely on secret manager; rotate keys quarterly.
- **Vulnerability Mitigation**: Enable Django SecurityMiddleware, rate-limit login endpoints, CAPTCHAs for suspicious activity, regular dependency scans.

## 4. API Contract Outline

> All endpoints prefixed with `/api/v1/`. Responses follow JSON:API-style envelopes `{ "data": ..., "meta": ... }`. Validation errors return HTTP 422 with field-level error arrays.

### Accounts

- `POST /auth/login` → body `{ email | username, password }` returns `{ access_token, refresh_token, user: {...} }`.
- `POST /auth/refresh` → body `{ refresh_token }` returns new access/refresh pair with rotation.
- `POST /auth/logout` → invalidates refresh token (requires Authorization header and refresh token in body).
- `POST /auth/biometric/register` → body `{ device_id, public_key, signature }` creates biometric credential; restricted to managers enabling staff.
- `POST /auth/biometric/login` → body `{ device_id, challenge_response }` returns tokens; fallback to password required every 30 days.
- `PATCH /users/me` → update profile fields (name, contact). Validates against RBAC (staff can't elevate role).
- `PATCH /users/me/password` → body `{ current_password, new_password }`, enforce password policy.

### Inventory

- `GET /inventory/items` → supports filters (`sku`, `category`, `low_stock`, `expiring_within`); returns paginated list.
- `POST /inventory/items` (manager-only) → create item; requires menu linkage data.
- `PATCH /inventory/items/{id}` → update item attributes; validation ensures non-negative stock.
- `GET /inventory/items/{id}/batches` → list stock batches with expiry info.
- `POST /inventory/items/{id}/movements` → body `{ type: "adjustment"|"receive"|"deduct", quantity, reason }`; triggers Celery job for audit log.
- `GET /inventory/restock-plans` → returns schedule per item; optional `status` filter.
- `POST /inventory/restock-plans` → create/update min/max, supplier info.

### Orders

- `POST /orders` → body with customer info (optional), lines array, payment intent. Returns order in `queued` status.
- `GET /orders` → query parameters `status`, `assigned_to`, `bulk_id`, `date_range`.
- `PATCH /orders/{id}` → update status transitions, enforce allowed transitions by role.
- `POST /orders/{id}/assign` → assign to staff; manager override permitted.
- `POST /orders/bulk` → create bulk orders; returns `bulk_order_id`; Celery handles preallocation.
- `GET /orders/bulk/{id}/progress` → aggregated metrics on completion percentage and outstanding actions.
- `GET /orders/queue` (websocket handshake at `/ws/orders/queue/`) for realtime updates.

### Payments

- `POST /payments/transactions` → initiates cash/online payments; request includes `order_id`, `amount`, `method`, `gateway_token`.
- `POST /payments/transactions/{id}/capture` → confirm online payments; asynchronous webhook from gateway hits `/payments/webhooks/gateway`.
- `POST /payments/transactions/{id}/refund` → manager-only; requires reason and amount ≤ original.
- `GET /payments/transactions` → filters by date, status, staff.
- `GET /payments/receipts/{id}` → returns signed URL to receipt PDF.
- `GET /payments/history` → consolidated order+payment timeline for staff view.

### Scheduling

- `GET /scheduling/shifts` → filters by date range, branch, status.
- `POST /scheduling/shifts` → create shift and assign staff; enforces no overlapping assignments.
- `PATCH /scheduling/shifts/{id}` → update start/end, status.
- `POST /scheduling/attendance/check-in` → body includes `shift_id`, method (`manual|biometric`), geolocation (optional).
- `POST /scheduling/leave` → submit leave request; manager approval via `PATCH /scheduling/leave/{id}` with status.
- `GET /scheduling/attendance` → report-friendly data with filters.

### Notifications

- `POST /notifications/register` → store Expo push token or other channel; associates with user/device.
- `GET /notifications` → paginated; filters by `read`, `category`.
- `PATCH /notifications/{id}` → mark read/unread.
- `POST /notifications/send` → manager/staff with permission; Celery dispatch fan-out to channels.
- `GET /notifications/preferences` → user-level settings; update via `PUT`.

### Reports

- `POST /reports/jobs` → request report generation; body `type`, `date_range`, `format`; enqueues Celery task.
- `GET /reports/jobs` → list with status; includes `progress` meta.
- `GET /reports/jobs/{id}` → detail including signed download link when ready.
- `GET /reports/dashboard-metrics` → aggregated metrics for mobile dashboard; cached (Redis) with TTL 60s.

### Common Patterns

- **Pagination**: Cursor-based via `?cursor=`; default page size 25, max 100.
- **Versioning**: Namespace under `/api/v1/`; breaking changes create `/api/v2/` with feature-flagged rollout.
- **Errors**: Standardized error object `{ "code": "string", "message": "...", "details": { field: ["error"] } }`.
- **Rate Limits**: Apply throttling (`AnonRateThrottle`, `UserRateThrottle`, `ScopedRateThrottle`) tailored to critical endpoints (login, payments).

## 5. Backend Module Implementation (Current Sprint)

- Added `rest_framework` and new `mobile_api` app structured by domain (`accounts`, `inventory`, `orders`, `payments`) with DRF serializers and view layers.
- Proxied existing authentication, biometric, and payment flows through shared helpers to deliver consistent REST payloads while reusing mature business logic.
- Introduced DRF JWT authentication class leveraging existing token issuance, and augmented `AppUser` with `is_authenticated` hints for request contexts.
- Published `/api/v1/` routes covering login/logout/refresh, biometric enrolment, profile update, inventory visibility/adjustments, order status management, and payment capture/refund endpoints.
- Established reusable utilities for marshaling legacy views, enabling incremental migration toward pure DRF implementations and easing future module expansion.

## 6. Persistence & Data Lifecycle (Current Sprint)

- Generated migration `0041_appuser_app_user_role_status_idx` to support role/status lookups powering mobile RBAC checks.
- Verified alignment between ORM models (`AppUser`, `InventoryItem`, `Order`, `PaymentTransaction`) and new serializers; captured expiry threshold defaults for inventory freshness.
- Leveraged existing `backup_db`/`restore_db` management commands; planned Celery Beat job to export compressed MySQL dumps to object storage nightly (retention 30 days).
- Pending follow-up: seed Expo push tokens/notification channels and automate role-to-permission provisioning once mobile clients begin registering devices.

## 7. Mobile Integration (Current Sprint)

- Replaced ad-hoc REST helpers with an Axios client targeting `/api/v1`, including JWT interceptors, shared error normalization, and token refresh coordination via AsyncStorage.
- Introduced React Query (with devtools) plus a new `AuthProvider` to bootstrap sessions, expose `signIn`/`signOut`, and hydrate the Expo router before navigation.
- Wired login, registration, forgot-password, and operations flows (inventory/orders/payments) to the new backend endpoints via dedicated hooks.
- Updated the splash screen to respect authenticated sessions and surfaced DRF validation errors directly within mobile alerts for better UX feedback loops.

## 8. Testing (Current Sprint)

- Added Django unit tests for core mobile endpoints (JWT login, inventory listing) under `mobile_api/tests/` to validate response envelopes and auth guards.
- Test run currently requires MySQL test credentials; plan to introduce sqlite-backed settings override for CI to unblock automation.
- Next steps: expand coverage to orders/payments workflows, add contract tests for Expo -> API payloads, and begin mobile UI smoke tests via Detox or Maestro.
