import React, { useMemo } from 'react';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import { Button } from '@/components/ui/button';
import { History, Loader2 } from 'lucide-react';

const formatTimestamp = (ts) => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    // Friendly, locale-aware date and time
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(ts);
  }
};

const normalize = (list = []) =>
  (list || []).map((a) => ({
    id: a.id,
    action: a.action || 'Stock Update',
    item: a.item || '',
    quantity: a.quantity ?? '',
    timestamp: a.timestamp || '',
    user: a.user || 'System',
  }));

const MAX_VISIBLE_ACTIVITIES = 6;

const InventoryRecentActivity = ({ recentActivities, loading = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const items = useMemo(
    () => normalize(recentActivities || []),
    [recentActivities]
  );

  const hasMoreActivities = items.length > MAX_VISIBLE_ACTIVITIES;
  const displayedActivities =
    isExpanded || !hasMoreActivities
      ? items
      : items.slice(0, MAX_VISIBLE_ACTIVITIES);

  return (
    <FeaturePanelCard
      title="Recent Inventory Activity"
      titleStyle="accent"
      titleIcon={History}
      titleAccentClassName="px-3 py-1 text-xs md:text-sm"
      titleClassName="text-xs md:text-sm"
      description="Latest inventory changes and updates"
      headerContent={
        loading ? (
          <div className="flex h-6 items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="text-xs">Updating...</span>
          </div>
        ) : null
      }
      contentClassName="space-y-4"
    >
      <div className="space-y-4">
        {(!displayedActivities || displayedActivities.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No recent activity yet.
          </p>
        )}
        {displayedActivities &&
          displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="rounded-full bg-muted p-2">
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {activity.item}
                  </span>
                  {activity.quantity ? (
                    <span> - {activity.quantity}</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  By {activity.user || 'System'}
                </p>
              </div>
            </div>
          ))}
      </div>

      <div className="flex flex-col gap-2 border-t pt-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Showing {displayedActivities.length} of {items.length} activities
        </span>
        {hasMoreActivities ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? 'Collapse inventory activity list'
                : 'Expand inventory activity list'
            }
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </Button>
        ) : null}
      </div>
    </FeaturePanelCard>
  );
};

export default InventoryRecentActivity;
