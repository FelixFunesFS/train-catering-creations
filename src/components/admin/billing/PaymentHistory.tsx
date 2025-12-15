import { format } from 'date-fns';
import { usePaymentTransactions, useInvoice } from '@/hooks/useInvoices';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { History, CreditCard, DollarSign, Check, X, Clock, Wallet, Ban, AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PaymentDataService } from '@/services/PaymentDataService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    case 'voided':
      return <Ban className="h-4 w-4 text-muted-foreground" />;
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-amber-600" />;
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    succeeded: { label: 'Succeeded', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    voided: { label: 'Voided', className: 'bg-muted text-muted-foreground border-border' },
  };
  const v = variants[status] || { label: status, className: 'bg-muted text-muted-foreground border-border' };
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

export function PaymentHistory({ invoiceId, onClose }: PaymentHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: transactions, isLoading: isLoadingTransactions } = usePaymentTransactions(invoiceId);
  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(invoiceId);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [pendingVoidId, setPendingVoidId] = useState<string | null>(null);

  // Calculate payment summary - only count completed/succeeded transactions
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

  // Separate transactions by status
  const { activeTransactions, voidedTransactions, pendingTransactions } = useMemo(() => {
    if (!transactions) return { activeTransactions: [], voidedTransactions: [], pendingTransactions: [] };
    
    return {
      activeTransactions: transactions.filter(tx => tx.status === 'completed' || tx.status === 'succeeded'),
      voidedTransactions: transactions.filter(tx => tx.status === 'voided'),
      pendingTransactions: transactions.filter(tx => tx.status === 'pending'),
    };
  }, [transactions]);

  const handleVoidTransaction = async (transactionId: string) => {
    setPendingVoidId(transactionId);
    setShowVoidConfirm(true);
  };

  const confirmVoid = async () => {
    if (!pendingVoidId) return;
    
    setVoidingId(pendingVoidId);
    setShowVoidConfirm(false);
    
    try {
      await PaymentDataService.voidTransaction(pendingVoidId, 'Manually voided by admin');
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Transaction Voided',
        description: 'The pending transaction has been voided.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to void transaction',
        variant: 'destructive',
      });
    } finally {
      setVoidingId(null);
      setPendingVoidId(null);
    }
  };

  const isLoading = isLoadingTransactions || isLoadingInvoice;

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <div className="flex justify-between sm:block sm:text-center">
                  <p className="text-xs text-muted-foreground">Invoice Total</p>
                  <p className="font-semibold">{formatCurrency(summary.totalAmount)}</p>
                </div>
                <div className="flex justify-between sm:block sm:text-center">
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="font-semibold text-emerald-600">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <div className="flex justify-between sm:block sm:text-center">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className={`font-semibold ${summary.remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {formatCurrency(summary.remaining)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{summary.transactionCount} completed payment{summary.transactionCount !== 1 ? 's' : ''}</span>
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
              <div className="space-y-4">
                {/* Pending Transactions - Show with warning */}
                {pendingTransactions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      Pending Transactions
                    </div>
                    <div className="space-y-2">
                      {pendingTransactions.map((tx) => (
                        <div 
                          key={tx.id} 
                          className="flex items-start gap-4 p-4 border border-amber-200 bg-amber-50/50 rounded-lg"
                        >
                          <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                            <Clock className="h-4 w-4 text-amber-600" />
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
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {getStatusIcon(tx.status)}
                                <span>
                                  {format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVoidTransaction(tx.id)}
                                disabled={voidingId === tx.id}
                                className="h-7 text-xs"
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                {voidingId === tx.id ? 'Voiding...' : 'Void'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Transactions */}
                {activeTransactions.length > 0 && (
                  <div className="space-y-2">
                    {pendingTransactions.length > 0 && (
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <Check className="h-4 w-4" />
                        Completed Payments
                      </div>
                    )}
                    <div className="space-y-2">
                      {activeTransactions.map((tx) => (
                        <div 
                          key={tx.id} 
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0 p-2 bg-emerald-100 rounded-full">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
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
                  </div>
                )}

                {/* Voided Transactions - Collapsed by default */}
                {voidedTransactions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Ban className="h-4 w-4" />
                      Voided Transactions ({voidedTransactions.length})
                    </div>
                    <div className="space-y-2">
                      {voidedTransactions.map((tx) => (
                        <div 
                          key={tx.id} 
                          className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30 opacity-60"
                        >
                          <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                            <Ban className="h-4 w-4 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm line-through">
                                  {formatCurrency(tx.amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatPaymentMethod(tx.payment_method)}
                                </p>
                              </div>
                              {getStatusBadge(tx.status)}
                            </div>
                            
                            {tx.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-through">
                                {tx.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {getStatusIcon(tx.status)}
                              <span>
                                Voided {tx.processed_at 
                                  ? format(new Date(tx.processed_at), 'MMM d, yyyy')
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Dialog */}
      <AlertDialog open={showVoidConfirm} onOpenChange={setShowVoidConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void This Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the pending transaction as voided. This is typically used when a 
              Stripe checkout session was abandoned and payment was made through another method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingVoidId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVoid}>Void Transaction</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
