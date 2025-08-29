import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-INVOICE] ${step}${detailsStr}`);
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

    // Fetch invoice data
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

    if (!invoiceData.stripe_invoice_id) {
      throw new Error("No Stripe invoice ID found");
    }

    logStep("Invoice found", { 
      stripeInvoiceId: invoiceData.stripe_invoice_id,
      customerEmail: invoiceData.customers?.email 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Send the invoice via Stripe
    const sentInvoice = await stripe.invoices.sendInvoice(invoiceData.stripe_invoice_id);

    logStep("Invoice sent via Stripe", { 
      invoiceId: sentInvoice.id,
      status: sentInvoice.status 
    });

    // Update invoice status in Supabase
    const { error: updateError } = await supabaseClient
      .from("invoices")
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq("id", invoice_id);

    if (updateError) {
      logStep("Warning: Failed to update invoice status", { error: updateError });
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

    logStep("Invoice sent successfully");

    return new Response(JSON.stringify({
      success: true,
      status: sentInvoice.status,
      hosted_invoice_url: sentInvoice.hosted_invoice_url,
      invoice_pdf: sentInvoice.invoice_pdf,
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