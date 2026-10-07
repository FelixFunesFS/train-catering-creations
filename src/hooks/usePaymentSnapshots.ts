import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentTransactions } from '@/hooks/useInvoices';
import { calculateMilestoneBalances } from '@/utils/paymentFormatters';

export interface PaymentSnapshot {
  invoiceId: string;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  nextMilestone: { type: string; dueDate: string | null; remainingCents: number; isDueNow: boolean } | null;
  recentPayments: Array<{ id: string; amount: number; method: string | null; at: string }>;
}

/**
 * One shared query for every invoice's payment state (single source of truth:
 * invoice_payment_summary view + completed transactions). Used by event cards,
 * calendars and the event summary drawer so all screens show the same numbers.
 */
export function usePaymentSnapshots() {
  const { data: summaries } = useQuery({
    queryKey: ['invoices', 'payment-snapshots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_payment_summary')
        .select('invoice_id, total_amount, total_paid, balance_remaining, milestones');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60,
  });
  const { data: transactions } = usePaymentTransactions();

  return useMemo(() => {
    const map = new Map<string, PaymentSnapshot>();
    (summaries || []).forEach((s: any) => {
      if (!s.invoice_id) return;
      const total = s.total_amount ?? 0;
      const paid = s.total_paid ?? 0;
      const balance = s.balance_remaining ?? Math.max(0, total - paid);
      const ms = (Array.isArray(s.milestones) ? s.milestones : [])
        .map((m: any) => ({ ...m, amount_cents: m.amount_cents ?? 0 }))
        .sort((a: any, b: any) => (a.due_date || '').localeCompare(b.due_date || ''));
      const enriched = calculateMilestoneBalances(ms, paid);
      const next = enriched.find((m: any) => m.remainingCents > 0);
      map.set(s.invoice_id, {
        invoiceId: s.invoice_id,
        totalCents: total,
        paidCents: paid,
        balanceCents: balance,
        nextMilestone: next && balance > 0
          ? { type: next.milestone_type, dueDate: next.due_date ?? null, remainingCents: Math.min(next.remainingCents, balance), isDueNow: !!(next as any).is_due_now }
          : null,
        recentPayments: [],
      });
    });
    (transactions || []).forEach((t: any) => {
      if (!['completed', 'succeeded'].includes(t.status)) return;
      const snap = map.get(t.invoice_id);
      if (!snap) return;
      snap.recentPayments.push({ id: t.id, amount: t.amount, method: t.payment_method, at: t.processed_at || t.created_at });
    });
    map.forEach(s => s.recentPayments.sort((a, b) => b.at.localeCompare(a.at)));
    return map;
  }, [summaries, transactions]);
}
