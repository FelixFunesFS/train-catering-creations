import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface LineItemInput {
  title: string;
  description: string;
  quantity: number;
  unit_price: number; // in cents
  total_price: number; // in cents
  category: string;
  metadata?: Json;
}

export interface LineItem extends LineItemInput {
  id: string;
  invoice_id: string;
  created_at: string;
}

/**
 * Centralized service for invoice line item operations
 */
export class LineItemsService {
  /**
   * Create multiple line items for an invoice
   */
  static async createLineItems(
    invoiceId: string,
    items: LineItemInput[]
  ): Promise<LineItem[]> {
    const lineItems = items.map(item => ({
      invoice_id: invoiceId,
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      category: item.category,
      metadata: item.metadata || {}
    }));

    const { data, error } = await supabase
      .from('invoice_line_items')
      .insert(lineItems)
      .select();

    if (error) {
      console.error('Error creating line items:', error);
      throw error;
    }

    return data as LineItem[];
  }

  /**
   * Update a single line item
   */
  static async updateLineItem(
    lineItemId: string,
    updates: Partial<LineItemInput>
  ): Promise<LineItem> {
    const { data, error } = await supabase
      .from('invoice_line_items')
      .update(updates)
      .eq('id', lineItemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating line item:', error);
      throw error;
    }

    return data as LineItem;
  }

  /**
   * Delete a line item
   */
  static async deleteLineItem(lineItemId: string): Promise<void> {
    const { error } = await supabase
      .from('invoice_line_items')
      .delete()
      .eq('id', lineItemId);

    if (error) {
      console.error('Error deleting line item:', error);
      throw error;
    }
  }

  /**
   * Delete all line items for an invoice
   */
  static async deleteLineItemsByInvoice(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from('invoice_line_items')
      .delete()
      .eq('invoice_id', invoiceId);

    if (error) {
      console.error('Error deleting line items:', error);
      throw error;
    }
  }

  /**
   * Get all line items for an invoice
   */
  static async getLineItemsByInvoice(invoiceId: string): Promise<LineItem[]> {
    const { data, error } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching line items:', error);
      throw error;
    }

    return data as LineItem[];
  }

  /**
   * Replace all line items for an invoice (delete existing, insert new)
   */
  static async replaceLineItems(
    invoiceId: string,
    items: LineItemInput[]
  ): Promise<LineItem[]> {
    // Delete existing line items
    await this.deleteLineItemsByInvoice(invoiceId);
    
    // Create new line items
    return this.createLineItems(invoiceId, items);
  }
}
