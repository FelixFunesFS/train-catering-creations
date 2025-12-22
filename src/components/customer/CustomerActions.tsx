import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChangeRequestModal } from './ChangeRequestModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, MessageSquare, Loader2 } from 'lucide-react';

interface CustomerActionsProps {
  invoiceId: string;
  customerEmail: string;
  status: string;
  quoteRequestId?: string;
  amountPaid?: number;
  onStatusChange?: () => void;
  autoApprove?: boolean;
}

export function CustomerActions({
  invoiceId,
  customerEmail,
  status,
  quoteRequestId,
  amountPaid = 0,
  onStatusChange,
  autoApprove = false,
}: CustomerActionsProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const { toast } = useToast();
  const autoApproveTriggered = useRef(false);

  // Determine if actions should be disabled based on status
  const isActionable = ['sent', 'viewed'].includes(status);
  const isAlreadyApproved = ['approved', 'paid', 'partially_paid', 'payment_pending'].includes(status);
  // Allow change requests until payment starts (even after approval)
  const canRequestChanges = ['sent', 'viewed', 'approved', 'payment_pending'].includes(status) && amountPaid === 0;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Update invoice status to approved and transition to invoice
      const { error } = await supabase
        .from('invoices')
        .update({
          workflow_status: 'approved',
          document_type: 'invoice', // Estimate becomes an invoice upon approval
          last_status_change: new Date().toISOString(),
          last_customer_interaction: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (error) throw error;

      // Generate payment milestones (BLOCKING - must succeed for payment options)
      const { data: milestoneData, error: milestoneError } = await supabase.functions.invoke('generate-payment-milestones', {
        body: { invoice_id: invoiceId }
      });

      if (milestoneError) {
        console.error('Failed to generate payment milestones:', milestoneError);
        toast({
          title: 'Payment Schedule Error',
          description: 'Unable to generate payment schedule. Please try again or contact us.',
          variant: 'destructive',
        });
        throw new Error('Milestone generation failed');
      }

      console.log('Payment milestones generated:', milestoneData);

      // Send approval confirmation email with payment link
      if (quoteRequestId) {
        const firstMilestone = milestoneData?.milestones?.[0];
        const { error: emailError } = await supabase.functions.invoke('send-customer-portal-email', {
          body: {
            quote_request_id: quoteRequestId,
            type: 'approval_confirmation',
            metadata: {
              first_milestone_amount: firstMilestone?.amount_cents,
              first_milestone_due: firstMilestone?.due_date
            }
          }
        });

        if (emailError) {
          console.error('Failed to send approval confirmation email:', emailError);
          // Non-blocking - don't fail approval if email fails
        }
      }

      // Send admin notification about customer approval
      await supabase.functions.invoke('send-admin-notification', {
        body: {
          invoiceId,
          notificationType: 'customer_approval',
          metadata: { customerEmail }
        }
      });

      toast({
        title: 'Estimate Approved!',
        description: 'Your payment options are now available below. Check your email for payment details.',
      });

      onStatusChange?.();
    } catch (error) {
      console.error('Failed to approve estimate:', error);
      toast({
        title: 'Approval Failed',
        description: 'Unable to approve. Please try again or contact us.',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  // Handle auto-approve from email link
  useEffect(() => {
    if (autoApprove && isActionable && !autoApproveTriggered.current) {
      autoApproveTriggered.current = true;
      handleApprove();
    }
  }, [autoApprove, isActionable]);

  // Show approved state with optional change request button
  if (isAlreadyApproved) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 py-4 px-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            {amountPaid > 0 ? 'Invoice Confirmed' : 'Estimate Approved'}
          </span>
        </div>
        
        {/* Allow change requests until payment starts */}
        {canRequestChanges && (
          <Button
            variant="outline"
            onClick={() => setShowChangeModal(true)}
            size="lg"
            className="w-full"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Request Changes
          </Button>
        )}
        
        <ChangeRequestModal
          open={showChangeModal}
          onOpenChange={setShowChangeModal}
          invoiceId={invoiceId}
          customerEmail={customerEmail}
          onSuccess={onStatusChange}
        />
      </div>
    );
  }

  if (!isActionable) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          size="lg"
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {isApproving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Approve Estimate
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowChangeModal(true)}
          size="lg"
          className="flex-1"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Request Changes
        </Button>
      </div>

      <ChangeRequestModal
        open={showChangeModal}
        onOpenChange={setShowChangeModal}
        invoiceId={invoiceId}
        customerEmail={customerEmail}
        onSuccess={onStatusChange}
      />
    </>
  );
}
