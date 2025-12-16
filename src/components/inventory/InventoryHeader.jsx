import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const InventoryHeader = ({ onAddItem, className }) => {
  return (
    <Button
      size="sm"
      className={cn('flex items-center gap-1', className)}
      onClick={onAddItem}
    >
      <PlusCircle className="h-4 w-4" aria-hidden="true" />
      <span>Add Item</span>
    </Button>
  );
};

export default InventoryHeader;
