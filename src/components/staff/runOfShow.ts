import type { StaffEvent } from '@/hooks/useStaffEvents';

export type RunStepKind = 'arrival' | 'start' | 'cocktail' | 'serving' | 'breakdown';

export interface RunStep {
  kind: RunStepKind;
  time: string | null; // "HH:MM" or null when untimed
  title: string;
  detail?: string;
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
};
const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : null);

/**
 * Builds a chronological run of show from real event data only — no invented times.
 * Untimed steps (cocktail hour, breakdown) are slotted by position.
 */
export function buildRunOfShow(event: StaffEvent): RunStep[] {
  const steps: RunStep[] = [];

  // Crew arrivals, grouped by time
  const byTime = new Map<string, string[]>();
  for (const a of event.staff_assignments) {
    const t = hhmm(a.arrival_time);
    if (!t) continue;
    byTime.set(t, [...(byTime.get(t) ?? []), `${a.staff_name} (${a.role})`]);
  }
  for (const [time, people] of byTime) {
    steps.push({ kind: 'arrival', time, title: 'Crew arrival', detail: people.join(', ') });
  }

  const start = hhmm(event.start_time);
  const serving = hhmm(event.serving_start_time);

  if (start && start !== serving) {
    steps.push({ kind: 'start', time: start, title: 'Event begins' });
  }

  steps.sort((a, b) => toMinutes(a.time!) - toMinutes(b.time!));

  if (event.cocktail_hour) {
    steps.push({ kind: 'cocktail', time: null, title: 'Cocktail hour', detail: 'Before main service' });
  }

  const serveTime = serving || start;
  if (serveTime) {
    const timedSoFar = steps.filter((s) => s.time);
    // Keep serving after anything earlier, but before later-timed arrivals
    const insertAt = steps.findIndex((s) => s.time && toMinutes(s.time) > toMinutes(serveTime));
    const servingStep: RunStep = {
      kind: 'serving',
      time: serveTime,
      title: 'Food service begins',
      detail: [
        `${event.guest_count} guests`,
        event.both_proteins_available && event.proteins.length >= 2 ? 'Dual Entrée' : null,
      ].filter(Boolean).join(' · '),
    };
    if (insertAt === -1 || timedSoFar.length === 0) steps.push(servingStep);
    else steps.splice(insertAt, 0, servingStep);
  }

  steps.push({
    kind: 'breakdown',
    time: null,
    title: 'Breakdown & cleanup',
    detail: event.bussing_tables_needed ? 'Includes bussing tables' : 'After service ends',
  });

  return steps;
}

/** Index of the current step for a today event, using "HH:MM" now. -1 when not applicable. */
export function getCurrentStepIndex(steps: RunStep[], nowHHMM: string, isToday: boolean): number {
  if (!isToday) return -1;
  const now = toMinutes(nowHHMM);
  let idx = -1;
  steps.forEach((s, i) => {
    if (s.time && toMinutes(s.time) <= now) idx = i;
  });
  return idx;
}
