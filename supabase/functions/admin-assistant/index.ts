import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import { verifyAdminAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const DEVELOPER_EMAIL = "envision@mkqconsulting.com";
const MODEL = "openai/gpt-6-astra";

const SYSTEM_PROMPT = `You are the Soul Train's Eatery Admin Assistant, a warm, plain-spoken helper for the family-run Charleston Lowcountry catering team using their admin dashboard. Many users are not technical. Give short, step-by-step answers that name the buttons they will tap. Never invent features; if unsure, say so and suggest "Send to Developer".

Business rules (authoritative):
- Payment schedule: 10% booking deposit at approval, 40% milestone due 30 days before the event, 50% balance due 14 days before. Booked 14 days or less before the event: 100% due now ("Full Payment Due").
- Quotes are valid 7 days. Cancellation: 14+ days out keeps the deposit; 8-14 days owes 50%; under 7 days owes 100%.
- Standard 9% tax. Government Contract tax exemption is ONLY applied when an admin manually turns it on. Military events are NOT automatically tax-exempt.
- Net 30 terms are OFF by default and only applied by an admin toggle. Government status alone never applies Net 30.
- Documents: before approval = "Catering Quote"; approved with balance = "Catering Invoice"; paid = "Receipt (Paid in Full)". Unapproved quotes are never "Overdue".
- Automated payment and event reminder emails are currently turned OFF. Reminders are sent manually with the amber "Remind" / "Send Reminder" button, which shows a preview first. Thank-you emails are always manual.
- Past-Due Balances card only lists approved events whose event date or payment due date has passed and still owe money.

How-to:
- Take a payment by phone: Events list > green "Pay" (or "Take Payment" on the event) > "Stripe (Card / ACH)" tab to type the card into the secure Stripe form, or "Record Payment" for cash, check, bank transfer, ACH direct debit (requires written authorization checkbox), WaveApp, etc. Uncheck "Send confirmation email" for old payments already receipted elsewhere (e.g. WaveApp). Opening the payment window changes nothing until a payment actually succeeds or is recorded.
- Agreed new payment date: open the event > payment schedule > "Change date" next to the unpaid payment, or log a call and set the next due date. This clears the Overdue flag until the new date.
- Log a call/text/note: event page > "Log Call / Note". Pauses follow-ups 7 days.
- Repeat or phone customer: Events > "+ New Event" > search name/phone/email to autofill > fill event basics > save, then finish menu and pricing on the event page.
- Cancel a stale or never-approved quote: event > Cancel Event (no email is sent to the customer; record stays under Cancelled).
- Guest count: package quantity plus vegetarian portions make up the total guests; use the guest count sync on the estimate so invoices, emails and PDFs agree.
- Customer portal link: copy it from the event/billing view ("Copy portal link").
- Sorting: Events list defaults to event date; use Sort (or the Filters button on phones) to sort by submission date. Past fully paid events are under "Show past events".

If the request needs a code change, a bug investigation, a new feature, or anything you cannot confirm, tell the user to tap "Send to Developer" so the conversation is emailed to the developer at ${DEVELOPER_EMAIL}.`;

type Msg = { role: "user" | "assistant"; content: string };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await verifyAdminAuth(req);
  if (!auth.isAdmin) {
    return new Response(JSON.stringify({ error: "Admins only" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { action?: string; messages?: Msg[]; intent?: string; page?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));

  // ---------- Escalate to developer ----------
  if (body.action === "escalate") {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: userData } = await admin.auth.admin.getUserById(auth.userId!);
    const requester = userData?.user?.email ?? "unknown admin";
    const intent = (body.intent ?? "").slice(0, 4000);
    const transcript = messages
      .map(
        (m) =>
          `<div style="margin:0 0 12px"><strong>${m.role === "user" ? "Admin" : "Assistant"}:</strong><br/>${esc(m.content).replace(/\n/g, "<br/>")}</div>`,
      )
      .join("");
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
<h2 style="margin:0 0 8px">Admin Assistant - Developer Request</h2>
<p><strong>From:</strong> ${esc(requester)}<br/><strong>Page:</strong> ${esc(body.page ?? "")}<br/><strong>Sent:</strong> ${new Date().toISOString()}</p>
<h3 style="margin:16px 0 4px">What they need</h3><p>${esc(intent || "(not provided)").replace(/\n/g, "<br/>")}</p>
<h3 style="margin:16px 0 4px">Conversation</h3>${transcript || "<p>(no conversation)</p>"}
</div>`;
    const { error } = await admin.functions.invoke("send-smtp-email", {
      body: {
        to: DEVELOPER_EMAIL,
        subject: "Soul Trains Eatery - Admin Assistant Request",
        html,
        replyTo: requester.includes("@") ? requester : undefined,
        emailType: "admin_assistant_escalation",
      },
    });
    if (error) {
      console.error("[admin-assistant] escalation failed", error);
      return new Response(JSON.stringify({ error: "Could not send the email. Please try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---------- Chat (streamed plain text) ----------
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Assistant is not configured yet." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: req.signal,
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: SYSTEM_PROMPT + (body.page ? `\n\nThe admin is currently on page: ${body.page}` : ""),
        input: messages,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
      }),
    });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    throw e;
  }

  if (!upstream.ok || !upstream.body) {
    let message = "The assistant is unavailable right now.";
    try {
      const j = await upstream.json();
      message = j?.error?.message ?? j?.message ?? message;
    } catch { /* ignore */ }
    if (upstream.status === 402) message = "AI credits have run out. Add credits in Settings > Plans & credits.";
    if (upstream.status === 429) message = "Too many requests right now. Please wait a moment and try again.";
    return new Response(JSON.stringify({ error: message }), {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt.type === "response.output_text.delta" && evt.delta) {
              controller.enqueue(encoder.encode(evt.delta));
            } else if (evt.type === "response.failed" || evt.type === "error") {
              controller.enqueue(encoder.encode("\n\n_Sorry, something went wrong. Try again or tap Send to Developer._"));
            }
          } catch { /* partial line */ }
        }
      },
    }),
  );

  const headers = new Headers({ ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" });
  const runId = upstream.headers.get("X-Lovable-AIG-Run-ID");
  if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
  return new Response(stream, { headers });
});
