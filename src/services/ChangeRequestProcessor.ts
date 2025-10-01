/**
 * ChangeRequestProcessor - Business logic for processing change requests
 * Handles approval/rejection and orchestrates quote updates
 */

import { supabase } from '@/integrations/supabase/client';
import { QuoteUpdateService } from './QuoteUpdateService';
import { HistoryLogger } from './HistoryLogger';

export interface ChangeRequest {
  id: string;
  invoice_id: string;
  customer_email: string;
  request_type: string;
  priority: string;
  status: string;
  customer_comments: string;
  requested_changes: any;
  original_details?: any;
  estimated_cost_change: number;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export interface ApproveChangeOptions {
  adminResponse: string;
  finalCostChange?: number;
}

export class ChangeRequestProcessor {
  private quoteUpdateService: QuoteUpdateService;
  private historyLogger: HistoryLogger;

  constructor() {
    this.quoteUpdateService = new QuoteUpdateService();
    this.historyLogger = new HistoryLogger();
  }

  /**
   * Approve and apply a change request
   */
  async approveChangeRequest(
    changeRequest: ChangeRequest,
    options: ApproveChangeOptions
  ): Promise<{ success: boolean; newTotal?: number; appliedChanges?: any; error?: string }> {
    try {
      // Get invoice and quote
      const { invoice, quote } = await this.getInvoiceAndQuote(changeRequest.invoice_id);
      
      if (!invoice || !quote) {
        throw new Error('Invoice or quote not found');
      }

      // Apply changes to quote
      const quoteUpdates = await this.quoteUpdateService.applyChanges(
        quote,
        changeRequest.requested_changes
      );

      // Update quote in database
      await this.quoteUpdateService.updateQuote(invoice.quote_request_id, quoteUpdates);

      // Regenerate line items
      await this.quoteUpdateService.regenerateLineItems(invoice.quote_request_id);

      // Log history
      await this.historyLogger.logChangeRequestApproval(
        invoice.quote_request_id,
        changeRequest,
        quote,
        changeRequest.requested_changes
      );

      // Update invoice total
      const newTotal = await this.updateInvoiceTotal(
        changeRequest.invoice_id,
        invoice.total_amount,
        options.finalCostChange || changeRequest.estimated_cost_change
      );

      // Mark change request as approved
      await this.markAsApproved(changeRequest.id, options.adminResponse, newTotal - invoice.total_amount);

      // Log workflow state
      await this.logWorkflowStateChange(changeRequest, invoice.quote_request_id, options, newTotal - invoice.total_amount);

      return { success: true, newTotal, appliedChanges: quoteUpdates };
    } catch (error) {
      console.error('Error approving change request:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Reject a change request
   */
  async rejectChangeRequest(
    changeRequest: ChangeRequest,
    adminResponse: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({
          status: 'rejected',
          admin_response: adminResponse,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', changeRequest.id);

      if (error) throw error;

      // Log the rejection
      await supabase.from('workflow_state_log').insert({
        entity_type: 'change_requests',
        entity_id: changeRequest.id,
        previous_status: 'pending',
        new_status: 'rejected',
        changed_by: 'admin',
        change_reason: `Change request rejected: ${adminResponse.substring(0, 100)}`
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting change request:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get invoice and associated quote
   */
  private async getInvoiceAndQuote(invoiceId: string) {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, quote_request_id, total_amount')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice?.quote_request_id) {
      throw new Error('Invoice or associated quote not found');
    }

    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', invoice.quote_request_id)
      .single();

    if (quoteError || !quote) {
      throw new Error('Quote request not found');
    }

    return { invoice, quote };
  }

  /**
   * Update invoice total amount
   */
  private async updateInvoiceTotal(
    invoiceId: string,
    currentTotal: number,
    costChangeCents: number
  ): Promise<number> {
    const newTotal = Math.max(0, currentTotal + costChangeCents);

    const { error } = await supabase
      .from('invoices')
      .update({
        total_amount: newTotal,
        status: 'approved',
        workflow_status: 'approved',
        updated_at: new Date().toISOString(),
        status_changed_by: 'admin'
      })
      .eq('id', invoiceId);

    if (error) throw error;

    return newTotal;
  }

  /**
   * Mark change request as approved
   */
  private async markAsApproved(
    requestId: string,
    adminResponse: string,
    costChangeCents: number
  ): Promise<void> {
    const { error } = await supabase
      .from('change_requests')
      .update({
        status: 'approved',
        admin_response: adminResponse,
        estimated_cost_change: costChangeCents,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  }

  /**
   * Log workflow state change
   */
  private async logWorkflowStateChange(
    changeRequest: ChangeRequest,
    quoteId: string,
    options: ApproveChangeOptions,
    costChangeCents: number
  ): Promise<void> {
    await supabase.from('workflow_state_log').insert({
      entity_type: 'change_requests',
      entity_id: changeRequest.id,
      previous_status: 'pending',
      new_status: 'approved',
      changed_by: 'admin',
      change_reason: `Change request approved: ${options.adminResponse.substring(0, 100)}`,
      metadata: {
        invoice_id: changeRequest.invoice_id,
        quote_id: quoteId,
        cost_change: costChangeCents
      }
    });
  }
}
