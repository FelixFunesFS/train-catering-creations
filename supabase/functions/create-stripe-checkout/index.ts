import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

interface CreateCheckoutRequest {
  invoice_id: string;
  amount: number;
  customer_email: string;
  description?: string;
  success_url?: string;
  cancel_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      invoice_id, 
      amount, 
      customer_email,
      description,
      success_url,
      cancel_url
    }: CreateCheckoutRequest = await req.json();
    
    console.log('Creating Stripe checkout for invoice:', invoice_id);

    // Validate required fields
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required');
    }
    if (!customer_email) {
      throw new Error('Customer email is required');
    }
    if (!invoice_id) {
      throw new Error('Invoice ID is required');
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        quote_requests!quote_request_id(
          contact_name,
          event_name,
          event_date,
          location
        )
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceError);
      throw new Error('Invoice not found');
    }

    // Check if customer exists in Stripe, create if not
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customer_email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Found existing Stripe customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: customer_email,
        name: invoice.quote_requests?.contact_name || 'Customer',
      });
      console.log('Created new Stripe customer:', customer.id);
    }

    // Create checkout session
    const origin = req.headers.get('origin') || 'https://your-domain.com';
    const defaultSuccessUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${origin}/estimate/${invoice_id}`;

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || `Payment for ${invoice.quote_requests?.event_name || 'Catering Service'}`,
              description: `Event: ${invoice.quote_requests?.event_name || 'N/A'} | Date: ${invoice.quote_requests?.event_date || 'TBD'} | Location: ${invoice.quote_requests?.location || 'TBD'}`,
            },
            unit_amount: Math.round(amount), // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || defaultSuccessUrl,
      cancel_url: cancel_url || defaultCancelUrl,
      metadata: {
        invoice_id: invoice_id,
        customer_email: customer_email,
      },
      payment_intent_data: {
        metadata: {
          invoice_id: invoice_id,
          customer_email: customer_email,
        },
      },
    });

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice_id,
        amount: Math.round(amount),
        customer_email: customer_email,
        payment_type: 'stripe_checkout',
        status: 'pending',
        stripe_session_id: session.id,
        description: description || `Payment for ${invoice.quote_requests?.event_name || 'Catering Service'}`,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      throw new Error('Failed to create payment record');
    }

    console.log('Stripe checkout session created successfully:', session.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: session.url,
        session_id: session.id,
        transaction_id: transaction.id,
        amount: amount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating Stripe checkout:', error);
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