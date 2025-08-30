import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CreatePaymentLinkRequest {
  invoice_id: string;
  amount: number;
  quote_id?: string;
  payment_type?: string;
  customer_email?: string;
  description?: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      invoice_id, 
      amount, 
      payment_type = 'payment',
      customer_email,
      description,
      terms_accepted = false,
      terms_accepted_at 
    }: CreatePaymentLinkRequest = await req.json();
    
    console.log('Creating payment link for invoice:', invoice_id);

    // Get invoice details
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

    // For now, create a simple payment URL
    // In production, this would integrate with Stripe, Square, or another payment processor
    const paymentUrl = `${supabaseUrl.replace('supabase.co', 'lovable.app')}/payment/${invoice_id}`;

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice_id,
        amount: amount,
        customer_email: customer_email || invoice.customers?.email || '',
        payment_type: payment_type,
        status: 'pending',
        description: description || `Payment for invoice ${invoice.invoice_number}`,
        // Store terms acceptance in metadata if needed
        ...(terms_accepted && { 
          metadata: { 
            terms_accepted: true, 
            terms_accepted_at: terms_accepted_at 
          } 
        })
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    console.log('Payment link created successfully:', paymentUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: paymentUrl,
        transaction_id: transaction.id,
        amount: amount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating payment link:', error);
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