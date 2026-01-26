import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApproveEstimateRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: ApproveEstimateRequest = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://train-catering-creations.lovable.app";

    console.log("[approve-estimate] approving token:", token.slice(0, 6) + "...");

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        "id, workflow_status, document_type, quote_request_id, customer_access_token, total_amount, last_status_change, last_customer_interaction"
      )
      .eq("customer_access_token", token)
      .single();

    if (invoiceError || !invoice) {
      console.error("[approve-estimate] invoice lookup failed:", invoiceError);
      return new Response(JSON.stringify({ error: "Invalid or expired link" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const alreadyApproved = [
      "approved",
      "paid",
      "partially_paid",
      "payment_pending",
    ].includes(invoice.workflow_status);

    // Approve estimate (idempotent)
    if (!alreadyApproved) {
      console.log("[approve-estimate] updating invoice status -> approved", {
        invoiceId: invoice.id,
      });

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          workflow_status: "approved",
          document_type: "invoice",
          last_status_change: new Date().toISOString(),
          last_customer_interaction: new Date().toISOString(),
        })
        .eq("id", invoice.id);

      if (updateError) {
        console.error("[approve-estimate] invoice update failed:", updateError);
        throw new Error("Unable to approve estimate");
      }
    } else {
      console.log("[approve-estimate] already approved; continuing", {
        invoiceId: invoice.id,
        workflow_status: invoice.workflow_status,
      });
    }

    // Ensure payment milestones exist (blocking)
    const { data: existingMilestones } = await supabase
      .from("payment_milestones")
      .select("id")
      .eq("invoice_id", invoice.id)
      .limit(1);

    if (!existingMilestones || existingMilestones.length === 0) {
      console.log("[approve-estimate] generating milestones", { invoiceId: invoice.id });
      const { error: milestoneError } = await supabase.functions.invoke(
        "generate-payment-milestones",
        {
          body: { invoice_id: invoice.id },
        }
      );

      if (milestoneError) {
        console.error("[approve-estimate] milestone generation failed:", milestoneError);
        throw new Error("Unable to generate payment schedule");
      }
    }

    // Fetch milestones for email metadata
    const { data: milestonesData } = await supabase
      .from("payment_milestones")
      .select("amount_cents, due_date")
      .eq("invoice_id", invoice.id)
      .order("due_date", { ascending: true });

    const firstMilestone = (milestonesData || [])[0];

    // Send hybrid approval confirmation email (payment CTA + portal link)
    if (invoice.quote_request_id) {
      console.log("[approve-estimate] sending approval confirmation email", {
        quote_request_id: invoice.quote_request_id,
      });

      const { error: emailError } = await supabase.functions.invoke(
        "send-customer-portal-email",
        {
          body: {
            quote_request_id: invoice.quote_request_id,
            type: "approval_confirmation",
            metadata: {
              first_milestone_amount: firstMilestone?.amount_cents,
              first_milestone_due: firstMilestone?.due_date,
            },
          },
        }
      );

      if (emailError) {
        // Non-blocking: approval should still succeed even if email fails.
        console.error("[approve-estimate] approval email failed:", emailError);
      }
    }

	// Same-site only: return a relative URL so the SPA router can handle navigation reliably.
	// (Emails can still construct absolute URLs elsewhere using SITE_URL.)
	const portalUrl = `/estimate?token=${encodeURIComponent(token)}#payment`;

    return new Response(JSON.stringify({ success: true, portalUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[approve-estimate] error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Approval failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
