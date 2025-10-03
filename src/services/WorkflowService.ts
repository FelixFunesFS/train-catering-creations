import { supabase } from '@/integrations/supabase/client';
import { generateProfessionalLineItems, type QuoteRequest } from '@/utils/invoiceFormatters';

export class WorkflowService {
  /**
   * Fetch quotes for workflow processing
   */
  static async fetchQuotes() {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .in('status', ['pending', 'reviewed', 'quoted', 'confirmed'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch a specific quote by ID
   */
  static async fetchQuoteById(quoteId: string) {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if an invoice exists for a quote
   */
  static async checkExistingInvoice(quoteId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('quote_request_id', quoteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Fetch line items for an invoice
   */
  static async fetchLineItems(invoiceId: string) {
    const { data, error } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate a new invoice for a quote
   */
  static async generateInvoice(quote: QuoteRequest) {
    // Check if invoice already exists
    const existingInvoice = await this.checkExistingInvoice(quote.id);
    
    if (existingInvoice) {
      const lineItems = await this.fetchLineItems(existingInvoice.id);
      return { invoice: existingInvoice, lineItems, isNew: false };
    }

    // Create new invoice
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        quote_request_id: quote.id,
        status: 'draft',
        document_type: 'estimate',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        is_draft: true
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Generate line items from quote
    const generatedLineItems = generateProfessionalLineItems(quote);
    
    // Insert line items
    if (generatedLineItems.length > 0) {
      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(
          generatedLineItems.map(item => ({
            invoice_id: newInvoice.id,
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unit_price: 0,
            total_price: 0,
            category: item.category
          }))
        );

      if (lineItemsError) throw lineItemsError;
    }

    const lineItems = await this.fetchLineItems(newInvoice.id);
    return { invoice: newInvoice, lineItems, isNew: true };
  }

  /**
   * Update invoice with pricing totals
   */
  static async updateInvoiceTotals(
    invoiceId: string,
    totals: { subtotal: number; tax_amount: number; total_amount: number }
  ) {
    const { error } = await supabase
      .from('invoices')
      .update({
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        updated_at: new Date().toISOString(),
        status_changed_by: 'admin'
      })
      .eq('id', invoiceId);

    if (error) throw error;
    return true;
  }
}
