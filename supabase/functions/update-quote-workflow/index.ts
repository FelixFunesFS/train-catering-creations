import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteWorkflowRequest {
  quote_id: string;
  action: 'mark_reviewed' | 'create_estimate' | 'send_quote' | 'confirm_event';
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

    switch (action) {
      case 'mark_reviewed':
        updateData.workflow_status = 'under_review';
        updateData.status = 'reviewed';
        responseMessage = 'Quote marked as reviewed';
        break;

      case 'create_estimate':
        updateData.workflow_status = 'quoted';
        updateData.status = 'quoted';
        responseMessage = 'Estimate created';
        
        // Generate automated pricing if not already set
        if (!quote.estimated_total || quote.estimated_total === 0) {
          updateData.estimated_total = await calculateEstimatedTotal(quote, supabaseClient);
        }
        break;

      case 'send_quote':
        updateData.workflow_status = 'quoted';
        updateData.status = 'quoted';
        responseMessage = 'Quote sent to customer';
        
        // TODO: Trigger email sending
        await sendQuoteEmail(quote, supabaseClient);
        break;

      case 'confirm_event':
        updateData.workflow_status = 'confirmed';
        updateData.status = 'confirmed';
        responseMessage = 'Event confirmed';
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
    return new Response(
      JSON.stringify({ 
        error: error.message,
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