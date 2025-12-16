import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn, formatOrderNumber } from '@/lib/utils';

const STATUS_CANONICAL_MAP = {
  pending: 'new',
  accepted: 'accepted',
  'in-queue': 'accepted',
  in_queue: 'accepted',
  in_progress: 'in_prep',
  'in-progress': 'in_prep',
  preparing: 'in_prep',
  ready: 'staged',
  staged: 'staged',
  handoff: 'handoff',
  serving: 'now_serving',
};

const normalizeStatus = (value) => {
  if (!value) return '';
  const normalized = String(value).toLowerCase().trim();
  return STATUS_CANONICAL_MAP[normalized] || normalized;
};

const resolveOrderStatus = (order) => {
  const candidates = [
    order?.canonicalStatus,
    order?.canonical_status,
    order?.status,
    order?.rawStatus,
    order?.raw_status,
  ];
  for (const value of candidates) {
    const result = normalizeStatus(value);
    if (result) return result;
  }
  return '';
};

const getOrderTimestamp = (order) => {
  const candidates = [
    order?.updatedAt,
    order?.updated_at,
    order?.phaseStartedAt,
    order?.phase_started_at,
    order?.createdAt,
    order?.created_at,
    order?.timeReceived,
    order?.time_received,
  ];
  for (const input of candidates) {
    if (!input) continue;
    const date = new Date(input);
    const time = date.getTime();
    if (Number.isFinite(time)) return time;
  }
  return 0;
};

const getOrderDisplayNumber = (order) => {
  const candidates = [
    order?.orderNumber,
    order?.order_number,
    order?.displayNumber,
    order?.display_number,
    order?.externalOrderId,
    order?.external_order_id,
    order?.id,
  ];
  for (const value of candidates) {
    if (value === null || value === undefined) continue;
    const formatted = formatOrderNumber(value);
    if (formatted) return formatted;
  }
  if (order?.id) {
    const fallback = String(order.id).slice(-4).toUpperCase();
    return fallback.padStart(4, '0');
  }
  return '----';
};

const preparingStatuses = new Set(['in_prep', 'preparing', 'in_progress']);
const servingStatuses = new Set(['now_serving', 'staged', 'ready', 'handoff']);

const Section = ({ title, accent, orders, emptyText, className }) => (
  <div
    className={cn(
      'flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 shadow-sm',
      className
    )}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </p>
      <span
        className={cn(
          'text-xs font-semibold uppercase tracking-widest',
          accent
        )}
      >
        {orders.length}
      </span>
    </div>
    <div className="flex flex-col gap-3">
      {orders.length ? (
        orders.slice(0, 6).map((order) => (
          <div
            key={
              order.id ||
              order.orderNumber ||
              order.order_number ||
              getOrderDisplayNumber(order)
            }
            className="rounded-2xl border border-border/60 bg-background px-4 py-6 text-center shadow-sm"
          >
            <p className="text-3xl font-black tracking-[0.25em] text-foreground sm:text-4xl">
              {getOrderDisplayNumber(order)}
            </p>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
    </div>
  </div>
);

const CustomerDisplay = ({ queue }) => {
  const orders = useMemo(() => {
    if (!queue) return [];
    if (Array.isArray(queue)) return queue;
    if (Array.isArray(queue.orders)) return queue.orders;
    if (Array.isArray(queue.data?.orders)) return queue.data.orders;
    return [];
  }, [queue]);

  const { preparingOrders, servingOrders } = useMemo(() => {
    const prep = [];
    const serving = [];

    orders.forEach((order) => {
      const status = resolveOrderStatus(order);
      if (preparingStatuses.has(status)) {
        prep.push(order);
      } else if (servingStatuses.has(status)) {
        serving.push(order);
      }
    });

    const sorter = (a, b) => getOrderTimestamp(a) - getOrderTimestamp(b);
    prep.sort(sorter);
    serving.sort(sorter);

    return { preparingOrders: prep, servingOrders: serving };
  }, [orders]);

  return (
    <Card className="h-full border border-border/60 bg-card/90 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex w-full items-center gap-4 text-4xl font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          <span className="flex-1 text-center text-foreground">Preparing</span>
          <span className="flex-1 text-center text-foreground">
            Now Serving
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Section
            title=""
            accent="text-amber-600 dark:text-amber-300"
            orders={preparingOrders}
            emptyText="No orders currently in preparation."
            className="bg-blue-500/10 dark:bg-blue-500/20"
          />
          <Section
            title=""
            accent="text-emerald-600 dark:text-emerald-300"
            orders={servingOrders}
            emptyText="No orders ready for pickup."
            className="bg-emerald-500/10 dark:bg-emerald-500/20 md:border-l md:border-border/60 md:pl-6"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDisplay; 