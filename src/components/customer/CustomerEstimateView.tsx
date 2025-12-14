import { useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useEstimateAccess } from '@/hooks/useEstimateAccess';
import { EstimateLineItems } from './EstimateLineItems';
import { CustomerActions } from './CustomerActions';
import { ChangeRequestModal } from './ChangeRequestModal';
import { PaymentOptions } from './PaymentOptions';
import { StandardTermsAndConditions } from '@/components/shared/StandardTermsAndConditions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Calendar, MapPin, Users, Clock, AlertCircle, FileText, ChevronDown, PenLine, MessageSquare } from 'lucide-react';
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

            {quote.guest_count_with_restrictions && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-600">🥗</span>
                <span className="text-muted-foreground">Vegetarian Portions:</span>
                <span className="font-medium">{quote.guest_count_with_restrictions} guests</span>
              </div>
            )}

            {quote.vegetarian_entrees && Array.isArray(quote.vegetarian_entrees) && quote.vegetarian_entrees.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200 dark:border-green-800">
                <span className="text-green-600">🌱</span>
                <span className="text-muted-foreground">Vegetarian Entrées:</span>
                {quote.vegetarian_entrees.map((entree: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300">
                    {entree.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                ))}
              </div>
            )}

            {quote.special_requests && (
              <div className="pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">📝 Special Requests:</span>
                <p className="text-sm font-medium mt-1">{quote.special_requests}</p>
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

        {/* Customer Notes from Caterer */}
        {invoice.notes && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <MessageSquare className="h-4 w-4" />
                Notes from Soul Train's
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 dark:text-amber-300">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Terms & Conditions */}
        <Collapsible>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-primary" />
                  Terms & Conditions
                </CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <StandardTermsAndConditions 
                  eventType={quote.compliance_level === 'government' ? 'government' : 'standard'} 
                  variant="compact" 
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
