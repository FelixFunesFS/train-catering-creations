import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { formatDateToString, subtractDaysFromDate } from '../_shared/dateHelpers.ts';
import { planSchedule, splitAmounts } from '../_shared/paymentSchedule.ts';
import { verifyAdminAuth, isInternalRequest } from '../_shared/security.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-MILESTONES] ${step}${detailsStr}`);
};

interface MilestoneRequest {
  invoice_id: string;
  force_regenerate?: boolean; // If true, delete existing and recreate
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Received request");

    // Only admins (or other server functions) may build or rebuild payment plans
    if (!isInternalRequest(req)) {
      const auth = await verifyAdminAuth(req);
      if (!auth.isAdmin) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 });
      }
    }

    const { invoice_id, force_regenerate = false }: MilestoneRequest = await req.json();

    if (!invoice_id) {
      throw new Error("invoice_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check existing milestones
    const { data: existingMilestones } = await supabase
      .from("payment_milestones")
      .select("id, status, amount_cents")
      .eq("invoice_id", invoice_id);

    if (existingMilestones && existingMilestones.length > 0) {
      if (!force_regenerate) {
        logStep("Milestones already exist, use force_regenerate to recreate", { count: existingMilestones.length });
        return new Response(
          JSON.stringify({ message: "Milestones already exist", milestones: existingMilestones }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Safeguard: never erase a plan that has money attached or customer-visible progress
      const { data: moneyRows } = await supabase
        .from("payment_transactions")
        .select("id")
        .eq("invoice_id", invoice_id)
        .in("status", ["completed", "pending", "processing"])
        .limit(1);
      const touched = existingMilestones.some((m: any) => m.status && m.status !== "pending");
      if ((moneyRows && moneyRows.length > 0) || touched) {
        logStep("Regeneration skipped - payments exist", { invoice_id });
        return new Response(
          JSON.stringify({ success: false, skipped: true, reason: "payments_exist",
            message: "This payment plan already has payments, so it was kept as is. Amounts still follow the invoice total.",
            milestones: existingMilestones }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      logStep("Deleting existing milestones for regeneration", { 
        count: existingMilestones.length
      });

      // Delete existing milestones
      const { error: deleteError } = await supabase
        .from("payment_milestones")
        .delete()
        .eq("invoice_id", invoice_id);

      if (deleteError) {
        logStep("Error deleting milestones", { error: deleteError });
        throw new Error(`Failed to delete existing milestones: ${deleteError.message}`);
      }
    }

    // Fetch invoice and quote details
    logStep("Fetching invoice data");
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id,
        total_amount,
        quote_request_id,
        payment_schedule_type,
        quote_requests (
          id,
          email,
          event_date,
          compliance_level,
          requires_po_number
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      logStep("Invoice not found", { error: invoiceError });
      throw new Error("Invoice not found");
    }

    const quote: any = Array.isArray(invoice.quote_requests) ? invoice.quote_requests[0] : invoice.quote_requests;
    const totalAmountCents = invoice.total_amount;
    const eventDate = new Date(quote?.event_date || new Date());
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine customer type
    const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;
    // Net 30 is a separate, admin-selected option (default off). Government = tax exempt only.
    const isNet30 = (invoice as any).payment_schedule_type === 'net30';

    logStep("Calculating schedule", { daysUntilEvent, isGovernment, isNet30, totalAmountCents });

    // Guard: placeholder totals (under $1.00) — skip schedule until real pricing is added
    if (!totalAmountCents || totalAmountCents < 100) {
      logStep("Skipping milestones - placeholder total under $1.00", { totalAmountCents });
      return new Response(
        JSON.stringify({ 
          success: false,
          placeholder: true,
          message: "Add menu items and pricing to generate the payment schedule.",
          milestones: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const milestones: any[] = [];

    // Valid milestone_type values: DEPOSIT, MILESTONE, BALANCE, FULL, COMBINED, FINAL
    if (isNet30) {
      // Net 30 after event (admin-selected only)
      const dueDate = new Date(eventDate);
      dueDate.setDate(dueDate.getDate() + 30);

      milestones.push({
        invoice_id,
        milestone_type: "FULL",
        percentage: 100,
        amount_cents: totalAmountCents,
        due_date: formatDateToString(dueDate),
        is_due_now: false,
        is_net30: true,
        status: "pending",
        description: "Full payment due 30 days after event (Net 30)",
      });
    } else if (daysUntilEvent < 0) {
      // Past event: balance was due on the event date (keeps it in Past-Due, not "Payment Arranged")
      milestones.push({
        invoice_id,
        milestone_type: "FULL",
        percentage: 100,
        amount_cents: totalAmountCents,
        due_date: quote?.event_date || formatDateToString(now),
        is_due_now: true,
        is_net30: false,
        status: "pending",
        description: "Full payment due (event date has passed)",
      });
    } else {
      // Tiers come from the shared plan (10/40/50 with short-notice roll-up)
      const parts = planSchedule(daysUntilEvent);
      const amounts = splitAmounts(totalAmountCents, parts);
      const describe = (type: string, pct: number): string => {
        if (type === "FULL") return "Full payment due immediately (booked within 14 days)";
        if (type === "DEPOSIT" && pct === 50) return "Booking payment (50%) due now - covers the 10% deposit and 40% milestone";
        if (type === "DEPOSIT") return "10% booking deposit due now";
        if (type === "MILESTONE") return "Milestone payment (40%) due 30 days before event - brings total paid to 50%";
        return "Final balance (50%) due 14 days before event";
      };
      parts.forEach((p, i) => {
        const due = p.daysBeforeEvent === null ? now : subtractDaysFromDate(eventDate, p.daysBeforeEvent);
        milestones.push({
          invoice_id, milestone_type: p.type, percentage: p.percentage, amount_cents: amounts[i],
          due_date: formatDateToString(due), is_due_now: p.daysBeforeEvent === null,
          is_net30: false, status: "pending", description: describe(p.type, p.percentage),
        });
      });
    }

    // Before inserting, check for completed transactions to mark milestones as paid
    logStep("Checking for completed transactions to preserve paid status");
    const { data: completedTransactions } = await supabase
      .from("payment_transactions")
      .select("amount, milestone_id")
      .eq("invoice_id", invoice_id)
      .eq("status", "completed");

    const totalPaidFromTransactions = completedTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    logStep("Total paid from transactions", { totalPaidFromTransactions, transactionCount: completedTransactions?.length });

    // Apply waterfall payment logic: mark milestones as paid based on actual transaction amounts
    let remainingPaidAmount = totalPaidFromTransactions;
    for (const milestone of milestones) {
      if (remainingPaidAmount >= milestone.amount_cents) {
        milestone.status = "paid";
        remainingPaidAmount -= milestone.amount_cents;
        logStep("Marking milestone as paid from transactions", { 
          type: milestone.milestone_type, 
          amount: milestone.amount_cents,
          remainingPaidAmount 
        });
      } else {
        break; // Waterfall stops when we can't fully pay a milestone
      }
    }

    logStep("Inserting milestones", { count: milestones.length });

    const { data: insertedMilestones, error: insertError } = await supabase
      .from("payment_milestones")
      .insert(milestones)
      .select();

    if (insertError) {
      logStep("Insert error", { error: insertError });
      throw new Error(`Failed to create milestones: ${insertError.message}`);
    }

    logStep("Milestones created successfully", { count: insertedMilestones?.length });

    return new Response(
      JSON.stringify({ success: true, milestones: insertedMilestones, regenerated: force_regenerate }),
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
