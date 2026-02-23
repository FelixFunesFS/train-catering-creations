import { supabase } from '@/integrations/supabase/client';
import { buildPaymentSchedule, determineCustomerType, calculatePaymentAmounts } from '@/utils/paymentScheduling';
import { parseDateFromLocalString, formatDateToLocalString } from '@/utils/dateHelpers';

export class PaymentMilestoneService {
  /**
   * Generate payment milestones for an invoice when it's approved
   */
  static async generateMilestones(invoiceId: string): Promise<void> {
    try {
      // Fetch invoice data
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, total_amount, quote_request_id')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      // Fetch quote data separately
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('email, event_date, requires_po_number')
        .eq('id', invoice.quote_request_id)
        .single();
      if (!quote) {
        throw new Error('Quote request not found');
      }

      // Check if milestones already exist
      const { data: existingMilestones } = await supabase
        .from('payment_milestones')
        .select('id')
        .eq('invoice_id', invoiceId);

      if (existingMilestones && existingMilestones.length > 0) {
        console.log('Milestones already exist for this invoice');
        return;
      }

      // Determine customer type
      const customerType = determineCustomerType(quote.email, quote.requires_po_number);

      // Build payment schedule
      const schedule = buildPaymentSchedule(
        parseDateFromLocalString(quote.event_date),
        customerType,
        new Date(),
        invoice.total_amount
      );

      // Calculate amounts for each rule
      const payments = calculatePaymentAmounts(schedule);

      // Use shared date helper for consistent formatting

      // Insert milestones
      const milestones = payments.map(payment => ({
        invoice_id: invoiceId,
        milestone_type: payment.rule.type,
        description: payment.rule.description,
        percentage: payment.rule.percentage,
        amount_cents: payment.amount_cents,
        due_date: typeof payment.due_date === 'string' ? null : formatDateToLocalString(payment.due_date),
        is_due_now: payment.due_date === 'NOW',
        is_net30: payment.due_date === 'NET_30_AFTER_EVENT',
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('payment_milestones')
        .insert(milestones);

      if (insertError) {
        throw insertError;
      }

      console.log(`Generated ${milestones.length} payment milestones for invoice ${invoiceId}`);
    } catch (error) {
      console.error('Error generating payment milestones:', error);
      throw error;
    }
  }

  /**
   * Check if invoice is fully paid and update statuses
   */
  static async checkAndUpdatePaymentStatus(invoiceId: string): Promise<void> {
    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount, quote_request_id')
        .eq('id', invoiceId)
        .single();

      if (!invoice) return;

      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('invoice_id', invoiceId)
        .eq('status', 'completed');

      const totalPaid = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      if (totalPaid >= invoice.total_amount) {
        // Mark invoice as paid
        await supabase
          .from('invoices')
          .update({
            workflow_status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', invoiceId);

        // Mark quote as confirmed
        if (invoice.quote_request_id) {
          await supabase
            .from('quote_requests')
            .update({
              workflow_status: 'confirmed'
            })
            .eq('id', invoice.quote_request_id);
        }

        console.log('Invoice fully paid and quote confirmed');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }
}
