import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { TaxCalculationService } from "../_shared/TaxCalculationService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-INVOICE-QUOTE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { invoice_id, quote_id, auto_resolve = false } = await req.json();
    if (!invoice_id || !quote_id) {
      throw new Error("invoice_id and quote_id are required");
    }

    logStep("Fetching invoice and quote data", { invoice_id, quote_id });

    // Fetch current invoice
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found");
    }

    // Fetch current quote
    const { data: quote, error: quoteError } = await supabaseClient
      .from("quote_requests")
      .select("*")
      .eq("id", quote_id)
      .single();

    if (quoteError || !quote) {
      throw new Error("Quote not found");
    }

    // Fetch current line items
    const { data: currentLineItems, error: lineItemsError } = await supabaseClient
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoice_id);

    if (lineItemsError) {
      throw new Error("Failed to fetch current line items");
    }

    logStep("Data fetched successfully", { 
      quoteGuestCount: quote.guest_count,
      serviceType: quote.service_type,
      currentLineItemsCount: currentLineItems?.length 
    });

    // Remove pricing rules dependency - manual pricing only
    logStep("Using manual pricing only - no automatic pricing rules");

    // Generate new line items based on current quote data (structure only)
    const newLineItems: any[] = [];
    let subtotal = 0;

    // Add menu items from quote with zero pricing (manual pricing only)
    const addMenuItems = (items: any[], category: string) => {
      if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => {
          // All items start with zero pricing for manual input
          newLineItems.push({
            description: `${item} for ${quote.guest_count} guests - requires manual pricing`,
            category,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
          });
          // No automatic pricing added to subtotal
        });
      }
    };

    // Add proteins with zero pricing (manual pricing only)
    if (quote.primary_protein) {
      newLineItems.push({
        description: `${quote.primary_protein} (Primary Protein) - requires manual pricing`,
        category: 'protein',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
    }

    if (quote.secondary_protein) {
      newLineItems.push({
        description: `${quote.secondary_protein} (Secondary Protein) - requires manual pricing`,
        category: 'protein',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
    }

    // Add menu selections
    addMenuItems(quote.appetizers || [], 'appetizer');
    addMenuItems(quote.sides || [], 'side');
    addMenuItems(quote.desserts || [], 'dessert');
    addMenuItems(quote.drinks || [], 'drink');

    // Add service charges with zero pricing (manual pricing only)
    const serviceTypeMap: Record<string, string> = {
      'drop-off': 'Drop-off Service',
      'buffet': 'Buffet Service', 
      'plated': 'Plated Service',
      'full-service': 'Full Service'
    };
    
    const serviceName = serviceTypeMap[quote.service_type] || 'Catering Service';
    
    // Always add service with zero pricing for manual input
    newLineItems.push({
      description: `${serviceName} for ${quote.guest_count} guests - requires manual pricing`,
      category: 'service',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    });

    // Check if government contract (tax-exempt)
    const isGovContract = quote.compliance_level === 'government' || quote.requires_po_number === true;
    const taxCalc = TaxCalculationService.calculateTax(subtotal, isGovContract);

    logStep("Generated line items with manual pricing", { 
      itemCount: newLineItems.length, 
      subtotal: taxCalc.subtotal, 
      taxAmount: taxCalc.taxAmount, 
      totalAmount: taxCalc.totalAmount,
      isGovContract,
      note: "Manual pricing required for all items"
    });

    if (auto_resolve) {
      // Delete old line items
      const { error: deleteError } = await supabaseClient
        .from("invoice_line_items")
        .delete()
        .eq("invoice_id", invoice_id);

      if (deleteError) {
        throw new Error("Failed to delete old line items");
      }

      // Insert new line items
      const lineItemsWithInvoiceId = newLineItems.map(item => ({
        ...item,
        invoice_id: invoice_id,
      }));

      const { error: insertError } = await supabaseClient
        .from("invoice_line_items")
        .insert(lineItemsWithInvoiceId);

      if (insertError) {
        throw new Error("Failed to insert new line items");
      }

      // Update invoice totals and sync timestamp
      const { error: updateError } = await supabaseClient
        .from("invoices")
        .update({
          subtotal: taxCalc.subtotal,
          tax_amount: taxCalc.taxAmount,
          total_amount: taxCalc.totalAmount,
          last_quote_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", invoice_id);

      if (updateError) {
        throw new Error("Failed to update invoice");
      }

      logStep("Invoice synced successfully");
    }

    return new Response(JSON.stringify({
      success: true,
      invoice_id: invoice_id,
      changes_applied: auto_resolve,
      new_totals: {
        subtotal: taxCalc.subtotal,
        tax_amount: taxCalc.taxAmount,
        total_amount: taxCalc.totalAmount
      },
      line_items_updated: newLineItems.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});