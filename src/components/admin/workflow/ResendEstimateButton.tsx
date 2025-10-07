import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResendEstimateButtonProps {
  quoteId: string;
  invoiceId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ResendEstimateButton({ 
  quoteId, 
  invoiceId,
  variant = 'outline',
  size = 'default'
}: ResendEstimateButtonProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setSending(true);
    try {
      console.log('[Resend] Resending estimate email for quote:', quoteId);

      const { error } = await supabase.functions.invoke('send-customer-portal-email', {
        body: {
          quote_request_id: quoteId,
          type: 'estimate_ready'
        }
      });

      if (error) throw error;

      // Update invoice sent_at timestamp
      await supabase
        .from('invoices')
        .update({
          sent_at: new Date().toISOString(),
          workflow_status: 'sent',
          last_status_change: new Date().toISOString()
        })
        .eq('id', invoiceId);

      toast({
        title: "Estimate Resent",
        description: "Customer will receive the estimate email shortly.",
      });

      console.log('[Resend] Estimate email sent successfully');
    } catch (error: any) {
      console.error('[Resend] Failed to resend estimate:', error);
      toast({
        title: "Failed to Send",
        description: error.message || "Could not resend estimate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      onClick={handleResend}
      disabled={sending}
      variant={variant}
      size={size}
    >
      {sending ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Resend Estimate
        </>
      )}
    </Button>
  );
}
