import { describe, it, expect } from 'vitest';
import { mapMilestoneReceipts, formatReceiptMethod } from '../../src/utils/paymentReceipt';

describe('mapMilestoneReceipts', () => {
  const ms = [{ amount_cents: 1000 }, { amount_cents: 4000 }, { amount_cents: 5000 }];

  it('deposit paid by card shows its payment date, later milestones unpaid', () => {
    const r = mapMilestoneReceipts(ms, [
      { amount: 1000, payment_method: 'card', processed_at: '2026-10-08T15:00:00Z' },
    ]);
    expect(r[0]).toEqual({ paidAt: '2026-10-08T15:00:00Z', method: 'Card' });
    expect(r[1]).toBeNull();
    expect(r[2]).toBeNull();
  });

  it('one full payment by check completes every milestone', () => {
    const r = mapMilestoneReceipts(ms, [
      { amount: 10000, payment_method: 'check', payment_type: 'manual', processed_at: '2026-10-01T00:00:00Z' },
    ]);
    expect(r.every((x) => x?.method === 'Check')).toBe(true);
  });

  it('milestone is dated by the payment that completed it', () => {
    const r = mapMilestoneReceipts(ms, [
      { amount: 3000, payment_method: 'card', processed_at: '2026-09-01T00:00:00Z' },
      { amount: 2000, payment_method: 'ach_debit', processed_at: '2026-09-20T00:00:00Z' },
    ]);
    expect(r[0]?.paidAt).toBe('2026-09-01T00:00:00Z');
    expect(r[1]).toEqual({ paidAt: '2026-09-20T00:00:00Z', method: 'ACH' });
  });

  it('labels ACH and WaveApp', () => {
    expect(formatReceiptMethod('us_bank_account')).toBe('ACH');
    expect(formatReceiptMethod('waveapp')).toBe('WaveApp');
  });
});
