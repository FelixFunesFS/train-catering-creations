import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStaffEventsRange } from '@/hooks/useStaffEvents';
import { formatDateToLocalString, parseDateFromLocalString } from '@/utils/dateHelpers';
import { buildMonthGrid, groupByDate, monthRange, parseMonthKey, shiftMonth } from './monthGrid';
import { StaffEventCard } from './StaffEventCard';
import { formatStaffTime } from './staffUrgency';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAYS_LONG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  month: string; // YYYY-MM
  onMonthChange: (m: string) => void;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

export function StaffMonthView({ month, onMonthChange, selectedEventId, onSelectEvent }: Props) {
  const todayStr = formatDateToLocalString(new Date());
  const { from, to } = monthRange(month);
  const { data: events = [], isLoading } = useStaffEventsRange(from, to);
  const byDate = useMemo(() => groupByDate(events), [events]);
  const cells = useMemo(() => buildMonthGrid(month), [month]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const { year, month: m } = parseMonthKey(month);
  const label = new Date(year, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const activeDay = selectedDay && selectedDay.startsWith(month) ? selectedDay : null;
  const dayEvents = activeDay ? byDate[activeDay] ?? [] : events;

  const go = (d: number) => { setSelectedDay(null); onMonthChange(shiftMonth(month, d)); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-lg tracking-tight">{label}</h3>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-10 px-3" onClick={() => { setSelectedDay(todayStr); onMonthChange(todayStr.slice(0, 7)); }}>Today</Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Previous month" onClick={() => go(-1)}><ChevronLeft className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Next month" onClick={() => go(1)}><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      <div
        className="rounded-xl border bg-card overflow-hidden touch-pan-y"
        onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          // Only clear horizontal swipes change month; vertical scrolling is ignored
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <div className="grid grid-cols-7 border-b bg-muted/40 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-2 text-center">
              <span className="lg:hidden">{d}</span><span className="hidden lg:inline">{WEEKDAYS_LONG[i]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {cells.map((c) => {
            const list = byDate[c.date] ?? [];
            const isToday = c.date === todayStr;
            const isSel = c.date === activeDay;
            return (
              <button
                key={c.date}
                type="button"
                onClick={() => {
                  if (!c.inMonth) { onMonthChange(c.date.slice(0, 7)); setSelectedDay(c.date); return; }
                  setSelectedDay(isSel ? null : c.date);
                }}
                aria-label={`${c.date}, ${list.length} event${list.length === 1 ? '' : 's'}`}
                className={cn(
                  'relative flex flex-col items-center lg:items-stretch gap-1 border-b border-r p-1 lg:p-1.5 text-left min-h-[48px] lg:min-h-[96px] touch-manipulation transition-colors',
                  !c.inMonth && 'bg-muted/20 text-muted-foreground/50',
                  isSel ? 'bg-primary/10' : 'hover:bg-muted/40',
                )}
              >
                <span className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                  isToday && 'bg-primary text-primary-foreground font-semibold',
                )}>{c.day}</span>
                {/* Phone: dots */}
                {list.length > 0 && (
                  <span className="flex gap-0.5 lg:hidden">
                    {list.slice(0, 3).map((e) => <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-primary" />)}
                  </span>
                )}
                {/* Desktop: chips */}
                <span className="hidden lg:flex flex-col gap-0.5 w-full">
                  {list.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      role="link"
                      onClick={(ev) => { ev.stopPropagation(); onSelectEvent(e.id); }}
                      className={cn(
                        'truncate rounded px-1.5 py-0.5 text-[11px] leading-tight cursor-pointer',
                        e.id === selectedEventId ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-foreground hover:bg-primary/20',
                      )}
                    >
                      {e.start_time ? `${formatStaffTime(e.start_time)} ` : ''}{e.event_name}
                    </span>
                  ))}
                  {list.length > 2 && <span className="text-[11px] text-muted-foreground px-1">+{list.length - 2} more</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {activeDay
            ? parseDateFromLocalString(activeDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : `All events in ${label}`}
          {' · '}{dayEvents.length}
        </p>
        {dayEvents.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center py-10 text-center rounded-xl border border-dashed">
            <CalendarX className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No events {activeDay ? 'on this day' : 'this month'}</p>
          </div>
        ) : (
          dayEvents.map((e) => (
            <StaffEventCard key={e.id} event={e} isSelected={e.id === selectedEventId} onClick={() => onSelectEvent(e.id)} />
          ))
        )}
      </div>
    </div>
  );
}
