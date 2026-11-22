// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, it, expect } from 'bun:test';
import { pricingLockState, adjustToToday, removeOutliers, applyFloors, windowStart, eventGroup, itemRange, matchingPriceHistory, currentPriceAnchor, expectedPriceMatches } from '../../supabase/functions/_shared/pricingEngine';

describe('pricing lock states', () => {
  it('resend re-locks without changing the original seven-day sent date', () => {
    const sentAt = '2026-11-01T00:00:00Z';
    expect(pricingLockState({ workflowStatus: 'sent', sentAt, pricingSentAt: '2026-11-03T00:00:00Z', lastUnlockAt: '2026-11-02T00:00:00Z', totalPaidCents: 0 })).toBe('guarded');
    expect(new Date(Date.parse(sentAt) + 7 * 86400000).toISOString()).toBe('2026-11-08T00:00:00.000Z');
  });
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
  it('clamps the eight-month window at month end', () => {
    expect(windowStart('2026-10-31', 8)).toBe('2026-02-28');
  });
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

describe('pricing matching safeguards', () => {
  it('rejects stale prices before apply and undo', () => {
    expect(expectedPriceMatches({ unit_price: 1800, quantity: 50 }, { expected_price: 1700, expected_quantity: 50 })).toBe(false);
    expect(expectedPriceMatches({ unit_price: 1800, quantity: 50 }, { expected_price: 1800, expected_quantity: 50 })).toBe(true);
  });
  it('rejects changed guest quantities and missing comparison values', () => {
    expect(expectedPriceMatches({ unit_price: 1800, quantity: 60 }, { expected_price: 1800, expected_quantity: 50 })).toBe(false);
    expect(expectedPriceMatches({ unit_price: 1800, quantity: 50 }, {})).toBe(false);
  });
  it('matches wedding package titles and retired package rule titles', () => {
    const rows = [{ title: 'Catering Package - Wedding', category: 'package' }, { title: 'Standard Entree Package', category: 'meal' }, { title: 'Catering Package - Event', category: 'package' }];
    expect(matchingPriceHistory({ title: 'Catering Package', category: 'package' }, rows)).toEqual(rows);
  });
  it('falls back to package category only when title history is absent', () => {
    const rows = [{ title: 'Custom Meal', category: 'package' }, { title: 'Salmon', category: 'protein' }];
    expect(matchingPriceHistory({ title: 'Catering Package', category: 'package' }, rows)).toEqual([rows[0]]);
    expect(matchingPriceHistory({ title: 'Catfish', category: 'protein' }, rows)).toEqual([]);
  });
  it('uses delivery-only legacy service anchor, not full-service pricing', () => {
    const rules = [{ item_name: 'Standard Entree Package', price_per_person: 1800, service_type: 'full-service' },
      { item_name: 'Standard Entree Package', price_per_person: 1400, service_type: 'drop-off' }];
    expect(currentPriceAnchor({ title: 'Catering Package', quantity: 100 }, rules, 'delivery-only')).toBe(1400);
    expect(currentPriceAnchor({ title: 'Catering Package', quantity: 100 }, rules, 'full-service')).toBe(1800);
  });
  it('does not apply per-head anchors to a lump-sum package', () => {
    expect(currentPriceAnchor({ title: 'Catering Package', quantity: 1 }, [{ item_name: 'Standard Entree Package', price_per_person: 1800 }])).toBeNull();
  });
  it('ambiguous duplicate pricing rules require manual review', () => {
    expect(currentPriceAnchor({ title: 'Catering Package', quantity: 100 }, [
      { item_name: 'Standard Entree Package', price_per_person: 1800 },
      { item_name: 'Standard Entree Package', price_per_person: 1900 },
    ])).toBeNull();
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
  it('counts unchanged line items toward the minimum without raising them', () => {
    expect(applyFloors([{ quantity: 10, unit: 1000 }], 10, { per_head_cents: 0, minimum_order_cents: 50000 }, 40000)).toEqual([1000]);
  });
  it('scales up to the catering minimum', () => {
    const out = applyFloors([{ quantity: 10, unit: 1000 }], 10, { per_head_cents: 0, minimum_order_cents: 50000 });
    expect(out[0]).toBe(5000);
  });
  it('leaves tiers above the floor alone', () => {
    expect(applyFloors([{ quantity: 100, unit: 2000 }], 100, { per_head_cents: 1500, minimum_order_cents: 50000 })[0]).toBe(2000);
  });
});

import { archetypePackageCents, deliveryZone, supplyPackageCents, FLAT_PACKAGE_MIN_CENTS } from '../../supabase/functions/_shared/pricingEngine';
describe('cold-start archetype pricing', () => {
  it('salmon full-service is $18 base + $5 seafood = $23', () => {
    expect(archetypePackageCents('full-service', ['lemon-honey-salmon', 'fettuccine-alfredo'], false)).toBe(2300);
  });
  it('drop-off chicken stays at $14', () => expect(archetypePackageCents('drop-off', ['fried-chicken'], false)).toBe(1400));
  it('brisket delivery-setup with both proteins is $16 + $3 + $3 = $22', () => {
    expect(archetypePackageCents('delivery-setup', ['hickory-beef-brisket', 'bbq-chicken'], true)).toBe(2200);
  });
  it('supply packages anchor at $25 / $65 / $150 and $2 entries fall under the floor', () => {
    expect([supplyPackageCents('delivery-only'), supplyPackageCents('delivery-setup'), supplyPackageCents('full-service')]).toEqual([2500, 6500, 15000]);
    expect(200 < FLAT_PACKAGE_MIN_CENTS).toBe(true);
  });
});
describe('delivery zones from North Charleston', () => {
  it('Goose Creek is zone 1 with no charge', () => expect(deliveryZone('Red Bank Club, Goose Creek Sc')).toMatchObject({ zone: 1, surchargeCents: 0 }));
  it('Summerville is zone 2, +$25', () => expect(deliveryZone('236 Apache Dr Summerville, SC')).toMatchObject({ zone: 2, surchargeCents: 2500 }));
  it('Mount Pleasant is zone 2 even when Charleston is named', () => expect(deliveryZone('Mount Pleasant, Charleston SC').zone).toBe(2));
  it('Kiawah is zone 3, +$50', () => expect(deliveryZone('Kiawah Island')).toMatchObject({ zone: 3, surchargeCents: 5000 }));
  it('Blythewood is zone 4 at $1.50/mi beyond 30 and needs review', () => {
    expect(deliveryZone('Blythewood, SC')).toMatchObject({ zone: 4, surchargeCents: 12750, needsReview: true });
  });
  it('unknown places need manual review', () => expect(deliveryZone('Tbd')).toMatchObject({ zone: null, needsReview: true }));
});
