import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createErrorResponse, verifyInvoiceAccess } from "../_shared/security.ts";
import { getDeclineFromSession, translateDeclineCode } from "../_shared/declineTranslator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[GET-PAYMENT-FAILURE] ${step}${detailsStr}`);
};

interface RequestBody {
  session_id?: string;
  invoice_id?: string;
  access_token?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, invoice_id, access_token }: RequestBody = await req.json();

    if (!access_token) {
      return new Response(
        JSON.stringify({ error: "Access token required", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !serviceKey || !stripeKey) {
      throw new Error("Service not configured");
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Resolve invoice from session_id if invoice_id not provided
    let resolvedInvoiceId = invoice_id;
    if (!resolvedInvoiceId && session_id) {
      const { data: tx } = await supabase
        .from("payment_transactions")
        .select("invoice_id")
        .eq("stripe_session_id", session_id)
        .maybeSingle();
      resolvedInvoiceId = tx?.invoice_id;
    }

    if (!resolvedInvoiceId) {
      return new Response(
        JSON.stringify({ error: "Could not locate invoice", code: "NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: customer must hold a valid invoice access token
    const hasAccess = await verifyInvoiceAccess(resolvedInvoiceId, access_token);
    if (!hasAccess) {
      logStep("Access denied for invoice", { resolvedInvoiceId });
      return new Response(
        JSON.stringify({ error: "Invalid or expired access token", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strategy:
    // 1. If we have a session_id, ask Stripe directly for fresh decline data.
    // 2. Otherwise, fall back to the most recent failed/voided tx on this invoice.
    let decline = null;

    if (session_id) {
      decline = await getDeclineFromSession(stripe, session_id);
    }

    if (!decline) {
      const { data: lastFailed } = await supabase
        .from("payment_transactions")
        .select("status, failed_reason, stripe_session_id, updated_at")
        .eq("invoice_id", resolvedInvoiceId)
        .in("status", ["failed", "voided"])
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastFailed?.stripe_session_id) {
        decline = await getDeclineFromSession(stripe, lastFailed.stripe_session_id);
      }

      // If still nothing but we have a stored reason, surface a generic translation
      if (!decline && lastFailed?.failed_reason) {
        // Try to extract a Stripe code from the stored admin reason
        const match = lastFailed.failed_reason.match(/Card declined:\s*([a-z_]+)/i);
        const extractedCode = match ? match[1] : null;
        decline = translateDeclineCode(extractedCode, lastFailed.failed_reason);
      }
    }

    if (!decline) {
      // No decline found = customer probably abandoned the page
      return new Response(
        JSON.stringify({
          customerHeadline: "Payment was canceled",
          customerExplanation:
            "You closed the checkout page before completing the payment. No charge was made to your account.",
          customerActions: [
            "Return to your estimate to try again.",
            "Need help? Call Soul Train's Eatery at (843) 970-0265.",
          ],
          declineCode: null,
          zipMismatch: false,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        customerHeadline: decline.customerHeadline,
        customerExplanation: decline.customerExplanation,
        customerActions: decline.customerActions,
        declineCode: decline.declineCode,
        zipMismatch: decline.zipMismatch,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return createErrorResponse(error, "get-payment-failure-reason", corsHeaders);
  }
});
