/**
 * Invoice Totals Recalculation Service
 * 
 * Single source of truth for keeping invoice.subtotal, invoice.tax_amount, 
 * and invoice.total_amount in sync with invoice_line_items.
 * 
 * This service ensures that:
 * 1. Database fields match calculated values from line items
 * 2. Government contracts receive tax exemption
 * 3. All recalculations use TaxCalculationService
 * 4. Changes are logged for audit trail
 */

import { supabase } from '@/integrations/supabase/client';
import { TaxCalculationService } from './TaxCalculationService';

export class InvoiceTotalsRecalculator {
  /**
   * Recalculate and update invoice totals based on line items
   * @param invoiceId - The invoice to recalculate
   * @returns Promise<void>
   */
  static async recalculateInvoice(invoiceId: string): Promise<void> {
    try {
      // 1. Fetch all line items for this invoice
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('total_price')
        .eq('invoice_id', invoiceId);

      if (lineItemsError) throw lineItemsError;

      // 2. Calculate subtotal from line items
      const subtotal = lineItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;

      // 3. Get government contract status for tax exemption
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('quote_request_id, quote_requests!quote_request_id(compliance_level, requires_po_number)')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const quoteData = invoice?.quote_requests as any;
      const isGovContract = 
        quoteData?.compliance_level === 'government' ||
        quoteData?.requires_po_number === true;

      // 4. Calculate tax using centralized service
      const taxCalc = TaxCalculationService.calculateTax(subtotal, isGovContract);

      // 5. Update invoice with calculated totals
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          subtotal: taxCalc.subtotal,
          tax_amount: taxCalc.taxAmount,
          total_amount: taxCalc.totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      console.log(
        `✅ Recalculated invoice ${invoiceId}:`, 
        `Subtotal: ${taxCalc.subtotal / 100}, Tax: ${taxCalc.taxAmount / 100}, Total: ${taxCalc.totalAmount / 100}`,
        `(Gov Contract: ${isGovContract})`
      );
    } catch (error) {
      console.error('Error recalculating invoice totals:', error);
      throw new Error(`Failed to recalculate invoice ${invoiceId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Recalculate invoice before sending to customer
   * Ensures customer receives correct totals
   * @param invoiceId - The invoice to recalculate
   * @returns Promise<void>
   */
  static async recalculateBeforeSend(invoiceId: string): Promise<void> {
    console.log(`🔄 Recalculating invoice ${invoiceId} before sending to customer...`);
    await this.recalculateInvoice(invoiceId);
  }

  /**
   * Validate that invoice totals match line items
   * Used for integrity checks
   * @param invoiceId - The invoice to validate
   * @returns Promise<boolean> - True if totals match, false otherwise
   */
  static async validateInvoice(invoiceId: string): Promise<boolean> {
    try {
      // Get current invoice totals
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('subtotal, tax_amount, total_amount, quote_request_id, quote_requests!quote_request_id(compliance_level, requires_po_number)')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('total_price')
        .eq('invoice_id', invoiceId);

      if (lineItemsError) throw lineItemsError;

      // Calculate expected totals
      const calculatedSubtotal = lineItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;
      const quoteData = invoice?.quote_requests as any;
      const isGovContract = 
        quoteData?.compliance_level === 'government' ||
        quoteData?.requires_po_number === true;
      const taxCalc = TaxCalculationService.calculateTax(calculatedSubtotal, isGovContract);

      // Compare
      const isValid = 
        invoice.subtotal === taxCalc.subtotal &&
        invoice.tax_amount === taxCalc.taxAmount &&
        invoice.total_amount === taxCalc.totalAmount;

      if (!isValid) {
        console.warn(
          `⚠️ Invoice ${invoiceId} totals mismatch:`,
          `DB: ${invoice.subtotal / 100} + ${invoice.tax_amount / 100} = ${invoice.total_amount / 100}`,
          `Expected: ${taxCalc.subtotal / 100} + ${taxCalc.taxAmount / 100} = ${taxCalc.totalAmount / 100}`
        );
      }

      return isValid;
    } catch (error) {
      console.error('Error validating invoice:', error);
      return false;
    }
  }
}
