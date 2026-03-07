import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceTypeFilter = 'all' | 'delivery-only' | 'delivery-setup' | 'full-service';
export type SortBy = 'submitted' | 'date' | 'name' | 'event' | 'guests' | 'status' | 'payment_status' | 'invoice' | 'total' | 'edited';
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
}: EventFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mobile: Status Dropdown */}
      <div className="sm:hidden">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.value === 'all' ? 'All Statuses' : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Status Filter Pills */}
      <div className="hidden sm:flex flex-wrap gap-1">
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
        <SelectTrigger className="w-[130px] sm:w-[140px] h-8 text-xs">
          <SelectValue placeholder="Service Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          <SelectItem value="delivery-only">Delivery Only</SelectItem>
          <SelectItem value="delivery-setup">Delivery + Setup</SelectItem>
          <SelectItem value="full-service">Full-Service</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
