import { supabase } from '@/integrations/supabase/client';

export interface ChangeRequestInput {
  quoteRequestId: string;
  invoiceId?: string;
  customerEmail: string;
  requestType: 'modification' | 'cancellation' | 'date_change' | 'guest_count_change';
  customerComments: string;
  requestedChanges: Record<string, any>;
}

export interface QuoteStatusUpdateInput {
  quoteId: string;
  status: 'confirmed' | 'cancelled';
  comments?: string;
}

export class ChangeRequestService {
  /**
   * Submit a new change request from a customer
   */
  static async submitChangeRequest(input: ChangeRequestInput): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('change_requests')
      .insert({
        invoice_id: input.invoiceId || null,
        customer_email: input.customerEmail,
        request_type: input.requestType,
        workflow_status: 'pending',
        customer_comments: input.customerComments,
        requested_changes: input.requestedChanges
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to submit change request:', error);
      throw new Error('Failed to submit change request');
    }

    return { id: data.id };
  }

  /**
   * Update quote status (confirm or cancel)
   */
  static async updateQuoteStatus(input: QuoteStatusUpdateInput): Promise<void> {
    const { error } = await supabase
      .from('quote_requests')
      .update({
        workflow_status: input.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', input.quoteId);

    if (error) {
      console.error('Failed to update quote status:', error);
      throw new Error('Failed to update quote status');
    }
  }

  /**
   * Send quote notification to admin
   */
  static async sendQuoteNotification(
    quoteId: string,
    action: 'confirmed' | 'cancelled' | 'change_requested',
    customerComments?: string
  ): Promise<void> {
    const { error } = await supabase.functions.invoke('send-quote-notification', {
      body: {
        quote_id: quoteId,
        action,
        customer_comments: customerComments || null
      }
    });

    if (error) {
      console.error('Failed to send notification:', error);
      // Don't throw - notification failure shouldn't block the main action
    }
  }

  /**
   * Get change requests for an invoice
   */
  static async getChangeRequestsByInvoice(invoiceId: string) {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch change requests:', error);
      throw new Error('Failed to fetch change requests');
    }

    return data;
  }

  /**
   * Get pending change requests count
   */
  static async getPendingCount(): Promise<number> {
    const { count, error } = await supabase
      .from('change_requests')
      .select('*', { count: 'exact', head: true })
      .eq('workflow_status', 'pending');

    if (error) {
      console.error('Failed to get pending count:', error);
      return 0;
    }

    return count || 0;
  }
}
