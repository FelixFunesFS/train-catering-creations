import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentOptions {
  invoiceId: string;
  accessToken: string;
  paymentType: 'full' | 'deposit' | 'milestone' | 'custom';
  amount?: number;
  milestoneId?: string;
}

export function usePaymentCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const initiatePayment = async (options: PaymentOptions) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          invoice_id: options.invoiceId,
          access_token: options.accessToken,
          payment_type: options.paymentType === 'custom' ? 'milestone' : options.paymentType,
          amount: options.amount,
          milestone_id: options.milestoneId,
        },
      });

      if (error) {
        // Surface clearer messaging for known business-rule errors returned
        // by the edge function (e.g., deposit already paid).
        const ctx: any = (error as any)?.context;
        let parsedBody: any = null;
        try {
          if (ctx?.body && typeof ctx.body === 'string') parsedBody = JSON.parse(ctx.body);
          else if (ctx?.body) parsedBody = ctx.body;
          else if ((error as any)?.message && typeof (error as any).message === 'string') {
            // supabase-js sometimes embeds JSON in the message
            const match = (error as any).message.match(/\{.*\}/);
            if (match) parsedBody = JSON.parse(match[0]);
          }
        } catch { /* ignore parse failures */ }

        if (parsedBody?.code === 'DEPOSIT_SATISFIED' && parsedBody?.error) {
          toast({
            title: 'Already Paid',
            description: parsedBody.error,
          });
          return;
        }
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Payment initiation failed:', err);
      toast({
        title: 'Payment Error',
        description: err.message || 'Unable to start payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return { initiatePayment, isProcessing };
}
