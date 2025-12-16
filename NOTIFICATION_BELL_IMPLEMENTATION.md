# Notification Bell Full-Stack Implementation

This document describes the full-stack implementation of the real-time notification bell in the MainLayout header.

## Overview

The notification bell button in the MainLayout header (`src/layouts/MainLayout.jsx:141`) now displays the live unread notification count from the backend API with real-time updates via WebSocket.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  MainLayout.jsx                                              │
│    └─> useNotifications() hook                               │
│         ├─> Fetches unread count from API                    │
│         ├─> WebSocket connection for real-time updates       │
│         ├─> Polling fallback (30s intervals)                 │
│         └─> Returns: unreadCount, notifications, actions     │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
                   WebSocket + REST API
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Django)                        │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints                                               │
│    ├─> /api/notifications (GET - list notifications)        │
│    ├─> /api/notifications/unread-count (GET - count)        │
│    ├─> /api/notifications/<id>/read (POST - mark read)      │
│    └─> /api/notifications/mark-all-read (POST)              │
│                                                               │
│  WebSocket Consumer                                          │
│    └─> /ws/notifications (real-time updates)                │
│                                                               │
│  Celery Tasks                                                │
│    ├─> send_email_notification                              │
│    ├─> send_push_notification                               │
│    ├─> process_notification_outbox                          │
│    └─> create_notification                                  │
│                                                               │
│  Database Models                                             │
│    ├─> Notification                                          │
│    ├─> NotificationPreference                               │
│    ├─> WebPushSubscription                                  │
│    └─> NotificationOutbox                                   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Implementation

### useNotifications Hook (`src/hooks/useNotifications.js`)

A custom React hook that manages notification state and provides real-time updates.

**Features:**

- Fetches unread count from API on mount
- Establishes WebSocket connection for real-time updates
- Falls back to polling (30s) when WebSocket unavailable
- Handles multiple message types:
  - `notification` - New notification received
  - `notification_read` - Notification marked as read
  - `notification_deleted` - Notification deleted
- Syncs state across browser tabs and devices
- Provides actions: markAsRead, markAllAsRead, deleteNotification, refresh

**API:**

```javascript
const {
  unreadCount, // Number: Current unread notification count
  notifications, // Array: List of recent notifications
  loading, // Boolean: Loading state
  error, // String: Error message if any
  markAsRead, // Function: Mark notification as read
  markAllAsRead, // Function: Mark all as read
  deleteNotification, // Function: Delete notification
  refresh, // Function: Refresh notifications
} = useNotifications();
```

### MainLayout Integration (`src/layouts/MainLayout.jsx`)

The bell button uses the `useNotifications` hook to display the live unread count.

**Before:**

```javascript
// Mock notification count
const notificationCount = 3;
```

**After:**

```javascript
import { useNotifications } from '@/hooks/useNotifications';

const { unreadCount } = useNotifications();
```

**UI Features:**

- Displays badge with unread count when count > 0
- Shows "99+" for counts over 99
- Smooth animation when badge appears/updates
- Accessibility: screen reader announces count
- Real-time updates without page refresh

## Backend Implementation

### API Endpoints

All notification endpoints are available at `/api/notifications`:

| Endpoint                              | Method  | Description                        |
| ------------------------------------- | ------- | ---------------------------------- |
| `/api/notifications`                  | GET     | List notifications with pagination |
| `/api/notifications`                  | POST    | Create new notification            |
| `/api/notifications/<id>/read`        | POST    | Mark notification as read          |
| `/api/notifications/mark-all-read`    | POST    | Mark all notifications as read     |
| `/api/notifications/<id>`             | DELETE  | Delete notification                |
| `/api/notifications/settings`         | GET/PUT | Get/update user preferences        |
| `/api/notifications/push/public-key`  | GET     | Get VAPID public key               |
| `/api/notifications/push/subscribe`   | POST    | Subscribe to push notifications    |
| `/api/notifications/push/unsubscribe` | POST    | Unsubscribe from push              |

### WebSocket Connection

The WebSocket consumer at `/ws/notifications` sends real-time updates:

**Message Types:**

1. **New Notification**

```json
{
  "type": "notification",
  "data": {
    "id": "uuid",
    "title": "New Order Received",
    "message": "Order #12345 has been placed",
    "type": "info",
    "createdAt": "2025-10-17T10:30:00Z"
  }
}
```

2. **Notification Read**

```json
{
  "type": "notification_read",
  "data": {
    "notificationId": "uuid"
  }
}
```

3. **Notification Deleted**

```json
{
  "type": "notification_deleted",
  "data": {
    "notificationId": "uuid"
  }
}
```

### Database Models

**Notification Model:**

```python
class Notification(models.Model):
    id = UUIDField(primary_key=True)
    user = ForeignKey(AppUser, on_delete=CASCADE)
    title = CharField(max_length=255)
    message = TextField()
    type = CharField(max_length=16)  # info, warning, success, error
    read = BooleanField(default=False)
    meta = JSONField(default=dict)
    created_at = DateTimeField(auto_now_add=True)
```

## Real-Time Update Flow

### When a New Notification is Created:

```
1. Backend creates Notification in database
   └─> api.tasks.create_notification()

2. WebSocket consumer broadcasts to connected clients
   └─> NotificationConsumer.send_notification()

3. Frontend receives WebSocket message
   └─> useNotifications.handleRealtimeNotification()

4. State updates
   ├─> notifications list updated (add new notification)
   └─> unreadCount incremented

5. UI updates
   └─> Badge displays new count with animation
```

### When a Notification is Marked as Read:

```
1. User clicks "Mark as read" in Notifications page
   └─> notificationsService.markRead(id)

2. Backend updates database
   └─> Notification.objects.filter(id=id).update(read=True)

3. WebSocket broadcasts to all user's devices
   └─> NotificationConsumer.notification_marked_read()

4. Frontend receives message
   └─> useNotifications handles 'notification_read' message

5. State updates
   ├─> notifications list updated (mark as read)
   └─> unreadCount decremented

6. Badge updates
   └─> Count decreases (or badge disappears if count reaches 0)
```

## Features

### Implemented ✅

- [x] Real-time unread count from API
- [x] WebSocket real-time updates
- [x] Polling fallback (30s)
- [x] Sync across browser tabs
- [x] Sync across devices
- [x] Display "99+" for high counts
- [x] Smooth badge animations
- [x] Accessibility support
- [x] Error handling
- [x] Loading states
- [x] Automatic reconnection
- [x] Cleanup on unmount

### UI/UX Features

- **Badge Visibility:** Only shown when unreadCount > 0
- **Count Display:** Shows actual count (1-99) or "99+" for larger numbers
- **Animation:** Smooth zoom-in animation when badge appears
- **Color:** Red (destructive variant) to draw attention
- **Position:** Top-right corner of bell icon
- **Size:** Compact 5x5 badge to avoid blocking icon
- **Accessibility:** Screen reader announces count

## Configuration

### Environment Variables

For WebSocket connection, set in `.env`:

```bash
VITE_WS_URL=ws://localhost:8000/ws
```

For fallback-only mode (no WebSocket), leave `VITE_WS_URL` unset and polling will be used.

### Polling Interval

The polling interval can be adjusted in `useNotifications.js`:

```javascript
// Current: 30 seconds
pollRef.current = setInterval(() => {
  fetchUnreadCount();
}, 30000);
```

## Testing

### Manual Testing

1. **Initial Count:**
   - Open the application
   - Verify badge shows correct unread count
   - If count is 0, badge should be hidden

2. **Real-Time Updates:**
   - Open two browser tabs with the application
   - In Tab 1: Mark a notification as read
   - In Tab 2: Verify count decreases immediately

3. **New Notifications:**
   - Create a new notification via Django admin or API
   - Verify badge updates without refresh
   - Verify animation plays smoothly

4. **High Counts:**
   - Create 100+ unread notifications
   - Verify badge displays "99+"

5. **Offline/Reconnection:**
   - Disable network
   - Wait 30+ seconds
   - Re-enable network
   - Verify count updates via polling

### Automated Testing (Future)

```javascript
// Example test
describe('useNotifications', () => {
  it('should fetch unread count on mount', async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.unreadCount).toBeGreaterThanOrEqual(0);
  });

  it('should update count when notification marked as read', async () => {
    const { result } = renderHook(() => useNotifications());
    const initialCount = result.current.unreadCount;

    await act(async () => {
      await result.current.markAsRead('notification-id');
    });

    expect(result.current.unreadCount).toBe(initialCount - 1);
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **WebSocket First:** Prioritizes WebSocket for zero-latency updates
2. **Polling Fallback:** Only activates when WebSocket unavailable
3. **Debouncing:** State updates are batched to prevent excessive re-renders
4. **Lazy Loading:** Hook only initializes when MainLayout mounts
5. **Cleanup:** Properly cleans up connections on unmount

### Network Usage

- **WebSocket:** Persistent connection, minimal overhead
- **Polling (fallback):** 1 request every 30 seconds
- **API Calls:** Only when actions performed (mark read, delete, etc.)

## Troubleshooting

### Badge Not Showing

**Possible causes:**

- No unread notifications (count = 0)
- API request failed
- Network error

**Solutions:**

1. Check browser console for errors
2. Verify `/api/notifications` endpoint is accessible
3. Check network tab for API responses

### Count Not Updating

**Possible causes:**

- WebSocket connection failed
- Polling disabled or too long interval
- Backend not broadcasting updates

**Solutions:**

1. Check WebSocket connection in DevTools > Network > WS
2. Verify `VITE_WS_URL` environment variable
3. Check Celery worker is running (for background notifications)
4. Verify Redis is running (for WebSocket backend)

### Multiple Tabs Out of Sync

**Possible causes:**

- WebSocket not connected in one tab
- Browser throttling background tabs

**Solutions:**

1. Ensure WebSocket enabled in both tabs
2. Use polling as fallback
3. Consider using Broadcast Channel API for tab sync

## Future Enhancements

### Planned Features

1. **Notification Preview:** Hover tooltip showing recent notifications
2. **Quick Actions:** Mark as read from bell dropdown
3. **Notification Grouping:** Group similar notifications
4. **Sound Alerts:** Optional sound when new notification arrives
5. **Desktop Notifications:** Browser push notifications
6. **Badge Animations:** Different animations for different priority levels
7. **Filter by Type:** Show counts per notification type
8. **Snooze Notifications:** Temporarily hide notifications

### Performance Improvements

1. **Virtual Scrolling:** For large notification lists
2. **Lazy Loading:** Load notifications on demand
3. **Caching:** Cache notifications in IndexedDB
4. **Service Worker:** Background sync for offline support

## Related Files

### Frontend

- `src/hooks/useNotifications.js` - Notification hook
- `src/layouts/MainLayout.jsx` - Bell button implementation
- `src/components/Notifications.jsx` - Full notifications page
- `src/api/services/notificationsService.js` - API service
- `src/lib/realtime.js` - WebSocket client
- `src/utils/serviceWorkerRegistration.js` - Service worker setup

### Backend

- `backend/api/views_notifications.py` - API endpoints
- `backend/api/models.py` - Database models
- `backend/api/tasks.py` - Celery tasks
- `backend/api/notification_templates.py` - Notification templates
- `backend/api/notification_triggers.py` - Automated triggers
- `backend/config/celery.py` - Celery configuration

### Documentation

- `backend/NOTIFICATIONS_SETUP.md` - Complete setup guide
- `backend/test_notifications.py` - Test script
- `NOTIFICATION_BELL_IMPLEMENTATION.md` - This document

## Support

For issues or questions:

- Check browser console for errors
- Review Django logs for backend issues
- Test WebSocket connection in DevTools
- Verify Celery worker is running
- Check Redis server status

## Summary

The notification bell is now a fully-functional, full-stack feature with:

- ✅ Real-time updates via WebSocket
- ✅ Polling fallback for reliability
- ✅ Multi-tab synchronization
- ✅ Smooth UI animations
- ✅ Full accessibility support
- ✅ Production-ready error handling

The implementation follows best practices for React hooks, WebSocket management, and real-time state synchronization.
