import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Download, ArrowLeft, Loader2, FileText, Calendar, CreditCard, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentDetails {
  payment_status: string;
  transaction_id: string;
  invoice_id: string;
  amount_total: number;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const invoiceId = searchParams.get('invoice_id');
  const paymentType = searchParams.get('type') || 'deposit';

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      // If no session_id, assume successful direct payment
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      setPaymentDetails(data);
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setError(error.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = () => {
    // Get token from session storage or URL param
    const token = sessionStorage.getItem('customerAccessToken') || new URLSearchParams(window.location.search).get('token');
    if (token) {
      navigate(`/estimate?token=${token}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error && sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentSuccessful = paymentDetails ? paymentDetails.payment_status === 'paid' : true;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentDetails && (
            <div className="text-center mb-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(paymentDetails.amount_total / 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="default">
                    {paymentDetails.payment_status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {paymentDetails.transaction_id}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Thank you! Your {paymentType === 'deposit' ? 'deposit' : 'payment'} has been processed successfully.
            </p>
            
            {paymentType === 'deposit' && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🎉 Your Event Date is Now Secured!
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll receive a service agreement via email within 24 hours for your digital signature.
                </p>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                What happens next?
              </h3>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                {paymentType === 'deposit' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Service agreement sent for signature</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Final details confirmation 1 week before event</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Remaining balance due 2 weeks prior to event</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Your event is fully paid and confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Final details confirmation 1 week before event</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Menu and guest count finalization</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our team is here to help with any questions about your event.
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Phone:</strong> (843) 970-0265</p>
                <p><strong>Email:</strong> soultrainseatery@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            {(paymentDetails?.invoice_id || invoiceId) && (
              <Button onClick={handleViewInvoice}>
                <FileText className="h-4 w-4 mr-2" />
                View Invoice
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              A confirmation email has been sent to your email address.
              If you have any questions, please contact Soul Train's Eatery at{' '}
              <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline">
                soultrainseatery@gmail.com
              </a>{' '}
              or{' '}
              <a href="tel:8439700265" className="text-primary hover:underline">
                (843) 970-0265
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}