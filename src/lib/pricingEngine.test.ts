// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, it, expect } from 'bun:test';
import { pricingLockState, adjustToToday, removeOutliers, applyFloors, windowStart, eventGroup, itemRange } from '../../supabase/functions/_shared/pricingEngine';

describe('pricing lock states', () => {
  it('new inquiry not sent and unpaid is open', () => {
    expect(pricingLockState({ workflowStatus: 'draft', sentAt: null, totalPaidCents: 0 })).toBe('open');
  });
  it('sent but unpaid is guarded', () => {
    expect(pricingLockState({ workflowStatus: 'sent', sentAt: '2026-11-01T00:00:00Z', totalPaidCents: 0 })).toBe('guarded');
  });
  it('unlock after send reopens it', () => {
    expect(pricingLockState({ workflowStatus: 'sent', sentAt: '2026-11-01T00:00:00Z', totalPaidCents: 0, lastUnlockAt: '2026-11-02T00:00:00Z' })).toBe('unlocked');
  });
  it('re-sending after an unlock locks it again', () => {
    expect(pricingLockState({ workflowStatus: 'sent', sentAt: '2026-11-03T00:00:00Z', totalPaidCents: 0, lastUnlockAt: '2026-11-02T00:00:00Z' })).toBe('guarded');
  });
  it('any payment freezes pricing even after unlock', () => {
    expect(pricingLockState({ workflowStatus: 'sent', sentAt: '2026-11-01T00:00:00Z', totalPaidCents: 100, lastUnlockAt: '2026-11-02T00:00:00Z' })).toBe('locked');
  });
});

describe('rolling window and price changes', () => {
  it('looks back 8 months from today', () => {
    expect(windowStart('2026-11-22', 8)).toBe('2026-03-22');
  });
  it('+$1/head after new year lifts older events only', () => {
    const adj = [{ effective_date: '2027-01-01', scope: 'all' as const, adjustment_type: 'flat' as const, amount: 100 }];
    expect(adjustToToday(1500, '2026-12-10', '2027-02-01', {}, adj)).toBe(1600);
    expect(adjustToToday(1500, '2027-01-15', '2027-02-01', {}, adj)).toBe(1500);
  });
  it('scheduled future change is not applied yet', () => {
    const adj = [{ effective_date: '2027-01-01', scope: 'all' as const, adjustment_type: 'flat' as const, amount: 100 }];
    expect(adjustToToday(1500, '2026-10-01', '2026-11-22', {}, adj)).toBe(1500);
  });
  it('category percent change only hits that category', () => {
    const adj = [{ effective_date: '2026-06-01', scope: 'category' as const, scope_value: 'sides', adjustment_type: 'percent' as const, amount: 10 }];
    expect(adjustToToday(400, '2026-05-01', '2026-11-22', { category: 'sides' }, adj)).toBe(440);
    expect(adjustToToday(400, '2026-05-01', '2026-11-22', { category: 'desserts' }, adj)).toBe(400);
  });
});

describe('clean data', () => {
  it('drops $0 items and typo outliers', () => {
    const s = [1500, 1450, 1550, 1600, 1500, 15000, 0].map((value) => ({ value, weight: 1 }));
    const r = removeOutliers(s);
    expect(r.excluded).toBe(2);
    expect(r.kept.every((k) => k.value < 2000)).toBe(true);
  });
  it('current menu price is the recommended starting point', () => {
    const s = [1400, 1450, 1500, 1550, 1600].map((value) => ({ value, weight: 1 }));
    expect(itemRange(s, 1700)!.mid).toBe(1700);
  });
  it('military events are grouped separately', () => {
    expect(eventGroup('graduation', '628 FSS')).toBe('military');
    expect(eventGroup('wedding')).toBe('formal');
  });
});

describe('minimums', () => {
  it('scales up to the catering minimum', () => {
    const out = applyFloors([{ quantity: 10, unit: 1000 }], 10, { per_head_cents: 0, minimum_order_cents: 50000 });
    expect(out[0]).toBe(5000);
  });
  it('leaves tiers above the floor alone', () => {
    expect(applyFloors([{ quantity: 100, unit: 2000 }], 100, { per_head_cents: 1500, minimum_order_cents: 50000 })[0]).toBe(2000);
  });
});
