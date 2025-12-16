import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Receipt, Check, X, ArrowDownUp, Calendar } from 'lucide-react';
import { CustomBadge } from '@/components/ui/custom-badge';

const RecentTransactions = ({ sortedPayments, getStatusBadgeVariant }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>View latest payment activities</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedPayments.length > 0 ? (
          <div className="space-y-4">
            {sortedPayments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center border-b pb-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-1 ${
                      payment.status === 'completed'
                        ? 'bg-green-100'
                        : payment.status === 'failed'
                          ? 'bg-red-100'
                          : payment.status === 'refunded'
                            ? 'bg-amber-100'
                            : 'bg-gray-100'
                    }`}
                  >
                    {payment.status === 'completed' && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {payment.status === 'failed' && (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    {payment.status === 'refunded' && (
                      <ArrowDownUp className="h-4 w-4 text-amber-600" />
                    )}
                    {payment.status === 'pending' && (
                      <Calendar className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{payment.orderId}</span>
                      <CustomBadge
                        variant={getStatusBadgeVariant(payment.status)}
                        className="capitalize text-xs"
                      >
                        {payment.status}
                      </CustomBadge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.customer ? payment.customer : 'Walk-in Customer'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">�,�{payment.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {payment.method}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No recent transactions to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
