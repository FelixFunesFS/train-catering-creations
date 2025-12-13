import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentOptions {
  invoiceId: string;
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
          payment_type: options.paymentType === 'custom' ? 'milestone' : options.paymentType,
          amount: options.amount,
          milestone_id: options.milestoneId,
        },
      });

      if (error) throw error;

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
