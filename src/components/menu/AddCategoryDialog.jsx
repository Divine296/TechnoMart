// src/components/menu/AddCategoryDialog.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import menuService from '@/api/services/menuService';
import { toast } from 'sonner';

const AddCategoryDialog = ({ open, onOpenChange, onConfirm }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    const value = (name || '').trim();
    if (!value) return;

    setLoading(true);
    try {
      // Call API to create category
      const response = await menuService.createCategory({ name: value });

      if (response.success) {
        toast.success(`Category "${value}" created successfully`);
        onConfirm && onConfirm(value);
      } else {
        toast.error(response.message || 'Failed to create category');
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a category and continue to add an item under it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category-name" className="text-right">
              Category Name
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Combo Meals"
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!name.trim() || loading}>
            {loading ? 'Creating...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
