import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceTypeFilter = 'all' | 'drop-off' | 'delivery-setup' | 'full-service';
export type SortBy = 'date' | 'name' | 'total';
export type SortOrder = 'asc' | 'desc';

interface EventFiltersProps {
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  serviceTypeFilter: ServiceTypeFilter;
  setServiceTypeFilter: (value: ServiceTypeFilter) => void;
  sortBy: SortBy;
  setSortBy: (value: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function EventFilters({
  statusFilter,
  setStatusFilter,
  serviceTypeFilter,
  setServiceTypeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: EventFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-1">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Service Type Dropdown */}
      <Select value={serviceTypeFilter} onValueChange={(v) => setServiceTypeFilter(v as ServiceTypeFilter)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Service Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          <SelectItem value="drop-off">Drop-Off</SelectItem>
          <SelectItem value="delivery-setup">Delivery + Setup</SelectItem>
          <SelectItem value="full-service">Full-Service</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
        <SelectTrigger className="w-[110px] h-8 text-xs">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="total">Total</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Order Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span className="ml-1 text-xs">{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
      </Button>
    </div>
  );
}