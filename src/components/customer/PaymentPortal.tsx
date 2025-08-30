import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, CheckCircle, Clock, AlertTriangle, DollarSign, Calendar, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PaymentPortalProps {
  quote: any;
  invoice?: any;
}

export function PaymentPortal({ quote, invoice }: PaymentPortalProps) {
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    fetchPaymentTransactions();
  }, [invoice?.id]);

  const fetchPaymentTransactions = async () => {
    if (!invoice?.id) {
      setIsLoadingTransactions(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentTransactions(data || []);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const createPaymentSession = async (paymentType: 'deposit' | 'full' | 'remaining') => {
    setIsCreatingPayment(true);
    
    try {
      let amount = 0;
      
      switch (paymentType) {
        case 'deposit':
          amount = Math.round((invoice?.total_amount || quote.estimated_total) * 0.5); // 50% deposit
          break;
        case 'full':
          amount = invoice?.total_amount || quote.estimated_total;
          break;
        case 'remaining':
          const paidAmount = paymentTransactions
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
          amount = (invoice?.total_amount || quote.estimated_total) - paidAmount;
          break;
      }

      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          quote_id: quote.id,
          invoice_id: invoice?.id,
          amount: amount,
          payment_type: paymentType,
          customer_email: quote.email,
          description: `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment for ${quote.event_name}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open payment link in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Payment Link Created",
          description: "Redirecting you to secure payment page...",
        });
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalAmount = invoice?.total_amount || quote.estimated_total || 0;
  const paidAmount = paymentTransactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
  const remainingAmount = totalAmount - paidAmount;
  const paymentProgress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const canMakePayment = invoice?.status !== 'draft' && remainingAmount > 0;
  const depositAmount = Math.round(totalAmount * 0.5);
  const needsDeposit = paidAmount === 0 && totalAmount > 0;

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
              <div className="text-sm text-muted-foreground">Paid</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(remainingAmount)}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Progress</span>
              <span>{Math.round(paymentProgress)}% Complete</span>
            </div>
            <Progress value={paymentProgress} className="h-3" />
          </div>

          {/* Invoice Status */}
          {invoice && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Invoice #{invoice.invoice_number}</span>
              </div>
              <Badge variant={invoice.status === 'sent' ? 'default' : 'secondary'}>
                {invoice.status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Actions */}
      {canMakePayment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Make a Payment
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose your payment option below. All payments are processed securely through Stripe.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {needsDeposit && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Deposit Required</h4>
                <p className="text-sm text-blue-700 mb-3">
                  A 50% deposit is required to secure your booking.
                </p>
                <Button
                  onClick={() => createPaymentSession('deposit')}
                  disabled={isCreatingPayment}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Deposit ({formatCurrency(depositAmount)})
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {remainingAmount > 0 && remainingAmount < totalAmount && (
                <Card className="border-orange-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Pay Remaining Balance</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete your payment with the remaining balance.
                    </p>
                    <Button
                      onClick={() => createPaymentSession('remaining')}
                      disabled={isCreatingPayment}
                      variant="outline"
                      className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      Pay {formatCurrency(remainingAmount)}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {remainingAmount === totalAmount && (
                <Card className="border-green-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Pay in Full</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pay the complete amount now.
                    </p>
                    <Button
                      onClick={() => createPaymentSession('full')}
                      disabled={isCreatingPayment}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Pay {formatCurrency(totalAmount)}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading transactions...</p>
            </div>
          ) : paymentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payments have been made yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                      {getPaymentStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.payment_type} • {formatDate(transaction.created_at)}
                    </div>
                    {transaction.payment_method && (
                      <div className="text-xs text-muted-foreground">
                        {transaction.payment_method}
                      </div>
                    )}
                  </div>
                  {transaction.stripe_payment_intent_id && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Status Messages */}
      {!canMakePayment && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Payment Not Available</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {invoice?.status === 'draft' 
                ? 'Your invoice is still being prepared. Payment will be available once it\'s finalized.'
                : 'Payment is not currently available for this quote.'}
            </p>
          </CardContent>
        </Card>
      )}

      {paymentProgress === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800">Payment Complete!</h3>
              <p className="text-green-700">
                Thank you for your payment. We're excited to cater your event!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}