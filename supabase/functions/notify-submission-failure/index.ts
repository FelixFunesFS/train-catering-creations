import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "soultrainseatery@gmail.com";
const DEBOUNCE_MINUTES = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { failure_id } = await req.json().catch(() => ({}));
    if (!failure_id) {
      return new Response(JSON.stringify({ error: "failure_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: failure, error } = await supabase
      .from("submission_failures")
      .select("*")
      .eq("id", failure_id)
      .single();

    if (error || !failure) {
      return new Response(JSON.stringify({ error: "Failure not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Debounce: skip if another admin alert was sent in the last 15 minutes
    const since = new Date(Date.now() - DEBOUNCE_MINUTES * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("email_send_log")
      .select("id", { count: "exact", head: true })
      .eq("template_name", "submission_failure_alert")
      .eq("recipient_email", ADMIN_EMAIL)
      .gte("created_at", since);

    if ((count ?? 0) > 0) {
      console.log("[notify-submission-failure] debounced — recent alert exists");
      return new Response(JSON.stringify({ success: true, debounced: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull recent unresolved failures for context
    const { data: recent } = await supabase
      .from("submission_failures")
      .select("id, created_at, contact_name, email, phone, failure_stage, error_message")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentRows = (recent || [])
      .map(
        (r) => `
        <tr>
          <td style="padding:6px 10px;border:1px solid #e5e7eb;">${new Date(r.created_at).toLocaleString()}</td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb;">${escapeHtml(r.contact_name || "—")}</td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb;">${escapeHtml(r.email || "—")}</td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb;">${escapeHtml(r.phone || "—")}</td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb;">${escapeHtml(r.failure_stage)}</td>
        </tr>`
      )
      .join("");

    const siteUrl = Deno.env.get("SITE_URL") || "https://www.soultrainseatery.com";

    const html = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 8px;color:#b91c1c;">Quote Submission Failure Detected</h2>
    <p style="margin:0 0 16px;color:#334155;">A customer attempted to submit a quote request but encountered an error. Their contact info has been captured for manual recovery.</p>

    <h3 style="margin:16px 0 8px;font-size:14px;color:#0f172a;">Latest failure</h3>
    <table style="border-collapse:collapse;font-size:13px;width:100%;">
      <tr><td style="padding:4px 8px;color:#64748b;">Name</td><td style="padding:4px 8px;font-weight:600;">${escapeHtml(failure.contact_name || "—")}</td></tr>
      <tr><td style="padding:4px 8px;color:#64748b;">Email</td><td style="padding:4px 8px;font-weight:600;">${escapeHtml(failure.email || "—")}</td></tr>
      <tr><td style="padding:4px 8px;color:#64748b;">Phone</td><td style="padding:4px 8px;font-weight:600;">${escapeHtml(failure.phone || "—")}</td></tr>
      <tr><td style="padding:4px 8px;color:#64748b;">Stage</td><td style="padding:4px 8px;font-weight:600;">${escapeHtml(failure.failure_stage)}</td></tr>
      <tr><td style="padding:4px 8px;color:#64748b;">Error</td><td style="padding:4px 8px;color:#b91c1c;">${escapeHtml(failure.error_message || "—")}</td></tr>
    </table>

    ${recentRows ? `
    <h3 style="margin:24px 0 8px;font-size:14px;color:#0f172a;">Recent unresolved (last 10)</h3>
    <table style="border-collapse:collapse;font-size:12px;width:100%;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:6px 10px;border:1px solid #e5e7eb;text-align:left;">When</th>
          <th style="padding:6px 10px;border:1px solid #e5e7eb;text-align:left;">Name</th>
          <th style="padding:6px 10px;border:1px solid #e5e7eb;text-align:left;">Email</th>
          <th style="padding:6px 10px;border:1px solid #e5e7eb;text-align:left;">Phone</th>
          <th style="padding:6px 10px;border:1px solid #e5e7eb;text-align:left;">Stage</th>
        </tr>
      </thead>
      <tbody>${recentRows}</tbody>
    </table>` : ""}

    <p style="margin:24px 0 0;">
      <a href="${siteUrl}/admin/submission-failures" style="background:#b91c1c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;display:inline-block;">View in Admin</a>
    </p>
  </div>
</body></html>`;

    // Send via existing SMTP function
    const { error: sendErr } = await supabase.functions.invoke("send-smtp-email", {
      body: {
        to: ADMIN_EMAIL,
        subject: "Quote submission failure detected - manual recovery needed",
        html,
        emailType: "submission_failure_alert",
      },
    });

    if (sendErr) {
      console.error("[notify-submission-failure] send error:", sendErr);
    }

    return new Response(JSON.stringify({ success: true, sent: !sendErr }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[notify-submission-failure] error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
