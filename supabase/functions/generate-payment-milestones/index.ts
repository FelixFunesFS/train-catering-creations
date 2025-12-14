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
  force_regenerate?: boolean; // If true, delete existing and recreate
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Received request");

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

    // Calculate total already paid from existing milestones
    let totalPaidCents = 0;
    if (existingMilestones && existingMilestones.length > 0) {
      if (!force_regenerate) {
        logStep("Milestones already exist, use force_regenerate to recreate", { count: existingMilestones.length });
        return new Response(
          JSON.stringify({ message: "Milestones already exist", milestones: existingMilestones }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Sum paid milestone amounts before deleting
      for (const m of existingMilestones) {
        if (m.status === 'paid') {
          totalPaidCents += m.amount_cents || 0;
        }
      }

      logStep("Deleting existing milestones for regeneration", { 
        count: existingMilestones.length, 
        totalPaidCents 
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

    logStep("Calculating schedule", { daysUntilEvent, isGovernment, totalAmountCents, totalPaidCents });

    const milestones: any[] = [];

    // Valid milestone_type values: DEPOSIT, MILESTONE, BALANCE, FULL, COMBINED, FINAL
    if (isGovernment) {
      // Government: Net 30 after event
      const dueDate = new Date(eventDate);
      dueDate.setDate(dueDate.getDate() + 30);

      milestones.push({
        invoice_id,
        milestone_type: "FULL",
        percentage: 100,
        amount_cents: totalAmountCents,
        due_date: dueDate.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: true,
        status: totalPaidCents >= totalAmountCents ? "paid" : "pending",
        description: "Full payment due 30 days after event (Net 30)",
      });
    } else if (daysUntilEvent <= 14) {
      // Rush: 100% due immediately
      milestones.push({
        invoice_id,
        milestone_type: "FULL",
        percentage: 100,
        amount_cents: totalAmountCents,
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: totalPaidCents >= totalAmountCents ? "paid" : "pending",
        description: "Full payment due immediately (rush event)",
      });
    } else if (daysUntilEvent <= 30) {
      // Short notice: 60% now, 40% 7 days before
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 7);

      const depositAmount = Math.round(totalAmountCents * 0.6);
      const finalAmount = totalAmountCents - depositAmount;

      // Determine status based on what's been paid
      let depositStatus = "pending";
      let finalStatus = "pending";
      let remainingPaid = totalPaidCents;

      if (remainingPaid >= depositAmount) {
        depositStatus = "paid";
        remainingPaid -= depositAmount;
        if (remainingPaid >= finalAmount) {
          finalStatus = "paid";
        }
      }

      milestones.push({
        invoice_id,
        milestone_type: "DEPOSIT",
        percentage: 60,
        amount_cents: depositAmount,
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: depositStatus,
        description: "60% deposit due now",
      });

      milestones.push({
        invoice_id,
        milestone_type: "FINAL",
        percentage: 40,
        amount_cents: finalAmount,
        due_date: finalDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: finalStatus,
        description: "Final 40% due 7 days before event",
      });
    } else if (daysUntilEvent <= 44) {
      // Mid-range: 60% now, 40% 14 days before
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 14);

      const depositAmount = Math.round(totalAmountCents * 0.6);
      const finalAmount = totalAmountCents - depositAmount;

      let depositStatus = "pending";
      let finalStatus = "pending";
      let remainingPaid = totalPaidCents;

      if (remainingPaid >= depositAmount) {
        depositStatus = "paid";
        remainingPaid -= depositAmount;
        if (remainingPaid >= finalAmount) {
          finalStatus = "paid";
        }
      }

      milestones.push({
        invoice_id,
        milestone_type: "DEPOSIT",
        percentage: 60,
        amount_cents: depositAmount,
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: depositStatus,
        description: "60% deposit due now",
      });

      milestones.push({
        invoice_id,
        milestone_type: "FINAL",
        percentage: 40,
        amount_cents: finalAmount,
        due_date: finalDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: finalStatus,
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

      // Waterfall payment status based on total paid
      let bookingStatus = "pending";
      let midStatus = "pending";
      let finalStatus = "pending";
      let remainingPaid = totalPaidCents;

      if (remainingPaid >= bookingAmount) {
        bookingStatus = "paid";
        remainingPaid -= bookingAmount;
        if (remainingPaid >= midAmount) {
          midStatus = "paid";
          remainingPaid -= midAmount;
          if (remainingPaid >= finalAmount) {
            finalStatus = "paid";
          }
        }
      }

      milestones.push({
        invoice_id,
        milestone_type: "DEPOSIT",
        percentage: 10,
        amount_cents: bookingAmount,
        due_date: now.toISOString().split('T')[0],
        is_due_now: true,
        is_net30: false,
        status: bookingStatus,
        description: "10% booking deposit due now",
      });

      milestones.push({
        invoice_id,
        milestone_type: "MILESTONE",
        percentage: 50,
        amount_cents: midAmount,
        due_date: midDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: midStatus,
        description: "50% payment due 30 days before event",
      });

      milestones.push({
        invoice_id,
        milestone_type: "FINAL",
        percentage: 40,
        amount_cents: finalAmount,
        due_date: finalDue.toISOString().split('T')[0],
        is_due_now: false,
        is_net30: false,
        status: finalStatus,
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
