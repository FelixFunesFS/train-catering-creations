import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, CreditCard, CheckCircle2, AlertCircle, Calendar, Clock, TrendingUp, Send } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentCollectionPanelProps {
  quote: any;
  invoice: any;
  isGovernmentContract: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function PaymentCollectionPanel({
  quote,
  invoice,
  isGovernmentContract,
  onBack,
  onContinue
}: PaymentCollectionPanelProps) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState('check');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, [invoice?.id]);

  const fetchPaymentData = async () => {
    if (!invoice?.id) return;

    try {
      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('due_date', { ascending: true });

      setMilestones(milestonesData || []);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('created_at', { ascending: false });

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  };

  const calculateTotalPaid = () => {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateAmountDue = () => {
    return invoice.total_amount - calculateTotalPaid();
  };

  const recordManualPayment = async () => {
    setLoading(true);
    try {
      const amountInCents = Math.round(parseFloat(manualAmount) * 100);

      const { error } = await supabase
        .from('payment_transactions')
        .insert({
          invoice_id: invoice.id,
          amount: amountInCents,
          payment_type: 'full',
          payment_method: manualMethod,
          status: 'completed',
          customer_email: quote.email,
          processed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Check if fully paid
      const newTotalPaid = calculateTotalPaid() + amountInCents;
      if (newTotalPaid >= invoice.total_amount) {
        await supabase
          .from('invoices')
          .update({
            workflow_status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', invoice.id);

        await supabase
          .from('quote_requests')
          .update({ workflow_status: 'confirmed' })
          .eq('id', quote.id);
      }

      toast({
        title: 'Payment Recorded',
        description: `Payment of $${manualAmount} recorded successfully`
      });

      setManualAmount('');
      fetchPaymentData();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record payment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPaymentLink = async (milestoneId?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-workflow-email', {
        body: {
          quoteId: quote.id,
          invoiceId: invoice.id,
          emailType: 'payment_request',
          milestoneId
        }
      });

      if (error) throw error;

      toast({
        title: 'Payment Link Sent',
        description: 'Customer has been emailed the payment link'
      });
    } catch (error: any) {
      console.error('Error sending payment link:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send payment link',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = calculateTotalPaid();
  const amountDue = calculateAmountDue();
  const isFullyPaid = amountDue <= 0;
  const paymentProgress = (totalPaid / invoice.total_amount) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Collection
            </div>
            {isFullyPaid ? (
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Fully Paid
              </Badge>
            ) : (
              <Badge variant="outline">
                <AlertCircle className="h-3 w-3 mr-1" />
                Payment Pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold">${(invoice.total_amount / 100).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">${(totalPaid / 100).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
              <p className="text-2xl font-bold text-amber-600">${(amountDue / 100).toFixed(2)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium">{paymentProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Payment Milestones - Enhanced */}
          {!isGovernmentContract && milestones.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Payment Milestones
                </h4>
                <Badge variant="outline">
                  {milestones.filter(m => m.status === 'completed').length} of {milestones.length} paid
                </Badge>
              </div>
              
              <div className="space-y-3">
                {milestones.map((milestone, index) => {
                  const isPaid = milestone.status === 'completed';
                  const isPending = milestone.status === 'pending';
                  const isOverdue = milestone.due_date && new Date(milestone.due_date) < new Date() && !isPaid;
                  
                  return (
                    <div key={milestone.id} className="relative">
                      <div className={`p-4 border-2 rounded-lg transition-all ${
                        isPaid 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                          : isOverdue
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {/* Milestone Header */}
                            <div className="flex items-center gap-2">
                              {isPaid ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : isOverdue ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-amber-600" />
                              )}
                              <p className="font-semibold">{milestone.description || `Payment ${index + 1}`}</p>
                              <Badge className={
                                isPaid 
                                  ? 'bg-green-500' 
                                  : isOverdue 
                                  ? 'bg-red-500' 
                                  : 'bg-amber-500'
                              }>
                                {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                              </Badge>
                            </div>
                            
                            {/* Milestone Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-bold text-lg">${(milestone.amount_cents / 100).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Due Date</p>
                                <p className="font-medium">
                                  {milestone.due_date ? format(new Date(milestone.due_date), 'MMM dd, yyyy') : 'Not set'}
                                </p>
                              </div>
                              {milestone.percentage && (
                                <div>
                                  <p className="text-muted-foreground">Percentage</p>
                                  <p className="font-medium">{milestone.percentage}% of total</p>
                                </div>
                              )}
                              {milestone.milestone_type && (
                                <div>
                                  <p className="text-muted-foreground">Type</p>
                                  <p className="font-medium capitalize">{milestone.milestone_type.replace('_', ' ')}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Payment Progress for this Milestone */}
                            {!isPaid && milestone.amount_cents > 0 && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Payment Progress</span>
                                  <span>$0 of ${(milestone.amount_cents / 100).toFixed(2)}</span>
                                </div>
                                <Progress value={0} className="h-1.5" />
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {!isPaid && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => sendPaymentLink(milestone.id)}
                                  disabled={loading}
                                  className="whitespace-nowrap"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Send Reminder
                                </Button>
                                {milestone.payment_link_sent_at && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    Sent: {format(new Date(milestone.payment_link_sent_at), 'MMM dd')}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Connection line to next milestone */}
                      {index < milestones.length - 1 && (
                        <div className="h-4 w-0.5 bg-border mx-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Government Contract Payment */}
          {isGovernmentContract && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Net-30 Payment Terms</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Invoice will be generated post-event with Net-30 payment terms
                  </p>
                  {quote.po_number && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      PO Number: <span className="font-mono">{quote.po_number}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Payment Recording */}
          {!isFullyPaid && !isGovernmentContract && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">Record Manual Payment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Method</label>
                  <Select value={manualMethod} onValueChange={setManualMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={recordManualPayment}
                disabled={!manualAmount || loading}
              >
                Record Payment
              </Button>
            </div>
          )}

          {/* Transaction History - Enhanced */}
          {transactions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Payment History</h4>
                <Badge variant="outline">
                  {transactions.filter(t => t.status === 'completed').length} completed
                </Badge>
              </div>
              
              <div className="space-y-2">
                {transactions.map((txn, index) => (
                  <div key={txn.id}>
                    <div className={`p-4 rounded-lg border transition-all ${
                      txn.status === 'completed' 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                        : 'bg-muted/30 border-border'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            txn.status === 'completed' 
                              ? 'bg-green-100 dark:bg-green-900' 
                              : 'bg-muted'
                          }`}>
                            <CreditCard className={`h-4 w-4 ${
                              txn.status === 'completed' 
                                ? 'text-green-600' 
                                : 'text-muted-foreground'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium capitalize">
                                {txn.payment_method?.replace('_', ' ') || 'Payment'}
                              </p>
                              <Badge
                                variant={txn.status === 'completed' ? 'default' : 'outline'}
                                className={txn.status === 'completed' ? 'bg-green-500' : ''}
                              >
                                {txn.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mt-2">
                              <div>
                                <p className="mb-0.5">Transaction Date</p>
                                <p className="font-medium text-foreground">
                                  {format(new Date(txn.created_at), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-xs">{format(new Date(txn.created_at), 'h:mm a')}</p>
                              </div>
                              {txn.processed_at && (
                                <div>
                                  <p className="mb-0.5">Processed</p>
                                  <p className="font-medium text-foreground">
                                    {format(new Date(txn.processed_at), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                              )}
                              {txn.payment_type && (
                                <div>
                                  <p className="mb-0.5">Payment Type</p>
                                  <p className="font-medium text-foreground capitalize">
                                    {txn.payment_type.replace('_', ' ')}
                                  </p>
                                </div>
                              )}
                              {txn.stripe_payment_intent_id && (
                                <div>
                                  <p className="mb-0.5">Stripe ID</p>
                                  <p className="font-mono text-xs text-foreground">
                                    {txn.stripe_payment_intent_id.slice(-8)}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {txn.description && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                {txn.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${(txn.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {index < transactions.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Payment Summary Stats */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
                  <p className="text-lg font-bold">{transactions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Completed</p>
                  <p className="text-lg font-bold text-green-600">
                    {transactions.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Collected</p>
                  <p className="text-lg font-bold">${(totalPaid / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            {!isGovernmentContract && !isFullyPaid && (
              <Button onClick={() => sendPaymentLink()} disabled={loading}>
                Send Payment Link to Customer
              </Button>
            )}
            {(isFullyPaid || isGovernmentContract) && (
              <Button onClick={onContinue}>
                Continue to Event Confirmation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
