import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Home, RefreshCw, HelpCircle, Phone, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FailureDetails {
  customerHeadline: string;
  customerExplanation: string;
  customerActions: string[];
  declineCode: string | null;
  zipMismatch: boolean;
}

export default function PaymentCanceled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');
  const token = searchParams.get('token');
  const paymentType = searchParams.get('type');

  const [details, setDetails] = useState<FailureDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(token && sessionId));

  useEffect(() => {
    let cancelled = false;
    async function fetchReason() {
      if (!token) return;
      try {
        const { data, error } = await supabase.functions.invoke('get-payment-failure-reason', {
          body: { session_id: sessionId, access_token: token },
        });
        if (cancelled) return;
        if (error) throw error;
        if (data) setDetails(data as FailureDetails);
      } catch (err) {
        console.error('[PaymentCanceled] Failed to fetch reason', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReason();
    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  const handleRetry = () => {
    if (token) {
      navigate(`/estimate?token=${token}`);
    } else {
      window.history.back();
    }
  };

  const headline = details?.customerHeadline ?? 'Payment was not completed';
  const explanation =
    details?.customerExplanation ??
    'No charge was made to your account. Your event booking is still pending payment.';
  const actions = details?.customerActions ?? [
    'Verify your card details and billing ZIP code.',
    'Try again, or use a different card.',
    "Need help? Call Soul Train's Eatery at (843) 970-0265.",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl text-orange-700 dark:text-orange-300">
            {loading ? 'Checking payment status...' : headline}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Alert className="border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20">
                <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-foreground">
                  <strong className="block mb-1">Good news: no charge was made.</strong>
                  {explanation}
                </AlertDescription>
              </Alert>

              {details?.zipMismatch && (
                <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <AlertDescription className="text-sm">
                    <strong>Heads up:</strong> the billing ZIP code entered did not match the one on file with the card issuer.
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/40 p-5 rounded-lg border border-border/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  What to do next
                </h3>
                <ol className="space-y-2.5 text-sm text-muted-foreground">
                  {actions.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Button onClick={handleRetry} size="lg" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {token ? 'Return to Estimate' : 'Try Payment Again'}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => (window.location.href = 'tel:+18439700265')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us: (843) 970-0265
                </Button>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Prefer email? We're happy to help.
                </p>
                <a
                  href="mailto:soultrainseatery@gmail.com"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  soultrainseatery@gmail.com
                </a>
                {paymentType && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Reference: {paymentType} payment attempt
                  </p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = '/')}
                  className="text-muted-foreground"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
