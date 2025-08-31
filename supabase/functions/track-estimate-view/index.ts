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
  event_type: 'email_opened' | 'estimate_viewed';
  customer_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id, event_type, customer_email }: TrackViewRequest = await req.json();
    
    console.log(`Tracking ${event_type} for invoice:`, invoice_id);

    // Get current tracking data
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('email_opened_count, estimate_viewed_count, email_opened_at, estimate_viewed_at')
      .eq('id', invoice_id)
      .single();

    if (fetchError) {
      console.error('Error fetching invoice:', fetchError);
      throw new Error('Invoice not found');
    }

    let updateData: any = {
      last_customer_interaction: new Date().toISOString()
    };

    if (event_type === 'email_opened') {
      updateData.email_opened_count = (invoice.email_opened_count || 0) + 1;
      updateData.email_opened_at = new Date().toISOString();
      
      // Update status if this is the first time email is opened
      if (!invoice.email_opened_at) {
        updateData.workflow_status = 'viewed';
        updateData.status = 'viewed';
      }
    } else if (event_type === 'estimate_viewed') {
      updateData.estimate_viewed_count = (invoice.estimate_viewed_count || 0) + 1;
      updateData.estimate_viewed_at = new Date().toISOString();
      
      // Update status if this is the first time estimate is viewed
      if (!invoice.estimate_viewed_at) {
        updateData.workflow_status = 'viewed';
        updateData.status = 'viewed';
      }
    }

    // Update the invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoice_id);

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      throw new Error('Failed to update tracking data');
    }

    // Log the tracking event
    await supabase
      .from('workflow_state_log')
      .insert({
        entity_type: 'invoice',
        entity_id: invoice_id,
        previous_status: invoice.status || 'unknown',
        new_status: updateData.status || invoice.status || 'viewed',
        changed_by: 'customer',
        change_reason: `Customer ${event_type.replace('_', ' ')} - ${customer_email || 'Unknown email'}`
      });

    console.log(`Successfully tracked ${event_type} for invoice:`, invoice_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${event_type} tracked successfully`,
        tracked_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error tracking view:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);