import type { StaffEvent } from '@/hooks/useStaffEvents';
import { computePulseMetrics } from './staffUrgency';
import { cn } from '@/lib/utils';

interface Props {
  events: StaffEvent[];
  className?: string;
}

/** Single-line operational summary. Hidden when there's nothing to summarize. */
export function StaffPulseStrip({ events, className }: Props) {
  const m = computePulseMetrics(events);
  if (m.eventCount === 0) return null;
  const parts = [
    `${m.eventCount} event${m.eventCount === 1 ? '' : 's'}`,
    `${m.guestTotal.toLocaleString()} guests`,
    m.staffTotal ? `${m.staffConfirmed}/${m.staffTotal} crew confirmed` : null,
    m.nextService ? `Next: ${m.nextService.dateLabel} ${m.nextService.time}` : null,
  ].filter(Boolean);
  return (
    <p role="status" aria-label="Schedule overview" className={cn('text-sm text-muted-foreground tabular-nums truncate', className)}>
      {parts.map((p, i) => (
        <span key={i}>{i > 0 && <span className="mx-1.5 text-muted-foreground/50">·</span>}<span className={i === 0 ? 'font-medium text-foreground' : undefined}>{p}</span></span>
      ))}
    </p>
  );
}
