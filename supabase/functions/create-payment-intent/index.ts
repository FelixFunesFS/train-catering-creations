import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id, amount, milestone_id } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch invoice and quote details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        quote_requests(*)
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    const quote = invoice.quote_requests;

    // Create Stripe payment intent
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    
    const paymentIntent = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: 'usd',
        'metadata[invoice_id]': invoice_id,
        'metadata[milestone_id]': milestone_id || '',
        'metadata[customer_email]': quote.email,
        description: `Payment for ${quote.event_name} - ${invoice.invoice_number || invoice.id}`,
      }),
    });

    const paymentData = await paymentIntent.json();

    if (!paymentIntent.ok) {
      throw new Error(paymentData.error?.message || 'Failed to create payment intent');
    }

    // Create payment transaction record
    await supabaseClient
      .from('payment_transactions')
      .insert({
        invoice_id,
        amount,
        payment_type: milestone_id ? 'milestone' : 'full',
        stripe_payment_intent_id: paymentData.id,
        customer_email: quote.email,
        status: 'pending',
      });

    return new Response(
      JSON.stringify({
        client_secret: paymentData.client_secret,
        payment_intent_id: paymentData.id,
        checkout_url: `https://checkout.stripe.com/pay/${paymentData.client_secret}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
