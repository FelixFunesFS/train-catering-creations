import { CalendarDays, Users, UserCheck, Clock } from 'lucide-react';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { computePulseMetrics } from './staffUrgency';
import { cn } from '@/lib/utils';

interface Props {
  events: StaffEvent[];
  className?: string;
}

/** Glanceable operational KPIs. Horizontal scroll on phones, 4-up grid from tablet. */
export function StaffPulseStrip({ events, className }: Props) {
  const m = computePulseMetrics(events);
  const allConfirmed = m.staffTotal > 0 && m.staffConfirmed === m.staffTotal;

  const items = [
    { icon: CalendarDays, label: 'Events', value: String(m.eventCount), sub: m.eventCount === 1 ? 'scheduled' : 'scheduled' },
    { icon: Users, label: 'Guests', value: m.guestTotal.toLocaleString(), sub: 'to serve' },
    {
      icon: UserCheck,
      label: 'Crew',
      value: m.staffTotal ? `${m.staffConfirmed}/${m.staffTotal}` : '—',
      sub: m.staffTotal ? (allConfirmed ? 'all confirmed' : 'confirmed') : 'none assigned',
      tone: m.staffTotal ? (allConfirmed ? 'text-success' : 'text-[hsl(var(--gold-dark))]') : undefined,
    },
    {
      icon: Clock,
      label: 'Next service',
      value: m.nextService ? m.nextService.time : '—',
      sub: m.nextService ? `${m.nextService.dateLabel} · ${m.nextService.eventName}` : 'nothing upcoming',
    },
  ];

  return (
    <div
      role="region"
      aria-label="Schedule overview"
      className={cn(
        'flex gap-2 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'md:grid md:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 md:gap-3',
        className
      )}
    >
      {items.map(({ icon: Icon, label, value, sub, tone }) => (
        <div
          key={label}
          className="snap-start shrink-0 min-w-[9.5rem] md:min-w-0 rounded-xl border border-border/70 bg-card/80 backdrop-blur px-3 py-2.5 shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </div>
          <div className={cn('mt-0.5 text-xl font-semibold tabular-nums leading-tight', tone)}>{value}</div>
          <div className="text-xs text-muted-foreground truncate" title={sub}>{sub}</div>
        </div>
      ))}
    </div>
  );
}
