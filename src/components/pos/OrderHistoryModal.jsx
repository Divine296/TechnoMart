import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatOrderNumber } from '@/lib/utils';

const OrderHistoryModal = ({
  isOpen,
  onClose,
  orderHistory,
  loading = false,
  onRefresh = null,
  error = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Recent completed orders</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Make this section scrollable */}
        <CardContent className="flex-1 overflow-y-auto">
          {error && (
            <div className="mb-3 text-sm text-red-600">{String(error)}</div>
          )}
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No order history found.
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order) => {
                const tsRaw =
                  order.timeCompleted ||
                  order.updatedAt ||
                  order.timeReceived ||
                  order.createdAt;
                const d = tsRaw instanceof Date ? tsRaw : new Date(tsRaw);
                const tsValid = !Number.isNaN(d.getTime());
                const dateStr = tsValid ? d.toLocaleDateString() : '';
                const timeStr = tsValid ? d.toLocaleTimeString() : '';
                return (
                  <div key={order.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">
                          #
                          {formatOrderNumber(order.orderNumber) ||
                            order.orderNumber ||
                            'N/A'}
                        </h3>
                        {tsValid && (
                          <p className="text-sm text-muted-foreground">
                            {dateStr} {timeStr}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Payment: {order.paymentMethod || '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₱{Number(order.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderHistoryModal;
