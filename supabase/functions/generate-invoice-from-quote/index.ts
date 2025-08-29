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

    // Helper functions for NLP text conversion
    const convertMenuIdToReadableText = (menuId: string): string => {
      if (!menuId) return '';
      
      const conversions: Record<string, string> = {
        'fried-chicken': 'Fried Chicken', 'baked-chicken': 'Baked Chicken', 'grilled-chicken': 'Grilled Chicken',
        'chicken-alfredo': 'Chicken Alfredo', 'bbq-chicken': 'BBQ Chicken', 'chicken-tenders': 'Chicken Tenders',
        'black-bean-burgers': 'Black Bean Burgers', 'turkey-breast': 'Turkey Breast', 'ham-glazed': 'Glazed Ham',
        'pork-ribs': 'Pork Ribs', 'beef-brisket': 'Beef Brisket', 'pulled-pork': 'Pulled Pork',
        'mac-and-cheese': 'Mac & Cheese', 'mashed-potatoes-gravy': 'Mashed Potatoes with Gravy',
        'green-beans': 'Green Beans', 'collard-greens': 'Collard Greens', 'corn-on-cob': 'Corn on the Cob',
        'black-eyed-peas': 'Black-Eyed Peas', 'cornbread': 'Cornbread', 'dinner-rolls': 'Dinner Rolls',
        'chicken-sliders': 'Chicken Sliders', 'meatballs': 'Meatballs', 'deviled-eggs': 'Deviled Eggs',
        'vanilla-cake': 'Vanilla Cake', 'chocolate-cake': 'Chocolate Cake', 'cheesecake': 'Cheesecake',
        'sweet-tea': 'Sweet Tea', 'lemonade': 'Fresh Lemonade', 'water': 'Water', 'coffee': 'Coffee',
        'vegetarian': 'Vegetarian', 'vegan': 'Vegan', 'gluten-free': 'Gluten-Free'
      };

      return conversions[menuId] || menuId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const createMealBundleDescription = (proteins: string[], sides: string[], drinks: string[], guestCount: number): string => {
      const proteinText = proteins.map(convertMenuIdToReadableText).join(' & ');
      const sidesText = sides.slice(0, 2).map(convertMenuIdToReadableText).join(' and ');
      const drinkText = drinks.length > 0 ? convertMenuIdToReadableText(drinks[0]) : '';
      
      let description = `Meal Package: ${proteinText}`;
      if (sidesText) description += ` with ${sidesText}`;
      description += ', dinner rolls';
      if (drinkText) description += ` and ${drinkText}`;
      description += ` for ${guestCount} guests`;
      
      return description;
    };

    // Generate intelligent line items from quote data
    const lineItems: any[] = [];
    let subtotal = 0;

    // 1. MEALS - Bundle primary proteins, sides, rolls, and drinks
    const proteins: string[] = [];
    if (quoteData.primary_protein) proteins.push(quoteData.primary_protein);
    if (quoteData.secondary_protein) proteins.push(quoteData.secondary_protein);
    
    const sides = quoteData.sides || [];
    const drinks = quoteData.drinks || [];
    
    if (proteins.length > 0) {
      lineItems.push({
        description: createMealBundleDescription(proteins, sides.slice(0, 2), drinks.slice(0, 1), quoteData.guest_count),
        category: 'meal',
        quantity: quoteData.guest_count,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Meal package created', { proteins: proteins.join(', '), sides: sides.slice(0, 2).join(', ') });
    }

    // 2. APPETIZERS - If any appetizers selected
    if (quoteData.appetizers && Array.isArray(quoteData.appetizers) && quoteData.appetizers.length > 0) {
      const appetizerText = quoteData.appetizers.map(convertMenuIdToReadableText).join(', ');
      lineItems.push({
        description: `Appetizers: ${appetizerText} for ${quoteData.guest_count} guests`,
        category: 'appetizer',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Appetizers added', { items: appetizerText });
    }

    // 3. ADDITIONAL SIDES - If more than 2 sides selected
    if (sides.length > 2) {
      const additionalSides = sides.slice(2);
      const sidesText = additionalSides.map(convertMenuIdToReadableText).join(', ');
      lineItems.push({
        description: `Additional Sides: ${sidesText} for ${quoteData.guest_count} guests`,
        category: 'side',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Additional sides added', { items: sidesText });
    }

    // 4. DESSERTS - If any desserts selected
    if (quoteData.desserts && Array.isArray(quoteData.desserts) && quoteData.desserts.length > 0) {
      const dessertText = quoteData.desserts.map(convertMenuIdToReadableText).join(', ');
      lineItems.push({
        description: `Desserts: ${dessertText} for ${quoteData.guest_count} guests`,
        category: 'dessert',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Desserts added', { items: dessertText });
    }

    // 5. ADDITIONAL BEVERAGES - If more than 1 drink selected
    if (drinks.length > 1) {
      const additionalDrinks = drinks.slice(1);
      const drinksText = additionalDrinks.map(convertMenuIdToReadableText).join(', ');
      lineItems.push({
        description: `Additional Beverages: ${drinksText} for ${quoteData.guest_count} guests`,
        category: 'drink',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Additional beverages added', { items: drinksText });
    }

    // 6. DIETARY RESTRICTIONS - As separate accommodations
    if (quoteData.dietary_restrictions && Array.isArray(quoteData.dietary_restrictions) && quoteData.dietary_restrictions.length > 0) {
      const restrictionCount = parseInt(quoteData.guest_count_with_restrictions) || Math.ceil(quoteData.guest_count * 0.1);
      const restrictionsText = quoteData.dietary_restrictions.map(convertMenuIdToReadableText).join(', ');
      lineItems.push({
        description: `Dietary Accommodations: ${restrictionsText} options for ${restrictionCount} guests`,
        category: 'dietary',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Dietary accommodations added', { restrictions: restrictionsText, count: restrictionCount });
    }

    // 7. SERVICE - Combined service offering
    const serviceTypeMap: Record<string, string> = {
      'drop-off': 'Drop-off Service',
      'buffet': 'Buffet Service', 
      'plated': 'Plated Service',
      'full-service': 'Full Service'
    };
    
    const serviceName = serviceTypeMap[quoteData.service_type] || 'Catering Service';
    let serviceDescription = serviceName;
    
    if (quoteData.wait_staff_requested) {
      serviceDescription = `${serviceName} with Professional Wait Staff`;
    }
    
    lineItems.push({
      description: `${serviceDescription} for ${quoteData.guest_count} guests`,
      category: 'service',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    });
    logStep('Service added', { service: serviceDescription });

    // 8. EQUIPMENT RENTALS - Bundled together
    const equipment: string[] = [];
    let equipmentQuantities: any = {};
    
    if (quoteData.chafers_requested) {
      const chaferQty = Math.ceil(quoteData.guest_count / 25);
      equipment.push(`${chaferQty} chafing dishes`);
      equipmentQuantities.chafers = chaferQty;
    }
    if (quoteData.linens_requested) equipment.push('table linens');
    if (quoteData.tables_chairs_requested) {
      const tableQty = Math.ceil(quoteData.guest_count / 8);
      equipment.push(`${tableQty} tables & chairs`);
      equipmentQuantities.tables = tableQty;
    }
    if (quoteData.serving_utensils_requested) equipment.push('serving utensils');
    if (quoteData.plates_requested) equipment.push('disposable plates');
    if (quoteData.cups_requested) equipment.push('disposable cups');
    if (quoteData.napkins_requested) equipment.push('napkins');
    if (quoteData.ice_requested) equipment.push('ice service');
    
    if (equipment.length > 0) {
      const equipmentText = equipment.length === 1 ? equipment[0] : 
        equipment.length === 2 ? equipment.join(' and ') :
        equipment.slice(0, -1).join(', ') + ', and ' + equipment[equipment.length - 1];
      
      lineItems.push({
        description: `Equipment Rental: ${equipmentText.charAt(0).toUpperCase() + equipmentText.slice(1)}`,
        category: 'equipment',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
      logStep('Equipment rental added', { items: equipmentText });
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
      subtotal: subtotal,
      tax_amount: taxAmount,
      line_items: lineItems, // Return the generated line items
      line_items_count: lineItems.length,
      requires_pricing: !manual_overrides?.line_items,
      pdf_url: finalizedInvoice?.invoice_pdf || null,
      hosted_invoice_url: finalizedInvoice?.hosted_invoice_url || null,
      quote_selections_captured: true,
      status: manual_overrides?.line_items ? 'draft' : 'pending_pricing',
      is_draft: !manual_overrides?.line_items,
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