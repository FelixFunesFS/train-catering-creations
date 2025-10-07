import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('[AUTO-INVOICE] Starting auto-generation scan...');

    // Find quotes without invoices (pending or under_review status)
    const { data: quotesWithoutInvoices, error: queryError } = await supabase
      .from('quote_requests')
      .select('id, event_name, workflow_status')
      .in('workflow_status', ['pending', 'under_review'])
      .is('id', null) // Will be filtered by LEFT JOIN
      .limit(10);

    if (queryError) {
      console.error('[AUTO-INVOICE] Query error:', queryError);
      throw queryError;
    }

    // Better approach: Find all quotes and check which ones don't have invoices
    const { data: allQuotes, error: allQuotesError } = await supabase
      .from('quote_requests')
      .select('id, event_name, workflow_status')
      .in('workflow_status', ['pending', 'under_review'])
      .limit(20);

    if (allQuotesError) throw allQuotesError;

    const processedQuotes = [];
    const errors = [];

    for (const quote of allQuotes || []) {
      try {
        // Check if invoice exists
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('quote_request_id', quote.id)
          .maybeSingle();

        if (existingInvoice) {
          console.log(`[AUTO-INVOICE] Invoice already exists for quote ${quote.id}`);
          continue;
        }

        // Generate invoice
        console.log(`[AUTO-INVOICE] Generating invoice for quote ${quote.id} (${quote.event_name})`);
        
        const { data: newInvoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            quote_request_id: quote.id,
            workflow_status: 'draft',
            is_draft: true,
            document_type: 'estimate',
            subtotal: 0,
            tax_amount: 0,
            total_amount: 0,
            status_changed_by: 'system'
          })
          .select()
          .single();

        if (invoiceError) {
          console.error(`[AUTO-INVOICE] Failed to create invoice for ${quote.id}:`, invoiceError);
          errors.push({ quote_id: quote.id, error: invoiceError.message });
          continue;
        }

        // Generate basic line items from quote
        const lineItems = await generateLineItemsFromQuote(supabase, quote.id, newInvoice.id);
        
        if (lineItems.length > 0) {
          const { error: lineItemsError } = await supabase
            .from('invoice_line_items')
            .insert(lineItems);

          if (lineItemsError) {
            console.error(`[AUTO-INVOICE] Failed to create line items:`, lineItemsError);
          }
        }

        // Update quote status to under_review if it was pending
        if (quote.workflow_status === 'pending') {
          await supabase
            .from('quote_requests')
            .update({ workflow_status: 'under_review' })
            .eq('id', quote.id);
        }

        processedQuotes.push({
          quote_id: quote.id,
          invoice_id: newInvoice.id,
          event_name: quote.event_name
        });

        console.log(`[AUTO-INVOICE] ✅ Successfully created invoice ${newInvoice.id} for quote ${quote.id}`);

      } catch (error: any) {
        console.error(`[AUTO-INVOICE] Error processing quote ${quote.id}:`, error);
        errors.push({ quote_id: quote.id, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedQuotes.length,
        invoices_created: processedQuotes,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[AUTO-INVOICE] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

async function generateLineItemsFromQuote(
  supabase: any,
  quoteId: string,
  invoiceId: string
): Promise<any[]> {
  const { data: quote } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (!quote) return [];

  const lineItems: any[] = [];

  // Add service type as base item
  if (quote.service_type) {
    lineItems.push({
      invoice_id: invoiceId,
      title: `${quote.service_type.charAt(0).toUpperCase() + quote.service_type.slice(1)} Service`,
      description: `Catering service for ${quote.guest_count} guests`,
      category: 'service',
      quantity: 1,
      unit_price: 0, // Admin will price this
      total_price: 0
    });
  }

  // Add proteins
  if (quote.primary_protein) {
    lineItems.push({
      invoice_id: invoiceId,
      title: quote.primary_protein,
      description: 'Primary protein',
      category: 'protein',
      quantity: quote.guest_count,
      unit_price: 0,
      total_price: 0
    });
  }

  if (quote.secondary_protein) {
    lineItems.push({
      invoice_id: invoiceId,
      title: quote.secondary_protein,
      description: 'Secondary protein',
      category: 'protein',
      quantity: quote.guest_count,
      unit_price: 0,
      total_price: 0
    });
  }

  return lineItems;
}

serve(handler);
