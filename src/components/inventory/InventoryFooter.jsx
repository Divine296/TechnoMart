import React from 'react';
import { cn } from '@/lib/utils';

const InventoryFooter = ({ filteredCount, totalCount, className }) => {
  return (
    <div
      className={cn('border-t pt-3 text-xs text-muted-foreground', className)}
    >
      Showing {filteredCount} of {totalCount} items
    </div>
  );
};

export default InventoryFooter;
