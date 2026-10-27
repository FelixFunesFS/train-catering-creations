import { useMemo, useState } from 'react';
import { History, Loader2, MapPin, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStaffHistory } from '@/hooks/useStaffEvents';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { ListSearchInput, matchesSearch } from '@/components/admin/ListSearchInput';

const PAGE = 30;

interface Props {
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

export function StaffHistoryList({ selectedEventId, onSelectEvent }: Props) {
  const [limit, setLimit] = useState(PAGE);
  const [search, setSearch] = useState('');
  const [jump, setJump] = useState('');
  const { data: events = [], isLoading, isFetching } = useStaffHistory(limit);

  const filtered = events.filter((e) =>
    (!jump || e.event_date.startsWith(jump)) &&
    matchesSearch(search, [e.event_name, e.contact_name, e.location, e.event_type, e.service_type]),
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const k = e.event_date.slice(0, 7);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return [...map.entries()];
  }, [filtered]);

  const months = useMemo(() => [...new Set(events.map((e) => e.event_date.slice(0, 7)))], [events]);
  const monthLabel = (k: string) => {
    const [y, m] = k.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1"><ListSearchInput value={search} onChange={setSearch} placeholder="Search past events" /></div>
        <select
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          aria-label="Jump to month"
          className="h-11 rounded-md border bg-background px-3 text-base sm:text-sm"
        >
          <option value="">All months</option>
          {months.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
        </select>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center rounded-xl border border-dashed">
          <History className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">{search || jump ? 'No past events match' : 'No past events yet'}</p>
        </div>
      ) : groups.map(([k, list]) => (
        <section key={k} className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">{monthLabel(k)} · {list.length}</h4>
          <div className="rounded-xl border bg-card divide-y overflow-hidden">
            {list.map((e) => {
              const d = parseDateFromLocalString(e.event_date);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onSelectEvent(e.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 text-left min-h-[64px] touch-manipulation transition-colors',
                    e.id === selectedEventId ? 'bg-primary/10' : 'hover:bg-muted/40',
                  )}
                >
                  <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted py-1.5">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">{d?.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-semibold leading-none">{d?.getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.event_name}</p>
                    <p className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{e.guest_count}</span>
                      <span className="inline-flex items-center gap-1 min-w-0"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{e.location}</span></span>
                    </p>
                  </div>
                  <Badge variant="outline" className="hidden sm:inline-flex text-muted-foreground">{e.workflow_status === 'completed' ? 'Completed' : 'Pending close-out'}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {events.length >= limit && (
        <Button variant="outline" className="w-full h-11" disabled={isFetching} onClick={() => setLimit((l) => l + PAGE)}>
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load more'}
        </Button>
      )}
    </div>
  );
}
