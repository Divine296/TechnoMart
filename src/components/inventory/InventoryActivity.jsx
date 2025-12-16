import React from 'react';
import { History } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export const InventoryActivity = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Inventory Activity
        </CardTitle>
        <CardDescription>Latest inventory changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border-l-2 border-primary/20 pl-4 pb-4 last:pb-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.item} - {activity.quantity}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                by {activity.user}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};