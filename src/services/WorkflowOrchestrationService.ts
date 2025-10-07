import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

/**
 * Central Workflow Orchestration Service
 * Single source of truth for all workflow state transitions
 * Event-driven architecture using workflow-orchestrator edge function
 */

export type InvoiceWorkflowStatus = Database['public']['Enums']['invoice_workflow_status'];
export type QuoteWorkflowStatus = Database['public']['Enums']['quote_workflow_status'];

export type WorkflowStatus = InvoiceWorkflowStatus;

interface WorkflowTransitionParams {
  invoiceId: string;
  newStatus: WorkflowStatus;
  triggeredBy: 'admin' | 'customer' | 'system';
  metadata?: Record<string, any>;
}

interface WorkflowNotificationParams {
  invoiceId: string;
  notificationType: 'estimate_ready' | 'payment_received' | 'customer_action' | 'reminder';
  recipientType: 'admin' | 'customer';
  metadata?: Record<string, any>;
}

export class WorkflowOrchestrationService {
  /**
   * Transition workflow status with full orchestration
   * Handles: status update, quote sync, notifications, analytics
   */
  static async transitionWorkflow({
    invoiceId,
    newStatus,
    triggeredBy,
    metadata = {}
  }: WorkflowTransitionParams): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Workflow] Transitioning invoice ${invoiceId} to ${newStatus} (by ${triggeredBy})`);

      // 1. Update invoice status
      const { data: invoice, error: updateError } = await supabase
        .from('invoices')
        .update({
          workflow_status: newStatus,
          last_status_change: new Date().toISOString(),
          status_changed_by: triggeredBy,
          last_customer_action: triggeredBy === 'customer' ? new Date().toISOString() : undefined,
        })
        .eq('id', invoiceId)
        .select('*, quote_requests(*)')
        .single();

      if (updateError) throw updateError;

      // 2. Sync quote status if needed
      if (invoice.quote_request_id) {
        await this.syncQuoteStatus(invoice.quote_request_id, newStatus);
      }

      // 3. Trigger notifications based on status
      await this.triggerNotifications(invoiceId, newStatus, triggeredBy);

      // 4. Log analytics event
      await supabase.from('analytics_events').insert({
        event_type: 'workflow_transition',
        entity_type: 'invoices',
        entity_id: invoiceId,
        metadata: {
          previous_status: invoice.workflow_status,
          new_status: newStatus,
          triggered_by: triggeredBy,
          ...metadata
        }
      });

      console.log(`[Workflow] Successfully transitioned to ${newStatus}`);
      return { success: true };

    } catch (error: any) {
      console.error('[Workflow] Transition failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync quote workflow_status to match invoice
   */
  private static async syncQuoteStatus(quoteId: string, invoiceStatus: WorkflowStatus) {
    // Map invoice statuses to quote statuses
    const quoteStatusMap: Partial<Record<WorkflowStatus, QuoteWorkflowStatus>> = {
      'draft': 'pending',
      'pending_review': 'under_review',
      'sent': 'estimated',
      'viewed': 'estimated',
      'approved': 'approved',
      'payment_pending': 'awaiting_payment',
      'partially_paid': 'awaiting_payment',
      'paid': 'paid',
      'overdue': 'awaiting_payment'
    };

    const quoteStatus = quoteStatusMap[invoiceStatus] || 'pending';

    await supabase
      .from('quote_requests')
      .update({
        workflow_status: quoteStatus,
        last_status_change: new Date().toISOString(),
      })
      .eq('id', quoteId);

    console.log(`[Workflow] Synced quote ${quoteId} to status ${quoteStatus}`);
  }

  /**
   * Trigger appropriate notifications based on workflow transition
   */
  private static async triggerNotifications(
    invoiceId: string,
    newStatus: WorkflowStatus,
    triggeredBy: 'admin' | 'customer' | 'system'
  ) {
    // Get invoice and quote data with explicit join
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        quote_requests!invoices_quote_request_id_fkey(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (!invoice || !invoice.quote_requests) return;
    
    const quote = invoice.quote_requests as any;

    // Define notification triggers
    const notificationConfig: Partial<Record<WorkflowStatus, { type: string; recipient: 'admin' | 'customer' }>> = {
      'sent': { type: 'estimate_ready', recipient: 'customer' },
      'approved': { type: 'customer_action', recipient: 'admin' },
      'paid': { type: 'payment_received', recipient: 'admin' },
      'overdue': { type: 'reminder', recipient: 'customer' }
    };

    const config = notificationConfig[newStatus];
    if (!config) return;

    try {
      if (config.type === 'estimate_ready' && config.recipient === 'customer') {
        // Send estimate ready email to customer
        await supabase.functions.invoke('send-customer-portal-email', {
          body: {
            quote_request_id: invoice.quote_request_id,
            type: 'estimate_ready'
          }
        });
      } else if (config.recipient === 'admin') {
        // Send admin notification
        const siteUrl = window.location.origin;
        await supabase.functions.invoke('send-gmail-email', {
          body: {
            to: 'soultrainseatery@gmail.com',
            subject: `Customer Action Required: ${quote.event_name}`,
            html: `
              <h2>Customer ${config.type === 'customer_action' ? 'Approved' : 'Paid'} Estimate</h2>
              <p><strong>Event:</strong> ${quote.event_name}</p>
              <p><strong>Customer:</strong> ${quote.contact_name}</p>
              <p><strong>Date:</strong> ${quote.event_date}</p>
              <p><strong>Action:</strong> ${newStatus}</p>
              <a href="${siteUrl}/admin/workflow?quote=${invoice.quote_request_id}">View in Admin Dashboard</a>
            `
          }
        });
      }
      console.log(`[Workflow] Notification sent: ${config.type} to ${config.recipient}`);
    } catch (error) {
      console.error(`[Workflow] Notification failed:`, error);
      // Don't fail the workflow if notification fails
    }
  }

  /**
   * Auto-generate invoice for new quote
   */
  static async autoGenerateInvoice(quoteId: string): Promise<{ success: boolean; invoiceId?: string }> {
    try {
      // Check if invoice already exists
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('quote_request_id', quoteId)
        .maybeSingle();

      if (existing) {
        console.log(`[Workflow] Invoice already exists for quote ${quoteId}`);
        return { success: true, invoiceId: existing.id };
      }

      // Get quote data
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) throw new Error('Quote not found');

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          quote_request_id: quoteId,
          workflow_status: 'draft',
          is_draft: true,
          document_type: 'estimate',
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      console.log(`[Workflow] Auto-generated invoice ${invoice.id} for quote ${quoteId}`);
      return { success: true, invoiceId: invoice.id };

    } catch (error: any) {
      console.error('[Workflow] Auto-generate invoice failed:', error);
      return { success: false };
    }
  }

  /**
   * Handle customer approval
   */
  static async handleCustomerApproval(invoiceId: string, feedback?: string): Promise<{ success: boolean }> {
    try {
      // Update invoice to approved
      await this.transitionWorkflow({
        invoiceId,
        newStatus: 'approved',
        triggeredBy: 'customer',
        metadata: { feedback }
      });

      // Generate payment milestones
      const { PaymentMilestoneService } = await import('@/services/PaymentMilestoneService');
      await PaymentMilestoneService.generateMilestones(invoiceId);

      return { success: true };
    } catch (error) {
      console.error('[Workflow] Customer approval failed:', error);
      return { success: false };
    }
  }

  /**
   * Handle payment received
   */
  static async handlePaymentReceived(invoiceId: string, amount: number): Promise<{ success: boolean }> {
    try {
      // Get invoice total
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', invoiceId)
        .single();

      if (!invoice) throw new Error('Invoice not found');

      // Determine if fully paid
      const isFull = amount >= invoice.total_amount;
      const newStatus: WorkflowStatus = isFull ? 'paid' : 'partially_paid';

      await this.transitionWorkflow({
        invoiceId,
        newStatus,
        triggeredBy: 'system',
        metadata: { amount, full_payment: isFull }
      });

      return { success: true };
    } catch (error) {
      console.error('[Workflow] Payment handling failed:', error);
      return { success: false };
    }
  }
}
