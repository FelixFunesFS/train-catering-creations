import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-INVOICE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { quote_request_id, manual_overrides } = await req.json();
    if (!quote_request_id) throw new Error("quote_request_id is required");

    logStep("Fetching quote and customer data", { quote_request_id });

    // Fetch quote request and customer data
    const { data: quoteData, error: quoteError } = await supabaseClient
      .from("quote_requests")
      .select("*")
      .eq("id", quote_request_id)
      .single();

    if (quoteError || !quoteData) {
      throw new Error("Quote request not found");
    }

    const { data: customerData, error: customerError } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("quote_request_id", quote_request_id)
      .single();

    if (customerError || !customerData) {
      throw new Error("Customer not found - please create customer first");
    }

    // Fetch pricing rules
    const { data: pricingRules, error: pricingError } = await supabaseClient
      .from("pricing_rules")
      .select("*")
      .eq("is_active", true);

    if (pricingError) {
      throw new Error("Failed to fetch pricing rules");
    }

    logStep("Data fetched successfully", { 
      guestCount: quoteData.guest_count,
      serviceType: quoteData.service_type,
      pricingRulesCount: pricingRules?.length 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Generate line items from quote data without pricing
    const lineItems: any[] = [];
    let subtotal = 0;

    // Helper function to add menu items with descriptions only
    const addMenuItems = (items: any[], category: string) => {
      if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => {
          lineItems.push({
            description: `${item} for ${quoteData.guest_count} guests`,
            category,
            quantity: 1,
            unit_price: 0, // No pricing until manually set
            total_price: 0,
          });
          logStep(`${category} line item added`, { item, pricing: 'manual required' });
        });
      }
    };

    // Add proteins without pricing
    if (quoteData.primary_protein) {
      lineItems.push({
        description: `${quoteData.primary_protein} (Primary Protein) for ${quoteData.guest_count} guests`,
        category: 'protein',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Primary protein added', { protein: quoteData.primary_protein });
    }

    if (quoteData.secondary_protein) {
      lineItems.push({
        description: `${quoteData.secondary_protein} (Secondary Protein) for ${quoteData.guest_count} guests`,
        category: 'protein',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Secondary protein added', { protein: quoteData.secondary_protein });
    }

    // Add all menu selections
    addMenuItems(quoteData.appetizers || [], 'appetizer');
    addMenuItems(quoteData.sides || [], 'side');
    addMenuItems(quoteData.desserts || [], 'dessert');
    addMenuItems(quoteData.drinks || [], 'drink');

    // Add dietary restrictions without pricing
    if (quoteData.dietary_restrictions && Array.isArray(quoteData.dietary_restrictions)) {
      quoteData.dietary_restrictions.forEach((restriction: string) => {
        const restrictionCount = parseInt(quoteData.guest_count_with_restrictions) || Math.ceil(quoteData.guest_count * 0.1);
        lineItems.push({
          description: `${restriction} Option for ${restrictionCount} guests`,
          category: 'dietary',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        });
        logStep("Dietary restriction added", { restriction, restrictionCount });
      });
    }

    // Add wait staff if requested (without pricing)
    if (quoteData.wait_staff_requested) {
      lineItems.push({
        description: `Wait Staff Service for ${quoteData.guest_count} guests`,
        category: 'service',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep("Wait staff service added", { pricing: 'manual required' });
    }

    // Add service charge based on service type (without pricing)
    const serviceTypeMap: Record<string, string> = {
      'drop-off': 'Drop-off Service',
      'buffet': 'Buffet Service', 
      'plated': 'Plated Service',
      'full-service': 'Full Service'
    };
    
    const serviceName = serviceTypeMap[quoteData.service_type] || 'Catering Service';
    lineItems.push({
      description: `${serviceName} for ${quoteData.guest_count} guests`,
      category: 'service',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    });
    logStep("Service charge line item added", { serviceName });

    // Add event details as informational line items
    lineItems.push({
      description: `Event: ${quoteData.event_name} on ${quoteData.event_date}`,
      category: 'event_info',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    });

    if (quoteData.location) {
      lineItems.push({
        description: `Location: ${quoteData.location}`,
        category: 'event_info',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
    }

    if (quoteData.start_time) {
      lineItems.push({
        description: `Service Time: ${quoteData.start_time}${quoteData.serving_start_time ? ` - ${quoteData.serving_start_time}` : ''}`,
        category: 'event_info',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
    }

    // Add equipment rentals without pricing
    if (quoteData.chafers_requested) {
      const chaferQuantity = Math.ceil(quoteData.guest_count / 25); // Estimate 1 chafer per 25 guests
      lineItems.push({
        description: `Chafer Rental (estimated ${chaferQuantity} units needed)`,
        category: 'equipment',
        quantity: chaferQuantity,
        unit_price: 0,
        total_price: 0,
      });
      logStep("Chafer rental added", { estimatedQuantity: chaferQuantity });
    }

    if (quoteData.linens_requested) {
      lineItems.push({
        description: 'Linen Rental',
        category: 'equipment',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep("Linen rental added");
    }

    if (quoteData.tables_chairs_requested) {
      const tableQuantity = Math.ceil(quoteData.guest_count / 8); // Estimate 1 table per 8 guests
      lineItems.push({
        description: `Table & Chair Rental (estimated ${tableQuantity} tables)`,
        category: 'equipment',
        quantity: tableQuantity,
        unit_price: 0,
        total_price: 0,
      });
      logStep("Table rental added", { estimatedQuantity: tableQuantity });
    }

    // Add other equipment requests
    if (quoteData.serving_utensils_requested) {
      lineItems.push({
        description: 'Serving Utensils',
        category: 'equipment',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
    }

    if (quoteData.plates_requested) {
      lineItems.push({
        description: `Plates for ${quoteData.guest_count} guests`,
        category: 'equipment',
        quantity: quoteData.guest_count,
        unit_price: 0,
        total_price: 0,
      });
    }

    if (quoteData.cups_requested) {
      lineItems.push({
        description: `Cups for ${quoteData.guest_count} guests`,
        category: 'equipment',
        quantity: quoteData.guest_count,
        unit_price: 0,
        total_price: 0,
      });
    }

    if (quoteData.napkins_requested) {
      lineItems.push({
        description: `Napkins for ${quoteData.guest_count} guests`,
        category: 'equipment',
        quantity: quoteData.guest_count,
        unit_price: 0,
        total_price: 0,
      });
    }

    if (quoteData.ice_requested) {
      lineItems.push({
        description: 'Ice Service',
        category: 'equipment',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
    }

    // Apply manual overrides if provided (for pricing)
    if (manual_overrides?.line_items) {
      // Replace all line items with manually priced ones
      lineItems.length = 0;
      subtotal = 0;
      
      manual_overrides.line_items.forEach((override: any) => {
        lineItems.push(override);
        subtotal += override.total_price || 0;
      });
      
      logStep("Manual pricing applied", { lineItemsCount: lineItems.length, subtotal });
    }

    if (manual_overrides?.discount) {
      const discount = manual_overrides.discount;
      lineItems.push({
        description: discount.description || 'Discount',
        category: 'discount',
        quantity: 1,
        unit_price: -discount.amount,
        total_price: -discount.amount,
      });
      subtotal -= discount.amount;
    }

    // Calculate tax and total (will be 0 for initial drafts)
    const taxRate = 0.08; // 8% tax rate - make configurable
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    logStep("Calculated pricing", { subtotal, taxAmount, totalAmount, lineItemsCount: lineItems.length });

    // Generate invoice number
    const invoiceNumber = `STE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Only create Stripe invoice if we have pricing (manual overrides)
    let stripeInvoice = null;
    let finalizedInvoice = null;
    
    if (manual_overrides?.line_items && subtotal > 0) {
      // Create Stripe invoice with pricing
      stripeInvoice = await stripe.invoices.create({
        customer: customerData.stripe_customer_id,
        description: `Catering services for ${quoteData.event_name}`,
        metadata: {
          quote_request_id: quote_request_id,
          event_name: quoteData.event_name,
          event_date: quoteData.event_date,
          guest_count: quoteData.guest_count.toString(),
        },
        auto_advance: false, // Manual sending
        collection_method: 'send_invoice',
        days_until_due: 30,
      });

      // Add line items to Stripe invoice
      for (const item of lineItems) {
        if (item.unit_price > 0) { // Only add items with pricing
          await stripe.invoiceItems.create({
            customer: customerData.stripe_customer_id,
            invoice: stripeInvoice.id,
            description: item.description,
            unit_amount: item.unit_price,
            currency: 'usd',
            quantity: item.quantity,
          });
        }
      }

      // Finalize the invoice to make it ready to send
      finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
      logStep("Stripe invoice created with pricing", { invoiceId: stripeInvoice.id, status: finalizedInvoice.status });
    } else {
      logStep("Draft invoice created without Stripe integration", { reason: "no pricing" });
    }

    // Save invoice and line items to Supabase
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from("invoices")
      .insert({
        customer_id: customerData.id,
        quote_request_id: quote_request_id,
        stripe_invoice_id: stripeInvoice?.id || null,
        invoice_number: invoiceNumber,
        status: manual_overrides?.line_items ? 'draft' : 'pending_pricing',
        is_draft: !manual_overrides?.line_items,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        pdf_url: finalizedInvoice?.invoice_pdf || null,
        notes: manual_overrides?.notes,
        draft_data: {
          quote_selections: {
            primary_protein: quoteData.primary_protein,
            secondary_protein: quoteData.secondary_protein,
            appetizers: quoteData.appetizers,
            sides: quoteData.sides,
            desserts: quoteData.desserts,
            drinks: quoteData.drinks,
            dietary_restrictions: quoteData.dietary_restrictions,
            service_type: quoteData.service_type,
            guest_count: quoteData.guest_count,
            equipment_requests: {
              chafers: quoteData.chafers_requested,
              linens: quoteData.linens_requested,
              tables_chairs: quoteData.tables_chairs_requested,
              serving_utensils: quoteData.serving_utensils_requested,
              plates: quoteData.plates_requested,
              cups: quoteData.cups_requested,
              napkins: quoteData.napkins_requested,
              ice: quoteData.ice_requested
            },
            wait_staff: quoteData.wait_staff_requested,
            special_requests: quoteData.special_requests
          }
        }
      })
      .select()
      .single();

    if (invoiceError) {
      throw new Error(`Failed to save invoice: ${invoiceError.message}`);
    }

    // Save line items
    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoice_id: invoiceData.id,
    }));

    const { error: lineItemsError } = await supabaseClient
      .from("invoice_line_items")
      .insert(lineItemsWithInvoiceId);

    if (lineItemsError) {
      throw new Error(`Failed to save line items: ${lineItemsError.message}`);
    }

    // Update quote request with invoice status
    await supabaseClient
      .from("quote_requests")
      .update({
        invoice_status: 'generated',
        estimated_total: totalAmount,
      })
      .eq("id", quote_request_id);

    logStep("Invoice saved successfully", { invoiceId: invoiceData.id });

    return new Response(JSON.stringify({
      success: true,
      invoice_id: invoiceData.id,
      stripe_invoice_id: stripeInvoice?.id || null,
      invoice_number: invoiceNumber,
      total_amount: totalAmount,
      line_items_count: lineItems.length,
      requires_pricing: !manual_overrides?.line_items,
      pdf_url: finalizedInvoice?.invoice_pdf || null,
      hosted_invoice_url: finalizedInvoice?.hosted_invoice_url || null,
      quote_selections_captured: true,
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