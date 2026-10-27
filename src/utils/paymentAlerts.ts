export interface AlertTx {
  amount: number;
  status: string;
  created_at: string;
  processed_at?: string | null;
}

const isPaid = (s: string) => s === 'completed' || s === 'succeeded';

/** Cents paid above the invoice total (0 when not overpaid). */
export function getOverpaymentCents(txs: AlertTx[], invoiceTotal: number | null | undefined): number {
  const total = invoiceTotal ?? 0;
  if (total <= 0) return 0;
  const paid = txs.filter(t => isPaid(t.status)).reduce((s, t) => s + (t.amount ?? 0), 0);
  return Math.max(0, paid - total);
}

/** True when two successful payments landed within 72 hours of each other. */
export function hasPossibleDuplicatePayment(txs: AlertTx[]): boolean {
  const times = txs
    .filter(t => isPaid(t.status))
    .map(t => new Date(t.processed_at || t.created_at).getTime())
    .sort((a, b) => a - b);
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] <= 72 * 3600 * 1000) return true;
  }
  return false;
}
