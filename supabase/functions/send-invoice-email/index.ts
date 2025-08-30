import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SendInvoiceRequest {
  invoice_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id }: SendInvoiceRequest = await req.json();
    
    console.log('Sending invoice email for:', invoice_id);

    // Get invoice with customer details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customers!customer_id(*),
        quote_requests!quote_request_id(*)
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Update invoice status
    await supabase
      .from('invoices')
      .update({ 
        sent_at: new Date().toISOString(),
        workflow_status: 'sent',
        status: 'sent',
        is_draft: false
      })
      .eq('id', invoice_id);

    // Update quote status
    if (invoice.quote_request_id) {
      await supabase
        .from('quote_requests')
        .update({ 
          workflow_status: 'awaiting_approval',
          invoice_status: 'sent'
        })
        .eq('id', invoice.quote_request_id);
    }

    console.log('Invoice email sent successfully for:', invoice_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Invoice sent to ${invoice.customers?.email}`,
        sent_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending invoice email:', error);
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