import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CalendarDays, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useStaffEvents, useStaffEvent, type StaffEventFilter } from '@/hooks/useStaffEvents';
import { StaffEventCard } from '@/components/staff/StaffEventCard';
import { StaffEventDetails } from '@/components/staff/StaffEventDetails';
import { SubscribeCalendarButton } from '@/components/staff/SubscribeCalendarButton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/admin/PaginationControls';
import { ListSearchInput, matchesSearch } from '@/components/admin/ListSearchInput';
import { StaffPulseStrip } from '@/components/staff/StaffPulseStrip';
import { StaffMonthView } from '@/components/staff/StaffMonthView';
import { StaffHistoryList } from '@/components/staff/StaffHistoryList';
import { formatDateToLocalString } from '@/utils/dateHelpers';
import { cn } from '@/lib/utils';

type StaffView = 'today' | 'week' | 'all' | 'month' | 'history';
const VIEWS: { value: StaffView; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'all', label: 'Upcoming' },
  { value: 'month', label: 'Month' },
  { value: 'history', label: 'History' },
];
const isListView = (v: StaffView): v is StaffEventFilter => v === 'today' || v === 'week' || v === 'all';

function Segmented({ value, onChange }: { value: StaffView; onChange: (v: StaffView) => void }) {
  return (
    <div role="tablist" aria-label="Schedule view" className="flex gap-1 overflow-x-auto no-scrollbar rounded-lg bg-muted p-1">
      {VIEWS.map((v) => (
        <button
          key={v.value}
          role="tab"
          aria-selected={value === v.value}
          onClick={() => onChange(v.value)}
          className={cn(
            'flex-1 shrink-0 whitespace-nowrap rounded-md px-3 min-h-[40px] text-sm font-medium transition-all touch-manipulation',
            value === v.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

export default function StaffSchedule() {
  // Phones only (< md 768px); tablets get the split view.
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [params, setParams] = useSearchParams();
  const view = (VIEWS.some((v) => v.value === params.get('view')) ? params.get('view') : 'all') as StaffView;
  const month = /^\d{4}-\d{2}$/.test(params.get('m') ?? '') ? params.get('m')! : formatDateToLocalString(new Date()).slice(0, 7);
  const setView = (v: StaffView) => setParams((p) => { p.set('view', v); return p; }, { replace: true });
  const setMonth = (m: string) => setParams((p) => { p.set('m', m); return p; }, { replace: true });

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const listFilter: StaffEventFilter = isListView(view) ? view : 'all';
  const { data: events, isLoading, error } = useStaffEvents(listFilter);
  const { data: selectedEventRaw } = useStaffEvent(selectedEventId);

  const PAGE_SIZE = 10;
  const eventList = (events ?? []).filter((e) =>
    matchesSearch(search, [e.event_name, e.contact_name, e.phone, e.location, e.event_type, e.service_type]),
  );
  const { currentPage, setCurrentPage, totalPages, startIndex, endIndex } = usePagination(eventList.length, PAGE_SIZE, [view, search]);
  const paginatedEvents = eventList.slice(startIndex, endIndex);
  // In list views, only show the detail panel for an event that is still visible in the filtered list
  const selectedEvent = isListView(view) && !isLoading && !eventList.some((e) => e.id === selectedEventId) ? null : selectedEventRaw;

  // Desktop: auto-open the first upcoming event in list views so the detail pane is never blank
  useEffect(() => {
    if (isMobile || !isListView(view) || paginatedEvents.length === 0) return;
    if (!selectedEventId || !eventList.some((e) => e.id === selectedEventId)) setSelectedEventId(paginatedEvents[0].id);
  }, [isMobile, view, paginatedEvents, eventList, selectedEventId]);

  const emptyCopy: Record<StaffEventFilter, string> = {
    today: 'No events scheduled for today',
    week: 'No events scheduled this week',
    all: 'No upcoming events',
  };

  const listContent = (
    <div className="space-y-3">
      {paginatedEvents.length > 0 ? (
        paginatedEvents.map((event) => (
          <StaffEventCard key={event.id} event={event} isSelected={!isMobile && event.id === selectedEventId} onClick={() => setSelectedEventId(event.id)} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted"><Calendar className="h-5 w-5 text-muted-foreground" /></div>
          <p className="font-medium">{search.trim() ? `No events match "${search}"` : emptyCopy[listFilter]}</p>
          {search.trim() ? (
            <Button variant="link" onClick={() => setSearch('')} className="min-h-[44px]">Clear search</Button>
          ) : (
            <Button variant="link" onClick={() => setView('month')} className="min-h-[44px]">Open month view</Button>
          )}
        </div>
      )}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={eventList.length} onPageChange={setCurrentPage} />
    </div>
  );

  const body = view === 'month' ? (
    <StaffMonthView month={month} onMonthChange={setMonth} selectedEventId={selectedEventId} onSelectEvent={setSelectedEventId} />
  ) : view === 'history' ? (
    <StaffHistoryList selectedEventId={selectedEventId} onSelectEvent={setSelectedEventId} />
  ) : isLoading ? (
    <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>
  ) : error ? (
    <div className="py-12 text-center">
      <p className="text-destructive mb-1">Failed to load events</p>
      <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
    </div>
  ) : (
    <div className="space-y-4">
      {!isMobile && <ListSearchInput value={search} onChange={setSearch} placeholder="Search event, client, venue, phone" />}
      <StaffPulseStrip events={eventList} />
      {listContent}
    </div>
  );

  // Mobile details
  if (isMobile && selectedEventId && selectedEvent) {
    return (
      <AdminLayout>
        <div className="p-4 pb-24">
          <StaffEventDetails event={selectedEvent} onBack={() => setSelectedEventId(null)} />
        </div>
      </AdminLayout>
    );
  }

  // Mobile list
  if (isMobile) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Staff</p>
            <h2 className="text-2xl font-semibold tracking-tight">Schedule</h2>
          </div>
          <div className="flex items-center gap-1">
            {isListView(view) && (
              <Button variant="ghost" size="icon" className="h-11 w-11" aria-label={searchOpen ? 'Close search' : 'Search'} onClick={() => { setSearchOpen((o) => !o); if (searchOpen) setSearch(''); }}>
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>
            )}
            <SubscribeCalendarButton variant="icon" />
          </div>
        </div>
        <div className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 bg-background/95 backdrop-blur px-4 py-2 border-b">
          <Segmented value={view} onChange={(v) => { setView(v); setSelectedEventId(null); }} />
          {searchOpen && isListView(view) && (
            <div className="pt-2"><ListSearchInput value={search} onChange={setSearch} placeholder="Search event, client, venue, phone" /></div>
          )}
        </div>
        <div className="p-4 pb-24">{body}</div>
      </AdminLayout>
    );
  }

  // Desktop / tablet split view
  return (
    <AdminLayout>
      <div className="h-16 border-b print:hidden flex items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3 min-w-0">
          <CalendarDays className="h-5 w-5 text-primary shrink-0" />
          <h2 className="font-semibold text-lg tracking-tight truncate">Staff Schedule</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-[440px] max-w-[50vw]"><Segmented value={view} onChange={setView} /></div>
          <SubscribeCalendarButton />
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-8rem)]">
        <ResizablePanel defaultSize={view === 'month' ? 55 : 38} minSize={28} maxSize={65} className="print:hidden">
          <ScrollArea className="h-full">
            <div className="p-5">{body}</div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle className="print:hidden" />
        <ResizablePanel defaultSize={view === 'month' ? 45 : 62}>
          <ScrollArea className="h-full">
            <div className="p-6">
              {selectedEvent ? (
                <StaffEventDetails event={selectedEvent} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <Calendar className="h-14 w-14 text-muted-foreground/30 mb-4" />
                  <p className="font-medium">Select an event</p>
                  <p className="text-sm text-muted-foreground">Details, menu, and crew will appear here.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </AdminLayout>
  );
}
