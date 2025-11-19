import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowEmailRequest {
  invoiceId: string;
  emailType: 'estimate' | 'payment_reminder' | 'contract_ready';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, emailType }: WorkflowEmailRequest = await req.json();
    console.log('send-workflow-email invoked:', { invoiceId, emailType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get invoice and quote details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('quote_request_id')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceError);
      throw new Error('Invoice not found');
    }

    // Map email types to customer portal email types
    const typeMap = {
      'estimate': 'estimate_ready',
      'payment_reminder': 'payment_reminder',
      'contract_ready': 'estimate_ready' // Use same template for now
    } as const;

    console.log('Calling send-customer-portal-email with:', {
      quote_request_id: invoice.quote_request_id,
      type: typeMap[emailType]
    });

    // Call the actual email function
    const { data, error: emailError } = await supabase.functions.invoke('send-customer-portal-email', {
      body: {
        quote_request_id: invoice.quote_request_id,
        type: typeMap[emailType] || 'estimate_ready'
      }
    });

    if (emailError) {
      console.error('Email function error:', emailError);
      throw emailError;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in send-workflow-email:', error);
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
