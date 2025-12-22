import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SortBy, SortOrder } from './EventFilters';

interface SortableTableHeadProps {
  label: string;
  sortKey: SortBy;
  currentSortBy: SortBy;
  currentSortOrder: SortOrder;
  onSort: (key: SortBy) => void;
  className?: string;
}

export function SortableTableHead({ 
  label, 
  sortKey, 
  currentSortBy, 
  currentSortOrder, 
  onSort, 
  className 
}: SortableTableHeadProps) {
  const isActive = currentSortBy === sortKey;
  
  return (
    <TableHead 
      className={cn(
        "cursor-pointer hover:bg-muted/50 select-none transition-colors",
        isActive && "bg-muted/30",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          currentSortOrder === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-foreground" />
          ) : (
            <ArrowDown className="h-3 w-3 text-foreground" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </div>
    </TableHead>
  );
}
