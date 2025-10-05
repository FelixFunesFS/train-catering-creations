/**
 * QuoteUpdateService - Handles quote updates and line item regeneration
 * Responsible for applying changes to quotes and maintaining data consistency
 */

import { supabase } from '@/integrations/supabase/client';
import { generateProfessionalLineItems } from '@/utils/invoiceFormatters';
import { formatCustomerName, formatEventName, formatLocation } from '@/utils/textFormatters';

export class QuoteUpdateService {
  /**
   * Apply requested changes to quote data
   */
  async applyChanges(currentQuote: any, changes: any): Promise<any> {
    const quoteUpdates: any = {};

    // Apply event detail changes with logging for debugging
    if (changes.event_date) {
      console.log('Updating event_date:', changes.event_date);
      quoteUpdates.event_date = changes.event_date;
    }
    if (changes.guest_count) {
      const parsedCount = parseInt(changes.guest_count);
      console.log('Updating guest_count from', currentQuote.guest_count, 'to', parsedCount);
      quoteUpdates.guest_count = parsedCount;
    }
    if (changes.location) {
      console.log('Updating location:', changes.location);
      quoteUpdates.location = formatLocation(changes.location);
    }
    if (changes.start_time) {
      console.log('Updating start_time:', changes.start_time);
      quoteUpdates.start_time = changes.start_time;
    }
    if (changes.contact_name) {
      console.log('Updating contact_name:', changes.contact_name);
      quoteUpdates.contact_name = formatCustomerName(changes.contact_name);
    }
    if (changes.event_name) {
      console.log('Updating event_name:', changes.event_name);
      quoteUpdates.event_name = formatEventName(changes.event_name);
    }
    if (changes.phone) {
      console.log('Updating phone:', changes.phone);
      quoteUpdates.phone = changes.phone;
    }
    if (changes.email) {
      console.log('Updating email:', changes.email);
      quoteUpdates.email = changes.email;
    }

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
      console.log('🔄 Updating invoice line items with changes:', changes);
      
      // Fetch updated quote
      const { data: updatedQuote, error: fetchError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (fetchError || !updatedQuote) {
        throw new Error('Failed to fetch updated quote');
      }

      // Fetch current invoice line items
      const { data: currentLineItems, error: currentError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (currentError) {
        throw new Error('Failed to fetch current line items');
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

      // Build list of items to remove based on menu_changes
      const itemsToRemoveByName: Set<string> = new Set();
      if (changes.menu_changes) {
        // Check for protein removals
        if (changes.menu_changes.proteins?.remove) {
          changes.menu_changes.proteins.remove.forEach((type: string) => {
            if (type === 'primary' && !updatedQuote.primary_protein) {
              currentLineItems?.forEach(item => {
                if (item.title.toLowerCase().includes('primary') || 
                    item.title.toLowerCase().includes('protein') ||
                    item.category === 'protein') {
                  itemsToRemoveByName.add(item.title);
                }
              });
            }
          });
        }
        
        // Check for menu category removals
        ['appetizers', 'sides', 'desserts', 'drinks'].forEach(category => {
          if (changes.menu_changes[category]?.remove) {
            changes.menu_changes[category].remove.forEach((item: string) => {
              itemsToRemoveByName.add(item);
            });
          }
        });
      }

      // Delete removed items from invoice
      if (itemsToRemoveByName.size > 0) {
        const idsToDelete = (currentLineItems || [])
          .filter(item => {
            const itemTitle = item.title.toLowerCase();
            return Array.from(itemsToRemoveByName).some(removeName => 
              itemTitle.includes(removeName.toLowerCase()) ||
              removeName.toLowerCase().includes(itemTitle)
            );
          })
          .map(item => item.id);

        if (idsToDelete.length > 0) {
          console.log('🗑️ Deleting line items:', idsToDelete);
          const { error: deleteError } = await supabase
            .from('invoice_line_items')
            .delete()
            .in('id', idsToDelete);

          if (deleteError) {
            console.error('Error deleting line items:', deleteError);
          }
        }
      }

      // Generate new line items from updated quote
      const newLineItems = generateProfessionalLineItems(quoteForLineItems as any);
      
      // Re-fetch current items after deletions
      const { data: remainingItems } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      const currentItemsMap = new Map(
        (remainingItems || []).map(item => [item.title, item])
      );

      // Track items to insert/update
      const itemsToInsert = [];
      const itemsToUpdate = [];
      const processedTitles = new Set<string>();

      for (const newItem of newLineItems) {
        processedTitles.add(newItem.title);
        const existingItem = currentItemsMap.get(newItem.title);

        if (existingItem) {
          // Update existing
          const shouldUpdatePrice = existingItem.unit_price === newItem.unit_price;
          itemsToUpdate.push({
            id: existingItem.id,
            quantity: newItem.quantity,
            unit_price: shouldUpdatePrice ? newItem.unit_price : existingItem.unit_price,
            total_price: (shouldUpdatePrice ? newItem.unit_price : existingItem.unit_price) * newItem.quantity
          });
        } else {
          // Insert new
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

      // Execute inserts/updates
      if (itemsToInsert.length > 0) {
        console.log('➕ Inserting new line items:', itemsToInsert.length);
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

      // Recalculate invoice totals
      const { data: allLineItems, error: recalcError } = await supabase
        .from('invoice_line_items')
        .select('total_price')
        .eq('invoice_id', invoiceId);

      if (!recalcError && allLineItems) {
        const newSubtotal = allLineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
        const taxAmount = Math.round(newSubtotal * 0.0);
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

        console.log(`✅ Updated invoice totals: ${totalAmount / 100}`);
      }

      console.log(`✅ Updated invoice line items for invoice ${invoiceId}`);
    } catch (error) {
      console.error('❌ Error updating invoice line items:', error);
      throw error;
    }
  }
}
