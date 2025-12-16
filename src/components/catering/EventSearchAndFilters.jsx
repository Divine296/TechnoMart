import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const EventSearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onCalendarView 
}) => {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search events..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        className="flex gap-1 items-center"
        onClick={onCalendarView}
      >
        <Calendar className="h-4 w-4 mr-1" /> Calendar View
      </Button>
    </div>
  );
};