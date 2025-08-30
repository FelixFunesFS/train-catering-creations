import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

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

    // Calculate pricing from quote data
    const baseServiceCost = Math.max(quote.guest_count * 2500, 150000); // $25 per person, min $1500
    const subtotal = baseServiceCost;
    const taxRate = 0.08875; // Charleston tax rate
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

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
        status: 'draft',
        currency: 'usd',
        invoice_number: `INV-${Date.now()}-${quote_request_id.split('-')[0]}`,
        notes: `Catering service for ${quote.event_name} on ${quote.event_date}`
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create line items
    const lineItems = [
      {
        invoice_id: invoice.id,
        title: 'Catering Service',
        description: `${quote.service_type} catering for ${quote.guest_count} guests`,
        quantity: quote.guest_count,
        unit_price: Math.round(baseServiceCost / quote.guest_count),
        total_price: baseServiceCost,
        category: 'service'
      }
    ];

    // Add protein items if specified
    if (quote.primary_protein) {
      lineItems.push({
        invoice_id: invoice.id,
        title: 'Primary Protein',
        description: quote.primary_protein,
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        category: 'protein'
      });
    }

    if (quote.secondary_protein) {
      lineItems.push({
        invoice_id: invoice.id,
        title: 'Secondary Protein',
        description: quote.secondary_protein,
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        category: 'protein'
      });
    }

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItems);

    if (lineItemsError) throw lineItemsError;

    // Update quote status
    await supabase
      .from('quote_requests')
      .update({ 
        workflow_status: 'estimated',
        estimated_total: totalAmount,
        invoice_status: 'draft'
      })
      .eq('id', quote_request_id);

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);