// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, it, expect } from 'bun:test';
import { getOverpaymentCents, hasPossibleDuplicatePayment } from './paymentAlerts';

const tx = (amount: number, status: string, at: string) => ({ amount, status, created_at: at });

describe('payment alerts', () => {
  it('flags overpayment when ACH and card both complete', () => {
    expect(getOverpaymentCents([tx(50000, 'completed', '2026-10-01'), tx(50000, 'completed', '2026-10-01')], 50000)).toBe(50000);
  });
  it('ignores voided/pending rows for overpayment', () => {
    expect(getOverpaymentCents([tx(50000, 'completed', '2026-10-01'), tx(50000, 'voided', '2026-10-01')], 50000)).toBe(0);
  });
  it('flags two successful payments within 72 hours', () => {
    expect(hasPossibleDuplicatePayment([tx(1, 'completed', '2026-10-01T00:00:00Z'), tx(1, 'completed', '2026-10-03T23:00:00Z')])).toBe(true);
  });
  it('does not flag payments more than 72 hours apart', () => {
    expect(hasPossibleDuplicatePayment([tx(1, 'completed', '2026-10-01T00:00:00Z'), tx(1, 'completed', '2026-10-05T00:00:00Z')])).toBe(false);
  });
});
