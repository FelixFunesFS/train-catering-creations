import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Fetch active pricing rules
    const { data: pricingRules, error: pricingError } = await supabaseClient
      .from("pricing_rules")
      .select("*")
      .eq("is_active", true);

    if (pricingError) {
      throw new Error("Failed to fetch pricing rules");
    }

    // Generate new line items based on current quote data
    const newLineItems: any[] = [];
    let subtotal = 0;

    // Helper function to find pricing rule
    const findPricingRule = (category: string, itemName: string, serviceType?: string) => {
      let rule = pricingRules?.find(rule => 
        rule.category === category && 
        rule.item_name === itemName &&
        (!rule.service_type || rule.service_type === serviceType)
      );
      
      if (!rule && category === 'protein') {
        rule = pricingRules?.find(rule => 
          rule.category === 'protein' &&
          (rule.item_name.toLowerCase().includes(itemName.toLowerCase()) ||
           itemName.toLowerCase().includes(rule.item_name.toLowerCase())) &&
          (!rule.service_type || rule.service_type === serviceType)
        );
      }
      
      if (!rule) {
        rule = pricingRules?.find(rule => 
          rule.category === category && 
          rule.item_name === itemName
        );
      }
      
      return rule;
    };

    // Add menu items from quote
    const addMenuItems = (items: any[], category: string) => {
      if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => {
          const rule = findPricingRule(category, item, quote.service_type);
          if (rule) {
            const unitPrice = rule.base_price + (rule.price_per_person * quote.guest_count);
            newLineItems.push({
              description: `${item} for ${quote.guest_count} guests`,
              category,
              quantity: 1,
              unit_price: unitPrice,
              total_price: unitPrice,
            });
            subtotal += unitPrice;
          } else {
            // Fallback pricing
            const fallbackPrice = category === 'appetizer' ? 400 : 
                                 category === 'side' ? 250 : 
                                 category === 'dessert' ? 350 : 
                                 category === 'drink' ? 175 : 300;
            const unitPrice = fallbackPrice * quote.guest_count;
            newLineItems.push({
              description: `${item} for ${quote.guest_count} guests`,
              category,
              quantity: 1,
              unit_price: unitPrice,
              total_price: unitPrice,
            });
            subtotal += unitPrice;
          }
        });
      }
    };

    // Add proteins
    if (quote.primary_protein) {
      const rule = findPricingRule('protein', quote.primary_protein, quote.service_type);
      const unitPrice = rule ? (rule.base_price + (rule.price_per_person * quote.guest_count)) : 1200 * quote.guest_count;
      newLineItems.push({
        description: `${quote.primary_protein} (Primary Protein)`,
        category: 'protein',
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice,
      });
      subtotal += unitPrice;
    }

    if (quote.secondary_protein) {
      const rule = findPricingRule('protein', quote.secondary_protein, quote.service_type);
      const unitPrice = rule ? (rule.base_price + (rule.price_per_person * quote.guest_count)) : 1100 * quote.guest_count;
      newLineItems.push({
        description: `${quote.secondary_protein} (Secondary Protein)`,
        category: 'protein',
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice,
      });
      subtotal += unitPrice;
    }

    // Add menu selections
    addMenuItems(quote.appetizers || [], 'appetizer');
    addMenuItems(quote.sides || [], 'side');
    addMenuItems(quote.desserts || [], 'dessert');
    addMenuItems(quote.drinks || [], 'drink');

    // Add service charges and equipment as before...
    const serviceTypeMap: Record<string, string> = {
      'drop-off': 'Drop-off Service',
      'buffet': 'Buffet Service', 
      'plated': 'Plated Service',
      'full-service': 'Full Service'
    };
    
    const serviceName = serviceTypeMap[quote.service_type] || 'Catering Service';
    const serviceRule = findPricingRule('service', serviceName, quote.service_type);
    
    if (serviceRule) {
      const serviceCharge = serviceRule.base_price + (serviceRule.price_per_person * quote.guest_count);
      newLineItems.push({
        description: `${serviceName} for ${quote.guest_count} guests`,
        category: 'service',
        quantity: 1,
        unit_price: serviceCharge,
        total_price: serviceCharge,
      });
      subtotal += serviceCharge;
    }

    const taxRate = 0.08;
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    logStep("Calculated new pricing", { subtotal, taxAmount, totalAmount });

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
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
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
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount
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