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
      event_type,
      form_type,
      session_id,
      step_number,
      step_name,
      field_name,
      time_on_step_seconds,
      total_time_seconds,
      metadata,
      url,
    } = body || {};

    if (!event_type || !session_id) {
      return new Response(
        JSON.stringify({ error: "event_type and session_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userAgent = req.headers.get("user-agent") || null;

    const { error } = await supabase.from("form_analytics_events").insert([
      {
        event_type: String(event_type).slice(0, 100),
        form_type: form_type ? String(form_type).slice(0, 50) : null,
        session_id: String(session_id).slice(0, 100),
        step_number: typeof step_number === "number" ? step_number : null,
        step_name: step_name ? String(step_name).slice(0, 100) : null,
        field_name: field_name ? String(field_name).slice(0, 100) : null,
        time_on_step_seconds: typeof time_on_step_seconds === "number" ? time_on_step_seconds : null,
        total_time_seconds: typeof total_time_seconds === "number" ? total_time_seconds : null,
        metadata: metadata && typeof metadata === "object" ? metadata : {},
        user_agent: userAgent,
        url: url ? String(url).slice(0, 500) : null,
      },
    ]);

    if (error) {
      console.error("[track-analytics] insert failed:", error);
      return new Response(
        JSON.stringify({ error: "Failed to record event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[track-analytics] error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
