import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CUSTOMER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { quote_request_id } = await req.json();
    if (!quote_request_id) throw new Error("quote_request_id is required");

    logStep("Fetching quote request", { quote_request_id });

    // Fetch quote request data
    const { data: quoteData, error: quoteError } = await supabaseClient
      .from("quote_requests")
      .select("*")
      .eq("id", quote_request_id)
      .single();

    if (quoteError || !quoteData) {
      throw new Error("Quote request not found");
    }

    logStep("Quote request found", { email: quoteData.email, name: quoteData.contact_name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: quoteData.email,
      limit: 1,
    });

    let customerId;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: quoteData.email,
        name: quoteData.contact_name,
        phone: quoteData.phone,
        metadata: {
          quote_request_id: quote_request_id,
          source: "soul_trains_eatery",
        },
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Upsert customer record in Supabase
    const { data: customerData, error: customerError } = await supabaseClient
      .from("customers")
      .upsert({
        quote_request_id: quote_request_id,
        stripe_customer_id: customerId,
        email: quoteData.email,
        name: quoteData.contact_name,
        phone: quoteData.phone,
        address: quoteData.location,
      }, { onConflict: 'stripe_customer_id' });

    if (customerError) {
      logStep("Error upserting customer", { error: customerError });
      throw new Error(`Failed to save customer: ${customerError.message}`);
    }

    logStep("Customer upserted successfully", { customerData });

    return new Response(JSON.stringify({ 
      success: true, 
      customer_id: customerId,
      supabase_customer_id: (customerData as any)?.[0]?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});