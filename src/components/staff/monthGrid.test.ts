// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, it, expect } from 'bun:test';
import { buildMonthGrid, monthRange, shiftMonth, groupByDate } from './monthGrid';

describe('monthGrid', () => {
  it('starts grid on Sunday and has 42 cells', () => {
    const g = buildMonthGrid('2026-10'); // Oct 1 2026 is a Thursday
    expect(g.length).toBe(42);
    expect(g[0].date).toBe('2026-09-27');
    expect(g[4].date).toBe('2026-10-01');
    expect(g[4].inMonth).toBe(true);
  });

  it('handles leap-year February range', () => {
    expect(monthRange('2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
    expect(monthRange('2026-02').to).toBe('2026-02-28');
  });

  it('shifts across year boundaries', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });

  it('groups events by date', () => {
    const g = groupByDate([{ event_date: '2026-10-03' }, { event_date: '2026-10-03' }, { event_date: '2026-10-04' }]);
    expect(g['2026-10-03'].length).toBe(2);
  });
});
