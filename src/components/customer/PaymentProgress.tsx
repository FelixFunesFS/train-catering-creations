import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, DollarSign } from 'lucide-react';

interface PaymentProgressProps {
  totalAmount: number;
  amountPaid: number;
  milestones?: Array<{
    id: string;
    milestone_type: string;
    amount_cents: number;
    percentage: number;
    status: string | null;
    due_date: string | null;
  }>;
}

export function PaymentProgress({ totalAmount, amountPaid, milestones = [] }: PaymentProgressProps) {
  const progressPercent = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;
  const remaining = totalAmount - amountPaid;

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment Progress</span>
          <span className="font-medium text-foreground">{progressPercent}% Complete</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Paid: {formatCurrency(amountPaid)}</span>
          <span>Remaining: {formatCurrency(remaining)}</span>
        </div>
      </div>

      {/* Milestone Timeline */}
      {milestones.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-sm font-medium text-foreground">Payment Schedule</p>
          <div className="space-y-2">
            {milestones.map((milestone, index) => {
              const isPaid = milestone.status === 'paid';
              const isDue = milestone.status === 'pending' && 
                milestone.due_date && new Date(milestone.due_date) <= new Date();

              return (
                <div
                  key={milestone.id}
                  className={`flex items-center justify-between p-2 rounded-md text-sm ${
                    isPaid 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20' 
                      : isDue 
                        ? 'bg-amber-50 dark:bg-amber-950/20'
                        : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : isDue ? (
                      <Clock className="h-4 w-4 text-amber-600" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={isPaid ? 'text-emerald-700 dark:text-emerald-400' : ''}>
                      {milestone.milestone_type.replace('_', ' ')} ({milestone.percentage}%)
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(milestone.amount_cents)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
