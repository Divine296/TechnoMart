# Notifications System Setup Guide

This guide explains how to set up and use the complete notifications system with Celery, email delivery, and push notifications.

## Overview

The notification system consists of:

- **Backend API**: Django REST endpoints for notifications
- **Database Models**: Notification, NotificationPreference, WebPushSubscription, NotificationOutbox
- **Templates**: Pre-defined notification templates for various events
- **Celery Tasks**: Background workers for email and push notification delivery
- **Frontend Service Worker**: Browser push notifications
- **Automated Triggers**: Auto-create notifications for business events

## Prerequisites

1. **Redis Server** (for Celery broker)

   ```bash
   # Install Redis (Windows with WSL or Docker)
   docker run -d -p 6379:6379 redis:alpine

   # Or install Redis locally
   # https://redis.io/docs/getting-started/installation/
   ```

2. **VAPID Keys** (for Web Push)

   ```bash
   # Install py-vapid
   pip install py-vapid

   # Generate VAPID keys
   vapid --gen
   ```

3. **Email Service** (SMTP or provider like SendGrid)

## Installation

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:

- `celery>=5.3` - Background task processing
- `redis>=5.0` - Celery broker and result backend
- `py-vapid>=1.9` - VAPID key generation for Web Push
- `pywebpush>=1.14` - Web Push protocol implementation

### 2. Configure Environment Variables

Add to `backend/.env`:

```env
# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Web Push / VAPID Keys (generate with: vapid --gen)
WEBPUSH_VAPID_PUBLIC_KEY=your_public_key_here
WEBPUSH_VAPID_PRIVATE_KEY=your_private_key_here
WEBPUSH_VAPID_SUBJECT=mailto:your-email@example.com

# Email Configuration (if not already set)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### 3. Run Database Migrations

```bash
python manage.py migrate
```

This creates the notification tables if they don't already exist.

### 4. Start Celery Worker

Open a new terminal and run:

```bash
cd backend
celery -A config worker --loglevel=info
```

### 5. Start Celery Beat (Scheduled Tasks)

Open another terminal and run:

```bash
cd backend
celery -A config beat --loglevel=info
```

Celery Beat runs periodic tasks:

- Process notification outbox every 2 minutes
- Cleanup old notifications daily at 2 AM

### 6. Frontend Setup

The service worker is automatically registered when the app starts. Make sure the frontend is built:

```bash
npm run build
```

## Usage

### Creating Notifications Programmatically

#### Using Templates

```python
from api.notification_templates import format_notification
from api.tasks import create_notification

# Format notification using template
notification_data = format_notification(
    'low_stock_alert',
    item_name='Coffee Beans',
    current_stock=5,
    unit='kg',
    reorder_level=10
)

# Create and send notification
create_notification.delay(
    user_id=user.id,
    title=notification_data['title'],
    message=notification_data['message'],
    notification_type=notification_data['type'],
    meta={'item_id': str(item.id)},
    send_immediately=True
)
```

#### Using Triggers

Triggers automatically create notifications when certain events occur:

```python
from api.notification_triggers import (
    trigger_low_stock_alert,
    trigger_new_order,
    trigger_payment_received,
    trigger_catering_booking,
)

# Trigger low stock alert
trigger_low_stock_alert(inventory_item)

# Trigger new order notification
trigger_new_order(order)

# Trigger payment received
trigger_payment_received(order, amount=500.00, payment_method='Cash')

# Trigger catering booking
trigger_catering_booking(catering_event)
```

### Integrating Triggers into Your Code

Add triggers to your model save methods or view endpoints:

**Example: Inventory Update**

```python
# In api/views_inventory.py
from api.notification_triggers import trigger_low_stock_alert, trigger_out_of_stock

def update_inventory_item(request, item_id):
    item = InventoryItem.objects.get(id=item_id)

    # ... update item ...
    item.save()

    # Check for low stock
    if item.stock_quantity <= item.reorder_level:
        trigger_low_stock_alert(item)

    # Check for out of stock
    if item.stock_quantity <= 0:
        trigger_out_of_stock(item)

    return JsonResponse({'success': True})
```

**Example: Order Creation**

```python
# In api/views_orders.py
from api.notification_triggers import trigger_new_order

def create_order(request):
    # ... create order ...
    order.save()

    # Trigger notification
    trigger_new_order(order)

    return JsonResponse({'success': True, 'order_id': str(order.id)})
```

## Available Templates

### Inventory

- `low_stock_alert` - Item stock below reorder level
- `out_of_stock` - Item out of stock
- `item_expiring_soon` - Items expiring within 7 days
- `item_expired` - Item has expired

### Orders

- `new_order` - New order received
- `order_completed` - Order completed
- `order_cancelled` - Order cancelled

### Payments

- `payment_received` - Payment received successfully
- `payment_failed` - Payment failed

### Catering

- `catering_booking_confirmed` - Catering event confirmed
- `catering_booking_pending` - New catering booking request
- `catering_booking_cancelled` - Catering event cancelled
- `catering_reminder` - Upcoming catering event reminder

### Employee

- `shift_assigned` - Employee shift assigned
- `shift_updated` - Employee shift updated
- `shift_cancelled` - Employee shift cancelled
- `leave_approved` - Leave request approved
- `leave_rejected` - Leave request rejected

### System

- `system_maintenance` - System maintenance scheduled
- `backup_completed` - Backup completed successfully
- `backup_failed` - Backup failed

## Testing Push Notifications

1. **Enable Push in Frontend**
   - Go to Notifications page
   - Toggle "Push Notifications" switch
   - Grant browser permission when prompted

2. **Test from Django Shell**

   ```python
   python manage.py shell

   from api.tasks import send_push_notification
   from django.contrib.auth import get_user_model

   User = get_user_model()
   user = User.objects.first()

   send_push_notification.delay(
       user_id=user.id,
       title='Test Notification',
       message='This is a test push notification!',
       notification_type='info'
   )
   ```

3. **Check Browser**
   - You should see a browser notification appear
   - Check browser console for service worker logs

## Monitoring

### Celery Task Status

```bash
# View active tasks
celery -A config inspect active

# View registered tasks
celery -A config inspect registered

# View stats
celery -A config inspect stats
```

### Django Admin

Access notification data in Django admin:

- Notifications: View all in-app notifications
- NotificationPreferences: User notification settings
- WebPushSubscriptions: Active push subscriptions
- NotificationOutbox: Queued email/push notifications

### Logs

Check logs for debugging:

```bash
# Celery worker logs
tail -f celery.log

# Django logs
tail -f django.log
```

## Troubleshooting

### Issue: Push notifications not working

**Check:**

1. Service worker registered: Open DevTools > Application > Service Workers
2. VAPID keys configured in `.env`
3. Browser permission granted
4. Push subscription exists in database
5. Celery worker running

### Issue: Email notifications not sent

**Check:**

1. Email settings configured in `.env`
2. SMTP credentials valid
3. Celery worker running
4. Check NotificationOutbox table for failed items

### Issue: Celery tasks not running

**Check:**

1. Redis server running: `redis-cli ping` (should return `PONG`)
2. Celery worker running: `celery -A config inspect ping`
3. Check for errors in worker logs

## Production Deployment

### 1. Use Supervisor or Systemd for Celery

**Example systemd service** (`/etc/systemd/system/celery.service`):

```ini
[Unit]
Description=Celery Service
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/celery -A config worker --loglevel=info --logfile=/var/log/celery/worker.log --pidfile=/var/run/celery/worker.pid --detach
ExecStop=/path/to/venv/bin/celery -A config control shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

### 2. Use Redis Sentinel or Cluster

For high availability, use Redis Sentinel or Redis Cluster instead of standalone Redis.

### 3. Configure Celery Queues

Separate queues for different priority levels:

```python
# In config/celery.py
app.conf.task_routes = {
    'api.tasks.send_email_notification': {'queue': 'email'},
    'api.tasks.send_push_notification': {'queue': 'push'},
    'api.tasks.process_notification_outbox': {'queue': 'outbox'},
}
```

Start workers for specific queues:

```bash
celery -A config worker -Q email,push,outbox --loglevel=info
```

### 4. Monitor with Flower

Install Flower for monitoring:

```bash
pip install flower
celery -A config flower
```

Access at `http://localhost:5555`

## API Endpoints

All notification endpoints are available at `/api/notifications`:

- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `POST /api/notifications/<id>/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/<id>` - Delete notification
- `GET /api/notifications/settings` - Get user preferences
- `PUT /api/notifications/settings` - Update preferences
- `GET /api/notifications/push/public-key` - Get VAPID public key
- `POST /api/notifications/push/subscribe` - Subscribe to push
- `POST /api/notifications/push/unsubscribe` - Unsubscribe from push

## Security Considerations

1. **VAPID Keys**: Keep private key secret, never expose in frontend
2. **Push Subscriptions**: Validate endpoint URLs before storing
3. **Rate Limiting**: Implement rate limits on notification creation
4. **Permissions**: Only admins/managers should trigger certain notifications
5. **Email**: Use app-specific passwords, not main account password
6. **HTTPS**: Push notifications require HTTPS in production

## Next Steps

1. Add more notification templates for your specific use cases
2. Implement notification preferences for more granular control
3. Add notification history/archive feature
4. Implement notification categories and filters
5. Add notification analytics and reporting
6. Implement notification digests (daily/weekly summaries)

## Support

For issues or questions:

- Check logs: Celery worker logs, Django logs
- Review Django admin: Notification tables
- Test individual components: Tasks, triggers, service worker
- Consult Django and Celery documentation
