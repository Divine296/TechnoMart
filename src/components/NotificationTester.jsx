import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';

const NotificationTester = () => {
  const [loading, setLoading] = useState({});

  const triggerTestNotification = async (type) => {
    setLoading((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await apiClient.post('/notifications/test-trigger', {
        type,
      });

      if (response?.success) {
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} notification triggered!`,
          {
            description: 'Check your notification bell in the top right',
          }
        );
      } else {
        toast.error('Failed to trigger notification', {
          description: response?.message || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Error triggering notification:', error);
      toast.error('Failed to trigger notification', {
        description: error.message || 'Network error',
      });
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const notificationTypes = [
    {
      type: 'info',
      label: 'Info Notification',
      description: 'Informational message',
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      type: 'success',
      label: 'Success Notification',
      description: 'Success message',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
    },
    {
      type: 'warning',
      label: 'Warning Notification',
      description: 'Warning message',
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200',
    },
    {
      type: 'error',
      label: 'Error Notification',
      description: 'Error message',
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 hover:bg-red-100',
      borderColor: 'border-red-200',
    },
  ];

  const triggerScenarios = [
    {
      title: 'Inventory Scenarios',
      description: 'Test inventory-related notifications',
      triggers: [
        {
          name: 'Low Stock Alert',
          description: 'Simulates item running low on stock',
          action: 'Update inventory item below reorder level',
        },
        {
          name: 'Out of Stock',
          description: 'Simulates item completely out of stock',
          action: 'Set inventory item quantity to 0',
        },
        {
          name: 'Items Expiring Soon',
          description: 'Daily check for items expiring within 7 days',
          action: 'Triggered by Celery beat daily',
        },
      ],
    },
    {
      title: 'Order Scenarios',
      description: 'Test order-related notifications',
      triggers: [
        {
          name: 'New Order',
          description: 'Triggers when new order is placed',
          action: 'Create new order in POS',
        },
        {
          name: 'Order Completed',
          description: 'Triggers when order is marked complete',
          action: 'Complete an order',
        },
        {
          name: 'Large Order Alert',
          description: 'Triggers for orders over ₱5,000',
          action: 'Create order with total > ₱5,000',
        },
      ],
    },
    {
      title: 'Payment Scenarios',
      description: 'Test payment-related notifications',
      triggers: [
        {
          name: 'Payment Received',
          description: 'Confirms payment has been received',
          action: 'Process payment for an order',
        },
        {
          name: 'Payment Failed',
          description: 'Notifies of failed payment attempt',
          action: 'Payment processing fails',
        },
      ],
    },
    {
      title: 'Catering Scenarios',
      description: 'Test catering event notifications',
      triggers: [
        {
          name: 'New Catering Booking',
          description: 'New catering event created',
          action: 'Create new catering event',
        },
        {
          name: 'Booking Confirmed',
          description: 'Catering event status changed to confirmed',
          action: 'Update event status to confirmed',
        },
        {
          name: 'Booking Cancelled',
          description: 'Catering event cancelled',
          action: 'Update event status to cancelled',
        },
      ],
    },
    {
      title: 'Employee Scenarios',
      description: 'Test employee-related notifications',
      triggers: [
        {
          name: 'Shift Assigned',
          description: 'Employee assigned to new shift',
          action: 'Create new schedule entry',
        },
        {
          name: 'Leave Approved',
          description: 'Leave request approved',
          action: 'Approve a leave request',
        },
        {
          name: 'Leave Rejected',
          description: 'Leave request rejected',
          action: 'Reject a leave request',
        },
      ],
    },
    {
      title: 'Menu & POS Scenarios',
      description: 'Test menu and POS notifications',
      triggers: [
        {
          name: 'New Menu Item',
          description: 'New item added to menu',
          action: 'Create new menu item',
        },
      ],
    },
    {
      title: 'User & Account Scenarios',
      description: 'Test user account notifications',
      triggers: [
        {
          name: 'New User Registration',
          description: 'New user registered',
          action: 'User completes registration',
        },
        {
          name: 'Role Changed',
          description: 'User role updated',
          action: 'Admin changes user role',
        },
      ],
    },
    {
      title: 'Daily Summary Scenarios',
      description: 'Test automated daily reports',
      triggers: [
        {
          name: 'Daily Sales Summary',
          description: 'End-of-day sales report',
          action: 'Triggered by Celery beat at end of day',
        },
        {
          name: 'Low Inventory Report',
          description: 'Daily low inventory summary',
          action: 'Triggered by Celery beat daily',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Test Notification Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Test Notifications
          </CardTitle>
          <CardDescription>
            Trigger test notifications to see real-time updates in the
            notification bell
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {notificationTypes.map(
              ({
                type,
                label,
                description,
                icon: Icon,
                color,
                bgColor,
                borderColor,
              }) => (
                <button
                  key={type}
                  onClick={() => triggerTestNotification(type)}
                  disabled={loading[type]}
                  className={`p-6 rounded-lg border-2 ${borderColor} ${bgColor} transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    {loading[type] ? (
                      <Loader2 className={`h-8 w-8 ${color} animate-spin`} />
                    ) : (
                      <Icon className={`h-8 w-8 ${color}`} />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Click to Test
                    </Badge>
                  </div>
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Trigger Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Trigger Scenarios</CardTitle>
          <CardDescription>
            Real business events that automatically trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {triggerScenarios.map((scenario, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-lg mb-2">{scenario.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {scenario.description}
                </p>
                <div className="space-y-2">
                  {scenario.triggers.map((trigger, tidx) => (
                    <div
                      key={tidx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border"
                    >
                      <div className="mt-0.5">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {trigger.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            Auto
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {trigger.description}
                        </p>
                        <p className="text-xs text-primary mt-1">
                          <strong>How to trigger:</strong> {trigger.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>1. Test Buttons:</strong> Click any of the colored buttons
            above to trigger a test notification immediately.
          </p>
          <p>
            <strong>2. Watch the Bell:</strong> Look at the notification bell in
            the top-right corner. The badge should update in real-time!
          </p>
          <p>
            <strong>3. View Notifications:</strong> Click the bell to see all
            your notifications in the Notifications page.
          </p>
          <p>
            <strong>4. Auto Triggers:</strong> Perform the actions listed in the
            scenarios to trigger real business notifications.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            💡 Tip: Open two browser tabs to see notifications sync in real-time
            across tabs!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;
