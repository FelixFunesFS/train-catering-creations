// Single source of truth for which payment split applies (pure, no imports).
// <=14 days: 100% now. 15-44 days: 60% now + 40% (7 days prior if <=30, else 14). 45+: 10/40/50.
export type ScheduleTier = 'RUSH' | 'SHORT_NOTICE' | 'MID_RANGE' | 'STANDARD';
export interface SchedulePart { type: 'FULL' | 'DEPOSIT' | 'MILESTONE' | 'FINAL'; percentage: number; daysBeforeEvent: number | null }

export function getScheduleTier(daysOut: number): ScheduleTier {
  if (daysOut <= 14) return 'RUSH';
  if (daysOut <= 30) return 'SHORT_NOTICE';
  if (daysOut <= 44) return 'MID_RANGE';
  return 'STANDARD';
}

export function planSchedule(daysOut: number): SchedulePart[] {
  switch (getScheduleTier(daysOut)) {
    case 'RUSH': return [{ type: 'FULL', percentage: 100, daysBeforeEvent: null }];
    case 'SHORT_NOTICE': return [{ type: 'DEPOSIT', percentage: 60, daysBeforeEvent: null }, { type: 'FINAL', percentage: 40, daysBeforeEvent: 7 }];
    case 'MID_RANGE': return [{ type: 'DEPOSIT', percentage: 60, daysBeforeEvent: null }, { type: 'FINAL', percentage: 40, daysBeforeEvent: 14 }];
    default: return [
      { type: 'DEPOSIT', percentage: 10, daysBeforeEvent: null },
      { type: 'MILESTONE', percentage: 40, daysBeforeEvent: 30 },
      { type: 'FINAL', percentage: 50, daysBeforeEvent: 14 },
    ];
  }
}

/** Split a total in cents; the last part absorbs rounding so parts always sum to the total. */
export function splitAmounts(totalCents: number, parts: SchedulePart[]): number[] {
  let used = 0;
  return parts.map((p, i) => {
    if (i === parts.length - 1) return totalCents - used;
    const a = Math.round(totalCents * p.percentage / 100); used += a; return a;
  });
}
