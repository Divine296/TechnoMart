import React from 'react';
import { MoreVertical, PenSquare, Archive, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const InventoryGrid = ({
  items,
  onEditItem,
  onDisableItem,
  onDeleteItem,
  getStockPercentage,
  getStockBadgeVariant,
  getStockStatusText,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No items found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`border rounded-lg p-4 ${item.disabled ? 'opacity-50' : ''}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{item.name}</h3>
                {item.disabled && (
                  <Badge variant="secondary" className="text-xs">
                    Archived
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </div>
            <CustomBadge
              variant={getStockBadgeVariant(
                item.currentStock,
                item.minThreshold
              )}
            >
              {getStockStatusText(item.currentStock, item.minThreshold)}
            </CustomBadge>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>
                Current: {item.currentStock} {item.unit}
              </span>
              <span>
                Min: {item.minThreshold} {item.unit}
              </span>
            </div>
            <Progress
              value={getStockPercentage(item.currentStock, item.minThreshold)}
              className="h-2"
            />
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Supplier: {item.supplier}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEditItem(item)}>
                  <PenSquare className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDisableItem(item.id, item.name)}
                  className={
                    item.disabled ? 'text-green-600' : 'text-orange-600'
                  }
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {item.disabled ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};
