import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoInvoiceRequest {
  quote_request_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_request_id }: AutoInvoiceRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Fetch quote request details
    const { data: quoteRequest, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote_request_id)
      .single();

    if (quoteError) throw quoteError;

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('quote_request_id', quote_request_id)
      .single();

    if (existingInvoice) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invoice already exists for this quote request',
          invoice_id: existingInvoice.id
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate line items using the same logic from frontend
    const lineItems = generateLineItemsFromQuote(quoteRequest);

    // Create draft invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote_request_id,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        workflow_status: 'draft',
        document_type: 'estimate',
        is_draft: true
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create line items
    const lineItemsData = lineItems.map(item => ({
      invoice_id: invoice.id,
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unit_price: 0, // Start with $0 for admin pricing
      total_price: 0,
      category: item.category
    }));

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsData);

    if (lineItemsError) throw lineItemsError;

    // Update quote request status
    await supabase
      .from('quote_requests')
      .update({ workflow_status: 'under_review' })
      .eq('id', quote_request_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice_id: invoice.id,
        line_items_count: lineItems.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error auto-generating invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

// Simplified line item generation
function generateLineItemsFromQuote(quote: any): Array<{
  title: string;
  description: string;
  quantity: number;
  category: string;
}> {
  const items = [];

  // Main meal bundle
  if (quote.proteins && Array.isArray(quote.proteins) && quote.proteins.length > 0) {
    const proteinDesc = quote.both_proteins_available && quote.proteins.length === 2
      ? `${quote.proteins.join(' & ')} (both proteins served to all guests)`
      : quote.proteins.join(' & ');
    
    items.push({
      title: `${quote.proteins.join(' & ')} Meal Package`,
      description: `Includes ${proteinDesc} with choice of sides for ${quote.guest_count} guests`,
      quantity: quote.guest_count,
      category: 'entree'
    });
  }

  // Appetizers
  if (quote.appetizers && quote.appetizers.length > 0) {
    items.push({
      title: 'Appetizer Selection',
      description: `${quote.appetizers.join(', ')} for ${quote.guest_count} guests`,
      quantity: 1,
      category: 'appetizer'
    });
  }

  // Desserts
  if (quote.desserts && quote.desserts.length > 0) {
    items.push({
      title: 'Dessert Selection',
      description: `${quote.desserts.join(', ')} for ${quote.guest_count} guests`,
      quantity: 1,
      category: 'dessert'
    });
  }

  // Service charge
  if (quote.service_type !== 'pickup') {
    items.push({
      title: 'Service Charge',
      description: `${quote.service_type} service for ${quote.guest_count} guests`,
      quantity: 1,
      category: 'service'
    });
  }

  return items;
}

serve(handler);