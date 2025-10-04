import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentInterfaceProps {
  invoiceId: string;
  accessToken: string;
}

export function PaymentInterface({ invoiceId, accessToken }: PaymentInterfaceProps) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { createPaymentIntent, loading: processing } = usePaymentProcessing(invoiceId);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, [invoiceId]);

  const fetchPaymentData = async () => {
    try {
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
      
      // Redirect to Stripe checkout (simplified - in production use Stripe Elements)
      toast({
        title: 'Payment Processing',
        description: 'Redirecting to secure payment page...'
      });

      // In production, you would use Stripe Elements or redirect to checkout
      window.location.href = paymentIntent.checkout_url;
    } catch (err: any) {
      console.error('Payment error:', err);
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

  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingMilestones = milestones.filter(m => m.status === 'pending');
  const paidMilestones = milestones.filter(m => m.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Track your payment milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
              <span className="font-medium">Total Paid</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalPaid)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {pendingMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>Complete these payments to proceed with your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{milestone.description}</p>
                    {milestone.is_due_now && <Badge variant="destructive">Due Now</Badge>}
                  </div>
                  {milestone.due_date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Due: {format(new Date(milestone.due_date), 'MMMM dd, yyyy')}
                    </p>
                  )}
                  <p className="text-lg font-semibold mt-2">{formatCurrency(milestone.amount_cents)}</p>
                </div>
                <Button
                  onClick={() => handlePayment(milestone)}
                  disabled={processing}
                  size="lg"
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
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Payment Received</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.processed_at), 'MMMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paid Milestones */}
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
    </div>
  );
}
