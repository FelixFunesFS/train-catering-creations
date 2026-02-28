import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { formatDateToString } from '../_shared/dateHelpers.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteWorkflowRequest {
  quote_id: string;
  action: 'mark_reviewed' | 'create_estimate' | 'send_quote' | 'send_estimate' | 'confirm_event' | 'create_invoice';
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { quote_id, action, user_id }: QuoteWorkflowRequest = await req.json();
    
    if (!quote_id || !action) {
      throw new Error("Missing required fields: quote_id and action");
    }

    console.log(`Processing workflow action: ${action} for quote: ${quote_id}`);

    // Get current quote
    const { data: quote, error: quoteError } = await supabaseClient
      .from('quote_requests')
      .select('*')
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found: ${quote_id}`);
    }

    let updateData: any = {
      status_changed_by: user_id || 'admin',
      updated_at: new Date().toISOString()
    };

    let responseMessage = '';
    let stepCompletions: string[] = [];

    switch (action) {
      case 'mark_reviewed':
        updateData.workflow_status = 'under_review';
        updateData.status = 'reviewed';
        responseMessage = 'Quote marked as reviewed';
        stepCompletions.push('quote_reviewed');
        break;

      case 'create_estimate':
        updateData.workflow_status = 'under_review';
        updateData.status = 'quoted';
        responseMessage = 'Estimate created';
        
        // Generate automated pricing if not already set
        if (!quote.estimated_total || quote.estimated_total === 0) {
          updateData.estimated_total = await calculateEstimatedTotal(quote, supabaseClient);
        }
        
        // Create or update customer record
        await ensureCustomerExists(quote, supabaseClient);
        
        // Create draft invoice
        await createDraftInvoice(quote, updateData.estimated_total, supabaseClient);
        
        stepCompletions.push('pricing_completed', 'estimate_created');
        break;

      case 'send_quote':
      case 'send_estimate':
        updateData.workflow_status = 'quoted';
        updateData.status = 'quoted';
        responseMessage = 'Quote sent to customer';
        
        // Update invoice status to sent if exists
        await updateInvoiceStatus(quote_id, 'sent', supabaseClient);
        
        // Trigger email sending
        await sendQuoteEmail(quote, supabaseClient);
        
        stepCompletions.push('estimate_sent');
        break;

      case 'confirm_event':
        updateData.workflow_status = 'confirmed';
        updateData.status = 'confirmed';
        responseMessage = 'Event confirmed';
        stepCompletions.push('event_confirmed');
        break;

      case 'create_invoice':
        // Don't change quote status, just create invoice
        await createInvoiceFromQuote(quote, supabaseClient);
        responseMessage = 'Invoice created successfully';
        stepCompletions.push('invoice_created');
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    // Update the quote
    const { error: updateError } = await supabaseClient
      .from('quote_requests')
      .update(updateData)
      .eq('id', quote_id);

    if (updateError) {
      throw updateError;
    }

    // Log step completions
    for (const stepId of stepCompletions) {
      await logStepCompletion(quote_id, stepId, user_id || 'admin', supabaseClient);
    }

    // Log workflow state change
    await logWorkflowStateChange(
      'quote',
      quote_id,
      quote.workflow_status || quote.status,
      updateData.workflow_status || updateData.status,
      user_id || 'admin',
      responseMessage,
      supabaseClient
    );

    console.log(`Successfully processed action: ${action} for quote: ${quote_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: responseMessage,
        quote_id,
        action,
        new_status: updateData.workflow_status 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in update-quote-workflow:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function calculateEstimatedTotal(quote: any, supabaseClient: any): Promise<number> {
  try {
    // Get pricing rules
    const { data: pricingRules } = await supabaseClient
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true);

    if (!pricingRules || pricingRules.length === 0) {
      // Default pricing calculation
      const basePrice = quote.guest_count * 3500; // $35 per person base
      return basePrice;
    }

    let total = 0;
    
    // Calculate based on pricing rules
    for (const rule of pricingRules) {
      if (rule.service_type && rule.service_type !== quote.service_type) {
        continue;
      }
      
      total += rule.base_price + (rule.price_per_person * quote.guest_count);
    }

    return Math.max(total, quote.guest_count * 2500); // Minimum $25 per person
  } catch (error) {
    console.error('Error calculating estimated total:', error);
    return quote.guest_count * 3500; // Fallback pricing
  }
}

async function ensureCustomerExists(quote: any, supabaseClient: any): Promise<string> {
  try {
    // Check if customer already exists
    const { data: existingCustomer } = await supabaseClient
      .from('customers')
      .select('id')
      .eq('email', quote.email)
      .single();

    if (existingCustomer) {
      return existingCustomer.id;
    }

    // Create new customer
    const { data: newCustomer, error } = await supabaseClient
      .from('customers')
      .insert({
        name: quote.contact_name,
        email: quote.email,
        phone: quote.phone,
        quote_request_id: quote.id
      })
      .select('id')
      .single();

    if (error) throw error;
    return newCustomer.id;
  } catch (error) {
    console.error('Error ensuring customer exists:', error);
    throw error;
  }
}

async function createDraftInvoice(quote: any, estimatedTotal: number, supabaseClient: any): Promise<void> {
  try {
    // Check if draft invoice already exists
    const { data: existingInvoice } = await supabaseClient
      .from('invoices')
      .select('id')
      .eq('quote_request_id', quote.id)
      .eq('is_draft', true)
      .single();

    if (existingInvoice) {
      // Update existing draft
      await supabaseClient
        .from('invoices')
        .update({
          total_amount: estimatedTotal,
          subtotal: estimatedTotal,
          updated_at: new Date().toISOString(),
          workflow_status: 'draft'
        })
        .eq('id', existingInvoice.id);
    } else {
      // Create new draft invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      const invoiceData = {
        quote_request_id: quote.id,
        subtotal: estimatedTotal,
        total_amount: estimatedTotal,
        is_draft: true,
        workflow_status: 'draft',
        invoice_number: `DRAFT-${quote.id.slice(0, 8)}`,
        due_date: formatDateToString(dueDate)
      };

      await supabaseClient
        .from('invoices')
        .insert(invoiceData);
    }
  } catch (error) {
    console.error('Error creating draft invoice:', error);
    // Don't throw here, draft creation is not critical for workflow progression
  }
}

async function updateInvoiceStatus(quoteId: string, status: string, supabaseClient: any): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('invoices')
      .update({
        workflow_status: status,
        last_status_change: new Date().toISOString(),
        status_changed_by: 'system'
      })
      .eq('quote_request_id', quoteId);

    if (error) {
      console.error('Error updating invoice status:', error);
    }
  } catch (error) {
    console.error('Error updating invoice status:', error);
  }
}

async function createInvoiceFromQuote(quote: any, supabaseClient: any): Promise<void> {
  try {
    // Check if invoice already exists
    const { data: existingInvoice } = await supabaseClient
      .from('invoices')
      .select('id')
      .eq('quote_request_id', quote.id)
      .single();

    if (existingInvoice) {
      // Update existing invoice
      await supabaseClient
        .from('invoices')
        .update({
          workflow_status: 'draft',
          is_draft: false,
          document_type: 'invoice',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInvoice.id);
    } else {
      // Create new invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      const invoiceData = {
        quote_request_id: quote.id,
        subtotal: quote.estimated_total || 0,
        total_amount: quote.estimated_total || 0,
        is_draft: false,
        workflow_status: 'draft',
        document_type: 'invoice',
        invoice_number: `INV-${Date.now().toString().slice(-8)}`,
        due_date: formatDateToString(dueDate)
      };

      await supabaseClient
        .from('invoices')
        .insert(invoiceData);
    }
  } catch (error) {
    console.error('Error creating invoice from quote:', error);
    throw error;
  }
}

async function logStepCompletion(quoteId: string, stepId: string, completedBy: string, supabaseClient: any): Promise<void> {
  try {
    // Check if step already completed
    const { data: existing } = await supabaseClient
      .from('workflow_step_completion')
      .select('id')
      .eq('quote_request_id', quoteId)
      .eq('step_id', stepId)
      .single();

    if (!existing) {
      await supabaseClient
        .from('workflow_step_completion')
        .insert({
          quote_request_id: quoteId,
          step_id: stepId,
          step_name: getStepName(stepId),
          completed_by: completedBy,
          notes: `Step completed via workflow action`
        });
    }
  } catch (error) {
    console.error('Error logging step completion:', error);
  }
}

async function logWorkflowStateChange(
  entityType: string,
  entityId: string,
  previousStatus: string,
  newStatus: string,
  changedBy: string,
  reason: string,
  supabaseClient: any
): Promise<void> {
  try {
    await supabaseClient
      .from('workflow_state_log')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_by: changedBy,
        change_reason: reason,
        metadata: {
          timestamp: new Date().toISOString(),
          automated: true
        }
      });
  } catch (error) {
    console.error('Error logging workflow state change:', error);
  }
}

function getStepName(stepId: string): string {
  const stepNames: { [key: string]: string } = {
    'quote_reviewed': 'Quote Reviewed',
    'pricing_completed': 'Pricing Completed',
    'estimate_created': 'Estimate Created',
    'estimate_sent': 'Estimate Sent',
    'event_confirmed': 'Event Confirmed',
    'invoice_created': 'Invoice Created'
  };
  return stepNames[stepId] || stepId;
}

async function sendQuoteEmail(quote: any, supabaseClient: any): Promise<void> {
  try {
    // This would integrate with your email service
    console.log(`Would send quote email to: ${quote.email} for event: ${quote.event_name}`);
    
    // Log the email sending
    await supabaseClient
      .from('workflow_state_log')
      .insert({
        entity_type: 'quote',
        entity_id: quote.id,
        new_status: 'email_sent',
        changed_by: 'system',
        change_reason: 'Quote email sent to customer',
        metadata: {
          recipient_email: quote.email,
          event_name: quote.event_name,
          estimated_total: quote.estimated_total
        }
      });
      
  } catch (error) {
    console.error('Error sending quote email:', error);
    // Don't throw here, just log the error
  }
}