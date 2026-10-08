import { getDocumentLabel } from '@/utils/documentLabel';
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
import { CustomerActions, DownloadPdfButton } from './CustomerActions';
import { ChangeRequestModal } from './ChangeRequestModal';
import { PaymentCard } from './PaymentCard';
import { CustomerDetailsSidebar } from './CustomerDetailsSidebar';
import { StandardTermsAndConditions } from '@/components/shared/StandardTermsAndConditions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Calendar, MapPin, Users, AlertCircle, FileText, ChevronDown, PenLine, MessageSquare, Info, Shield, CreditCard, HelpCircle } from 'lucide-react';
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
    const { amountPaid: paid } = calculatePaymentProgress(estimateData.milestones as Milestone[], estimateData.totalPaid);
    return paid;
  }, [estimateData?.milestones, estimateData?.totalPaid]);

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
  const paymentStatus = getPaymentStatus(invoice.workflow_status, nextMilestone?.milestone_type, nextMilestone?.due_date, (quote as any)?.event_date);

  // Shared header component
  const HeaderSection = () => (
    <div className="text-center space-y-2">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground text-balance leading-tight">
        Your {getDocumentLabel(invoice.workflow_status).title.replace(/\s*\(.*\)\s*$/, '')}
      </h1>
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
            totalPaidFromTransactions={estimateData.totalPaid}
            payments={estimateData.payments}
          />
        </div>
      )}

      {/* Line Items Card */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="pb-2 sm:pb-2">
          <CardTitle className="text-lg">Your Menu & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="sm:pt-0">
          {(quote as any)?.both_proteins_available && Array.isArray((quote as any)?.proteins) && (quote as any).proteins.length >= 2 && (
            <div className="mb-4 rounded-md border border-primary/40 bg-primary/5 p-3 text-sm font-semibold text-primary">
              ⭐ Both proteins served to all guests
            </div>
          )}
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
            totalPaidFromTransactions={estimateData.totalPaid}
            payments={estimateData.payments}
          />
        </div>
      )}

      {/* Customer Notes from Caterer */}
      {invoice.notes && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
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
      <Card className="border-border/60 shadow-sm">
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
            invoiceNumber={invoice.invoice_number}
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

  // Single support block (phone + email live here only)
  const HelpCard = () => (
    <Card className="border-border/60 bg-muted/30 shadow-sm">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Need Help?</span>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Call:{' '}
            <a href="tel:+18439700265" className="text-primary hover:underline">(843) 970-0265</a>
          </p>
          <p>
            Email:{' '}
            <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline break-all">soultrainseatery@gmail.com</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Branded red copyright & legal bar
  const FooterSection = () => (
    <footer className="bg-gradient-to-r from-primary to-primary-dark py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-center">
        <p>© {new Date().getFullYear()} Soul Train's Eatery. All rights reserved.</p>
        <nav className="flex items-center gap-3">
          <a href="/privacy-policy" className="hover:text-primary-foreground/80">Privacy Policy</a>
          <span className="text-primary-foreground/60">|</span>
          <a href="/terms-conditions" className="hover:text-primary-foreground/80">Terms & Conditions</a>
        </nav>
      </div>
    </footer>
  );

  // MOBILE LAYOUT (unchanged)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <div className="flex-1 w-full max-w-3xl mx-auto space-y-6 py-8 px-4">
          <HeaderSection />

          {/* Event & Contact Overview — same consolidated card as desktop */}
          <CustomerDetailsSidebar quote={quote} hideTermsAndHelp={true} />

          <MainContent />

          <ChangeModal />

          {/* Terms & Conditions */}
          <Collapsible>
            <Card className="border-border/60 shadow-sm">
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
                <CardContent className="pt-0 sm:pt-0">
                  <StandardTermsAndConditions 
                    eventType={quote.compliance_level === 'government' ? 'government' : 'standard'} 
                    variant="compact" 
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <HelpCard />
        </div>
        <FooterSection />
      </div>
    );
  }

  // DESKTOP / TABLET: document column + sticky action sidebar
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <div className="py-6 px-4 border-b bg-background">
        <HeaderSection />
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          {/* Left: sticky booking overview, payment, download, terms, help */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1 lg:-mr-1 overscroll-contain">
            <CustomerDetailsSidebar 
              quote={quote}
              invoiceId={invoice.id}
              customerEmail={quote.email}
              quoteRequestId={invoice.quote_request_id}
              amountPaid={amountPaid}
              onStatusChange={refetch}
              autoApprove={shouldAutoApprove}
              accessToken={token}
              invoiceNumber={invoice.invoice_number}
              hideTermsAndHelp={true}
            />
            <div id="payment">
              <PaymentCard
                invoiceId={invoice.id}
                totalAmount={invoice.total_amount}
                milestones={(milestones || []) as Milestone[]}
                workflowStatus={invoice.workflow_status}
                customerEmail={quote.email}
                accessToken={token}
                totalPaidFromTransactions={estimateData.totalPaid}
            payments={estimateData.payments}
              />
            </div>
            <DownloadPdfButton 
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoice_number}
              accessToken={token}
              status={invoice.workflow_status}
            />
              {/* Terms & Conditions */}
            <Collapsible defaultOpen={false}>
              <Card className="border-border/60 shadow-sm">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PenLine className="h-4 w-4 text-primary" />
                      Terms & Conditions
                    </CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 sm:pt-0">
                    <StandardTermsAndConditions 
                      eventType={quote.compliance_level === 'government' ? 'government' : 'standard'} 
                      variant="compact" 
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
            <HelpCard />
          </aside>

          {/* Right: menu & pricing showcase */}
          <div className="space-y-6 min-w-0">
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
              accessToken={token}
              invoiceNumber={invoice.invoice_number}
            />
          </div>
        </div>
      </div>

      <ChangeModal />
      <FooterSection />
    </div>
  );
}
