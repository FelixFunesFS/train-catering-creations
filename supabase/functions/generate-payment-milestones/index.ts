import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Received request");

    const { invoice_id }: MilestoneRequest = await req.json();

    if (!invoice_id) {
      throw new Error("invoice_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if milestones already exist
    const { data: existingMilestones } = await supabase
      .from("payment_milestones")
      .select("id")
      .eq("invoice_id", invoice_id);

    if (existingMilestones && existingMilestones.length > 0) {
      logStep("Milestones already exist", { count: existingMilestones.length });
      return new Response(
        JSON.stringify({ message: "Milestones already exist", milestones: existingMilestones }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fetch invoice and quote details
    logStep("Fetching invoice data");
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id,
        total_amount,
        quote_request_id,
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

    const quote = invoice.quote_requests;
    const totalAmountCents = invoice.total_amount;
    const eventDate = new Date(quote?.event_date || new Date());
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine customer type
    const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;

    logStep("Calculating schedule", { daysUntilEvent, isGovernment, totalAmountCents });

    const milestones: any[] = [];

    if (isGovernment) {
      // Government: Net 30 after event
      const dueDate = new Date(eventDate);
      dueDate.setDate(dueDate.getDate() + 30);

      milestones.push({
        invoice_id,
        milestone_type: "full_payment",
        percentage: 100,
        amount_cents: totalAmountCents,
        due_date: dueDate.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: true,
        status: "pending",
        description: "Full payment due 30 days after event (Net 30)",
      });
    } else if (daysUntilEvent <= 14) {
      // Rush: 100% due immediately
      milestones.push({
        invoice_id,
        milestone_type: "full_payment",
        percentage: 100,
        amount_cents: totalAmountCents,
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: "pending",
        description: "Full payment due immediately (rush event)",
      });
    } else if (daysUntilEvent <= 30) {
      // Short notice: 60% now, 40% 7 days before
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 7);

      milestones.push({
        invoice_id,
        milestone_type: "deposit",
        percentage: 60,
        amount_cents: Math.round(totalAmountCents * 0.6),
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: "pending",
        description: "60% deposit due now",
      });

      milestones.push({
        invoice_id,
        milestone_type: "final_payment",
        percentage: 40,
        amount_cents: totalAmountCents - Math.round(totalAmountCents * 0.6),
        due_date: finalDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: "pending",
        description: "Final 40% due 7 days before event",
      });
    } else if (daysUntilEvent <= 44) {
      // Mid-range: 60% now, 40% 14 days before
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 14);

      milestones.push({
        invoice_id,
        milestone_type: "deposit",
        percentage: 60,
        amount_cents: Math.round(totalAmountCents * 0.6),
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: "pending",
        description: "60% deposit due now",
      });

      milestones.push({
        invoice_id,
        milestone_type: "final_payment",
        percentage: 40,
        amount_cents: totalAmountCents - Math.round(totalAmountCents * 0.6),
        due_date: finalDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: "pending",
        description: "Final 40% due 14 days before event",
      });
    } else {
      // Standard: 10% now, 50% at 30 days before, 40% at 14 days before
      const midDue = new Date(eventDate);
      midDue.setDate(midDue.getDate() - 30);
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 14);

      const bookingAmount = Math.round(totalAmountCents * 0.1);
      const midAmount = Math.round(totalAmountCents * 0.5);
      const finalAmount = totalAmountCents - bookingAmount - midAmount;

      milestones.push({
        invoice_id,
        milestone_type: "booking_deposit",
        percentage: 10,
        amount_cents: bookingAmount,
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: "pending",
        description: "10% booking deposit due now",
      });

      milestones.push({
        invoice_id,
        milestone_type: "mid_payment",
        percentage: 50,
        amount_cents: midAmount,
        due_date: midDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: "pending",
        description: "50% payment due 30 days before event",
      });

      milestones.push({
        invoice_id,
        milestone_type: "final_payment",
        percentage: 40,
        amount_cents: finalAmount,
        due_date: finalDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: "pending",
        description: "Final 40% due 14 days before event",
      });
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
      JSON.stringify({ success: true, milestones: insertedMilestones }),
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
