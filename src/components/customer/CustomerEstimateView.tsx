/**
 * SYNC: Customer Portal Estimate View
 * 
 * This file displays the customer-facing estimate in the portal.
 * Keep in sync with:
 * - supabase/functions/send-customer-portal-email/index.ts (estimate & approval emails)
 * - supabase/functions/generate-invoice-pdf/index.ts (PDF generation)
 * - supabase/functions/_shared/emailTemplates.ts (shared email components)
 * 
 * See CUSTOMER_DISPLAY_CHECKLIST.md for full sync requirements.
 */

import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useEstimateAccess } from '@/hooks/useEstimateAccess';
import { useIsMobile } from '@/hooks/use-mobile';
import { EstimateLineItems } from './EstimateLineItems';
import { MenuActionsPanel } from './MenuActionsPanel';
import { CustomerActions } from './CustomerActions';
import { ChangeRequestModal } from './ChangeRequestModal';
import { PaymentCard } from './PaymentCard';
import { CustomerContactCard } from './CustomerContactCard';
import { CustomerDetailsSidebar } from './CustomerDetailsSidebar';
import { StandardTermsAndConditions } from '@/components/shared/StandardTermsAndConditions';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Calendar, MapPin, Users, AlertCircle, FileText, ChevronDown, PenLine, MessageSquare, Info, Shield, CreditCard } from 'lucide-react';
import { formatDate, formatTime, formatServiceType } from '@/utils/formatters';
import { calculatePaymentProgress, type Milestone } from '@/utils/paymentFormatters';
import { isMilitaryEvent } from '@/utils/eventTypeUtils';
import { getEstimateStatus, getPaymentStatus, getNextUnpaidMilestone } from '@/utils/statusHelpers';

export function CustomerEstimateView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const action = searchParams.get('action');
  const { loading, estimateData, error, refetch } = useEstimateAccess(token);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [autoActionTriggered, setAutoActionTriggered] = useState(false);
  const [shouldAutoApprove, setShouldAutoApprove] = useState(false);
  const isMobile = useIsMobile();

  // Prevent mobile "action=approve" links from re-triggering in reload/remount scenarios
  const autoApproveLockKey = useMemo(() => {
    if (!token) return null;
    return `st_portal_autoapprove:${token}`;
  }, [token]);

  // Calculate payment progress - MUST be before any early returns
  const amountPaid = useMemo(() => {
    if (!estimateData?.milestones) return 0;
    const { amountPaid: paid } = calculatePaymentProgress(estimateData.milestones as Milestone[]);
    return paid;
  }, [estimateData?.milestones]);

  // Handle action query params from email links
  useEffect(() => {
    if (!loading && estimateData && !autoActionTriggered) {
      if (action === 'changes') {
        setShowChangeModal(true);
        setAutoActionTriggered(true);
      }

      if (action === 'approve' && token) {
        const alreadyRan = autoApproveLockKey ? sessionStorage.getItem(autoApproveLockKey) === '1' : false;
        if (!alreadyRan) {
          if (autoApproveLockKey) sessionStorage.setItem(autoApproveLockKey, '1');
          try {
            window.history.replaceState({}, '', `/estimate?token=${encodeURIComponent(token)}`);
          } catch {
            // no-op
          }
          setShouldAutoApprove(true);
        }
        setAutoActionTriggered(true);
      }
    }
  }, [action, loading, estimateData, autoActionTriggered, token, autoApproveLockKey]);

  // Ensure auto-approve is a one-shot signal to CustomerActions
  useEffect(() => {
    if (!shouldAutoApprove) return;
    const t = window.setTimeout(() => setShouldAutoApprove(false), 0);
    return () => window.clearTimeout(t);
  }, [shouldAutoApprove]);

  // If we arrived from an approval flow, jump straight to payment.
  useEffect(() => {
    if (loading) return;
    if (!estimateData) return;
    if (window.location.hash !== '#payment') return;

    const el = document.getElementById('payment');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading, estimateData]);

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
  const showPaymentFirst = ['approved', 'paid', 'partially_paid', 'payment_pending'].includes(invoice.workflow_status);

  // Calculate status badges
  const estimateStatus = getEstimateStatus(invoice.workflow_status);
  const nextMilestone = getNextUnpaidMilestone(
    (milestones || []).map(m => ({
      milestone_type: (m as Milestone).milestone_type,
      status: (m as Milestone).status,
      due_date: (m as Milestone).due_date,
    }))
  );
  const paymentStatus = getPaymentStatus(invoice.workflow_status, nextMilestone?.milestone_type);

  // Shared header component
  const HeaderSection = () => (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold text-foreground">Soul Train's Eatery</h1>
      <p className="text-muted-foreground">Your Custom Catering Estimate</p>
      {/* Status Badges */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Badge variant="outline" className={`${estimateStatus.color} border`}>
          <FileText className="h-3 w-3 mr-1" />
          {estimateStatus.label}
        </Badge>
        {paymentStatus && paymentStatus.showBadge && (
          <Badge variant="outline" className={`${paymentStatus.color} border`}>
            <CreditCard className="h-3 w-3 mr-1" />
            {paymentStatus.label}
          </Badge>
        )}
      </div>
    </div>
  );

  // Main content panel (right side on desktop, full on mobile)
  const MainContent = () => (
    <div className="space-y-6">
      {/* Payment-first after approval */}
      {showPaymentFirst && (
        <div id="payment">
          <PaymentCard
            invoiceId={invoice.id}
            totalAmount={invoice.total_amount}
            milestones={(milestones || []) as Milestone[]}
            workflowStatus={invoice.workflow_status}
            customerEmail={quote.email}
            accessToken={token}
          />
        </div>
      )}

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

      {/* Schedule-first before approval */}
      {!showPaymentFirst && (
        <div id="payment">
          <PaymentCard
            invoiceId={invoice.id}
            totalAmount={invoice.total_amount}
            milestones={(milestones || []) as Milestone[]}
            workflowStatus={invoice.workflow_status}
            customerEmail={quote.email}
            accessToken={token}
          />
        </div>
      )}

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

      {/* Actions Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {['sent', 'viewed'].includes(invoice.workflow_status) && (
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                By approving this estimate, you agree to our <strong>Terms & Conditions</strong>.
              </p>
            </div>
          )}
          
          <CustomerActions
            invoiceId={invoice.id}
            customerEmail={quote.email}
            status={invoice.workflow_status}
            quoteRequestId={invoice.quote_request_id}
            amountPaid={amountPaid}
            onStatusChange={refetch}
            autoApprove={shouldAutoApprove}
            accessToken={token}
          />
        </CardContent>
      </Card>
    </div>
  );

  // Change Request Modal
  const ChangeModal = () => (
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
  );

  // Footer Section
  const FooterSection = () => (
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
      <p className="text-xs text-muted-foreground">
        Build: {new Date(__APP_BUILD_TIME__).toLocaleString()}
      </p>
    </div>
  );

  // MOBILE LAYOUT (unchanged)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <HeaderSection />

          {/* Customer Contact Card */}
          <CustomerContactCard
            contactName={quote.contact_name}
            email={quote.email}
            phone={quote.phone}
            guestCountWithRestrictions={quote.guest_count_with_restrictions}
          />

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

              {isMilitaryEvent(quote.event_type) && quote.military_organization && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Military Organization</p>
                    <p className="text-sm font-medium text-blue-700">{quote.military_organization}</p>
                  </div>
                </div>
              )}

              {quote.location && (
                <div className="flex items-start gap-2 pt-2 border-t border-border">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-foreground">{quote.location}</p>
                </div>
              )}

              {(quote.wait_staff_requested || quote.bussing_tables_needed || quote.ceremony_included || quote.cocktail_hour) && (
                <div className="pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground block mb-2">🍽️ Services Included:</span>
                  <div className="flex flex-wrap gap-2">
                    {quote.wait_staff_requested && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        👨‍🍳 Wait Staff
                      </Badge>
                    )}
                    {quote.bussing_tables_needed && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        🧹 Table Bussing
                      </Badge>
                    )}
                    {quote.ceremony_included && (
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        💒 Ceremony Catering
                      </Badge>
                    )}
                    {quote.cocktail_hour && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        🍸 Cocktail Hour
                      </Badge>
                    )}
                  </div>
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

          <MainContent />

          <ChangeModal />

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

          <FooterSection />
        </div>
      </div>
    );
  }

  // DESKTOP 3-COLUMN LAYOUT
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header - Full Width */}
      <div className="py-6 px-4 border-b bg-background">
        <HeaderSection />
      </div>

      {/* 3-Column Split Panel Content */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 h-[calc(100vh-10rem)]"
      >
        {/* Left Panel - Customer Details Sidebar (25%) - NOW WITH CTAs AT TOP */}
        <ResizablePanel 
          defaultSize={25} 
          minSize={22} 
          maxSize={30}
          className="bg-background"
        >
          <CustomerDetailsSidebar 
            quote={quote}
            invoiceId={invoice.id}
            customerEmail={quote.email}
            workflowStatus={invoice.workflow_status}
            quoteRequestId={invoice.quote_request_id}
            amountPaid={amountPaid}
            onStatusChange={refetch}
            autoApprove={shouldAutoApprove}
            accessToken={token}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel - Payment (35%) */}
        <ResizablePanel defaultSize={35} minSize={30} maxSize={40}>
          <ScrollArea className="h-full">
            <div className="p-6">
              <div id="payment">
                <PaymentCard
                  invoiceId={invoice.id}
                  totalAmount={invoice.total_amount}
                  milestones={(milestones || []) as Milestone[]}
                  workflowStatus={invoice.workflow_status}
                  customerEmail={quote.email}
                  accessToken={token}
                />
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Menu & Actions (40%) */}
        <ResizablePanel defaultSize={40} minSize={35}>
          <ScrollArea className="h-full">
            <div className="p-6">
              <MenuActionsPanel
                lineItems={lineItems}
                subtotal={invoice.subtotal}
                taxAmount={invoice.tax_amount || 0}
                total={invoice.total_amount}
                notes={invoice.notes}
                invoiceId={invoice.id}
                customerEmail={quote.email}
                workflowStatus={invoice.workflow_status}
                quoteRequestId={invoice.quote_request_id}
                amountPaid={amountPaid}
                onStatusChange={refetch}
                autoApprove={shouldAutoApprove}
              />
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ChangeModal />

      {/* Footer - Full Width */}
      <div className="py-4 px-4 border-t bg-background">
        <FooterSection />
      </div>
    </div>
  );
}
