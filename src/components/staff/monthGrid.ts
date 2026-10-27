// Pure month-grid helpers. Works only with YYYY-MM-DD strings (no timezone math).

export interface MonthCell {
  date: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
export const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Parse "YYYY-MM" into { year, month (0-based) }. */
export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m - 1 };
}

export function monthKey(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  return monthKey(year, month + delta);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** First and last YYYY-MM-DD of a month. */
export function monthRange(key: string): { from: string; to: string } {
  const { year, month } = parseMonthKey(key);
  return { from: toKey(year, month, 1), to: toKey(year, month, daysInMonth(year, month)) };
}

/** 6 weeks x 7 days, Sunday start. */
export function buildMonthGrid(key: string): MonthCell[] {
  const { year, month } = parseMonthKey(key);
  const firstDow = new Date(year, month, 1).getDay();
  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - firstDow + i);
    cells.push({
      date: toKey(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    });
  }
  return cells;
}

export function groupByDate<T extends { event_date: string }>(events: T[]): Record<string, T[]> {
  return events.reduce((acc, e) => {
    (acc[e.event_date] ||= []).push(e);
    return acc;
  }, {} as Record<string, T[]>);
}
