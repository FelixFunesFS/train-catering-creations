import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { TaxCalculationService } from '../_shared/TaxCalculationService.ts';
import { formatDateToString, parseDateString } from '../_shared/dateHelpers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper: format menu item text
const formatMenuDescription = (description: string): string => {
  if (!description) return '';
  return description
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

// Helper: format service type
const formatServiceType = (serviceType: string): string => {
  const serviceTypes: Record<string, string> = {
    'full-service': 'Full Service Catering',
    'delivery-only': 'Delivery Only',
    'delivery-setup': 'Delivery with Setup',
    // Legacy/alias values (older data)
    'drop-off': 'Drop Off Delivery',
    'drop_off': 'Drop Off Delivery',
    'delivery_only': 'Delivery Only',
  };
  return serviceTypes[serviceType] || '';
};

// Helper: label for chafers_requested based on service type
const getChaferSupplyLabel = (serviceType?: string): string => {
  const normalized = (serviceType || '').toLowerCase();
  const isFullService = normalized === 'full-service' || normalized === 'full_service';
  return isFullService ? 'Chafing Dishes with Fuel' : 'Food Warmers with Fuel';
};

// Helper: detect government customer (tax exempt)
const isGovernmentCustomer = (email: string): boolean => {
  const govDomains = ['.gov', '.mil', '.state.'];
  return govDomains.some(domain => email.toLowerCase().includes(domain));
};

// Generate line items using proteins JSONB array - aligned with frontend 5-tier structure
// All items initialize at $0 for manual admin pricing
const generateLineItems = (quote: any): any[] => {
  const lineItems: any[] = [];
  let sortOrder = 10; // Start at 10, increment by 10 for each item
  
  // Get proteins from JSONB array (single source of truth)
  const proteins: string[] = Array.isArray(quote.proteins) ? quote.proteins.filter(Boolean) : [];
  const sides: string[] = Array.isArray(quote.sides) ? quote.sides : [];
  const drinks: string[] = Array.isArray(quote.drinks) ? quote.drinks : [];
  const appetizers: string[] = Array.isArray(quote.appetizers) ? quote.appetizers : [];
  const desserts: string[] = Array.isArray(quote.desserts) ? quote.desserts : [];
  
  // TIER 1: CATERING PACKAGE - Proteins + first 2 sides + rolls + ALL drinks
  if (proteins.length > 0) {
    const proteinText = proteins.map(formatMenuDescription).join(' & ');
    const includedSides = sides.slice(0, 2);
    const sidesText = includedSides.map(formatMenuDescription).join(' and ');
    const drinksText = drinks.map(formatMenuDescription).join(' and ');
    
    let description = proteinText;
    if (sidesText) description += ` with ${sidesText}`;
    description += ', dinner rolls';
    if (drinksText) description += `, ${drinksText}`;
    
    lineItems.push({
      title: `Catering Package`,
      description: description,
      quantity: quote.guest_count,
      unit_price: 0,
      total_price: 0,
      category: 'package',
      sort_order: sortOrder
    });
    sortOrder += 10;
  }
  
  // VEGETARIAN ENTRÉE SELECTION - separate line item for vegetarian guests
  const vegetarianEntrees: string[] = Array.isArray(quote.vegetarian_entrees) ? quote.vegetarian_entrees : [];
  
  if (quote.guest_count_with_restrictions || vegetarianEntrees.length > 0) {
    // Parse count from string like "5 guests" or just "5"
    const vegMatch = quote.guest_count_with_restrictions?.match(/\d+/);
    // Default to 0 if unparseable; if entrees exist but no count, use 1 as minimum
    const vegCount = vegMatch ? parseInt(vegMatch[0]) : (vegetarianEntrees.length > 0 ? 1 : 0);
    
    if (vegCount > 0 || vegetarianEntrees.length > 0) {
      // Build description with selected entrées if available
      let description = '';
      if (vegetarianEntrees.length > 0) {
        description = vegetarianEntrees.map(formatMenuDescription).join(', ');
      } else {
        description = 'Vegetarian meal accommodations';
      }
      
      lineItems.push({
        title: 'Vegetarian Entrée Selection',
        description: description,
        quantity: vegCount > 0 ? vegCount : 1,
        unit_price: 0,
        total_price: 0,
        category: 'dietary',
        sort_order: sortOrder
      });
      sortOrder += 10;
    }
  }
  
  // TIER 2: APPETIZER SELECTION
  if (appetizers.length > 0) {
    const regularAppetizers = appetizers.filter((app: string) => 
      !app.toLowerCase().includes('vegan') && 
      !app.toLowerCase().includes('vegetarian') &&
      !app.toLowerCase().includes('veggie')
    );
    
    if (regularAppetizers.length > 0) {
      lineItems.push({
        title: 'Appetizer Selection',
        description: regularAppetizers.map(formatMenuDescription).join(', '),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'appetizers',
        sort_order: sortOrder
      });
      sortOrder += 10;
    }
    
    // Dietary appetizers separately
    const dietaryAppetizers = appetizers.filter((app: string) => 
      app.toLowerCase().includes('vegan') || 
      app.toLowerCase().includes('vegetarian') ||
      app.toLowerCase().includes('veggie')
    );
    
    if (dietaryAppetizers.length > 0) {
      const restrictionCount = Math.max(1, Math.floor(quote.guest_count * 0.1));
      lineItems.push({
        title: 'Dietary Appetizer Selection',
        description: `${dietaryAppetizers.map(formatMenuDescription).join(', ')} (for guests with dietary restrictions)`,
        quantity: restrictionCount,
        unit_price: 0,
        total_price: 0,
        category: 'appetizers',
        sort_order: sortOrder
      });
      sortOrder += 10;
    }
  }
  
  // TIER 3: ADDITIONAL SIDES (beyond first 2, drinks now in Tier 1)
  const extraSides = sides.slice(2);
  if (extraSides.length > 0) {
    lineItems.push({
      title: 'Additional Side Selection',
      description: extraSides.map(formatMenuDescription).join(', '),
      quantity: quote.guest_count,
      unit_price: 0,
      total_price: 0,
      category: 'sides',
      sort_order: sortOrder
    });
    sortOrder += 10;
  }
  
  // TIER 4: DESSERT SELECTION
  if (desserts.length > 0) {
    lineItems.push({
      title: 'Dessert Selection',
      description: desserts.map(formatMenuDescription).join(', '),
      quantity: quote.guest_count,
      unit_price: 0,
      total_price: 0,
      category: 'desserts',
      sort_order: sortOrder
    });
    sortOrder += 10;
  }
  
  // TIER 5: SERVICE PACKAGE & ADD-ONS
  const serviceTypeLabel = formatServiceType(quote.service_type);
  if (serviceTypeLabel) {
    lineItems.push({
      title: 'Service Package',
      description: serviceTypeLabel,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'service',
      sort_order: sortOrder
    });
    sortOrder += 10;
  }
  
  // Service add-ons
  if (quote.wait_staff_requested) {
    lineItems.push({
      title: 'Wait Staff Service',
      description: 'Professional wait staff for serving and guest assistance',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'service',
      sort_order: sortOrder
    });
    sortOrder += 10;
  }
  
  if (quote.bussing_tables_needed) {
    lineItems.push({
      title: 'Table Bussing Service',
      description: 'Professional table clearing and maintenance during event',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'service',
      sort_order: sortOrder
    });
    sortOrder += 10;
  }
  
  // ceremony_included is deprecated - removed

  if (quote.cocktail_hour) {
    lineItems.push({
      title: 'Cocktail Hour Service',
      description: 'Beverage and appetizer service during cocktail hour',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'service',
      sort_order: sortOrder
    });
    sortOrder += 10;
  }
  
  // Consolidate all supply items into one "Supply & Equipment Package"
  const supplyItems: string[] = [];
  
  if (quote.chafers_requested) supplyItems.push(getChaferSupplyLabel(quote.service_type));
  if (quote.serving_utensils_requested) supplyItems.push('Professional serving utensils');
  if (quote.plates_requested) supplyItems.push('Disposable plates');
  if (quote.cups_requested) supplyItems.push('Disposable cups');
  if (quote.napkins_requested) supplyItems.push('Napkins');
  if (quote.ice_requested) supplyItems.push('Bagged ice');
  
  if (supplyItems.length > 0) {
    lineItems.push({
      title: 'Supply & Equipment Package',
      description: supplyItems.join(', '),
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'supplies',
      sort_order: sortOrder
    });
  }
  
  return lineItems;
};

interface GenerateInvoiceRequest {
  quote_request_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_request_id }: GenerateInvoiceRequest = await req.json();
    
    console.log('Generating invoice for quote:', quote_request_id);

    // Get quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote_request_id)
      .single();

    if (quoteError || !quote) {
      console.error('Quote not found:', quoteError);
      throw new Error('Quote not found');
    }

    // Check if non-draft invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, is_draft')
      .eq('quote_request_id', quote_request_id)
      .eq('is_draft', false)
      .single();

    if (existingInvoice) {
      return new Response(
        JSON.stringify({ 
          error: 'Invoice already exists for this quote',
          invoice_id: existingInvoice.id 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get or create customer
    let customer;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', quote.email)
      .single();

    if (existingCustomer) {
      customer = existingCustomer;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: quote.contact_name,
          email: quote.email,
          phone: quote.phone,
          quote_request_id: quote_request_id
        })
        .select()
        .single();

      if (customerError) throw customerError;
      customer = newCustomer;
    }

    // All line items start at $0 for manual admin pricing
    const subtotal = 0;
    
    // Use TaxCalculationService with correct 9% rate (2% hospitality + 7% service)
    const isGovCustomer = isGovernmentCustomer(quote.email);
    const taxCalculation = TaxCalculationService.calculateTax(subtotal, isGovCustomer);
    
    console.log(`Customer type: ${isGovCustomer ? 'GOV (tax exempt)' : 'Standard'}, Tax rate: ${TaxCalculationService.formatTaxRate()}`);

    // Create invoice with $0 totals (admin will set pricing manually)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        customer_id: customer.id,
        quote_request_id: quote_request_id,
        subtotal: taxCalculation.subtotal,
        tax_amount: taxCalculation.taxAmount,
        total_amount: taxCalculation.totalAmount,
        due_date: formatDateToString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        is_draft: true,
        workflow_status: 'draft',
        currency: 'usd',
        notes: `Catering service for ${quote.event_name} on ${quote.event_date}`
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
      throw invoiceError;
    }

    // Generate line items using proteins JSONB array
    const lineItems = generateLineItems(quote).map(item => ({
      invoice_id: invoice.id,
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unit_price: 0, // All items start at $0 for manual pricing
      total_price: 0,
      category: item.category,
      sort_order: item.sort_order
    }));

    console.log(`Generated ${lineItems.length} line items from quote`);

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItems);

    if (lineItemsError) {
      console.error('Line items error:', lineItemsError);
      throw lineItemsError;
    }

    // Update quote status
    await supabase
      .from('quote_requests')
      .update({ 
        workflow_status: 'estimated',
        estimated_total: 0
      })
      .eq('id', quote_request_id);

    // Generate payment milestones based on days until event
    const eventDate = parseDateString(quote.event_date);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`Days until event: ${daysUntilEvent}, generating payment milestones...`);
    
    // For now, create placeholder milestones at $0 (will be calculated when admin sets prices)
    // Following tier system: Rush (≤14 days) = 100%, Short Notice (15-30) = 60/40, 
    // Mid-Range (31-44) = 60/40, Standard (45+) = 10/40/50
    let milestones: any[] = [];
    
    // Valid milestone_type values: DEPOSIT, MILESTONE, BALANCE, FULL, COMBINED, FINAL
    if (isGovCustomer) {
      // Government: Net 30 (100% due 30 days after event)
      const dueDate = new Date(eventDate);
      dueDate.setDate(dueDate.getDate() + 30);
      milestones = [{
        invoice_id: invoice.id,
        milestone_type: 'FULL',
        percentage: 100,
        amount_cents: 0,
        due_date: formatDateToString(dueDate),
        status: 'pending',
        is_net30: true,
        is_due_now: false,
        description: 'Full payment due Net 30'
      }];
    } else if (daysUntilEvent <= 14) {
      // Rush: 100% now
      milestones = [{
        invoice_id: invoice.id,
        milestone_type: 'FULL',
        percentage: 100,
        amount_cents: 0,
        due_date: formatDateToString(new Date()),
        status: 'pending',
        is_due_now: true,
        description: 'Full payment due immediately (rush booking)'
      }];
    } else if (daysUntilEvent <= 30) {
      // Short Notice: 60% now, 40% 7 days before
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 7);
      milestones = [
        {
          invoice_id: invoice.id,
          milestone_type: 'DEPOSIT',
          percentage: 60,
          amount_cents: 0,
          due_date: formatDateToString(new Date()),
          status: 'pending',
          is_due_now: true,
          description: 'Deposit (60%)'
        },
        {
          invoice_id: invoice.id,
          milestone_type: 'BALANCE',
          percentage: 40,
          amount_cents: 0,
          due_date: formatDateToString(finalDue),
          status: 'pending',
          is_due_now: false,
          description: 'Final balance (40%)'
        }
      ];
    } else if (daysUntilEvent <= 44) {
      // Mid-Range: 60% now, 40% 14 days before
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 14);
      milestones = [
        {
          invoice_id: invoice.id,
          milestone_type: 'DEPOSIT',
          percentage: 60,
          amount_cents: 0,
          due_date: formatDateToString(new Date()),
          status: 'pending',
          is_due_now: true,
          description: 'Deposit (60%)'
        },
        {
          invoice_id: invoice.id,
          milestone_type: 'BALANCE',
          percentage: 40,
          amount_cents: 0,
          due_date: formatDateToString(finalDue),
          status: 'pending',
          is_due_now: false,
          description: 'Final balance (40%)'
        }
      ];
    } else {
      // Standard (45+ days): 10% now, 40% at 30 days before, 50% at 14 days before
      // Cumulative model: deposit (10%) + milestone (40%) = 50% paid by 30 days out
      const midDue = new Date(eventDate);
      midDue.setDate(midDue.getDate() - 30);
      const finalDue = new Date(eventDate);
      finalDue.setDate(finalDue.getDate() - 14);
      milestones = [
        {
          invoice_id: invoice.id,
          milestone_type: 'DEPOSIT',
          percentage: 10,
          amount_cents: 0,
          due_date: formatDateToString(new Date()),
          status: 'pending',
          is_due_now: true,
          description: 'Booking deposit (10%)'
        },
        {
          invoice_id: invoice.id,
          milestone_type: 'MILESTONE',
          percentage: 40,
          amount_cents: 0,
          due_date: formatDateToString(midDue),
          status: 'pending',
          is_due_now: false,
          description: 'Milestone payment (40%) — brings total paid to 50%'
        },
        {
          invoice_id: invoice.id,
          milestone_type: 'BALANCE',
          percentage: 50,
          amount_cents: 0,
          due_date: formatDateToString(finalDue),
          status: 'pending',
          is_due_now: false,
          description: 'Final balance (50%)'
        }
      ];
    }

    const { error: milestoneError } = await supabase
      .from('payment_milestones')
      .insert(milestones);

    if (milestoneError) {
      console.error('Milestone creation error:', milestoneError);
      // Don't throw - milestones are not critical for invoice creation
    } else {
      console.log(`Created ${milestones.length} payment milestones`);
    }

    console.log('Invoice generated successfully:', invoice.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice_id: invoice.id,
        line_items_count: lineItems.length,
        milestones_count: milestones.length,
        is_gov_customer: isGovCustomer
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
