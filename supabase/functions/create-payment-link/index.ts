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

    const { invoice_id } = await req.json();
    if (!invoice_id) throw new Error("invoice_id is required");

    logStep("Fetching invoice data", { invoice_id });

    // Fetch invoice with customer and line items
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customers (
          stripe_customer_id,
          email,
          name
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error("Invoice not found");
    }

    // Fetch line items
    const { data: lineItems, error: lineItemsError } = await supabaseClient
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoice_id);

    if (lineItemsError) {
      throw new Error("Failed to fetch line items");
    }

    logStep("Invoice found", { 
      invoiceNumber: invoiceData.invoice_number,
      customerEmail: invoiceData.customers?.email,
      lineItemsCount: lineItems?.length || 0
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists in Stripe
    let customerId = invoiceData.customers?.stripe_customer_id;
    if (!customerId) {
      // Create customer in Stripe
      const customer = await stripe.customers.create({
        email: invoiceData.customers?.email,
        name: invoiceData.customers?.name,
        metadata: {
          invoice_id: invoice_id,
          source: 'soul_trains_eatery'
        }
      });
      customerId = customer.id;
      
      // Update customer with Stripe ID
      await supabaseClient
        .from("customers")
        .update({ stripe_customer_id: customerId })
        .eq("id", invoiceData.customer_id);
    }

    // Create line items for Stripe
    const stripeLineItems = (lineItems || []).map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: item.description || undefined,
        },
        unit_amount: item.unit_price,
      },
      quantity: item.quantity,
    }));

    logStep("Creating Stripe payment link", { lineItemsCount: stripeLineItems.length });

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: stripeLineItems,
      metadata: {
        invoice_id: invoice_id,
        invoice_number: invoiceData.invoice_number,
        customer_id: invoiceData.customer_id,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${req.headers.get("origin")}/invoice/public/${invoice_id}?payment=success`,
        },
      },
      automatic_tax: {
        enabled: false, // We're handling tax manually
      },
      billing_address_collection: 'auto',
      customer_creation: 'if_required',
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Invoice ${invoiceData.invoice_number} - Soul Train's Eatery`,
          metadata: {
            invoice_id: invoice_id,
            invoice_number: invoiceData.invoice_number,
          },
          custom_fields: [
            {
              name: 'Event Details',
              value: invoiceData.quote_request?.event_name || 'Catering Service',
            },
          ],
        },
      },
    });

    logStep("Payment link created", { 
      paymentLinkId: paymentLink.id,
      url: paymentLink.url 
    });

    // Update invoice with payment link
    const { error: updateError } = await supabaseClient
      .from("invoices")
      .update({
        stripe_payment_link: paymentLink.url,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq("id", invoice_id);

    if (updateError) {
      logStep("Warning: Failed to update invoice", { error: updateError });
    }

    // Update quote request status
    const { error: quoteUpdateError } = await supabaseClient
      .from("quote_requests")
      .update({
        invoice_status: 'sent',
      })
      .eq("id", invoiceData.quote_request_id);

    if (quoteUpdateError) {
      logStep("Warning: Failed to update quote status", { error: quoteUpdateError });
    }

    logStep("Payment link created successfully");

    return new Response(JSON.stringify({
      success: true,
      payment_link: paymentLink.url,
      public_invoice_url: `${req.headers.get("origin")}/invoice/public/${invoice_id}`,
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