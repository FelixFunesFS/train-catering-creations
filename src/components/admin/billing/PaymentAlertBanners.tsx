import { AlertCircle, Clock } from 'lucide-react';
import { usePaymentTransactions } from '@/hooks/useInvoices';
import { getOverpaymentCents, hasPossibleDuplicatePayment } from '@/utils/paymentAlerts';

const fmt = (c: number) => (c / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** Admin-only payment warnings (overpaid / duplicate / online payment processing). Renders nothing when all clear. */
export function PaymentAlertBanners({ invoiceId, invoiceTotal }: { invoiceId?: string; invoiceTotal?: number | null }) {
  const { data: transactions } = usePaymentTransactions(invoiceId);
  const txs = (transactions || []) as any[];
  if (!invoiceId || txs.length === 0) return null;
  const over = getOverpaymentCents(txs, invoiceTotal);
  const dup = hasPossibleDuplicatePayment(txs);
  const processing = txs.filter(t => t.status === 'pending' && t.payment_method === 'stripe');
  if (!over && !dup && processing.length === 0) return null;

  return (
    <div className="space-y-2">
      {over > 0 && (
        <div className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">Overpaid by {fmt(over)}</p>
            <p className="text-muted-foreground">Refund the extra in Stripe or note it as a credit. Open Payment History for details.</p>
          </div>
        </div>
      )}
      {dup && over === 0 && (
        <div className="flex gap-2 rounded-md border border-accent bg-accent/30 p-3 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p><span className="font-semibold">Possible duplicate payment.</span> Two payments landed within 72 hours — confirm both were intended.</p>
        </div>
      )}
      {processing.length > 0 && (
        <div className="flex gap-2 rounded-md border border-accent bg-accent/30 p-3 text-sm">
          <Clock className="h-4 w-4 mt-0.5 shrink-0" />
          <p><span className="font-semibold">Online payment in progress:</span>{' '}
            {processing.map(t => `${fmt(t.amount)} started ${new Date(t.created_at).toLocaleDateString()}`).join(', ')}. Bank payments can take 3-5 business days.</p>
        </div>
      )}
    </div>
  );
}
