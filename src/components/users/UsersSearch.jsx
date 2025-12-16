import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const UsersSearch = ({ searchTerm, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search users..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

