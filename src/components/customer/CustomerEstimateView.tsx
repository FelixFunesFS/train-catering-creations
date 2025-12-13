import { useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useEstimateAccess } from '@/hooks/useEstimateAccess';
import { EstimateLineItems } from './EstimateLineItems';
import { CustomerActions } from './CustomerActions';
import { ChangeRequestModal } from './ChangeRequestModal';
import { PaymentOptions } from './PaymentOptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Calendar, MapPin, Users, Clock, AlertCircle, FileText } from 'lucide-react';
import { formatDate, formatTime, formatServiceType, getStatusColor } from '@/utils/formatters';

export function CustomerEstimateView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const action = searchParams.get('action'); // 'approve' or 'changes'
  const { loading, estimateData, error, refetch } = useEstimateAccess(token);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [autoActionTriggered, setAutoActionTriggered] = useState(false);

  // Calculate payment progress - MUST be before any early returns
  const amountPaid = useMemo(() => {
    if (!estimateData?.milestones) return 0;
    return estimateData.milestones.reduce((sum: number, m: any) => 
      m.status === 'paid' ? sum + (m.amount_cents || 0) : sum, 0);
  }, [estimateData?.milestones]);

  // Handle action query params from email links
  useEffect(() => {
    if (!loading && estimateData && !autoActionTriggered) {
      if (action === 'changes') {
        setShowChangeModal(true);
        setAutoActionTriggered(true);
      }
      // 'approve' action is handled by CustomerActions component
    }
  }, [action, loading, estimateData, autoActionTriggered]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  if (error || !estimateData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Estimate</h2>
            <p className="text-muted-foreground mb-4">
              {error === 'invalid_token'
                ? 'This link is invalid or has expired. Please contact us for a new link.'
                : 'We encountered an error loading your estimate. Please try again.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Need help? Call us at{' '}
              <a href="tel:+18439700265" className="text-primary hover:underline">
                (843) 970-0265
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invoice, quote, lineItems, milestones } = estimateData;

  const showPaymentOptions = ['approved', 'partially_paid', 'payment_pending'].includes(invoice.workflow_status);

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Soul Train's Eatery</h1>
          <p className="text-muted-foreground">Your Custom Catering Estimate</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className={getStatusColor(invoice.workflow_status)} variant="secondary">
            <FileText className="h-3 w-3 mr-1" />
            {invoice.workflow_status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Event Details Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-foreground">{quote.event_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(quote.event_date)}
                  {quote.start_time && ` at ${formatTime(quote.start_time)}`}
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{quote.guest_count} Guests</p>
                  <p className="text-sm text-muted-foreground">
                    {formatServiceType(quote.service_type)}
                  </p>
                </div>
              </div>
            </div>

            {quote.location && (
              <div className="flex items-start gap-2 pt-2 border-t border-border">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-foreground">{quote.location}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Menu & Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <EstimateLineItems
              lineItems={lineItems}
              subtotal={invoice.subtotal}
              taxAmount={invoice.tax_amount || 0}
              total={invoice.total_amount}
            />
          </CardContent>
        </Card>

        {/* Payment Schedule Preview */}
        {milestones && milestones.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((milestone: any, index: number) => (
                  <div
                    key={milestone.id || index}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {milestone.milestone_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {milestone.percentage}% of total
                        {milestone.due_date && ` • Due ${formatDate(milestone.due_date)}`}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(milestone.amount_cents / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <CustomerActions
              invoiceId={invoice.id}
              customerEmail={quote.email}
              status={invoice.workflow_status}
              quoteRequestId={invoice.quote_request_id}
              onStatusChange={refetch}
              autoApprove={action === 'approve' && !autoActionTriggered}
            />
          </CardContent>
        </Card>

        {/* Payment Options - Show after approval */}
        {showPaymentOptions && (
          <PaymentOptions
            invoiceId={invoice.id}
            totalAmount={invoice.total_amount}
            amountPaid={amountPaid}
            milestones={milestones || []}
            customerEmail={quote.email}
          />
        )}

        {/* Change Request Modal (triggered by action=changes) */}
        <ChangeRequestModal
          open={showChangeModal}
          onOpenChange={setShowChangeModal}
          invoiceId={invoice.id}
          customerEmail={quote.email}
          onSuccess={() => {
            refetch();
            setShowChangeModal(false);
          }}
        />

        {/* Contact Footer */}
        <div className="text-center space-y-2 pt-4">
          <Separator />
          <p className="text-sm text-muted-foreground pt-4">
            Questions? Contact us at{' '}
            <a href="tel:+18439700265" className="text-primary hover:underline">
              (843) 970-0265
            </a>
            {' '}or{' '}
            <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline">
              soultrainseatery@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
