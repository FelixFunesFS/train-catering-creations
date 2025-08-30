import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECKOUT-SESSION] ${step}${detailsStr}`);
};

interface CheckoutRequest {
  invoice_id: string;
  payment_type: 'deposit' | 'partial' | 'final' | 'full';
  amount?: number; // Override amount if provided
  success_url?: string;
  cancel_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Checkout session creation started");

    const { invoice_id, payment_type, amount, success_url, cancel_url }: CheckoutRequest = await req.json();

    if (!invoice_id || !payment_type) {
      throw new Error('Missing required fields: invoice_id, payment_type');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    logStep("Fetching invoice data", { invoice_id, payment_type });

    // Fetch invoice and customer details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          stripe_customer_id
        ),
        quote_requests (
          event_name,
          event_date
        )
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    logStep("Invoice data fetched", { 
      invoiceNumber: invoice.invoice_number,
      customerEmail: invoice.customers.email,
      totalAmount: invoice.total_amount 
    });

    // Calculate payment amount based on type
    let paymentAmount = amount;
    let description = '';

    if (!paymentAmount) {
      const eventDate = new Date(invoice.quote_requests.event_date);
      const today = new Date();
      const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      switch (payment_type) {
        case 'deposit':
          if (daysUntilEvent <= 30) {
            paymentAmount = Math.round(invoice.total_amount * 0.5); // 50% for short notice
            description = `Deposit Payment (50%) - ${invoice.quote_requests.event_name}`;
          } else {
            paymentAmount = Math.round(invoice.total_amount * 0.25); // 25% for standard
            description = `Deposit Payment (25%) - ${invoice.quote_requests.event_name}`;
          }
          break;
        case 'partial':
          paymentAmount = Math.round(invoice.total_amount * 0.5);
          description = `Partial Payment (50%) - ${invoice.quote_requests.event_name}`;
          break;
        case 'final':
          // Calculate remaining balance
          const { data: transactions } = await supabase
            .from('payment_transactions')
            .select('amount')
            .eq('invoice_id', invoice_id)
            .eq('status', 'succeeded');
          
          const paidAmount = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
          paymentAmount = invoice.total_amount - paidAmount;
          description = `Final Payment - ${invoice.quote_requests.event_name}`;
          break;
        case 'full':
          paymentAmount = invoice.total_amount;
          description = `Full Payment - ${invoice.quote_requests.event_name}`;
          break;
        default:
          throw new Error('Invalid payment type');
      }
    } else {
      description = `Payment - ${invoice.quote_requests.event_name}`;
    }

    logStep("Payment amount calculated", { paymentAmount, description });

    // Create or get Stripe customer
    let stripeCustomerId = invoice.customers.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: invoice.customers.email,
        name: invoice.customers.name,
        metadata: {
          supabase_customer_id: invoice.customers.id
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update customer record with Stripe ID
      await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', invoice.customers.id);
      
      logStep("Created new Stripe customer", { stripeCustomerId });
    }

    // Create checkout session
    const origin = req.headers.get('origin') || 'https://soultrainseatery.lovable.app';
    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description,
              description: `Invoice: ${invoice.invoice_number}`,
            },
            unit_amount: paymentAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${origin}/estimate-preview/${invoice_id}`,
      metadata: {
        invoice_id: invoice_id,
        payment_type: payment_type,
        supabase_invoice_id: invoice_id
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Record payment transaction as pending
    await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice_id,
        stripe_session_id: session.id,
        amount: paymentAmount,
        payment_type: payment_type,
        status: 'pending',
        customer_email: invoice.customers.email,
        description: description
      });

    logStep("Payment transaction recorded as pending");

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      amount: paymentAmount,
      description: description
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    logStep("ERROR in checkout session creation", { message: error.message });
    console.error('Error in create-checkout-session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);