/**
 * Maps completed payments to schedule milestones so paid rows can show
 * "Paid <date> via <method>". Keep in sync with generate-invoice-pdf.
 */

export interface ReceiptTransaction {
  amount: number; // cents
  payment_method?: string | null;
  payment_type?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
  milestone_id?: string | null;
}

export interface ReceiptMilestone {
  id?: string;
  amount_cents: number;
  due_date?: string | null;
}

export interface MilestoneReceipt {
  paidAt: string; // ISO timestamp
  method: string; // display label
}

export function formatReceiptMethod(method?: string | null, type?: string | null): string {
  const m = (method || '').toLowerCase();
  const map: Record<string, string> = {
    card: 'Card', credit_card: 'Card', stripe: 'Card',
    ach: 'ACH', ach_debit: 'ACH', us_bank_account: 'ACH', bank_transfer: 'Bank Transfer',
    cash: 'Cash', check: 'Check', venmo: 'Venmo', zelle: 'Zelle', waveapp: 'WaveApp', other: 'Other',
  };
  if (map[m]) return map[m];
  if (!m && type && type !== 'manual') return 'Card';
  return m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Payment';
}

const txTime = (t: ReceiptTransaction) => t.processed_at || t.created_at || '';

/**
 * Waterfall: payments applied in chronological order to milestones in schedule
 * order. A milestone's receipt is the payment that completed it.
 * Explicit milestone_id links win when present.
 */
export function mapMilestoneReceipts(
  milestones: ReceiptMilestone[],
  transactions: ReceiptTransaction[],
): Array<MilestoneReceipt | null> {
  const txs = [...transactions]
    .filter((t) => (t.amount ?? 0) > 0)
    .sort((a, b) => txTime(a).localeCompare(txTime(b)));

  let cumulativeNeeded = 0;
  let cumulativePaid = 0;
  let txIndex = 0;
  let lastTx: ReceiptTransaction | null = null;

  return milestones.map((m) => {
    const linked = m.id ? txs.filter((t) => t.milestone_id === m.id) : [];
    cumulativeNeeded += m.amount_cents;
    while (cumulativePaid < cumulativeNeeded && txIndex < txs.length) {
      lastTx = txs[txIndex++];
      cumulativePaid += lastTx.amount;
    }
    const completedBy = cumulativePaid >= cumulativeNeeded ? lastTx : null;
    const source = linked.length ? linked[linked.length - 1] : completedBy;
    if (!source || !txTime(source)) return null;
    return {
      paidAt: txTime(source),
      method: formatReceiptMethod(source.payment_method, source.payment_type),
    };
  });
}
