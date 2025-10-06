import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

// Professional line items generation utilities
const formatMenuDescription = (description: string): string => {
  if (!description) return '';
  
  // Clean up menu descriptions
  return description
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

const generateProfessionalLineItems = (quote: any): any[] => {
  const lineItems: any[] = [];
  
  // Check if we have 2 proteins for meal bundle
  const primaryProtein = Array.isArray(quote.primary_protein) 
    ? quote.primary_protein[0] 
    : quote.primary_protein;
  const secondaryProtein = Array.isArray(quote.secondary_protein) 
    ? quote.secondary_protein[0] 
    : quote.secondary_protein;
    
  const hasTwoProteins = (primaryProtein && secondaryProtein) || quote.both_proteins_available;
  
  if (hasTwoProteins) {
    // Create meal bundle for 2 proteins
    const proteins = [primaryProtein, secondaryProtein].filter(Boolean);
    const sides = Array.isArray(quote.sides) ? quote.sides.slice(0, 2) : [];
    const drinks = Array.isArray(quote.drinks) ? quote.drinks : [];
    
    const proteinText = proteins.map(formatMenuDescription).join(' & ');
    const sidesText = sides.slice(0, 2).map(formatMenuDescription).join(' and ');
    const drinkText = drinks.length > 0 ? formatMenuDescription(drinks[0]) : '';
    
    let description = proteinText;
    if (sidesText) description += ` with ${sidesText}`;
    description += ', dinner rolls';
    if (drinkText) description += ` and ${drinkText}`;
    
    lineItems.push({
      title: 'Entree Meals',
      description: description,
      quantity: quote.guest_count,
      unit_price: 0,
      total_price: 0,
      category: 'meal_bundle'
    });
    
    // Handle extra sides (beyond first 2)
    if (quote.sides && quote.sides.length > 2) {
      const extraSides = quote.sides.slice(2);
      lineItems.push({
        title: extraSides.length > 1 ? 'Additional Sides' : 'Additional Side',
        description: extraSides.map(formatMenuDescription).join(', '),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'side'
      });
    }
  } else {
    // Single protein - handle individually
    if (primaryProtein) {
      lineItems.push({
        title: 'Entree',
        description: formatMenuDescription(primaryProtein),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'protein'
      });
    }
    
    // Add all sides individually for single protein
    quote.sides?.forEach((side: string) => {
      lineItems.push({
        title: 'Side Dish',
        description: formatMenuDescription(side),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'side'
      });
    });
    
    // Add drinks
    quote.drinks?.forEach((drink: string) => {
      lineItems.push({
        title: 'Beverage',
        description: formatMenuDescription(drink),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'drink'
      });
    });
  }
  
  // Add appetizers (grouped if multiple)
  if (quote.appetizers && quote.appetizers.length > 0) {
    const regularAppetizers = quote.appetizers.filter((app: string) => 
      !app.toLowerCase().includes('vegan') && 
      !app.toLowerCase().includes('vegetarian') &&
      !app.toLowerCase().includes('veggie')
    );
    
    if (regularAppetizers.length > 0) {
      lineItems.unshift({
        title: regularAppetizers.length > 1 ? 'Appetizers' : 'Appetizer',
        description: regularAppetizers.map(formatMenuDescription).join(', '),
        quantity: quote.guest_count,
        unit_price: 0,
        total_price: 0,
        category: 'appetizer'
      });
    }
    
    // Add vegan/vegetarian appetizers separately
    const veganVegAppetizers = quote.appetizers.filter((app: string) => 
      app.toLowerCase().includes('vegan') || 
      app.toLowerCase().includes('vegetarian') ||
      app.toLowerCase().includes('veggie')
    );
    
    if (veganVegAppetizers.length > 0) {
      const restrictionCount = Math.max(1, Math.floor(quote.guest_count * 0.1));
      lineItems.unshift({
        title: veganVegAppetizers.length > 1 ? 'Vegan/Vegetarian Appetizers' : 'Vegan/Vegetarian Appetizer',
        description: veganVegAppetizers.map(formatMenuDescription).join(', '),
        quantity: restrictionCount,
        unit_price: 0,
        total_price: 0,
        category: 'appetizer_dietary'
      });
    }
  }
  
  // Add desserts (grouped if multiple)
  if (quote.desserts && quote.desserts.length > 0) {
    lineItems.push({
      title: quote.desserts.length > 1 ? 'Desserts' : 'Dessert',
      description: quote.desserts.map(formatMenuDescription).join(', '),
      quantity: quote.guest_count,
      unit_price: 0,
      total_price: 0,
      category: 'dessert'
    });
  }
  
  // Add service charge
  const serviceTypes: Record<string, string> = {
    'full-service': 'Full Service Catering',
    'delivery-setup': 'Delivery with Setup',
    'drop-off': 'Drop Off Delivery',
    'full_service': 'Full Service Catering',
    'drop_off': 'Drop Off Delivery',
    'drop_off_with_setup': 'Delivery with Setup'
  };
  
  lineItems.push({
    title: 'Service Charge',
    description: serviceTypes[quote.service_type] || 'Catering Service',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    category: 'service'
  });
  
  // Add bussing tables service if full-service and bussing is needed
  if (quote.service_type === 'full-service' && quote.bussing_tables_needed) {
    lineItems.push({
      title: 'Table Bussing Service',
      description: 'Professional table clearing and maintenance during event',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'service_addon'
    });
  }
  
  return lineItems;
};

// Payment scheduling utilities
const detectCustomerType = (email: string): 'PERSON' | 'ORG' | 'GOV' => {
  const govDomains = ['.gov', '.mil', '.state.', '.edu'];
  const normalizedEmail = email.toLowerCase();
  
  if (govDomains.some(domain => normalizedEmail.includes(domain))) {
    return 'GOV';
  }
  
  return 'PERSON';
};

const daysBetween = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const dateMinus = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Calculate pricing from quote data using enhanced logic
    const baseServiceCost = Math.max(quote.guest_count * 2500, 150000); // $25 per person, min $1500
    const subtotal = baseServiceCost;
    const taxRate = 0.08875; // Charleston tax rate
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;
    
    // Detect customer type for payment scheduling
    const customerType = detectCustomerType(quote.email);
    const eventDate = new Date(quote.event_date);
    const approvalDate = new Date();
    const daysOut = daysBetween(approvalDate, eventDate);
    
    console.log(`Customer type: ${customerType}, Days until event: ${daysOut}`);

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        customer_id: customer.id,
        quote_request_id: quote_request_id,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        is_draft: true,
        workflow_status: 'draft',
        currency: 'usd',
        invoice_number: `INV-${Date.now()}-${quote_request_id.split('-')[0]}`,
        notes: `Catering service for ${quote.event_name} on ${quote.event_date}`
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Generate professional line items using actual menu selections
    const professionalLineItems = generateProfessionalLineItems(quote);
    
    // Add invoice_id to each line item and distribute pricing
    const lineItems = professionalLineItems.map((item, index) => {
      // Distribute total cost across line items based on category
      let itemCost = 0;
      
      if (item.category === 'meal_bundle' || item.category === 'protein') {
        // Main meals get 70% of cost
        itemCost = Math.round(baseServiceCost * 0.7);
      } else if (item.category === 'service') {
        // Service charge gets 30% of cost
        itemCost = Math.round(baseServiceCost * 0.3);
      } else {
        // Other items (appetizers, sides, desserts) are included in meal cost
        itemCost = 0;
      }
      
      return {
        invoice_id: invoice.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.quantity > 0 ? Math.round(itemCost / item.quantity) : 0,
        total_price: itemCost,
        category: item.category
      };
    });

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItems);

    if (lineItemsError) throw lineItemsError;

    // Update quote status with enhanced workflow tracking
    await supabase
      .from('quote_requests')
      .update({ 
        status: 'quoted',
        workflow_status: 'estimated',
        estimated_total: totalAmount,
        invoice_status: customerType === 'GOV' ? 'gov_net30' : 'payment_scheduled'
      })
      .eq('id', quote_request_id);
      
    // Log payment schedule info
    console.log(`Payment schedule: ${customerType === 'GOV' ? 'Net 30 after event' : 'Tiered payment system'}`);

    console.log('Invoice generated successfully:', invoice.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice_id: invoice.id,
        total_amount: totalAmount
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