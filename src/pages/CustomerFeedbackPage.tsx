import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEstimateAccess } from '@/hooks/useEstimateAccess';
import { FeedbackForm } from '@/components/customer/FeedbackForm';
import { ReviewRequest } from '@/components/customer/ReviewRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CustomerFeedbackPage() {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('token') || '';
  const [submitted, setSubmitted] = useState(false);

  const { loading, estimateData, error } = useEstimateAccess(accessToken);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !estimateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Unable to load feedback form. Please check your link.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invoice, quote } = estimateData;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Soul Train's Eatery</h1>
            <p className="text-muted-foreground mt-1">Charleston's Lowcountry Catering</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <CardTitle>Thank You!</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your feedback has been submitted successfully. We truly appreciate you taking the time to share your experience!
                </p>
              </CardContent>
            </Card>

            <ReviewRequest invoiceId={invoice.id} customerEmail={quote.email} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Soul Train's Eatery</h1>
          <p className="text-muted-foreground mt-1">Charleston's Lowcountry Catering</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <FeedbackForm
            invoiceId={invoice.id}
            customerEmail={quote.email}
            eventName={quote.event_name}
            onSuccess={() => setSubmitted(true)}
          />
        </div>
      </div>
    </div>
  );
}
