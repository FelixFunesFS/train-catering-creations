/**
 * QuoteUpdateService - Handles quote updates and line item regeneration
 * Responsible for applying changes to quotes and maintaining data consistency
 */

import { supabase } from '@/integrations/supabase/client';
import { generateProfessionalLineItems } from '@/utils/invoiceFormatters';

export class QuoteUpdateService {
  /**
   * Apply requested changes to quote data
   */
  async applyChanges(currentQuote: any, changes: any): Promise<any> {
    const quoteUpdates: any = {};

    // Apply event detail changes
    if (changes.event_date) quoteUpdates.event_date = changes.event_date;
    if (changes.guest_count) quoteUpdates.guest_count = parseInt(changes.guest_count);
    if (changes.location) quoteUpdates.location = changes.location;
    if (changes.start_time) quoteUpdates.start_time = changes.start_time;

    // Handle menu changes
    if (changes.menu_changes) {
      const menuUpdates = this.applyMenuChanges(currentQuote, changes.menu_changes);
      Object.assign(quoteUpdates, menuUpdates);
    }

    // Update quote status
    quoteUpdates.status = 'quoted';
    quoteUpdates.workflow_status = 'estimated';
    quoteUpdates.last_status_change = new Date().toISOString();

    return quoteUpdates;
  }

  /**
   * Apply menu changes to quote
   */
  private applyMenuChanges(currentQuote: any, menuChanges: any): any {
    const updates: any = {};

    // Handle protein changes
    if (menuChanges.proteins?.remove) {
      if (menuChanges.proteins.remove.includes('primary')) {
        updates.primary_protein = null;
      }
      if (menuChanges.proteins.remove.includes('secondary')) {
        updates.secondary_protein = null;
      }
    }

    // Handle menu item array updates
    const categories = ['appetizers', 'sides', 'desserts', 'drinks'];
    categories.forEach(category => {
      if (menuChanges[category]?.remove?.length > 0) {
        const current = this.parseArrayField(currentQuote[category]);
        updates[category] = current.filter(
          (item: string) => !menuChanges[category].remove.includes(item)
        );
      }
    });

    // Handle service options
    if (menuChanges.service_options) {
      Object.keys(menuChanges.service_options).forEach(key => {
        updates[key] = menuChanges.service_options[key];
      });
    }

    // Handle custom requests
    if (menuChanges.custom_requests) {
      updates.custom_menu_requests = currentQuote.custom_menu_requests
        ? `${currentQuote.custom_menu_requests}\n\nADDITIONAL REQUEST: ${menuChanges.custom_requests}`
        : menuChanges.custom_requests;
    }

    return updates;
  }

  /**
   * Update quote in database with optimistic locking
   */
  async updateQuote(quoteId: string, updates: any): Promise<void> {
    // Fetch current version
    const { data: currentQuote, error: fetchError } = await supabase
      .from('quote_requests')
      .select('version')
      .eq('id', quoteId)
      .single();

    if (fetchError) {
      console.error('Error fetching quote version:', fetchError);
      throw fetchError;
    }

    // Update with version check
    const { data: updateResult, error } = await supabase
      .from('quote_requests')
      .update(updates)
      .eq('id', quoteId)
      .eq('version', currentQuote.version)
      .select();

    if (error) {
      console.error('Error updating quote:', error);
      throw error;
    }

    // Check for optimistic lock conflict
    if (!updateResult || updateResult.length === 0) {
      throw new Error('OPTIMISTIC_LOCK_CONFLICT: Quote was modified by another user');
    }
  }

  /**
   * Regenerate quote line items
   */
  async regenerateLineItems(quoteId: string): Promise<void> {
    // Fetch updated quote
    const { data: updatedQuote, error: fetchError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (fetchError || !updatedQuote) {
      throw new Error('Failed to fetch updated quote');
    }

    // Parse JSON fields
    const quoteForLineItems = {
      ...updatedQuote,
      appetizers: this.parseJsonField(updatedQuote.appetizers),
      sides: this.parseJsonField(updatedQuote.sides),
      desserts: this.parseJsonField(updatedQuote.desserts),
      drinks: this.parseJsonField(updatedQuote.drinks),
      dietary_restrictions: this.parseJsonField(updatedQuote.dietary_restrictions),
      utensils: this.parseJsonField(updatedQuote.utensils),
      extras: this.parseJsonField(updatedQuote.extras)
    };

    // Delete existing line items
    const { error: deleteError } = await supabase
      .from('quote_line_items')
      .delete()
      .eq('quote_request_id', quoteId);

    if (deleteError) {
      console.error('Error deleting old line items:', deleteError);
    }

    // Generate and insert new line items
    const newLineItems = generateProfessionalLineItems(quoteForLineItems as any);
    
    if (newLineItems.length > 0) {
      const lineItemsToInsert = newLineItems.map(item => ({
        quote_request_id: quoteId,
        title: item.title,
        description: item.description,
        category: item.category || 'other',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total_price: item.total_price || 0
      }));

      const { error: insertError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsToInsert);

      if (insertError) {
        throw new Error(`Failed to insert line items: ${insertError.message}`);
      }
    }
  }

  /**
   * Parse array field from database
   */
  private parseArrayField(field: any): string[] {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Parse JSON field (handles arrays and objects)
   */
  private parseJsonField(field: any): any[] {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Update invoice line items based on quote changes
   * Intelligently adds/removes/updates items while preserving manual pricing
   */
  async updateInvoiceLineItems(invoiceId: string, quoteId: string, changes: any): Promise<void> {
    try {
      // Fetch updated quote to generate new line items
      const { data: updatedQuote, error: fetchError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (fetchError || !updatedQuote) {
        throw new Error('Failed to fetch updated quote');
      }

      // Fetch current invoice line items to preserve manual adjustments
      const { data: currentLineItems, error: currentError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (currentError) {
        throw new Error('Failed to fetch current line items');
      }

      // Parse JSON fields for line item generation
      const quoteForLineItems = {
        ...updatedQuote,
        appetizers: this.parseJsonField(updatedQuote.appetizers),
        sides: this.parseJsonField(updatedQuote.sides),
        desserts: this.parseJsonField(updatedQuote.desserts),
        drinks: this.parseJsonField(updatedQuote.drinks),
        dietary_restrictions: this.parseJsonField(updatedQuote.dietary_restrictions),
        utensils: this.parseJsonField(updatedQuote.utensils),
        extras: this.parseJsonField(updatedQuote.extras)
      };

      // Generate new line items based on updated quote
      const { generateProfessionalLineItems } = await import('@/utils/invoiceFormatters');
      const newLineItems = generateProfessionalLineItems(quoteForLineItems as any);

      // Create a map of current line items by title for comparison
      const currentItemsMap = new Map(
        (currentLineItems || []).map(item => [item.title, item])
      );

      // Track items to keep, add, or update
      const itemsToInsert = [];
      const itemsToUpdate = [];
      const processedTitles = new Set<string>();

      for (const newItem of newLineItems) {
        processedTitles.add(newItem.title);
        const existingItem = currentItemsMap.get(newItem.title);

        if (existingItem) {
          // Item exists - update quantity and recalculate total
          // Preserve unit_price if it was manually adjusted
          const shouldUpdatePrice = existingItem.unit_price === newItem.unit_price;
          
          itemsToUpdate.push({
            id: existingItem.id,
            quantity: newItem.quantity,
            unit_price: shouldUpdatePrice ? newItem.unit_price : existingItem.unit_price,
            total_price: (shouldUpdatePrice ? newItem.unit_price : existingItem.unit_price) * newItem.quantity
          });
        } else {
          // New item - add it
          itemsToInsert.push({
            invoice_id: invoiceId,
            title: newItem.title,
            description: newItem.description,
            category: newItem.category || 'other',
            quantity: newItem.quantity || 1,
            unit_price: newItem.unit_price || 0,
            total_price: newItem.total_price || 0
          });
        }
      }

      // Find items to delete (items in current but not in new)
      const itemsToDelete = (currentLineItems || [])
        .filter(item => !processedTitles.has(item.title))
        .map(item => item.id);

      // Execute database operations
      if (itemsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('invoice_line_items')
          .delete()
          .in('id', itemsToDelete);

        if (deleteError) {
          console.error('Error deleting line items:', deleteError);
        }
      }

      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('invoice_line_items')
          .insert(itemsToInsert);

        if (insertError) {
          throw new Error(`Failed to insert line items: ${insertError.message}`);
        }
      }

      for (const updateItem of itemsToUpdate) {
        const { error: updateError } = await supabase
          .from('invoice_line_items')
          .update({
            quantity: updateItem.quantity,
            unit_price: updateItem.unit_price,
            total_price: updateItem.total_price
          })
          .eq('id', updateItem.id);

        if (updateError) {
          console.error('Error updating line item:', updateError);
        }
      }

      // Recalculate invoice totals from line items
      const { data: allLineItems, error: recalcError } = await supabase
        .from('invoice_line_items')
        .select('total_price')
        .eq('invoice_id', invoiceId);

      if (!recalcError && allLineItems) {
        const newSubtotal = allLineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
        const taxAmount = Math.round(newSubtotal * 0.0); // Adjust tax rate as needed
        const totalAmount = newSubtotal + taxAmount;

        await supabase
          .from('invoices')
          .update({
            subtotal: newSubtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId);

        // Log the change to invoice_audit_log
        await supabase
          .from('invoice_audit_log')
          .insert({
            invoice_id: invoiceId,
            field_changed: 'total_amount',
            old_value: null, // We don't have the old value here
            new_value: totalAmount,
            changed_by: 'admin'
          });
      }

      console.log(`Updated invoice line items for invoice ${invoiceId}`);
    } catch (error) {
      console.error('Error updating invoice line items:', error);
      throw error;
    }
  }
}
