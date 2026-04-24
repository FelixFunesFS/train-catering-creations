import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const {
      failure_stage,
      form_type,
      contact_name,
      email,
      phone,
      error_message,
      error_details,
      partial_payload,
      session_id,
      url,
    } = body || {};

    if (!failure_stage) {
      return new Response(
        JSON.stringify({ error: "failure_stage is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userAgent = req.headers.get("user-agent") || null;

    const { data, error } = await supabase
      .from("submission_failures")
      .insert([
        {
          failure_stage: String(failure_stage).slice(0, 100),
          form_type: form_type ? String(form_type).slice(0, 50) : null,
          contact_name: contact_name ? String(contact_name).slice(0, 200) : null,
          email: email ? String(email).slice(0, 255).toLowerCase() : null,
          phone: phone ? String(phone).slice(0, 50) : null,
          error_message: error_message ? String(error_message).slice(0, 2000) : null,
          error_details: error_details && typeof error_details === "object" ? error_details : {},
          partial_payload: partial_payload && typeof partial_payload === "object" ? partial_payload : {},
          session_id: session_id ? String(session_id).slice(0, 100) : null,
          user_agent: userAgent,
          url: url ? String(url).slice(0, 500) : null,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("[log-submission-failure] insert failed:", error);
      return new Response(
        JSON.stringify({ error: "Failed to log failure" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fire-and-forget admin notification (debounced inside notifier)
    supabase.functions
      .invoke("notify-submission-failure", { body: { failure_id: data.id } })
      .catch((e) => console.warn("[log-submission-failure] notify error:", e));

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[log-submission-failure] error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
