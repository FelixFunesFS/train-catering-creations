import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase with service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const { 
      milestone_id, 
      amount, 
      currency = 'usd', 
      customer_email, 
      description,
      metadata = {}
    } = await req.json();

    logStep("Request data", { milestone_id, amount, currency, customer_email, description });

    if (!milestone_id || !amount || !customer_email) {
      throw new Error("Missing required fields: milestone_id, amount, customer_email");
    }

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabaseClient
      .from('payment_milestones')
      .select(`
        *,
        invoices!inner(
          id,
          quote_request_id,
          quote_requests!inner(
            id,
            contact_name,
            event_name,
            event_date,
            location
          )
        )
      `)
      .eq('id', milestone_id)
      .maybeSingle();

    if (milestoneError || !milestone) {
      throw new Error(`Milestone not found: ${milestoneError?.message}`);
    }

    logStep("Found milestone", { milestoneType: milestone.milestone_type, amount: milestone.amount_cents });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ 
      email: customer_email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: customer_email,
        name: milestone.invoices.quote_requests.contact_name,
        metadata: {
          quote_request_id: milestone.invoices.quote_request_id,
          invoice_id: milestone.invoice_id
        }
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `${milestone.description} - ${milestone.invoices.quote_requests.event_name}`,
              description: `Payment for catering services on ${milestone.invoices.quote_requests.event_date}`,
              metadata: {
                milestone_id: milestone_id,
                invoice_id: milestone.invoice_id,
                quote_request_id: milestone.invoices.quote_request_id
              }
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&milestone_id=${milestone_id}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled?milestone_id=${milestone_id}`,
      metadata: {
        milestone_id: milestone_id,
        invoice_id: milestone.invoice_id,
        quote_request_id: milestone.invoices.quote_request_id,
        ...metadata
      },
      payment_intent_data: {
        metadata: {
          milestone_id: milestone_id,
          invoice_id: milestone.invoice_id,
          quote_request_id: milestone.invoices.quote_request_id
        }
      }
    });

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    // Log payment transaction
    const { error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        invoice_id: milestone.invoice_id,
        amount: amount,
        currency: currency,
        payment_type: milestone.milestone_type,
        status: 'pending',
        stripe_session_id: session.id,
        customer_email: customer_email,
        description: description
      });

    if (transactionError) {
      logStep("Warning: Failed to log transaction", { error: transactionError.message });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      customer_id: customerId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Failed to create payment link"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});