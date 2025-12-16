import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Receipt, Clock } from 'lucide-react';

const RecentSales = ({ sales }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return 'Today';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Recent Sales
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Latest orders from the canteen
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {sales && sales.length > 0 ? (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                {/* Order ID with payment method badge */}
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm truncate">
                    #{sale.id}
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium uppercase">
                    {sale.paymentMethod}
                  </span>
                </div>

                {/* Time info */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(sale.date)}</span>
                  <span>•</span>
                  <span>{formatTime(sale.date)}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="ml-4 text-right">
                <p className="font-bold text-sm">
                  ₱{sale.total.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No recent sales</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
