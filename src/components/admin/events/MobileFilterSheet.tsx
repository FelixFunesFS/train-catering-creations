import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger } from '@/components/ui/drawer';
import type { StatusFilter, ServiceTypeFilter, SortBy, SortOrder } from './EventFilters';

interface Props {
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  serviceTypeFilter: ServiceTypeFilter;
  setServiceTypeFilter: (v: ServiceTypeFilter) => void;
  sortBy: SortBy;
  setSortBy: (v: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (v: SortOrder) => void;
}

const sorts = [
  { value: 'date:asc', label: 'Event date (soonest)' },
  { value: 'date:desc', label: 'Event date (latest)' },
  { value: 'submitted:desc', label: 'Submitted (newest)' },
  { value: 'submitted:asc', label: 'Submitted (oldest)' },
];
const statuses: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
const services: { value: ServiceTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Services' },
  { value: 'delivery-only', label: 'Delivery Only' },
  { value: 'delivery-setup', label: 'Delivery + Setup' },
  { value: 'full-service', label: 'Full-Service' },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button type="button" size="sm" variant={active ? 'default' : 'outline'} aria-pressed={active}
      className="h-10 min-w-[44px] text-sm" onClick={onClick}>
      {children}
    </Button>
  );
}

export function MobileFilterSheet(p: Props) {
  const [open, setOpen] = useState(false);
  const current = `${p.sortBy}:${p.sortOrder}`;
  const activeCount =
    (p.statusFilter !== 'all' ? 1 : 0) +
    (p.serviceTypeFilter !== 'all' ? 1 : 0) +
    (current !== 'date:asc' ? 1 : 0);

  const reset = () => {
    p.setStatusFilter('all');
    p.setServiceTypeFilter('all');
    p.setSortBy('date');
    p.setSortOrder('asc');
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="h-9 gap-1.5 px-3" aria-label={`Filters${activeCount ? `, ${activeCount} active` : ''}`}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 rounded-full bg-primary text-primary-foreground text-[11px] leading-none px-1.5 py-1">
              {activeCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Sort & Filter Events</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-5 overflow-y-auto max-h-[60vh]">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sort by</h3>
            <div className="grid grid-cols-2 gap-2">
              {sorts.map(s => (
                <Chip key={s.value} active={current === s.value} onClick={() => {
                  const [by, order] = s.value.split(':');
                  p.setSortBy(by as SortBy);
                  p.setSortOrder(order as SortOrder);
                }}>{s.label}</Chip>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <Chip key={s.value} active={p.statusFilter === s.value} onClick={() => p.setStatusFilter(s.value)}>{s.label}</Chip>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Service type</h3>
            <div className="grid grid-cols-2 gap-2">
              {services.map(s => (
                <Chip key={s.value} active={p.serviceTypeFilter === s.value} onClick={() => p.setServiceTypeFilter(s.value)}>{s.label}</Chip>
              ))}
            </div>
          </section>
        </div>
        <DrawerFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1 h-11" onClick={reset} disabled={activeCount === 0}>Reset</Button>
          <Button className="flex-1 h-11" onClick={() => setOpen(false)}>Done</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
