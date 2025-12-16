import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Users,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MODAL_SCROLLBAR_STYLES = `
  .modal-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .modal-scroll::-webkit-scrollbar {
    display: none;
  }
`;

const SHORT_DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MIN_EVENT_LEAD_DAYS = 5;

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const startOfMonth = (date) => {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
};

const shiftDateByMonths = (date, months) => {
  const base = date ? new Date(date) : startOfDay(new Date());
  const desiredDay = base.getDate();
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();
  target.setDate(Math.min(desiredDay, lastDayOfTargetMonth));
  return startOfDay(target);
};

export const NewEventModal = ({ open, onOpenChange, onCreateEvent }) => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    date: undefined,
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
    contactName: '',
    contactPhone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [dateError, setDateError] = useState('');

  const today = useMemo(() => startOfDay(new Date()), []);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }),
    []
  );

  const dayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );

  const currentMonthStart = viewDate
    ? startOfMonth(viewDate)
    : startOfMonth(new Date());
  const currentMonthLabel = monthFormatter.format(currentMonthStart);

  const calendarDays = useMemo(() => {
    const monthStart = currentMonthStart;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const dateValue = new Date(gridStart);
      dateValue.setDate(gridStart.getDate() + index);
      const normalized = startOfDay(dateValue);
      const isCurrentMonth = normalized.getMonth() === monthStart.getMonth();
      const selectedDate = formData.date ? startOfDay(formData.date) : null;
      const isSelected =
        selectedDate && normalized.getTime() === selectedDate.getTime();
      const isToday = normalized.getTime() === today.getTime();

      return {
        date: normalized,
        key: normalized.toISOString(),
        isCurrentMonth,
        isSelected,
        isToday,
      };
    });
  }, [currentMonthStart, formData.date, today]);

  const goToPreviousMonth = () => {
    const base = formData.date ? startOfDay(formData.date) : viewDate;
    const newDate = shiftDateByMonths(base, -1);
    setViewDate(startOfMonth(newDate));
  };

  const goToNextMonth = () => {
    const base = formData.date ? startOfDay(formData.date) : viewDate;
    const newDate = shiftDateByMonths(base, 1);
    setViewDate(startOfMonth(newDate));
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client: '',
      date: undefined,
      startTime: '',
      endTime: '',
      location: '',
      attendees: '',
      contactName: '',
      contactPhone: '',
      notes: '',
    });
    setDateError('');
  };

  const getDaysUntilEvent = (date) => {
    if (!date) return null;
    const eventDate = startOfDay(date);
    const diffMs = eventDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleDateSelect = (date) => {
    updateFormData('date', date);
    setViewDate(startOfMonth(date));
    const daysUntilEvent = getDaysUntilEvent(date);
    if (
      typeof daysUntilEvent === 'number' &&
      daysUntilEvent <= MIN_EVENT_LEAD_DAYS - 1
    ) {
      setDateError(
        `Events must be scheduled at least ${MIN_EVENT_LEAD_DAYS} days in advance.`
      );
    } else {
      setDateError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !formData.name ||
      !formData.client ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      return;
    }

    const daysUntilEvent = getDaysUntilEvent(formData.date);
    if (
      typeof daysUntilEvent === 'number' &&
      daysUntilEvent <= MIN_EVENT_LEAD_DAYS - 1
    ) {
      setDateError(
        `Events must be scheduled at least ${MIN_EVENT_LEAD_DAYS} days in advance.`
      );
      return;
    }

    setDateError('');
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: format(formData.date, 'yyyy-MM-dd'),
      };
      const success = await onCreateEvent(payload);
      if (success) {
        resetForm();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style>{MODAL_SCROLLBAR_STYLES}</style>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto modal-scroll">
        <DialogHeader>
          <DialogTitle>Create New Catering Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name *</Label>
              <Input
                id="event-name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Corporate Lunch Meeting"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => updateFormData('client', e.target.value)}
                placeholder="ABC Technologies"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground'
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="rounded-lg border border-border/60 bg-background/70 p-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{currentMonthLabel}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={goToPreviousMonth}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-background transition-colors hover:bg-muted"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={goToNextMonth}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-background transition-colors hover:bg-muted"
                          aria-label="Next month"
                        >
                          <ChevronRight
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-tight text-muted-foreground">
                      {SHORT_DAY_LABELS.map((label) => (
                        <div key={label} className="py-1">
                          {label}
                        </div>
                      ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1 text-[11px]">
                      {calendarDays.map((day) => (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => handleDateSelect(day.date)}
                          className={cn(
                            'relative flex h-7 items-center justify-center rounded-sm border border-transparent leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                            day.isCurrentMonth
                              ? 'text-foreground'
                              : 'text-muted-foreground/60',
                            day.isSelected
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'hover:bg-muted',
                            day.isToday && !day.isSelected
                              ? 'border border-primary/50'
                              : null
                          )}
                          aria-pressed={day.isSelected}
                          aria-label={dayLabelFormatter.format(day.date)}
                        >
                          {day.date.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {dateError && (
                <p className="text-sm text-destructive" role="alert">
                  {dateError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time *</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => updateFormData('startTime', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time *</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.endTime}
                onChange={(e) => updateFormData('endTime', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="Conference Room B, ABC Technologies HQ"
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Number of Attendees</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="attendees"
                type="number"
                value={formData.attendees}
                onChange={(e) => updateFormData('attendees', e.target.value)}
                placeholder="25"
                className="pl-10"
                min={0}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Contact Name</Label>
              <Input
                id="contact-name"
                value={formData.contactName}
                onChange={(e) => updateFormData('contactName', e.target.value)}
                placeholder="John Smith"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-phone"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    updateFormData('contactPhone', e.target.value)
                  }
                  placeholder="(555) 123-4567"
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Any special requests or requirements"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || Boolean(dateError)}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
