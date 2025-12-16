import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  format,
  isSameDay,
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * CalendarViewModal (Light Theme, UX Refined)
 * - Left: calendar with clear event-day highlights and quick month/year dropdown.
 * - Right: agenda-style timeline for the selected date (clean cards, subtle dividers).
 * - Header: short description and quick actions (Today, Next/Prev event day).
 * - Footer: total count + Close.
 */

const phpCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
  } catch {
    const n = Number(value ?? 0);
    return `PHP ${Number.isFinite(n) ? n.toFixed(2) : '0.00'}`;
  }
};

const getSafeDate = (iso) => {
  try {
    return parseISO(iso);
  } catch {
    return null;
  }
};

const SHORT_DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarViewModal = ({
  open,
  onOpenChange,
  events = [],
  onViewDetails,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));

  // Normalize event dates and keep a sorted unique set for quick navigation
  const normalizedEventDates = useMemo(() => {
    const dates = events
      .map((e) => getSafeDate(e.date))
      .filter(Boolean)
      .map((d) => startOfDay(d).getTime());

    return Array.from(new Set(dates))
      .sort((a, b) => a - b)
      .map((t) => new Date(t));
  }, [events]);

  const hasEventsOnDate = (date) =>
    events.some((event) => {
      const d = getSafeDate(event.date);
      return d ? isSameDay(d, date) : false;
    });

  const getEventsForDate = (date) =>
    events.filter((event) => {
      const d = getSafeDate(event.date);
      return d ? isSameDay(d, date) : false;
    });

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled':
        return 'outline';
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewDate(startOfMonth(today));
  };

  // Next event day after selected
  const jumpToNextEventDay = () => {
    if (!normalizedEventDates.length) return;
    const anchor = startOfDay(selectedDate || new Date());
    const next = normalizedEventDates.find((d) => isAfter(d, anchor));
    if (next) {
      setSelectedDate(next);
      setViewDate(startOfMonth(next));
    }
  };

  // Previous event day before selected
  const jumpToPrevEventDay = () => {
    if (!normalizedEventDates.length) return;
    const anchor = startOfDay(selectedDate || new Date());
    const prev = [...normalizedEventDates]
      .reverse()
      .find((d) => isBefore(d, anchor));
    if (prev) {
      setSelectedDate(prev);
      setViewDate(startOfMonth(prev));
    }
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() - 1,
      1
    );
    setViewDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      1
    );
    setViewDate(newDate);
  };

  const currentMonthLabel = format(viewDate, 'MMMM yyyy');
  const today = useMemo(() => startOfDay(new Date()), []);

  const calendarDays = useMemo(() => {
    const monthStart = viewDate;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const dateValue = new Date(gridStart);
      dateValue.setDate(gridStart.getDate() + index);
      const normalized = startOfDay(dateValue);
      const isCurrentMonth = normalized.getMonth() === monthStart.getMonth();
      const isSelected =
        selectedDate && normalized.getTime() === selectedDate.getTime();
      const isToday = normalized.getTime() === today.getTime();
      const hasEvents = hasEventsOnDate(normalized);

      return {
        date: normalized,
        key: normalized.toISOString(),
        isCurrentMonth,
        isSelected,
        isToday,
        hasEvents,
      };
    });
  }, [viewDate, selectedDate, today, events]);

  const handleViewDetailsClick = (event) => {
    if (typeof onViewDetails === 'function') {
      onViewDetails(event);
    }
    if (typeof onOpenChange === 'function') {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide p-0">
        {/* Light theme shell */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]">
          <div className="pointer-events-none absolute -right-16 -top-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-muted/40 blur-3xl" />

          <div className="relative p-6">
            <DialogHeader className="mb-2">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Catering Events Calendar
              </DialogTitle>
              <DialogDescription className="text-sm">
                Browse your schedule, spot busy days at a glance, and review
                details in the agenda. Use the dropdowns to jump months quickly,
                or hop to the next event day.
              </DialogDescription>
            </DialogHeader>

            {/* Quick actions */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={jumpToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={jumpToPrevEventDay}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev event day
              </Button>
              <Button variant="outline" size="sm" onClick={jumpToNextEventDay}>
                Next event day
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>

              <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-primary/20 ring-1 ring-primary/30" />
                  Has events
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-secondary/20 ring-1 ring-secondary/30" />
                  Today
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Calendar */}
              <Card className="relative overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Select a date</CardTitle>
                  <CardDescription>
                    Days with events are highlighted.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
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
                          onClick={() => setSelectedDate(day.date)}
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
                          aria-label={format(day.date, 'EEEE, MMMM d, yyyy')}
                        >
                          {day.date.getDate()}
                          {day.hasEvents ? (
                            <span
                              className={cn(
                                'absolute bottom-0.5 h-1 w-1 rounded-full',
                                day.isSelected
                                  ? 'bg-primary-foreground'
                                  : 'bg-primary'
                              )}
                            />
                          ) : null}
                        </button>
                      ))}
                    </div>

                    <p className="mt-2 text-[10px] text-muted-foreground text-center">
                      Dates with a dot indicate at least one scheduled event.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Agenda / timeline for selected date */}
              <Card className="relative overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">
                      {selectedDate
                        ? `Agenda for ${format(selectedDate, 'MMMM d, yyyy')}`
                        : 'Select a date'}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    A concise, scannable overview of bookings and clients.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative max-h-96 space-y-4 overflow-y-auto">
                    {/* Timeline spine */}
                    <div
                      className="pointer-events-none absolute left-4 top-3 bottom-3 w-px bg-muted"
                      aria-hidden="true"
                    />
                    {selectedDateEvents.length > 0 ? (
                      selectedDateEvents.map((event, idx) => (
                        <div key={event.id ?? idx} className="relative pl-10">
                          {/* timeline node */}
                          <span className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary" />
                          <div className="group rounded-xl border border-transparent bg-slate-50/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white">
                            <div className="mb-1 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-foreground">
                                  {event.name || 'Untitled Event'}
                                </h4>
                                <p className="truncate text-xs text-muted-foreground">
                                  {event.client || 'Client not specified'}
                                </p>
                              </div>
                              <Badge
                                variant={getStatusBadgeVariant(event.status)}
                                className="shrink-0 text-[10px] uppercase"
                              >
                                {(event.status || 'scheduled').replace(
                                  '-',
                                  ' '
                                )}
                              </Badge>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{event.time || 'Time TBD'}</span>
                              </div>

                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="line-clamp-1">
                                    {event.location}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {Number(event.attendees ?? 0)} attendees
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Contact
                                </span>
                                <span className="text-sm font-medium">
                                  {event?.contactPerson?.name || '—'}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm font-semibold">
                                {phpCurrency(event.total)}
                              </span>
                              {/* Wire this to your EventDetailsModal if desired */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleViewDetailsClick(event)}
                                disabled={!onViewDetails}
                              >
                                View details
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : selectedDate ? (
                      <div className="py-10 text-center">
                        <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          No events scheduled for this date.
                        </p>
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Select a date to view events.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Total events: {events.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={jumpToToday}>
                  Jump to today
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
