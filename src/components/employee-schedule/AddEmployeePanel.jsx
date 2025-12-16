import React, { useMemo, useState } from 'react';
import UserManagementCard from '@/components/users/UserManagementCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_FORM = {
  name: '',
  position: '',
  hourlyRate: '',
  contact: '',
  status: 'active',
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'inactive', label: 'Inactive', tone: 'text-muted-foreground bg-muted/20 border-muted' },
  { value: 'pending', label: 'Pending', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
];

const statusToneClass = (value) => {
  const option = STATUS_OPTIONS.find((item) => item.value === value);
  return option?.tone || 'text-muted-foreground border-border';
};

const AddEmployeePanel = ({
  employees = [],
  loading = false,
  onAddEmployee,
  onDeleteEmployee,
  className,
}) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) =>
      (a?.name || '').localeCompare(b?.name || '', undefined, {
        sensitivity: 'base',
      })
    );
  }, [employees]);

  const totalActive = useMemo(
    () => employees.filter((employee) => employee?.status === 'active').length,
    [employees]
  );

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => setForm({ ...DEFAULT_FORM });

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (typeof onAddEmployee !== 'function') return;
    if (!form.name.trim()) {
      toast.error('Employee name is required');
      return;
    }

    setSaving(true);
    try {
      await onAddEmployee({
        name: form.name.trim(),
        position: form.position.trim(),
        hourlyRate: Number(form.hourlyRate || 0),
        contact: form.contact.trim(),
        status: form.status,
      });
      resetForm();
    } catch (error) {
      console.error('Failed to add employee', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (!employeeId || typeof onDeleteEmployee !== 'function') return;
    const confirmDelete =
      typeof window === 'undefined'
        ? true
        : window.confirm('Remove this employee from the roster?');
    if (!confirmDelete) return;

    setDeletingId(employeeId);
    try {
      await onDeleteEmployee(employeeId);
    } catch (error) {
      console.error('Failed to delete employee', error);
    } finally {
      setDeletingId(null);
    }
  };

  const disableSubmit = saving || !form.name.trim();

  return (
    <UserManagementCard
      title="Add Employees"
      titleIcon={UserPlus}
      titleStyle="accent"
      description="Quickly onboard team members or remove inactive staff without leaving the scheduling view."
      headerContent={
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
          {totalActive} Active
        </div>
      }
      className={cn('w-full', className)}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="employee-name">Full name</Label>
            <Input
              id="employee-name"
              placeholder="e.g. Jane Cruz"
              value={form.name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employee-position">Position</Label>
            <Input
              id="employee-position"
              placeholder="e.g. Barista"
              value={form.position}
              onChange={(event) =>
                handleFieldChange('position', event.target.value)
              }
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="employee-rate">Hourly rate</Label>
            <Input
              id="employee-rate"
              type="number"
              min="0"
              step="0.25"
              placeholder="0.00"
              value={form.hourlyRate}
              onChange={(event) =>
                handleFieldChange('hourlyRate', event.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employee-status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => handleFieldChange('status', value)}
            >
              <SelectTrigger id="employee-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="employee-contact">Contact number</Label>
          <Input
            id="employee-contact"
            placeholder="e.g. 0917 123 4567"
            value={form.contact}
            onChange={(event) => handleFieldChange('contact', event.target.value)}
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto" disabled={disableSubmit}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            'Add employee'
          )}
        </Button>
      </form>

      <div className="space-y-2">
        <div className="flex items-center justify-between pt-2 text-sm font-semibold">
          <span>Current team</span>
          <span className="text-xs text-muted-foreground">
            {loading ? 'Loading...' : `${employees.length} total`}
          </span>
        </div>
        <ScrollArea className="h-[320px] pr-1">
          <div className="space-y-3">
            {sortedEmployees.length === 0 && !loading ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                No employees yet. Use the form above to start building your roster.
              </div>
            ) : null}
            {sortedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-3 py-2"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-tight">
                    {employee?.name || 'Unnamed teammate'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {employee?.position || 'No role specified'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide',
                    statusToneClass(employee?.status)
                  )}
                >
                  {
                    STATUS_OPTIONS.find((option) => option.value === employee?.status)
                      ?.label || 'Unknown'
                  }
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(employee.id)}
                  disabled={deletingId === employee.id}
                >
                  {deletingId === employee.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">Remove {employee?.name}</span>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </UserManagementCard>
  );
};

export default AddEmployeePanel;
