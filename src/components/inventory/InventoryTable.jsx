import React from 'react';
import { ArrowUpDown, MoreVertical, PenSquare, Archive } from 'lucide-react';
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

export const InventoryTable = ({
  items,
  onEditItem,
  onDisableItem,
  onDeleteItem,
  getStockPercentage,
  getStockBadgeVariant,
  getStockStatusText,
}) => {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium">
                <div className="flex items-center gap-1">
                  Name <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="h-10 px-4 text-left font-medium">Category</th>
              <th className="h-10 px-4 text-left font-medium">Stock Level</th>
              <th className="h-10 px-4 text-left font-medium hidden md:table-cell">
                Supplier
              </th>
              <th className="h-10 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b transition-colors hover:bg-muted/50 ${
                    item.disabled ? 'opacity-50' : ''
                  } cursor-pointer`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onEditItem(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onEditItem(item);
                    }
                  }}
                >
                  <td className="p-4 align-middle font-medium">
                    <div className="flex items-center gap-2">
                      {item.name}
                      {item.disabled && (
                        <Badge variant="secondary" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant="outline">{item.category}</Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span>
                          {item.currentStock} {item.unit}
                        </span>
                        <CustomBadge
                          variant={getStockBadgeVariant(
                            item.currentStock,
                            item.minThreshold
                          )}
                        >
                          {getStockStatusText(
                            item.currentStock,
                            item.minThreshold
                          )}
                        </CustomBadge>
                      </div>
                      <Progress
                        value={getStockPercentage(
                          item.currentStock,
                          item.minThreshold
                        )}
                        className={`h-2 ${
                          item.currentStock < item.minThreshold
                            ? 'bg-red-200'
                            : 'bg-green-200'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="p-4 align-middle hidden md:table-cell">
                    {item.supplier}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onEditItem(item);
                          }}
                        >
                          <PenSquare className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onDisableItem(item.id, item.name);
                          }}
                          className={
                            item.disabled ? 'text-green-600' : 'text-orange-600'
                          }
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          {item.disabled ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-24 text-center">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
