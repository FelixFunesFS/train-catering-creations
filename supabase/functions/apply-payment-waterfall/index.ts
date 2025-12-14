import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-WATERFALL] ${step}${detailsStr}`);
};

interface WaterfallRequest {
  invoice_id: string;
  payment_amount_cents: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Received request");

    const { invoice_id, payment_amount_cents }: WaterfallRequest = await req.json();

    if (!invoice_id) {
      throw new Error("invoice_id is required");
    }

    if (!payment_amount_cents || payment_amount_cents <= 0) {
      throw new Error("payment_amount_cents must be positive");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all milestones for this invoice, ordered by due date
    const { data: milestones, error: milestonesError } = await supabase
      .from("payment_milestones")
      .select("*")
      .eq("invoice_id", invoice_id)
      .order("due_date", { ascending: true });

    if (milestonesError) {
      throw new Error(`Failed to fetch milestones: ${milestonesError.message}`);
    }

    if (!milestones || milestones.length === 0) {
      logStep("No milestones found for invoice");
      return new Response(
        JSON.stringify({ success: true, message: "No milestones to update" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Applying waterfall", { 
      paymentAmount: payment_amount_cents, 
      milestoneCount: milestones.length 
    });

    // Get total paid from completed transactions
    const { data: transactions } = await supabase
      .from("payment_transactions")
      .select("amount, status")
      .eq("invoice_id", invoice_id)
      .eq("status", "completed");

    const totalPaidCents = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    logStep("Total paid from transactions", { totalPaidCents });

    // Apply waterfall: mark milestones as paid based on cumulative amount
    let cumulativeRequired = 0;
    const updates: { id: string; status: string }[] = [];

    for (const milestone of milestones) {
      cumulativeRequired += milestone.amount_cents;
      
      if (totalPaidCents >= cumulativeRequired) {
        if (milestone.status !== 'paid') {
          updates.push({ id: milestone.id, status: 'paid' });
        }
      } else if (totalPaidCents > cumulativeRequired - milestone.amount_cents) {
        // Partially paid this milestone
        if (milestone.status !== 'partial') {
          updates.push({ id: milestone.id, status: 'partial' });
        }
      } else {
        // Not yet reached this milestone
        if (milestone.status !== 'pending') {
          updates.push({ id: milestone.id, status: 'pending' });
        }
      }
    }

    logStep("Milestone updates to apply", { updates });

    // Apply updates
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("payment_milestones")
        .update({ status: update.status, updated_at: new Date().toISOString() })
        .eq("id", update.id);

      if (updateError) {
        logStep("Error updating milestone", { id: update.id, error: updateError });
      }
    }

    // Get invoice total to determine overall status
    const { data: invoice } = await supabase
      .from("invoices")
      .select("total_amount, workflow_status")
      .eq("id", invoice_id)
      .single();

    if (invoice) {
      let newStatus = invoice.workflow_status;
      
      if (totalPaidCents >= invoice.total_amount) {
        newStatus = 'paid';
      } else if (totalPaidCents > 0) {
        newStatus = 'partially_paid';
      }

      if (newStatus !== invoice.workflow_status) {
        logStep("Updating invoice status", { from: invoice.workflow_status, to: newStatus });
        
        await supabase
          .from("invoices")
          .update({ 
            workflow_status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            last_status_change: new Date().toISOString()
          })
          .eq("id", invoice_id);
      }
    }

    logStep("Waterfall complete", { 
      totalPaid: totalPaidCents, 
      updatesApplied: updates.length 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalPaid: totalPaidCents,
        milestonesUpdated: updates.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
