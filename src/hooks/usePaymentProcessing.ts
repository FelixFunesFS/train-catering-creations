import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePaymentProcessing(invoiceId: string) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPaymentIntent = async (amount: number, milestoneId?: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          invoice_id: invoiceId,
          amount,
          milestone_id: milestoneId
        }
      });

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      toast({
        title: 'Payment Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async (paymentData: {
    amount: number;
    payment_method: string;
    stripe_payment_intent_id?: string;
    milestone_id?: string;
  }) => {
    try {
      setLoading(true);

      const { data: invoice } = await supabase
        .from('invoices')
        .select('quote_request_id, total_amount')
        .eq('id', invoiceId)
        .single();

      if (!invoice) throw new Error('Invoice not found');

      const { data: quote } = await supabase
        .from('quote_requests')
        .select('email')
        .eq('id', invoice.quote_request_id)
        .single();

      // Create payment transaction
      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          invoice_id: invoiceId,
          amount: paymentData.amount,
          payment_type: paymentData.milestone_id ? 'milestone' : 'full',
          payment_method: paymentData.payment_method,
          stripe_payment_intent_id: paymentData.stripe_payment_intent_id,
          customer_email: quote?.email || '',
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (txError) throw txError;

      // Update milestone if applicable
      if (paymentData.milestone_id) {
        await supabase
          .from('payment_milestones')
          .update({ status: 'paid' })
          .eq('id', paymentData.milestone_id);
      }

      // Check if invoice is fully paid
      const { data: allTransactions } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('invoice_id', invoiceId)
        .eq('status', 'completed');

      const totalPaid = allTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      if (totalPaid >= invoice.total_amount) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            workflow_status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', invoiceId);

        await supabase
          .from('quote_requests')
          .update({ workflow_status: 'completed' })
          .eq('id', invoice.quote_request_id);
      }

      toast({
        title: 'Payment Recorded',
        description: 'Payment has been successfully processed.'
      });

      return transaction;
    } catch (err: any) {
      console.error('Error recording payment:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createPaymentIntent, recordPayment, loading };
}
