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

const isPastDate = (d?: string | null) => {
  if (!d) return false;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return parseDateFromLocalString(d) < t;
};

function dueText(s: PaymentSnapshot, eventDate?: string | null) {
  const n = s.nextMilestone;
  if (!n) return null;
  // After the event, or a $0-paid event within 14 days, the whole balance is what's owed — never "deposit".
  if (isPastDate(eventDate)) {
    const kind = s.paidCents > 0 ? 'Remaining balance' : 'Full balance';
    if (n.dueDate && !isPastDate(n.dueDate)) return `${kind}: ${money(s.balanceCents)} — agreed due ${format(parseDateFromLocalString(n.dueDate), 'MMM d')}`;
    return `${kind}: ${money(s.balanceCents)} due`;
  }
  if (eventDate && s.paidCents === 0) {
    const days = Math.round((parseDateFromLocalString(eventDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (days <= 14 && (n.isDueNow || !n.dueDate || isPastDate(n.dueDate))) return `Full payment: ${money(s.balanceCents)} due now`;
  }
  const label = getMilestoneLabel(n.type as any) || n.type;
  if (n.isDueNow || !n.dueDate) return `${label}: ${money(n.remainingCents)} due now`;
  return `${label}: ${money(n.remainingCents)} due ${format(parseDateFromLocalString(n.dueDate), 'MMM d')}`;
}

function status(s: PaymentSnapshot) {
  if (s.totalCents > 0 && s.balanceCents <= 0) return { label: 'Paid in Full', cls: 'bg-success/10 text-success border-success/30' };
  if (s.paidCents > 0) return { label: 'Partially Paid', cls: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
  return { label: 'No Payments Yet', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
}

const PAYMENT_ACTIVE = ['approved', 'payment_pending', 'partially_paid', 'awaiting_payment', 'overdue'];

export interface OverdueInfo { since: string; days: number; amountCents: number }

/**
 * Overdue only for approved/payment-active invoices with a balance, when the next
 * milestone due date OR the event date has passed. Unapproved quotes never count.
 */
export function getOverdueInfo(
  snapshot: PaymentSnapshot | undefined,
  invoiceStatus: string | null | undefined,
  eventDate: string | null | undefined,
): OverdueInfo | null {
  if (!snapshot || !invoiceStatus || !PAYMENT_ACTIVE.includes(invoiceStatus)) return null;
  if (snapshot.balanceCents <= 0) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const past: Date[] = [];
  const due = snapshot.nextMilestone?.dueDate;
  // An agreed future due date (set by admin) is a grace period: not overdue, even after the event.
  if (due && parseDateFromLocalString(due) >= today) return null;
  if (due) { const d = parseDateFromLocalString(due); if (d < today) past.push(d); }
  if (eventDate) { const d = parseDateFromLocalString(eventDate); if (d < today) past.push(d); }
  if (past.length === 0) return null;
  const since = past.sort((a, b) => a.getTime() - b.getTime())[0];
  const days = Math.max(1, Math.round((today.getTime() - since.getTime()) / 86400000));
  return { since: format(since, 'yyyy-MM-dd'), days, amountCents: snapshot.balanceCents };
}

export function OverdueBadge({ className = '' }: { className?: string }) {
  return (
    <Badge variant="outline" className={`border-destructive/40 bg-destructive/10 text-destructive ${className}`}>
      Payment Overdue
    </Badge>
  );
}

const overdueText = (o: OverdueInfo, paidCents = 0) =>
  `${paidCents > 0 ? 'Remaining balance' : 'Full balance'} past due: ${money(o.amountCents)} since ${format(parseDateFromLocalString(o.since), 'MMM d')} (${o.days} day${o.days === 1 ? '' : 's'})`;

/** Compact 2-line summary for list cards and calendar tiles. */
export function PaymentSnapshotCompact({ snapshot, overdue, eventDate, invoiceStatus }: { snapshot?: PaymentSnapshot; overdue?: OverdueInfo | null; eventDate?: string | null; invoiceStatus?: string | null }) {
  if (!snapshot) return null;
  if (invoiceStatus && ['draft', 'pending_review', 'sent', 'viewed'].includes(invoiceStatus) && snapshot.paidCents === 0) {
    return <p className="text-xs text-muted-foreground">Estimate {money(snapshot.totalCents)} · awaiting approval</p>;
  }
  const next = dueText(snapshot, eventDate);
  const last = snapshot.recentPayments[0];
  return (
    <div className="text-xs space-y-0.5">
      <p>
        <span className="font-medium text-foreground">Paid {money(snapshot.paidCents)}</span>
        <span className="text-muted-foreground"> of {money(snapshot.totalCents)}</span>
        {snapshot.balanceCents > 0 && <span className="text-muted-foreground"> · {money(snapshot.balanceCents)} left</span>}
      </p>
      {overdue ? <p className="font-medium text-destructive">{overdueText(overdue, snapshot.paidCents)}</p>
        : next ? <p className="text-amber-700 dark:text-amber-400">Next — {next}</p>
        : snapshot.balanceCents <= 0 && snapshot.totalCents > 0 ? <p className="text-success">Paid in full</p> : null}
      {last && <p className="text-muted-foreground">Last: {money(last.amount)} on {format(new Date(last.at), 'MMM d, h:mm a')}</p>}
    </div>
  );
}

/** Full summary with progress bar + recent history for the event drawer. */
export function PaymentSnapshotFull({ snapshot, overdue, eventDate }: { snapshot?: PaymentSnapshot; overdue?: OverdueInfo | null; eventDate?: string | null }) {
  if (!snapshot) return null;
  const st = overdue ? { label: 'Payment Overdue', cls: 'bg-destructive/10 text-destructive border-destructive/40' } : status(snapshot);
  const pct = snapshot.totalCents ? Math.min(100, Math.round((snapshot.paidCents / snapshot.totalCents) * 100)) : 0;
  const next = overdue ? null : dueText(snapshot, eventDate);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">Payments</h4>
        <Badge variant="outline" className={`text-xs ${st.cls}`}>{st.label}</Badge>
      </div>
      {overdue && (
        <p role="alert" className="text-sm rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 font-medium">
          {overdueText(overdue, snapshot.paidCents)}
        </p>
      )}
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
