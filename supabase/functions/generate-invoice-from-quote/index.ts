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

    // Calculate line items from quote data
    const lineItems: any[] = [];
    let subtotal = 0;

    // Helper function to find pricing rule
    const findPricingRule = (category: string, itemName: string, serviceType?: string) => {
      // First try exact match
      let rule = pricingRules?.find(rule => 
        rule.category === category && 
        rule.item_name === itemName &&
        (!rule.service_type || rule.service_type === serviceType)
      );
      
      // If no exact match, try flexible matching for proteins
      if (!rule && category === 'protein') {
        rule = pricingRules?.find(rule => 
          rule.category === 'protein' &&
          (rule.item_name.toLowerCase().includes(itemName.toLowerCase()) ||
           itemName.toLowerCase().includes(rule.item_name.toLowerCase())) &&
          (!rule.service_type || rule.service_type === serviceType)
        );
      }
      
      // If still no match, try without service type constraint
      if (!rule) {
        rule = pricingRules?.find(rule => 
          rule.category === category && 
          rule.item_name === itemName
        );
      }
      
      return rule;
    };

    // Add proteins
    if (quoteData.primary_protein) {
      const rule = findPricingRule('protein', quoteData.primary_protein, quoteData.service_type);
      const unitPrice = rule ? (rule.base_price + (rule.price_per_person * quoteData.guest_count)) : 1200 * quoteData.guest_count;
      lineItems.push({
        description: `${quoteData.primary_protein} (Primary Protein)`,
        category: 'protein',
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice,
      });
      subtotal += unitPrice;
    }

    if (quoteData.secondary_protein) {
      const rule = findPricingRule('protein', quoteData.secondary_protein, quoteData.service_type);
      const unitPrice = rule ? (rule.base_price + (rule.price_per_person * quoteData.guest_count)) : 1100 * quoteData.guest_count;
      lineItems.push({
        description: `${quoteData.secondary_protein} (Secondary Protein)`,
        category: 'protein',
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice,
      });
      subtotal += unitPrice;
    }

    // Add service charge based on service type mapping
    const serviceTypeMap: Record<string, string> = {
      'drop-off': 'Drop-off Service',
      'buffet': 'Buffet Service', 
      'plated': 'Plated Service',
      'full-service': 'Full Service'
    };
    
    const serviceName = serviceTypeMap[quoteData.service_type] || 'Catering Service';
    const serviceRule = findPricingRule('service', serviceName, quoteData.service_type);
    
    if (serviceRule) {
      const serviceCharge = serviceRule.base_price + (serviceRule.price_per_person * quoteData.guest_count);
      lineItems.push({
        description: `${serviceName} for ${quoteData.guest_count} guests`,
        category: 'service',
        quantity: 1,
        unit_price: serviceCharge,
        total_price: serviceCharge,
      });
      subtotal += serviceCharge;
      logStep("Service charge applied", { serviceName, serviceCharge });
    } else {
      // Fallback pricing if no rule found
      const fallbackCharge = quoteData.guest_count * 500; // $5 per person fallback
      lineItems.push({
        description: `${serviceName} for ${quoteData.guest_count} guests`,
        category: 'service',
        quantity: 1,
        unit_price: fallbackCharge,
        total_price: fallbackCharge,
      });
      subtotal += fallbackCharge;
      logStep("Fallback service charge applied", { serviceName, fallbackCharge });
    }

    // Add equipment rentals
    if (quoteData.chafers_requested) {
      const chaferRule = findPricingRule('equipment', 'Chafer Rental');
      const chaferCost = chaferRule?.base_price || 2500;
      const chaferQuantity = Math.ceil(quoteData.guest_count / 25); // Estimate 1 chafer per 25 guests
      lineItems.push({
        description: `Chafer Rental (${chaferQuantity} units)`,
        category: 'equipment',
        quantity: chaferQuantity,
        unit_price: chaferCost,
        total_price: chaferCost * chaferQuantity,
      });
      subtotal += chaferCost * chaferQuantity;
    }

    if (quoteData.linens_requested) {
      const linenRule = findPricingRule('equipment', 'Linen Rental');
      const linenCost = linenRule?.base_price || 1500;
      lineItems.push({
        description: 'Linen Rental',
        category: 'equipment',
        quantity: 1,
        unit_price: linenCost,
        total_price: linenCost,
      });
      subtotal += linenCost;
    }

    if (quoteData.tables_chairs_requested) {
      const tableRule = findPricingRule('equipment', 'Table Rental');
      const tableCost = tableRule?.base_price || 1000;
      const tableQuantity = Math.ceil(quoteData.guest_count / 8); // Estimate 1 table per 8 guests
      lineItems.push({
        description: `Table Rental (${tableQuantity} tables)`,
        category: 'equipment',
        quantity: tableQuantity,
        unit_price: tableCost,
        total_price: tableCost * tableQuantity,
      });
      subtotal += tableCost * tableQuantity;
    }

    // Apply manual overrides if provided
    if (manual_overrides?.line_items) {
      manual_overrides.line_items.forEach((override: any) => {
        const existingIndex = lineItems.findIndex(item => item.description === override.description);
        if (existingIndex >= 0) {
          // Update existing item
          subtotal -= lineItems[existingIndex].total_price;
          lineItems[existingIndex] = { ...lineItems[existingIndex], ...override };
          subtotal += override.total_price;
        } else {
          // Add new item
          lineItems.push(override);
          subtotal += override.total_price;
        }
      });
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

    const taxRate = 0.08; // 8% tax rate - make configurable
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    logStep("Calculated pricing", { subtotal, taxAmount, totalAmount, lineItemsCount: lineItems.length });

    // Generate invoice number
    const invoiceNumber = `STE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
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
      await stripe.invoiceItems.create({
        customer: customerData.stripe_customer_id,
        invoice: stripeInvoice.id,
        description: item.description,
        unit_amount: item.unit_price,
        currency: 'usd',
        quantity: item.quantity,
      });
    }

    // Finalize the invoice to make it ready to send
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    logStep("Stripe invoice created", { invoiceId: stripeInvoice.id, status: finalizedInvoice.status });

    // Save invoice and line items to Supabase
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from("invoices")
      .insert({
        customer_id: customerData.id,
        quote_request_id: quote_request_id,
        stripe_invoice_id: stripeInvoice.id,
        invoice_number: invoiceNumber,
        status: 'draft',
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        pdf_url: finalizedInvoice.invoice_pdf,
        notes: manual_overrides?.notes,
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
      stripe_invoice_id: stripeInvoice.id,
      invoice_number: invoiceNumber,
      total_amount: totalAmount,
      pdf_url: finalizedInvoice.invoice_pdf,
      hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
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