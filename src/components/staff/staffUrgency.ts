import { format } from 'date-fns';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { convertMenuIdToReadableText } from '@/utils/menuNLP';

export type Urgency = 'past' | 'today' | 'tomorrow' | 'soon' | 'later';

export function getUrgency(daysUntil: number): Urgency {
  if (daysUntil < 0) return 'past';
  if (daysUntil === 0) return 'today';
  if (daysUntil === 1) return 'tomorrow';
  if (daysUntil <= 7) return 'soon';
  return 'later';
}

/** Left accent bar + countdown chip styling, using semantic tokens only. */
export const urgencyStyles: Record<Urgency, { accent: string; chip: string }> = {
  today: { accent: 'bg-destructive', chip: 'bg-destructive text-destructive-foreground' },
  tomorrow: { accent: 'bg-[hsl(var(--gold))]', chip: 'bg-[hsl(var(--gold))] text-[hsl(var(--gold-foreground))]' },
  soon: { accent: 'bg-primary', chip: 'bg-primary/10 text-primary' },
  later: { accent: 'bg-border', chip: 'bg-muted text-muted-foreground' },
  past: { accent: 'bg-muted', chip: 'bg-muted text-muted-foreground' },
};

export function getCountdownLabel(daysUntil: number, eventDate: string): string {
  const u = getUrgency(daysUntil);
  if (u === 'past') return 'Past';
  if (u === 'today') return 'Today';
  if (u === 'tomorrow') return 'Tomorrow';
  if (u === 'soon') return `In ${daysUntil} days`;
  return format(parseDateFromLocalString(eventDate), 'MMM d');
}

export function formatStaffTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m || 0).padStart(2, '0')} ${suffix}`;
}

/** Short, readable dietary summary for card/header pills. */
export function getDietarySummary(event: StaffEvent): { count: number; labels: string[] } {
  const labels = (event.dietary_restrictions ?? []).map((d) => convertMenuIdToReadableText(d));
  const count = Number(event.guest_count_with_restrictions) || 0;
  return { count, labels };
}

export interface PulseMetrics {
  eventCount: number;
  guestTotal: number;
  staffConfirmed: number;
  staffTotal: number;
  nextService: { time: string; eventName: string; dateLabel: string } | null;
}

/** Aggregate operational KPIs for the visible (upcoming) events. */
export function computePulseMetrics(events: StaffEvent[]): PulseMetrics {
  const upcoming = events.filter((e) => e.days_until >= 0);
  let staffConfirmed = 0;
  let staffTotal = 0;
  let guestTotal = 0;
  for (const e of upcoming) {
    guestTotal += Number(e.guest_count) || 0;
    staffTotal += e.staff_assignments.length;
    staffConfirmed += e.staff_assignments.filter((s) => s.confirmed).length;
  }
  const sorted = [...upcoming].sort((a, b) => {
    if (a.days_until !== b.days_until) return a.days_until - b.days_until;
    const ta = a.serving_start_time || a.start_time || '99:99';
    const tb = b.serving_start_time || b.start_time || '99:99';
    return ta.localeCompare(tb);
  });
  const next = sorted[0];
  const nextTime = next ? next.serving_start_time || next.start_time : null;
  return {
    eventCount: upcoming.length,
    guestTotal,
    staffConfirmed,
    staffTotal,
    nextService: next && nextTime
      ? { time: formatStaffTime(nextTime), eventName: next.event_name, dateLabel: getCountdownLabel(next.days_until, next.event_date) }
      : null,
  };
}
