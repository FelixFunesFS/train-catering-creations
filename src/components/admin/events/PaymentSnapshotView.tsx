import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { getMilestoneLabel } from '@/utils/paymentFormatters';
import type { PaymentSnapshot } from '@/hooks/usePaymentSnapshots';

const money = (c: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((c || 0) / 100);

const METHODS: Record<string, string> = {
  cash: 'Cash', check: 'Check', bank_transfer: 'Bank Transfer', ach_debit: 'ACH',
  credit_card: 'Card', stripe: 'Card', venmo: 'Venmo', zelle: 'Zelle', waveapp: 'WaveApp', other: 'Other',
};

function dueText(s: PaymentSnapshot) {
  const n = s.nextMilestone;
  if (!n) return null;
  const label = getMilestoneLabel(n.type as any) || n.type;
  if (n.isDueNow || !n.dueDate) return `${label}: ${money(n.remainingCents)} due now`;
  return `${label}: ${money(n.remainingCents)} due ${format(parseDateFromLocalString(n.dueDate), 'MMM d')}`;
}

function status(s: PaymentSnapshot) {
  if (s.totalCents > 0 && s.balanceCents <= 0) return { label: 'Paid in Full', cls: 'bg-success/10 text-success border-success/30' };
  if (s.paidCents > 0) return { label: 'Partially Paid', cls: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
  return { label: 'No Payments Yet', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
}

/** Compact 2-line summary for list cards and calendar tiles. */
export function PaymentSnapshotCompact({ snapshot }: { snapshot?: PaymentSnapshot }) {
  if (!snapshot) return null;
  const next = dueText(snapshot);
  const last = snapshot.recentPayments[0];
  return (
    <div className="text-xs space-y-0.5">
      <p>
        <span className="font-medium text-foreground">Paid {money(snapshot.paidCents)}</span>
        <span className="text-muted-foreground"> of {money(snapshot.totalCents)}</span>
        {snapshot.balanceCents > 0 && <span className="text-muted-foreground"> · {money(snapshot.balanceCents)} left</span>}
      </p>
      {next ? <p className="text-amber-700 dark:text-amber-400">Next — {next}</p>
        : snapshot.balanceCents <= 0 && snapshot.totalCents > 0 ? <p className="text-success">Paid in full</p> : null}
      {last && <p className="text-muted-foreground">Last: {money(last.amount)} on {format(new Date(last.at), 'MMM d, h:mm a')}</p>}
    </div>
  );
}

/** Full summary with progress bar + recent history for the event drawer. */
export function PaymentSnapshotFull({ snapshot }: { snapshot?: PaymentSnapshot }) {
  if (!snapshot) return null;
  const st = status(snapshot);
  const pct = snapshot.totalCents ? Math.min(100, Math.round((snapshot.paidCents / snapshot.totalCents) * 100)) : 0;
  const next = dueText(snapshot);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">Payments</h4>
        <Badge variant="outline" className={`text-xs ${st.cls}`}>{st.label}</Badge>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div><p className="text-[10px] uppercase text-muted-foreground">Total</p><p className="text-sm font-semibold">{money(snapshot.totalCents)}</p></div>
        <div><p className="text-[10px] uppercase text-muted-foreground">Paid</p><p className="text-sm font-semibold text-success">{money(snapshot.paidCents)}</p></div>
        <div><p className="text-[10px] uppercase text-muted-foreground">Balance</p><p className="text-sm font-semibold">{money(snapshot.balanceCents)}</p></div>
      </div>
      {next && <p className="text-sm rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 px-3 py-2">Next payment — {next}</p>}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Payment history</p>
        {snapshot.recentPayments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No payments yet</p>
        ) : (
          <ul className="space-y-1">
            {snapshot.recentPayments.slice(0, 5).map(p => (
              <li key={p.id} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{format(new Date(p.at), 'MMM d, yyyy h:mm a')} · {METHODS[p.method || ''] || p.method || 'Payment'}</span>
                <span className="font-medium">{money(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
