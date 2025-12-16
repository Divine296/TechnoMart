import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Boxes, Receipt, Users, Utensils } from 'lucide-react';

// Import panel components
import SalesPanel from '@/components/analytics/panels/SalesPanel';
import InventoryPanel from '@/components/analytics/panels/InventoryPanel';
import OrdersPanel from '@/components/analytics/panels/OrdersPanel';
import AttendancePanel from '@/components/analytics/panels/AttendancePanel';
import CateringPanel from '@/components/analytics/panels/CateringPanel';

export default function SalesAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="flex w-full flex-wrap items-center justify-between gap-1 sm:w-fit sm:justify-start sm:gap-2">
          <TabsTrigger
            value="sales"
            aria-label="Sales Reports"
            className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Sales Reports</span>
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            aria-label="Inventory Reports"
            className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
          >
            <Boxes className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Inventory Reports</span>
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            aria-label="Orders and Transactions"
            className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">
              Orders &amp; Transactions
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            aria-label="Staff Attendance"
            className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Staff Attendance</span>
          </TabsTrigger>
          <TabsTrigger
            value="catering"
            aria-label="Catering Analytics"
            className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
          >
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Catering Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <SalesPanel />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <InventoryPanel />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersPanel />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendancePanel />
        </TabsContent>

        <TabsContent value="catering" className="mt-6">
          <CateringPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
