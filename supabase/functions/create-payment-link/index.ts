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
      invoice_id,
      amount, 
      currency = 'usd', 
      customer_email, 
      description,
      metadata = {}
    } = await req.json();

    logStep("Request data", { milestone_id, invoice_id, amount, currency, customer_email, description });

    if (!amount || !customer_email) {
      throw new Error("Missing required fields: amount, customer_email");
    }

    let milestone;
    let invoiceData;

    // If milestone_id is provided, fetch milestone details
    if (milestone_id) {
      const { data: milestoneData, error: milestoneError } = await supabaseClient
        .from('payment_milestones')
        .select('*, invoice_id')
        .eq('id', milestone_id)
        .maybeSingle();

      if (milestoneError || !milestoneData) {
        throw new Error(`Milestone not found: ${milestoneError?.message}`);
      }
      milestone = milestoneData;
      
      // Fetch invoice separately
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('id, quote_request_id')
        .eq('id', milestoneData.invoice_id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error(`Invoice not found: ${invoiceError?.message}`);
      }

      // Fetch quote request separately
      const { data: quoteRequest, error: quoteError } = await supabaseClient
        .from('quote_requests')
        .select('id, contact_name, event_name, event_date, location')
        .eq('id', invoice.quote_request_id)
        .single();

      if (quoteError || !quoteRequest) {
        throw new Error(`Quote request not found: ${quoteError?.message}`);
      }

      invoiceData = {
        ...invoice,
        quote_requests: quoteRequest
      };
    } else if (invoice_id) {
      // No milestone provided, fetch invoice directly
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('id, quote_request_id')
        .eq('id', invoice_id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error(`Invoice not found: ${invoiceError?.message}`);
      }

      // Fetch quote request separately
      const { data: quoteRequest, error: quoteError } = await supabaseClient
        .from('quote_requests')
        .select('id, contact_name, event_name, event_date, location')
        .eq('id', invoice.quote_request_id)
        .single();

      if (quoteError || !quoteRequest) {
        throw new Error(`Quote request not found: ${quoteError?.message}`);
      }

      invoiceData = {
        ...invoice,
        quote_requests: quoteRequest
      };
    } else {
      throw new Error("Either milestone_id or invoice_id must be provided");
    }

    if (milestone) {
      logStep("Found milestone", { milestoneType: milestone.milestone_type, amount: milestone.amount_cents });
    } else {
      logStep("Direct invoice payment", { invoiceId: invoice_id, amount });
    }

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
        name: invoiceData.quote_requests.contact_name,
        metadata: {
          quote_request_id: invoiceData.quote_request_id,
          invoice_id: invoiceData.id
        }
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Create checkout session
    const productName = milestone 
      ? `${milestone.description} - ${invoiceData.quote_requests.event_name}`
      : `${description || 'Payment'} - ${invoiceData.quote_requests.event_name}`;
    
    const sessionMetadata: any = {
      invoice_id: invoiceData.id,
      quote_request_id: invoiceData.quote_request_id,
      ...metadata
    };
    
    if (milestone_id) {
      sessionMetadata.milestone_id = milestone_id;
    }

    // Use SITE_URL for consistent redirect URLs across all payment functions
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("FRONTEND_URL") || "https://mkqdevtesting.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              description: `Payment for catering services on ${invoiceData.quote_requests.event_date}`,
              metadata: sessionMetadata
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}${milestone_id ? `&milestone_id=${milestone_id}` : ''}`,
      cancel_url: `${siteUrl}/payment-canceled${milestone_id ? `?milestone_id=${milestone_id}` : ''}`,
      metadata: sessionMetadata,
      payment_intent_data: {
        metadata: sessionMetadata
      }
    });

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    // Log payment transaction
    const { error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        invoice_id: invoiceData.id,
        amount: amount,
        currency: currency,
        payment_type: milestone ? milestone.milestone_type : 'full',
        status: 'pending',
        stripe_session_id: session.id,
        customer_email: customer_email,
        description: description || productName
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