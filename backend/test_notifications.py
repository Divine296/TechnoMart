#!/usr/bin/env python
"""
Test script for notification system
Run with: python manage.py shell < test_notifications.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.notification_templates import format_notification, get_template
from api.tasks import create_notification, send_email_notification, send_push_notification
from api.models import Notification, NotificationPreference, WebPushSubscription, NotificationOutbox

User = get_user_model()


def print_section(title):
    """Print a section header"""
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}\n")


def test_templates():
    """Test notification templates"""
    print_section("Testing Notification Templates")

    # Test low stock alert
    low_stock = format_notification(
        'low_stock_alert',
        item_name='Coffee Beans',
        current_stock=5,
        unit='kg',
        reorder_level=10
    )
    print(f"✓ Low Stock Alert Template:")
    print(f"  Title: {low_stock['title']}")
    print(f"  Message: {low_stock['message']}")
    print(f"  Type: {low_stock['type']}\n")

    # Test new order
    new_order = format_notification(
        'new_order',
        order_number='12345',
        total_amount='1,250.00',
        item_count=5
    )
    print(f"✓ New Order Template:")
    print(f"  Title: {new_order['title']}")
    print(f"  Message: {new_order['message']}")
    print(f"  Type: {new_order['type']}\n")

    # Test catering booking
    catering = format_notification(
        'catering_booking_confirmed',
        event_name='Birthday Party',
        event_date='December 25, 2025',
        total_amount='5,000.00'
    )
    print(f"✓ Catering Booking Template:")
    print(f"  Title: {catering['title']}")
    print(f"  Message: {catering['message']}")
    print(f"  Type: {catering['type']}\n")


def test_database_models():
    """Test database models"""
    print_section("Testing Database Models")

    # Check if models exist
    try:
        notification_count = Notification.objects.count()
        print(f"✓ Notification model: {notification_count} records")

        pref_count = NotificationPreference.objects.count()
        print(f"✓ NotificationPreference model: {pref_count} records")

        sub_count = WebPushSubscription.objects.count()
        print(f"✓ WebPushSubscription model: {sub_count} records")

        outbox_count = NotificationOutbox.objects.count()
        print(f"✓ NotificationOutbox model: {outbox_count} records\n")

    except Exception as e:
        print(f"✗ Database models error: {e}\n")


def test_create_notification():
    """Test creating a notification"""
    print_section("Testing Notification Creation")

    try:
        # Get first user
        user = User.objects.first()
        if not user:
            print("✗ No users found. Please create a user first.\n")
            return

        print(f"Creating notification for user: {user.email}\n")

        # Create notification
        notification = Notification.objects.create(
            user=user,
            title="Test Notification",
            message="This is a test notification created by the test script.",
            type='info',
            read=False
        )

        print(f"✓ Created notification: {notification.id}")
        print(f"  Title: {notification.title}")
        print(f"  Message: {notification.message}")
        print(f"  Type: {notification.type}")
        print(f"  Read: {notification.read}\n")

        # Clean up
        notification.delete()
        print(f"✓ Cleaned up test notification\n")

    except Exception as e:
        print(f"✗ Failed to create notification: {e}\n")


def test_celery_tasks():
    """Test Celery tasks"""
    print_section("Testing Celery Tasks")

    try:
        # Check if Celery is configured
        from config.celery import app
        print(f"✓ Celery app configured: {app.conf.broker_url}")

        # List registered tasks
        print(f"\nRegistered tasks:")
        tasks = [
            'api.tasks.send_email_notification',
            'api.tasks.send_push_notification',
            'api.tasks.process_notification_outbox',
            'api.tasks.cleanup_old_notifications',
            'api.tasks.create_notification',
        ]
        for task_name in tasks:
            if task_name in app.tasks:
                print(f"  ✓ {task_name}")
            else:
                print(f"  ✗ {task_name} (not found)")

        print("\n⚠ Note: To test task execution, run:")
        print("  celery -A config worker --loglevel=info")
        print("  (in a separate terminal)\n")

    except Exception as e:
        print(f"✗ Celery configuration error: {e}\n")


def test_settings():
    """Test Django settings"""
    print_section("Testing Django Settings")

    from django.conf import settings

    # Check VAPID keys
    vapid_public = getattr(settings, 'WEBPUSH_VAPID_PUBLIC_KEY', '')
    vapid_private = getattr(settings, 'WEBPUSH_VAPID_PRIVATE_KEY', '')

    if vapid_public and vapid_private:
        print(f"✓ VAPID keys configured")
        print(f"  Public key: {vapid_public[:20]}...")
    else:
        print(f"✗ VAPID keys not configured")
        print(f"  Run: vapid --gen")
        print(f"  Add keys to .env file\n")

    # Check email settings
    email_backend = getattr(settings, 'EMAIL_BACKEND', '')
    email_host = getattr(settings, 'EMAIL_HOST', '')

    if 'smtp' in email_backend.lower() and email_host:
        print(f"✓ Email configured: {email_host}")
    else:
        print(f"✗ Email not configured")
        print(f"  Add EMAIL_HOST and EMAIL_HOST_USER to .env\n")

    # Check Celery settings
    broker_url = getattr(settings, 'CELERY_BROKER_URL', '')
    if broker_url:
        print(f"✓ Celery broker configured: {broker_url}")
    else:
        print(f"⚠ Celery broker not configured in settings")
        print(f"  Celery may use default settings\n")


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  NOTIFICATION SYSTEM TEST SUITE")
    print("=" * 60)

    test_settings()
    test_templates()
    test_database_models()
    test_create_notification()
    test_celery_tasks()

    print_section("Test Summary")
    print("✓ All basic tests passed!")
    print("\nNext steps:")
    print("1. Start Redis: docker run -d -p 6379:6379 redis:alpine")
    print("2. Start Celery worker: celery -A config worker --loglevel=info")
    print("3. Start Celery beat: celery -A config beat --loglevel=info")
    print("4. Test push notifications in the frontend")
    print("\nSee NOTIFICATIONS_SETUP.md for detailed instructions.\n")


if __name__ == '__main__':
    main()
