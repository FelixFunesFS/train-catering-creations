import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChangeRequestModal } from './ChangeRequestModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, MessageSquare, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerActionsProps {
  invoiceId: string;
  customerEmail: string;
  status: string;
  quoteRequestId?: string;
  amountPaid?: number;
  onStatusChange?: () => void;
  autoApprove?: boolean;
  /** 'stacked' forces vertical layout for narrow containers like sidebars */
  layout?: 'auto' | 'stacked';
  /** Customer access token for secure edge function calls */
  accessToken?: string;
  /** Invoice number for PDF filename */
  invoiceNumber?: string;
}

/** Standalone PDF Download Button for center panel use */
export function DownloadPdfButton({ 
  invoiceId, 
  invoiceNumber, 
  accessToken 
}: {
  invoiceId: string;
  invoiceNumber?: string;
  accessToken?: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    if (!accessToken) {
      toast({
        title: 'Download Error',
        description: 'Missing access credentials. Please use the link from your email.',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoiceId, token: accessToken }
      });

      if (error) throw error;
      if (!data?.pdf_base64) throw new Error('No PDF generated');

      // Convert base64 to blob and trigger download
      const binaryString = atob(data.pdf_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${invoiceNumber || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'PDF Downloaded', description: 'Your estimate has been saved.' });
    } catch (err: any) {
      console.error('PDF download error:', err);
      toast({
        title: 'Download Failed',
        description: 'Unable to download PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDownloadPdf} 
      disabled={isDownloading} 
      className="w-full"
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isDownloading ? 'Generating...' : 'Download Estimate PDF'}
    </Button>
  );
}

export function CustomerActions({
  invoiceId,
  customerEmail,
  status,
  quoteRequestId,
  amountPaid = 0,
  onStatusChange,
  autoApprove = false,
  layout = 'auto',
  accessToken,
  invoiceNumber,
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
    if (!accessToken) {
      toast({
        title: 'Approval Error',
        description: 'Missing access credentials. Please use the link from your email.',
        variant: 'destructive',
      });
      return;
    }

    setIsApproving(true);
    try {
      // Use the edge function which has proper permissions (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('approve-estimate', {
        body: { token: accessToken }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Approval failed');

      toast({
        title: data?.alreadyApproved ? 'Already Approved' : 'Estimate Approved!',
        description: data?.alreadyApproved
          ? 'Your estimate was already approved.'
          : 'Your payment options are now available below.',
      });

      onStatusChange?.();
    } catch (error) {
      console.error('Failed to approve estimate:', error);
      toast({
        title: 'Approval Failed',
        description: 'Unable to approve. Please try again or contact us at (843) 970-0265.',
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
      // Small delay to ensure UI is ready
      setTimeout(() => handleApprove(), 100);
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

  const buttonSize = layout === 'stacked' ? 'default' : 'lg';

  return (
    <>
      <div className={cn(
        "flex gap-3",
        layout === 'stacked' ? "flex-col" : "flex-col sm:flex-row"
      )}>
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          size={buttonSize}
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
          size={buttonSize}
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
