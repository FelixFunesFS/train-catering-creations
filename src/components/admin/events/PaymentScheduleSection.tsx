import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AdjustDueDateDialog, type AdjustableMilestone } from './AdjustDueDateDialog';
import { RefreshCw, CalendarClock, CheckCircle2, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { usePaymentTransactions } from '@/hooks/useInvoices';
import { calculateMilestoneBalances, getMilestoneLabel } from '@/utils/paymentFormatters';

interface PaymentMilestone {
  id: string;
  invoice_id: string;
  milestone_type: string;
  percentage: number;
  amount_cents: number;
  due_date: string | null;
  is_due_now: boolean;
  is_net30: boolean;
  status: string;
  description: string | null;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  milestone_id?: string | null;
}

interface PaymentScheduleSectionProps {
  invoiceId: string | undefined;
  quoteId?: string | null;
  milestones: PaymentMilestone[];
  totalAmount: number;
  isGovernment: boolean;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onToggleGovernment: (checked: boolean) => void;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
};


const getScheduleTierLabel = (milestones: PaymentMilestone[], _isGovernment: boolean): string => {
  if (milestones.some(m => m.is_net30)) return 'NET 30';
  if (milestones.length === 1) return 'RUSH (100%)';
  if (milestones.length === 2) {
    const deposit = milestones.find(m => m.milestone_type === 'DEPOSIT');
    return deposit?.percentage === 60 ? 'SHORT (60/40)' : 'MID (60/40)';
  }
  if (milestones.length === 3) return 'STANDARD (10/40/50)';
  return 'CUSTOM';
};

const getMilestoneIcon = (status: string, isDue: boolean) => {
  if (status === 'paid') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (isDue) return <AlertCircle className="h-4 w-4 text-amber-600" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
};

export function PaymentScheduleSection({
  invoiceId,
  milestones,
  totalAmount,
  isGovernment,
  isRegenerating,
  onRegenerate,
  onToggleGovernment,
  quoteId,
}: PaymentScheduleSectionProps) {
  const [adjusting, setAdjusting] = useState<AdjustableMilestone | null>(null);
  // Fetch payment transactions for this invoice
  const { data: transactions = [] } = usePaymentTransactions(invoiceId);
  
  // Calculate payment summary
  const paymentSummary = useMemo(() => {
    const txList = (transactions || []) as unknown as PaymentTransaction[];
    const completedTransactions = txList.filter(
      t => t.status === 'completed'
    );
    const totalPaid = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDue = milestones.reduce((sum, m) => sum + m.amount_cents, 0);
    const balance = totalDue - totalPaid;
    const percentPaid = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    
    return { totalPaid, totalDue, balance, percentPaid, transactionCount: completedTransactions.length };
  }, [milestones, transactions]);

  // Calculate per-milestone remaining balances using waterfall
  const enrichedMilestones = useMemo(() => {
    return calculateMilestoneBalances(
      milestones.map(m => ({
        id: m.id,
        milestone_type: m.milestone_type,
        amount_cents: m.amount_cents,
        percentage: m.percentage,
        status: m.status,
        due_date: m.due_date,
        is_due_now: m.is_due_now,
      })),
      paymentSummary.totalPaid
    );
  }, [milestones, paymentSummary.totalPaid]);

  // Group transactions by milestone
  const transactionsByMilestone = useMemo(() => {
    const map = new Map<string, PaymentTransaction[]>();
    const txList = (transactions || []) as unknown as PaymentTransaction[];
    txList
      .filter(t => t.status === 'completed')
      .forEach(t => {
        if (t.milestone_id) {
          const existing = map.get(t.milestone_id) || [];
          map.set(t.milestone_id, [...existing, t]);
        }
      });
    return map;
  }, [transactions]);

  const tierLabel = getScheduleTierLabel(milestones, isGovernment);
  const isNet30 = milestones.some(m => m.is_net30);
  const [isSavingNet30, setIsSavingNet30] = useState(false);

  // Net 30 is a manual, admin-only choice (default off). Saves the choice, then rebuilds the schedule.
  const handleToggleNet30 = async (checked: boolean) => {
    if (!invoiceId) return;
    setIsSavingNet30(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ payment_schedule_type: checked ? 'net30' : 'standard' })
        .eq('id', invoiceId);
      if (error) throw error;
      onRegenerate();
    } finally {
      setIsSavingNet30(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header with Government Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Payment Schedule
        </h3>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {tierLabel}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating || !invoiceId}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Government Contract Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏛️</span>
          <div>
            <Label htmlFor="government-toggle" className="text-sm font-medium cursor-pointer">
              Government Contract
            </Label>
            <p className="text-xs text-muted-foreground">
              Tax exempt
            </p>
          </div>
        </div>
        <Switch
          id="government-toggle"
          checked={isGovernment}
          onCheckedChange={onToggleGovernment}
        />
      </div>

      {/* Net 30 Toggle - manual only, default off */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
        <div>
          <Label htmlFor="net30-toggle" className="text-sm font-medium cursor-pointer">
            Net 30 Payment Terms
          </Label>
          <p className="text-xs text-muted-foreground">
            100% due 30 days after the event. Off = standard schedule.
          </p>
        </div>
        <Switch
          id="net30-toggle"
          checked={isNet30}
          disabled={!invoiceId || isSavingNet30 || isRegenerating}
          onCheckedChange={handleToggleNet30}
        />
      </div>

      {/* Payment Progress */}
      {milestones.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-medium">
              {formatCurrency(paymentSummary.totalPaid)} of {formatCurrency(paymentSummary.totalDue)}
            </span>
          </div>
          <Progress 
            value={paymentSummary.percentPaid} 
            className="h-2"
          />
          {paymentSummary.balance > 0 && (
            <p className="text-xs text-muted-foreground">
              Balance due: {formatCurrency(paymentSummary.balance)}
            </p>
          )}
          {paymentSummary.balance <= 0 && paymentSummary.totalDue > 0 && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Fully paid
            </p>
          )}
        </div>
      )}

      <Separator />

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4 text-center">
          No payment schedule generated yet. Click Regenerate to create one.
        </p>
      ) : (
        <div className="space-y-3">
          {enrichedMilestones.map((milestone) => {
            const isPaid = milestone.status === 'paid';
            const isDue = milestone.status === 'pending' && 
              milestone.due_date && new Date(milestone.due_date) <= new Date();
            const milestoneTransactions = transactionsByMilestone.get(milestone.id) || [];
            const hasPartialPayment = !isPaid && milestone.appliedCents > 0;
            
            return (
              <div 
                key={milestone.id} 
                className={`p-3 rounded-lg border transition-colors ${
                  isPaid 
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                    : isDue 
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' 
                      : 'bg-card border-border'
                }`}
              >
                {/* Milestone Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMilestoneIcon(milestone.status, !!isDue)}
                    <span className="font-medium text-sm">
                      {getMilestoneLabel(milestone.milestone_type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({milestone.percentage}%)
                    </span>
                  </div>
                  <div className="text-right">
                    {hasPartialPayment ? (
                      <>
                        <span className="font-semibold">
                          {formatCurrency(milestone.remainingCents)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          of {formatCurrency(milestone.amount_cents)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">
                        {formatCurrency(milestone.amount_cents)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Milestone Details */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {milestones.find(m => m.id === milestone.id)?.description}
                  </span>
                  {isPaid ? (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      Paid
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {milestone.is_due_now ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs">Due Now</Badge>
                      ) : milestone.due_date ? (
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(milestone.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Upcoming</span>
                      )}
                      <Button type="button" size="sm" variant="ghost" className="h-9 px-2 gap-1 text-xs"
                        aria-label={`Change due date for ${getMilestoneLabel(milestone.milestone_type)}`}
                        onClick={() => setAdjusting({ id: milestone.id, milestone_type: milestone.milestone_type, due_date: milestone.due_date })}>
                        <CalendarClock className="h-4 w-4" /> <span className="hidden sm:inline">Change date</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Transactions for this milestone */}
                {milestoneTransactions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Payments received:</p>
                    {milestoneTransactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between text-xs">
                        <span className="text-green-600">
                          {formatCurrency(tx.amount)} via {tx.payment_method || 'Unknown'}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <AdjustDueDateDialog open={!!adjusting} onOpenChange={o => !o && setAdjusting(null)} milestone={adjusting} quoteId={quoteId} invoiceId={invoiceId} />
    </section>
  );
}
