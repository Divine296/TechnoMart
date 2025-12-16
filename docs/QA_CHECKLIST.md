# QA Smoke Checklist (Web & Mobile ready)

Use this list before handing builds to stakeholders. Execute on both the web dashboard and, once available, the mobile app.

## Environment Prep

- Start stack via `scripts/dev.ps1 -Command up` (or `scripts/dev.sh up` on macOS/Linux); this runs frontend, API, MySQL, and Redis.
- Run `docker compose exec api python manage.py migrate` and seed any fixtures.
- Ensure Redis + MySQL containers are healthy; backend health check at http://localhost:8000/api/health/.
- Sign in with an Admin and a Staff account for role-specific scenarios.

## Account & Authentication

- Staff login/logout with email + password works; invalid credential attempt triggers rate limit message.
- Biometric enrollment (face capture) completes and login path rejects unregistered captures.
- Password change from profile reflects on immediate next login.

## Inventory Management

- New inventory item creation updates list instantly via websocket (watch realtime badge).
- Adjusting quantity (`PATCH /inventory/<id>/stock`) updates current stock and triggers toast + WS message.
- Recording a goods receipt increments quantity, logs activity entry, and surfaces in low-stock view when thresholds crossed.
- Stock transfer between locations adjusts both source and destination quantities correctly.

## Order Handling

- Placing an order inserts it into queue for both clients without refresh; status transitions propagate in realtime.
- Illegal status transitions (e.g., completed -> pending) return 400 and leave queue unchanged.
- Bulk progress poll endpoint returns latest statuses for multiple order IDs.

## Payments & Transactions

- Process cash payment populates order history and payment records; refund flow reverses totals and emits notification.
- View payment records filter respects date range and payment method toggles.

## Staff Scheduling

- Shift creation/edit for a staff user persists and is visible to the assignee on refresh.
- Attendance record adjustments (manager role) update summary metrics immediately.

## Notifications

- Sending notification from admin delivers toast + websocket event; receiving user can mark as read and see state sync across clients.
- Background push (FCM/APNs) placeholder logs appear for future mobile integration.

## Reports & Analytics

- Sales report daily + monthly tabs render without console errors and match manual totals from orders placed in session.
- Inventory report export (PDF) downloads and matches onscreen data.

## Regression Guards

- Run `npm test` and `python manage.py test` (or `pytest`) locally; ensure CI pipeline passes.
- Verify websocket endpoint `ws://localhost:8000/ws/events/?token=<JWT>` accepts a valid token and pushes order + inventory events during flows above.
- Confirm graceful failure when Redis is offline: API still serves requests, websocket connection retries with error banner.
