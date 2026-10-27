// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, it, expect } from 'bun:test';
import { buildRunOfShow, getCurrentStepIndex } from './runOfShow';

const base: any = {
  start_time: '17:00',
  serving_start_time: '18:00',
  cocktail_hour: false,
  bussing_tables_needed: false,
  both_proteins_available: false,
  proteins: [],
  guest_count: 100,
  staff_assignments: [
    { id: '1', staff_name: 'Tanya', role: 'Chef', arrival_time: '14:30:00', confirmed: true, notes: null },
    { id: '2', staff_name: 'Felix', role: 'Server', arrival_time: '15:00', confirmed: true, notes: null },
  ],
};

describe('buildRunOfShow', () => {
  it('orders arrivals, start, serving, then breakdown', () => {
    expect(buildRunOfShow(base).map((s) => s.time)).toEqual(['14:30', '15:00', '17:00', '18:00', null]);
  });
  it('skips a separate start step when start equals serving time', () => {
    const steps = buildRunOfShow({ ...base, serving_start_time: '17:00' });
    expect(steps.filter((s) => s.kind === 'start')).toHaveLength(0);
  });
});

describe('getCurrentStepIndex', () => {
  it('marks the latest step whose time has passed on the event day', () => {
    expect(getCurrentStepIndex(buildRunOfShow(base), '17:30', true)).toBe(2);
  });
  it('returns -1 for events that are not today', () => {
    expect(getCurrentStepIndex(buildRunOfShow(base), '17:30', false)).toBe(-1);
  });
});
