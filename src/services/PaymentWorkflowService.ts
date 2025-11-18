import { supabase } from '@/integrations/supabase/client';
import { WorkflowStateManager } from './WorkflowStateManager';
import { toast } from '@/hooks/use-toast';

export class PaymentWorkflowService {
  /**
   * Check if all milestones for an invoice are paid
   */
  static async checkAndUpdateInvoicePaymentStatus(invoiceId: string): Promise<void> {
    try {
      // Get all milestones for the invoice
      const { data: milestones, error: milestonesError } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (milestonesError) throw milestonesError;

      if (!milestones || milestones.length === 0) return;

      // Check if all milestones are completed
      const allPaid = milestones.every(m => m.status === 'paid' || m.status === 'completed');
      const somePaid = milestones.some(m => m.status === 'paid' || m.status === 'completed');

      // Update invoice status based on payment progress
      if (allPaid) {
        await WorkflowStateManager.updateInvoiceStatus(
          invoiceId,
          'paid',
          'system',
          'All payment milestones completed'
        );

        // Also update the associated quote to 'paid'
        const { data: invoice } = await supabase
          .from('invoices')
          .select('quote_request_id')
          .eq('id', invoiceId)
          .single();

        if (invoice?.quote_request_id) {
          await WorkflowStateManager.updateQuoteStatus(
            invoice.quote_request_id,
            'paid',
            'system',
            'All payments received'
          );
        }
      } else if (somePaid) {
        await WorkflowStateManager.updateInvoiceStatus(
          invoiceId,
          'partially_paid',
          'system',
          'Some payment milestones completed'
        );
      }
    } catch (error) {
      console.error('Error checking invoice payment status:', error);
    }
  }

  /**
   * Record a payment and update milestone status
   */
  static async recordPayment(params: {
    invoiceId: string;
    milestoneId?: string;
    amount: number;
    paymentMethod: string;
    stripePaymentIntentId?: string;
    customerEmail: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Insert payment transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          invoice_id: params.invoiceId,
          amount: params.amount,
          payment_method: params.paymentMethod,
          stripe_payment_intent_id: params.stripePaymentIntentId,
          customer_email: params.customerEmail,
          status: 'completed',
          payment_type: params.milestoneId ? 'milestone' : 'full',
          processed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // If milestone payment, update milestone status
      if (params.milestoneId) {
        const { error: milestoneError } = await supabase
          .from('payment_milestones')
          .update({ status: 'paid' })
          .eq('id', params.milestoneId);

        if (milestoneError) throw milestoneError;
      }

      // Check if invoice is fully paid
      await this.checkAndUpdateInvoicePaymentStatus(params.invoiceId);

      toast({
        title: "Payment Recorded",
        description: "Payment has been successfully processed.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Stripe webhook for payment success
   */
  static async handleStripePaymentSuccess(
    stripePaymentIntentId: string,
    amount: number,
    customerEmail: string
  ): Promise<void> {
    try {
      // Find the invoice associated with this payment
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, quote_request_id')
        .eq('stripe_invoice_id', stripePaymentIntentId)
        .single();

      if (invoiceError || !invoice) {
        console.error('Invoice not found for payment intent:', stripePaymentIntentId);
        return;
      }

      // Record the payment
      await this.recordPayment({
        invoiceId: invoice.id,
        amount,
        paymentMethod: 'stripe',
        stripePaymentIntentId,
        customerEmail
      });
    } catch (error) {
      console.error('Error handling Stripe payment success:', error);
    }
  }
}
