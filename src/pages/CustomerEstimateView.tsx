import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEstimateAccess } from '@/hooks/useEstimateAccess';
import { EstimateDetails } from '@/components/customer/EstimateDetails';
import { EstimateActions } from '@/components/customer/EstimateActions';
import { ChangeRequestForm } from '@/components/customer/ChangeRequestForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function CustomerEstimateView() {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('token') || '';
  const [showChangeForm, setShowChangeForm] = useState(false);

  const { loading, estimateData, error, refetch } = useEstimateAccess(accessToken);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your estimate...</p>
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
                {error || 'Unable to load estimate. Please check your link and try again.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invoice, quote, lineItems, milestones } = estimateData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Soul Train's Eatery</h1>
          <p className="text-muted-foreground mt-1">Charleston's Lowcountry Catering</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Estimate Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{quote.event_name}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Estimate for {quote.contact_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estimate #</p>
                  <p className="font-mono font-semibold">{invoice.invoice_number || invoice.id.slice(0, 8)}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Change Request Form or Estimate Details */}
          {showChangeForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowChangeForm(false)}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Estimate
              </Button>
              <ChangeRequestForm
                quote={quote}
                invoice={invoice}
                onRequestSubmitted={() => {
                  setShowChangeForm(false);
                  refetch();
                }}
              />
            </>
          ) : (
            <>
              <EstimateDetails
                invoice={invoice}
                quote={quote}
                lineItems={lineItems}
                milestones={milestones}
              />

              <EstimateActions
                invoiceId={invoice.id}
                customerEmail={quote.email}
                status={invoice.status}
                onChangeRequested={() => setShowChangeForm(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
