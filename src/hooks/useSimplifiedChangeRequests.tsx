import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface ApproveChangeOptions {
  adminResponse: string;
  finalCostChange?: number;
}

export function useSimplifiedChangeRequests(invoiceId?: string) {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const applyChangesToQuote = async (
    changeRequest: ChangeRequest,
    options: ApproveChangeOptions
  ) => {
    try {
      // Get the invoice and associated quote
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, quote_request_id, total_amount')
        .eq('id', changeRequest.invoice_id)
        .single();

      if (invoiceError || !invoice?.quote_request_id) {
        throw new Error('Invoice or associated quote not found');
      }

      // Get current quote data
      const { data: currentQuote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', invoice.quote_request_id)
        .single();

      if (quoteError || !currentQuote) {
        throw new Error('Quote request not found');
      }

      // Parse requested changes and build update object
      const changes = changeRequest.requested_changes || {};
      const quoteUpdates: any = {};

      // Apply each requested change
      if (changes.event_date) quoteUpdates.event_date = changes.event_date;
      if (changes.guest_count) quoteUpdates.guest_count = parseInt(changes.guest_count);
      if (changes.location) quoteUpdates.location = changes.location;
      if (changes.start_time) quoteUpdates.start_time = changes.start_time;
      if (changes.menu_changes || changes.service_changes || changes.dietary_changes) {
        // Store changes in special_requests for reference
        const changesSummary = [
          changes.menu_changes && `Menu: ${changes.menu_changes}`,
          changes.service_changes && `Service: ${changes.service_changes}`,
          changes.dietary_changes && `Dietary: ${changes.dietary_changes}`
        ].filter(Boolean).join(' | ');
        
        quoteUpdates.special_requests = currentQuote.special_requests 
          ? `${currentQuote.special_requests}\n\nAPPROVED CHANGES: ${changesSummary}`
          : `APPROVED CHANGES: ${changesSummary}`;
      }

      // Update quote status to indicate it's been modified
      quoteUpdates.status = 'quoted';
      quoteUpdates.workflow_status = 'estimated';
      quoteUpdates.last_status_change = new Date().toISOString();

      // Apply updates to quote_requests
      const { error: updateQuoteError } = await supabase
        .from('quote_requests')
        .update(quoteUpdates)
        .eq('id', invoice.quote_request_id);

      if (updateQuoteError) throw updateQuoteError;

      // Calculate new invoice total
      const costChangeCents = (options.finalCostChange || changeRequest.estimated_cost_change || 0);
      const newTotal = Math.max(0, invoice.total_amount + costChangeCents);

      // Update invoice with new total
      const { error: updateInvoiceError } = await supabase
        .from('invoices')
        .update({
          total_amount: newTotal,
          status: 'approved',
          workflow_status: 'approved',
          updated_at: new Date().toISOString(),
          status_changed_by: 'admin'
        })
        .eq('id', changeRequest.invoice_id);

      if (updateInvoiceError) throw updateInvoiceError;

      // Mark change request as approved
      const { error: updateRequestError } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          admin_response: options.adminResponse,
          estimated_cost_change: costChangeCents,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', changeRequest.id);

      if (updateRequestError) throw updateRequestError;

      // Log the workflow state change
      await supabase.from('workflow_state_log').insert({
        entity_type: 'change_requests',
        entity_id: changeRequest.id,
        previous_status: 'pending',
        new_status: 'approved',
        changed_by: 'admin',
        change_reason: `Change request approved: ${options.adminResponse.substring(0, 100)}`,
        metadata: {
          invoice_id: changeRequest.invoice_id,
          quote_id: invoice.quote_request_id,
          cost_change: costChangeCents,
          applied_changes: Object.keys(quoteUpdates)
        }
      });

      return { success: true, newTotal, appliedChanges: quoteUpdates };
    } catch (error) {
      console.error('Error applying changes to quote:', error);
      throw error;
    }
  };

  const approveChangeRequest = async (
    changeRequest: ChangeRequest,
    options: ApproveChangeOptions
  ) => {
    setProcessing(true);
    try {
      const result = await applyChangesToQuote(changeRequest, options);
      
      toast({
        title: "Changes Applied",
        description: "Quote has been updated with the approved changes. The updated estimate is ready to send.",
      });

      return result;
    } catch (error) {
      console.error('Error approving change request:', error);
      toast({
        title: "Error",
        description: "Failed to apply changes. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const rejectChangeRequest = async (
    changeRequest: ChangeRequest,
    adminResponse: string
  ) => {
    setProcessing(true);
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

      toast({
        title: "Request Rejected",
        description: "Customer will be notified of the decision.",
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting change request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    approveChangeRequest,
    rejectChangeRequest
  };
}
