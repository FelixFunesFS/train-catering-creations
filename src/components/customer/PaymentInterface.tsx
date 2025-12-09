import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2, CheckCircle2, DollarSign, Calendar, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentInterfaceProps {
  invoiceId: string;
  accessToken: string;
}

export function PaymentInterface({ invoiceId, accessToken }: PaymentInterfaceProps) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { createPaymentIntent, loading: processing } = usePaymentProcessing(invoiceId);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, [invoiceId]);

  const fetchPaymentData = async () => {
    try {
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('total_amount, workflow_status, due_date')
        .eq('id', invoiceId)
        .single();

      const { data: milestonesData } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('milestone_type');

      const { data: transactionsData } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      setInvoice(invoiceData);
      setMilestones(milestonesData || []);
      setTransactions(transactionsData || []);
    } catch (err: any) {
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (milestone: any) => {
    try {
      const paymentIntent = await createPaymentIntent(milestone.amount_cents, milestone.id);
      
      toast({
        title: 'Payment Processing',
        description: 'Redirecting to secure payment page...'
      });

      window.location.href = paymentIntent.checkout_url;
    } catch (err: any) {
      console.error('Payment error:', err);
    }
  };

  const handlePayFull = async () => {
    const pendingMilestones = milestones.filter(m => m.status === 'pending');
    const totalPending = pendingMilestones.reduce((sum, m) => sum + m.amount_cents, 0);
    
    if (pendingMilestones.length > 0) {
      // Create a single payment intent for the full remaining amount
      try {
        const paymentIntent = await createPaymentIntent(totalPending);
        window.location.href = paymentIntent.checkout_url;
      } catch (err) {
        console.error('Payment error:', err);
      }
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const totalAmount = invoice?.total_amount || 0;
  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
  const balanceRemaining = totalAmount - totalPaid;
  const paymentProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
  const pendingMilestones = milestones.filter(m => m.status === 'pending');
  const paidMilestones = milestones.filter(m => m.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Payment Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Payment Overview
          </CardTitle>
          <CardDescription>Track your payment progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium">{Math.round(paymentProgress)}%</span>
            </div>
            <Progress value={paymentProgress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">{formatCurrency(totalPaid)} paid</span>
              <span className="text-muted-foreground">{formatCurrency(totalAmount)} total</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground">Total Paid</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Balance Due</div>
              <div className="text-2xl font-bold">{formatCurrency(balanceRemaining)}</div>
            </div>
          </div>

          {/* Pay Full Amount Button */}
          {balanceRemaining > 0 && pendingMilestones.length > 1 && (
            <Button 
              onClick={handlePayFull} 
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Pay Full Balance ({formatCurrency(balanceRemaining)})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      {pendingMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Schedule
            </CardTitle>
            <CardDescription>Your upcoming payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingMilestones.map((milestone, index) => (
              <div 
                key={milestone.id} 
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  milestone.is_due_now ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{milestone.description}</span>
                    {milestone.is_due_now && (
                      <Badge variant="destructive" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Due Now
                      </Badge>
                    )}
                  </div>
                  {milestone.due_date && !milestone.is_due_now && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Due: {format(new Date(milestone.due_date), 'MMMM dd, yyyy')}
                    </div>
                  )}
                  {milestone.is_net30 && (
                    <div className="text-sm text-muted-foreground">
                      Net 30 - Due 30 days after event
                    </div>
                  )}
                  <div className="text-lg font-semibold mt-2">{formatCurrency(milestone.amount_cents)}</div>
                </div>
                <Button
                  onClick={() => handlePayment(milestone)}
                  disabled={processing}
                  size="lg"
                  variant={milestone.is_due_now ? 'default' : 'outline'}
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Pay Now
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Received</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.processed_at 
                          ? format(new Date(transaction.processed_at), 'MMMM dd, yyyy h:mm a')
                          : format(new Date(transaction.created_at), 'MMMM dd, yyyy h:mm a')
                        }
                      </p>
                      {transaction.payment_method && (
                        <p className="text-xs text-muted-foreground capitalize">
                          via {transaction.payment_method.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(transaction.amount)}</p>
                    {transaction.stripe_payment_intent_id && (
                      <p className="text-xs text-muted-foreground">
                        Ref: {transaction.stripe_payment_intent_id.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Milestones */}
      {paidMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paidMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="font-medium">{milestone.description}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(milestone.amount_cents)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Paid State */}
      {balanceRemaining <= 0 && totalPaid > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Payment Complete!</h3>
            <p className="text-muted-foreground">
              Thank you for your payment. Your event is confirmed!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}