// Closes open Stripe checkout pages for an invoice after an admin changes its prices,
// so a stale amount can no longer be paid. Never touches in-flight ACH or completed payments.
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyAdminAuth, isInternalRequest } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const VOID_REASON = "Voided: invoice revised by admin";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!isInternalRequest(req)) {
      const auth = await verifyAdminAuth(req);
      if (!auth.isAdmin) return json({ error: "Unauthorized" }, 401);
    }
    const body = await req.json().catch(() => ({}));
    const invoiceId = body?.invoice_id;
    if (typeof invoiceId !== "string" || !UUID.test(invoiceId)) return json({ error: "invoice_id required" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: pending } = await supabase
      .from("payment_transactions")
      .select("id, stripe_session_id")
      .eq("invoice_id", invoiceId)
      .eq("status", "pending")
      .eq("payment_method", "stripe")
      .not("stripe_session_id", "is", null);
    if (!pending?.length) return json({ voided: 0, skipped: 0 });

    const key = Deno.env.get("STRIPE_SECRET_KEY");
    if (!key) return json({ error: "Stripe not configured" }, 500);
    const stripe = new Stripe(key, { apiVersion: "2023-10-16" });

    let voided = 0, skipped = 0;
    for (const tx of pending) {
      try {
        const s = await stripe.checkout.sessions.retrieve(tx.stripe_session_id!, { expand: ["payment_intent"] });
        const pi = s.payment_intent as Stripe.PaymentIntent | null;
        // Money already moving (ACH in flight) or session finished: leave it alone.
        if (s.status !== "open" || (pi && ["processing", "succeeded", "requires_capture"].includes(pi.status))) { skipped++; continue; }
        // Mark first so the resulting checkout.session.expired webhook knows it was intentional.
        await supabase.from("payment_transactions")
          .update({ status: "voided", failed_reason: VOID_REASON, processed_at: new Date().toISOString() })
          .eq("id", tx.id).eq("status", "pending");
        await stripe.checkout.sessions.expire(tx.stripe_session_id!);
        voided++;
      } catch (err) {
        console.log("[EXPIRE-STALE] could not expire", tx.stripe_session_id, err instanceof Error ? err.message : String(err));
        skipped++;
      }
    }

    if (voided > 0) {
      const { data: inv } = await supabase.from("invoices").select("quote_request_id").eq("id", invoiceId).maybeSingle();
      if (inv?.quote_request_id) {
        await supabase.from("quote_request_history").insert({
          quote_request_id: inv.quote_request_id,
          field_name: "payment_link",
          old_value: `${voided} open payment page(s)`,
          new_value: "closed",
          changed_by: "system",
          change_reason: "Prices changed; customer must reopen payment to see the new amount",
        });
      }
    }
    return json({ voided, skipped });
  } catch (err) {
    console.error("[EXPIRE-STALE]", err);
    return json({ error: "Internal error" }, 500);
  }
});
