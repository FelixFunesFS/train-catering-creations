import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TrackViewRequest {
  invoice_id: string;
  view_type: 'email_opened' | 'estimate_viewed';
  user_agent?: string;
  ip_address?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      invoice_id, 
      view_type, 
      user_agent, 
      ip_address 
    }: TrackViewRequest = await req.json();
    
    console.log(`Tracking ${view_type} for invoice:`, invoice_id);

    // Get current invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Prepare update data based on view type
    const updateData: any = {
      last_customer_interaction: new Date().toISOString()
    };

    if (view_type === 'email_opened') {
      updateData.email_opened_at = new Date().toISOString();
      updateData.email_opened_count = (invoice.email_opened_count || 0) + 1;
      
      // Update status if first email open
      if (!invoice.email_opened_at) {
        updateData.workflow_status = 'viewed';
        if (invoice.status === 'sent') {
          updateData.status = 'viewed';
        }
      }
    } else if (view_type === 'estimate_viewed') {
      updateData.estimate_viewed_at = new Date().toISOString();
      updateData.estimate_viewed_count = (invoice.estimate_viewed_count || 0) + 1;
      updateData.viewed_at = new Date().toISOString();
      
      // Update status if first estimate view
      if (!invoice.estimate_viewed_at) {
        updateData.workflow_status = 'viewed';
        if (invoice.status === 'sent') {
          updateData.status = 'viewed';
        }
      }
    }

    // Update invoice with tracking data
    const { error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoice_id);

    if (updateError) {
      throw updateError;
    }

    // Log the interaction in workflow_state_log
    await supabase
      .from('workflow_state_log')
      .insert({
        entity_type: 'invoice',
        entity_id: invoice_id,
        previous_status: invoice.status,
        new_status: updateData.status || invoice.status,
        changed_by: 'customer',
        change_reason: `Customer ${view_type.replace('_', ' ')} - ${user_agent || 'Unknown device'}`,
        metadata: {
          view_type,
          user_agent,
          ip_address,
          timestamp: new Date().toISOString()
        }
      });

    // Update quote request status if applicable
    if (invoice.quote_request_id && updateData.status) {
      await supabase
        .from('quote_requests')
        .update({ 
          workflow_status: 'customer_reviewing',
          invoice_status: updateData.status
        })
        .eq('id', invoice.quote_request_id);
    }

    console.log(`Successfully tracked ${view_type} for invoice ${invoice_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${view_type} tracked successfully`,
        tracked_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error tracking estimate view:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);