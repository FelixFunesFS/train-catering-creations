import { format } from 'date-fns';
import { usePaymentTransactions, useInvoice } from '@/hooks/useInvoices';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { History, CreditCard, DollarSign, Check, X, Clock, Wallet } from 'lucide-react';
import { useMemo } from 'react';

interface PaymentHistoryProps {
  invoiceId?: string;
  onClose: () => void;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatPaymentMethod(method: string | null): string {
  const methods: Record<string, string> = {
    cash: 'Cash',
    check: 'Check',
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    venmo: 'Venmo',
    zelle: 'Zelle',
    stripe: 'Stripe',
    other: 'Other',
  };
  return methods[method || ''] || method || 'Unknown';
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
    case 'succeeded':
      return <Check className="h-4 w-4 text-emerald-600" />;
    case 'failed':
      return <X className="h-4 w-4 text-destructive" />;
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-amber-600" />;
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-700' },
    succeeded: { label: 'Succeeded', className: 'bg-emerald-500/10 text-emerald-700' },
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-700' },
    failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive' },
  };
  const v = variants[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

export function PaymentHistory({ invoiceId, onClose }: PaymentHistoryProps) {
  const { data: transactions, isLoading: isLoadingTransactions } = usePaymentTransactions(invoiceId);
  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(invoiceId);

  // Calculate payment summary
  const summary = useMemo(() => {
    if (!transactions || !invoice) return null;
    
    const completedTransactions = transactions.filter(tx => 
      tx.status === 'completed' || tx.status === 'succeeded'
    );
    const totalPaid = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalAmount = invoice.total_amount || 0;
    const remaining = Math.max(0, totalAmount - totalPaid);
    const percentPaid = totalAmount > 0 ? Math.min(100, (totalPaid / totalAmount) * 100) : 0;
    
    return { totalPaid, totalAmount, remaining, percentPaid, transactionCount: completedTransactions.length };
  }, [transactions, invoice]);

  const isLoading = isLoadingTransactions || isLoadingInvoice;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Payment History
            {invoice?.invoice_number && (
              <span className="text-sm font-normal text-muted-foreground">
                - {invoice.invoice_number}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Payment Summary Header */}
        {summary && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4 text-primary" />
              Payment Summary
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Invoice Total</p>
                <p className="font-semibold">{formatCurrency(summary.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="font-semibold text-emerald-600">{formatCurrency(summary.totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className={`font-semibold ${summary.remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {formatCurrency(summary.remaining)}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{summary.transactionCount} transaction{summary.transactionCount !== 1 ? 's' : ''}</span>
                <span>{Math.round(summary.percentPaid)}% paid</span>
              </div>
              <Progress value={summary.percentPaid} className="h-2" />
            </div>
          </div>
        )}

        <ScrollArea className="max-h-[50vh]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Transactions</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Payment transactions will appear here once recorded.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPaymentMethod(tx.payment_method)} • {tx.customer_email}
                        </p>
                      </div>
                      {getStatusBadge(tx.status)}
                    </div>
                    
                    {tx.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {tx.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      {getStatusIcon(tx.status)}
                      <span>
                        {tx.processed_at 
                          ? format(new Date(tx.processed_at), 'MMM d, yyyy h:mm a')
                          : format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
