// src/components/menu/AddComboMealDialog.jsx
import React, { useEffect, useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AddComboMealDialog = ({ open, onOpenChange, items = [], onCreate }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cat, setCat] = useState('Combo Meals');
  const [sel1, setSel1] = useState('');
  const [sel2, setSel2] = useState('');
  const [sel3, setSel3] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setPrice('');
      setCat('Combo Meals');
      setSel1('');
      setSel2('');
      setSel3('');
    }
  }, [open]);

  const options = useMemo(
    () => (items || []).map((i) => ({ id: i.id, label: i.name })),
    [items]
  );

  const summary = useMemo(() => {
    const labels = [sel1, sel2, sel3]
      .map((id) => options.find((o) => o.id === id)?.label)
      .filter(Boolean);
    return labels.join(' + ');
  }, [sel1, sel2, sel3, options]);

  const handleCreate = async () => {
    const chosen = [sel1, sel2, sel3].filter(Boolean);
    if (chosen.length === 0) return;
    const payload = {
      name: name.trim() || `Combo: ${summary}`,
      description: summary ? `Includes ${summary}` : 'Combo meal',
      price: Number(price) || 0,
      category: cat || 'Combo Meals',
      available: true,
      ingredients: chosen,
      preparationTime: 0,
    };
    await onCreate?.(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Combo Meal</DialogTitle>
          <DialogDescription>
            Select up to three menu items to include in the combo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="combo-name" className="text-right">
              Name
            </Label>
            <Input
              id="combo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={summary ? `Combo: ${summary}` : 'Combo name'}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="combo-price" className="text-right">
              Price
            </Label>
            <Input
              id="combo-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Item 1</Label>
            <Select value={sel1} onValueChange={setSel1}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a menu item" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Item 2</Label>
            <Select value={sel2} onValueChange={setSel2}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a menu item" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Item 3</Label>
            <Select value={sel3} onValueChange={setSel3}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a menu item" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="combo-category" className="text-right">
              Category
            </Label>
            <Input
              id="combo-category"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!sel1 && !sel2 && !sel3}>
            Create Combo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddComboMealDialog;
