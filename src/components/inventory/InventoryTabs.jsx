import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryGrid } from '@/components/inventory/InventoryGrid';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';

const InventoryTabs = ({
  filteredItems,
  onEditItem,
  onDisableItem,
  onDeleteItem,
  getStockPercentage,
  getStockBadgeVariant,
  getStockStatusText,
}) => {
  const [showArchived, setShowArchived] = useState(false);

  const displayItems = useMemo(() => {
    return filteredItems.filter((item) =>
      showArchived ? item.disabled : !item.disabled
    );
  }, [filteredItems, showArchived]);

  const archivedCount = useMemo(() => {
    return filteredItems.filter((item) => item.disabled).length;
  }, [filteredItems]);

  return (
    <Tabs defaultValue="list" className="w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        <Button
          variant={showArchived ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="shrink-0"
        >
          <Archive className="h-4 w-4" />
          {archivedCount > 0 && <span className="ml-1">({archivedCount})</span>}
        </Button>
      </div>
      <TabsContent value="list">
        <InventoryTable
          items={displayItems}
          onEditItem={onEditItem}
          onDisableItem={onDisableItem}
          onDeleteItem={onDeleteItem}
          getStockPercentage={getStockPercentage}
          getStockBadgeVariant={getStockBadgeVariant}
          getStockStatusText={getStockStatusText}
        />
      </TabsContent>
      <TabsContent value="grid">
        <InventoryGrid
          items={displayItems}
          onEditItem={onEditItem}
          onDisableItem={onDisableItem}
          onDeleteItem={onDeleteItem}
          getStockPercentage={getStockPercentage}
          getStockBadgeVariant={getStockBadgeVariant}
          getStockStatusText={getStockStatusText}
        />
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;
