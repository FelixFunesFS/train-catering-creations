import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createErrorResponse, verifyInvoiceAccess } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

interface CheckoutRequest {
  invoice_id: string;
  access_token: string; // Required for customer authentication
  payment_type: 'full' | 'deposit' | 'milestone';
  amount?: number;
  milestone_id?: string;
  success_url?: string;
  cancel_url?: string;
  ui_mode?: 'embedded'; // Optional: renders embedded checkout form
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Received checkout request");

    const {
      invoice_id,
      access_token,
      payment_type,
      amount: customAmount,
      milestone_id,
      success_url,
      cancel_url,
      ui_mode
    }: CheckoutRequest = await req.json();

    logStep("Request data", { invoice_id, payment_type, milestone_id, ui_mode, hasToken: !!access_token });

    // SECURITY: Verify invoice access using customer access token
    if (!access_token) {
      logStep("Missing access token");
      return new Response(
        JSON.stringify({ error: "Access token is required", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hasAccess = await verifyInvoiceAccess(invoice_id, access_token);
    if (!hasAccess) {
      logStep("Invalid access token for invoice");
      return new Response(
        JSON.stringify({ error: "Invalid or expired access token", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Invoice access verified");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("FRONTEND_URL");

    if (!stripeKey) throw new Error("Payment service not configured");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Service configuration error");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep("Fetching invoice");
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id,
        total_amount,
        customer_access_token,
        quote_request_id,
        quote_requests (
          id,
          contact_name,
          email,
          event_name,
          event_date
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      logStep("Invoice not found");
      throw new Error("Invoice not found");
    }

    let paymentAmount = customAmount || invoice.total_amount;

    if (payment_type === 'deposit') {
      paymentAmount = Math.round(invoice.total_amount * 0.5);
    } else if (payment_type === 'milestone' && milestone_id) {
      const { data: milestone } = await supabase
        .from("payment_milestones")
        .select("amount_cents")
        .eq("id", milestone_id)
        .single();

      if (milestone) paymentAmount = milestone.amount_cents;
    }

    logStep("Payment amount calculated", { paymentAmount, payment_type });

    const customerEmail = invoice.quote_requests?.email;
    const customerName = invoice.quote_requests?.contact_name;

    let stripeCustomerId: string | undefined;

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("email", customerEmail)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
      logStep("Using existing Stripe customer");
    } else {
      const stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: { quote_request_id: invoice.quote_request_id }
      });

      stripeCustomerId = stripeCustomer.id;
      logStep("Created new Stripe customer");

      await supabase.from("customers").upsert({
        email: customerEmail,
        name: customerName,
        stripe_customer_id: stripeCustomerId,
        quote_request_id: invoice.quote_request_id
      });
    }

    const defaultSuccessUrl = `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&token=${invoice.customer_access_token}&type=${payment_type}`;
    const defaultCancelUrl = `${siteUrl}/estimate?token=${invoice.customer_access_token}`;
    const returnUrl = `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&token=${invoice.customer_access_token}&type=${payment_type}`;

    const isEmbedded = ui_mode === 'embedded';

    const sessionParams: Record<string, unknown> = {
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Soul Train's Eatery LLC - ${invoice.quote_requests?.event_name || 'Catering Event'} (${payment_type === 'deposit' ? 'Deposit' : 'Payment'})`,
            description: `Event Date: ${invoice.quote_requests?.event_date || 'TBD'}`,
          },
          unit_amount: paymentAmount,
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: {
        invoice_id,
        payment_type,
        milestone_id: milestone_id || '',
        quote_request_id: invoice.quote_request_id
      },
    };

    if (isEmbedded) {
      sessionParams.ui_mode = 'embedded';
      sessionParams.return_url = returnUrl;
    } else {
      sessionParams.success_url = success_url || defaultSuccessUrl;
      sessionParams.cancel_url = cancel_url || defaultCancelUrl;
    }

    const session = await stripe.checkout.sessions.create(sessionParams as any);

    logStep("Stripe session created", { sessionId: session.id, isEmbedded });

    await supabase.from("payment_transactions").insert({
      invoice_id,
      amount: paymentAmount,
      payment_type,
      payment_method: "stripe",
      customer_email: customerEmail,
      status: "pending",
      stripe_session_id: session.id,
      description: `${payment_type} payment for ${invoice.quote_requests?.event_name}`
    });

    const responseData = isEmbedded
      ? { clientSecret: session.client_secret, sessionId: session.id }
      : { url: session.url, sessionId: session.id };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return createErrorResponse(error, 'create-checkout-session', corsHeaders);
  }
};

serve(handler);