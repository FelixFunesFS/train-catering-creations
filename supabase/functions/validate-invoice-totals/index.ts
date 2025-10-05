/**
 * Validate Invoice Totals Edge Function
 * 
 * Runs nightly to validate that invoice totals match line items
 * Automatically fixes discrepancies and logs them for audit
 */

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { TaxCalculationService } from '../_shared/TaxCalculationService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Discrepancy {
  invoice_id: string;
  invoice_number: string;
  database: {
    subtotal: number;
    tax: number;
    total: number;
  };
  calculated: {
    subtotal: number;
    tax: number;
    total: number;
  };
  difference: number;
  isGovContract: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting invoice totals validation...');

    // 1. Get all non-draft invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        subtotal,
        tax_amount,
        total_amount,
        quote_request_id,
        quote_requests!quote_request_id(compliance_level, requires_po_number)
      `)
      .neq('status', 'draft');

    if (invoicesError) throw invoicesError;

    console.log(`📊 Found ${invoices?.length || 0} non-draft invoices to validate`);

    const discrepancies: Discrepancy[] = [];
    const fixed: string[] = [];

    // 2. Validate each invoice
    for (const invoice of invoices || []) {
      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('total_price')
        .eq('invoice_id', invoice.id);

      if (lineItemsError) {
        console.error(`❌ Error fetching line items for invoice ${invoice.id}:`, lineItemsError);
        continue;
      }

      // Calculate actual totals from line items
      const actualSubtotal = lineItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;
      
      const quoteData = invoice.quote_requests as any;
      const isGovContract = 
        quoteData?.compliance_level === 'government' ||
        quoteData?.requires_po_number === true;
      
      const taxCalc = TaxCalculationService.calculateTax(actualSubtotal, isGovContract);

      // 3. Check for mismatch
      if (
        invoice.subtotal !== taxCalc.subtotal ||
        invoice.tax_amount !== taxCalc.taxAmount ||
        invoice.total_amount !== taxCalc.totalAmount
      ) {
        const discrepancy: Discrepancy = {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number || 'N/A',
          database: {
            subtotal: invoice.subtotal,
            tax: invoice.tax_amount,
            total: invoice.total_amount,
          },
          calculated: {
            subtotal: taxCalc.subtotal,
            tax: taxCalc.taxAmount,
            total: taxCalc.totalAmount,
          },
          difference: invoice.total_amount - taxCalc.totalAmount,
          isGovContract,
        };

        discrepancies.push(discrepancy);

        console.log(`⚠️ Discrepancy found in ${invoice.invoice_number}:`, {
          db_total: invoice.total_amount / 100,
          calc_total: taxCalc.totalAmount / 100,
          difference: (invoice.total_amount - taxCalc.totalAmount) / 100,
        });

        // 4. Auto-fix the discrepancy
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            subtotal: taxCalc.subtotal,
            tax_amount: taxCalc.taxAmount,
            total_amount: taxCalc.totalAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoice.id);

        if (updateError) {
          console.error(`❌ Failed to fix invoice ${invoice.id}:`, updateError);
        } else {
          fixed.push(invoice.invoice_number || invoice.id);
          console.log(`✅ Fixed invoice ${invoice.invoice_number}`);

          // Log to audit
          await supabase.from('invoice_audit_log').insert({
            invoice_id: invoice.id,
            field_changed: 'totals_recalculated',
            old_value: discrepancy.database,
            new_value: discrepancy.calculated,
            changed_by: 'validate-invoice-totals-function',
          });
        }
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_invoices_checked: invoices?.length || 0,
      discrepancies_found: discrepancies.length,
      invoices_fixed: fixed.length,
      discrepancies: discrepancies.map((d) => ({
        invoice: d.invoice_number,
        difference_usd: (d.difference / 100).toFixed(2),
        db_total: (d.database.total / 100).toFixed(2),
        calc_total: (d.calculated.total / 100).toFixed(2),
        is_gov_contract: d.isGovContract,
      })),
      fixed_invoices: fixed,
    };

    console.log('✅ Validation complete:', summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('❌ Error in validate-invoice-totals function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
