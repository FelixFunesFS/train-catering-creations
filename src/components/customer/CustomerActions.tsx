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
  onStatusChange?: () => void;
  autoApprove?: boolean;
}

export function CustomerActions({
  invoiceId,
  customerEmail,
  status,
  onStatusChange,
  autoApprove = false,
}: CustomerActionsProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const { toast } = useToast();
  const autoApproveTriggered = useRef(false);

  // Determine if actions should be disabled based on status
  const isActionable = ['sent', 'viewed'].includes(status);
  const isAlreadyApproved = ['approved', 'paid', 'partially_paid'].includes(status);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Update invoice status to approved
      const { error } = await supabase
        .from('invoices')
        .update({
          workflow_status: 'approved',
          last_status_change: new Date().toISOString(),
          last_customer_interaction: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (error) throw error;

      // Generate payment milestones
      const { error: milestoneError } = await supabase.functions.invoke('generate-payment-milestones', {
        body: { invoice_id: invoiceId }
      });

      if (milestoneError) {
        console.error('Failed to generate milestones:', milestoneError);
        // Non-blocking - don't fail approval if milestones fail
      }

      toast({
        title: 'Estimate Approved!',
        description: 'Your payment options are now available below.',
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

  if (isAlreadyApproved) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 px-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <CheckCircle className="h-5 w-5 text-emerald-600" />
        <span className="font-medium text-emerald-700 dark:text-emerald-400">
          Estimate Approved
        </span>
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
