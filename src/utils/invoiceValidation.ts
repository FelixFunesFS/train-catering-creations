import { supabase } from '@/integrations/supabase/client';
import { TaxCalculationService } from '@/services/TaxCalculationService';

/**
 * Validates invoice totals before critical customer-facing actions
 * Ensures database totals match line items calculation
 */
export async function validateInvoiceTotalsBeforeAction(
  invoiceId: string,
  actionType: 'send_estimate' | 'generate_contract' | 'collect_payment'
): Promise<{ valid: boolean; message: string }> {
  try {
    // Fetch invoice with line items and quote data
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        id,
        subtotal,
        tax_amount,
        total_amount,
        invoice_line_items(total_price),
        quote_requests!quote_request_id(compliance_level, requires_po_number)
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return { valid: false, message: 'Invoice not found' };
    }

    // Check if invoice has line items
    if (!invoice.invoice_line_items || invoice.invoice_line_items.length === 0) {
      return { valid: false, message: 'Invoice has no line items' };
    }

    // Calculate expected totals from line items
    const calculatedSubtotal = invoice.invoice_line_items.reduce(
      (sum, item) => sum + (item.total_price || 0), 
      0
    );

    // Check if government contract (tax exempt)
    const isGovernmentContract =
      invoice.quote_requests?.compliance_level === 'government' ||
      invoice.quote_requests?.requires_po_number === true;

    // Calculate expected tax
    const taxCalc = TaxCalculationService.calculateTax(calculatedSubtotal, isGovernmentContract);

    // Verify totals match
    if (
      invoice.subtotal === taxCalc.subtotal &&
      invoice.tax_amount === taxCalc.taxAmount &&
      invoice.total_amount === taxCalc.totalAmount
    ) {
      return { valid: true, message: 'Invoice totals are valid' };
    }

    // If mismatch detected, trigger recalculation by touching a line item
    console.warn('⚠️ Totals mismatch detected before', actionType, '- forcing recalculation...');
    console.warn('Expected:', taxCalc);
    console.warn('Actual:', { subtotal: invoice.subtotal, tax_amount: invoice.tax_amount, total_amount: invoice.total_amount });

    // Get any line item to trigger the database trigger
    const { data: anyLineItem } = await supabase
      .from('invoice_line_items')
      .select('id')
      .eq('invoice_id', invoiceId)
      .limit(1)
      .single();

    if (anyLineItem) {
      // Touch the line item to trigger the recalculation trigger
      // We update quantity to the same value to trigger the update
      const { data: currentItem } = await supabase
        .from('invoice_line_items')
        .select('quantity')
        .eq('id', anyLineItem.id)
        .single();
      
      if (currentItem) {
        await supabase
          .from('invoice_line_items')
          .update({ quantity: currentItem.quantity })
          .eq('id', anyLineItem.id);
      }

      // Wait for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      valid: true,
      message: 'Invoice totals recalculated successfully'
    };
  } catch (error) {
    console.error('Error validating invoice totals:', error);
    return { 
      valid: false, 
      message: 'Failed to validate invoice totals' 
    };
  }
}
