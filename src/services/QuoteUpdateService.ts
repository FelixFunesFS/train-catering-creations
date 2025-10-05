/**
 * QuoteUpdateService - Handles quote updates and line item regeneration
 * Responsible for applying changes to quotes and maintaining data consistency
 */

import { supabase } from '@/integrations/supabase/client';
import { TaxCalculationService } from './TaxCalculationService';
import { InvoiceTotalsRecalculator } from './InvoiceTotalsRecalculator';
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

    // Handle protein changes (FIXED)
    if (menuChanges.proteins) {
      let primaryProtein = currentQuote.primary_protein || '';
      let secondaryProtein = currentQuote.secondary_protein || '';
      
      // Parse existing proteins as arrays
      const primaryArray = primaryProtein ? primaryProtein.split(',').map((p: string) => p.trim()) : [];
      const secondaryArray = secondaryProtein ? secondaryProtein.split(',').map((p: string) => p.trim()) : [];
      
      // Handle removals - remove from BOTH primary and secondary
      if (menuChanges.proteins.remove && menuChanges.proteins.remove.length > 0) {
        const removeSet = new Set(menuChanges.proteins.remove);
        
        const newPrimary = primaryArray.filter((p: string) => !removeSet.has(p));
        const newSecondary = secondaryArray.filter((p: string) => !removeSet.has(p));
        
        updates.primary_protein = newPrimary.length > 0 ? newPrimary.join(', ') : null;
        updates.secondary_protein = newSecondary.length > 0 ? newSecondary.join(', ') : null;
        
        console.log(`🥩 Removed proteins: ${Array.from(removeSet).join(', ')}`);
        console.log(`🥩 New primary_protein: ${updates.primary_protein}`);
        console.log(`🥩 New secondary_protein: ${updates.secondary_protein}`);
      }
      
      // Handle additions - add to primary by default
      if (menuChanges.proteins.add && menuChanges.proteins.add.length > 0) {
        const currentPrimary = updates.primary_protein !== undefined 
          ? updates.primary_protein 
          : (currentQuote.primary_protein || '');
        
        const existingPrimary = currentPrimary ? currentPrimary.split(',').map((p: string) => p.trim()) : [];
        const newProteins = [...existingPrimary, ...menuChanges.proteins.add];
        
        updates.primary_protein = newProteins.join(', ');
        console.log(`🥩 Added proteins: ${menuChanges.proteins.add.join(', ')}`);
        console.log(`🥩 Updated primary_protein: ${updates.primary_protein}`);
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
      if (menuChanges[category]?.add?.length > 0) {
        const current = this.parseArrayField(currentQuote[category]);
        updates[category] = [...current, ...menuChanges[category].add];
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
  async updateInvoiceLineItems(invoiceId: string, quoteId: string, changes: any, changeRequestId?: string): Promise<void> {
    try {
      console.log('🔄 Regenerating invoice line items after change request approval...');
      
      // STEP 1: Fetch updated quote with all menu data
      const { data: updatedQuote, error: fetchError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (fetchError || !updatedQuote) {
        throw new Error('Failed to fetch updated quote');
      }

      // STEP 2: Store "before" snapshot for history logging
      const { data: beforeItems } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      console.log(`📸 Captured ${beforeItems?.length || 0} existing line items`);

      // STEP 2.5: Create price lookup map from existing items for smart price preservation
      const priceMap = new Map(
        beforeItems?.map(item => [
          `${item.title.toLowerCase()}-${item.category}`, 
          { unit_price: item.unit_price, total_price: item.total_price }
        ]) || []
      );

      console.log('💰 Price map created with', priceMap.size, 'entries');

      // STEP 3: Delete ALL existing invoice line items
      const { error: deleteError } = await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (deleteError) {
        throw new Error(`Failed to delete old line items: ${deleteError.message}`);
      }

      console.log('🗑️ Deleted all existing invoice line items');

      // STEP 4: Parse JSON fields for line item generation
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

      // STEP 5: Generate fresh line items from updated quote
      // This will now include ALL service options (wait staff, ice, plates, etc.)
      const newLineItems = generateProfessionalLineItems(quoteForLineItems as any);
      
      if (newLineItems.length === 0) {
        throw new Error('No line items generated from quote');
      }

      console.log(`🎯 Generated ${newLineItems.length} new line items`);

      // STEP 5.5: SMART PRICE COPYING - Preserve prices for unchanged items
      const lineItemsWithPricing = newLineItems.map(item => {
        const key = `${item.title.toLowerCase()}-${item.category}`;
        const existingPrices = priceMap.get(key);
        
        // If same item existed before, preserve its pricing
        if (existingPrices) {
          console.log(`💵 Preserving price for "${item.title}": $${existingPrices.unit_price / 100}`);
          return {
            ...item,
            unit_price: existingPrices.unit_price,
            total_price: existingPrices.total_price
          };
        }
        
        // New items stay at $0 for manual pricing
        console.log(`🆕 New item "${item.title}" set to $0 for manual pricing`);
        return item;
      });

      // STEP 6: Insert new line items (with preserved pricing)
      const lineItemsToInsert = lineItemsWithPricing.map(item => ({
        invoice_id: invoiceId,
        title: item.title,
        description: item.description,
        category: item.category || 'other',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total_price: item.total_price || 0
      }));

      const { error: insertError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsToInsert);

      if (insertError) {
        throw new Error(`Failed to insert line items: ${insertError.message}`);
      }

      console.log(`✅ Inserted ${newLineItems.length} new invoice line items`);

      // STEP 7: Recalculate invoice totals using TaxCalculationService
      const newSubtotal = newLineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const isGovContract = updatedQuote.compliance_level === 'government' || 
                            updatedQuote.requires_po_number === true;
      const { TaxCalculationService } = await import('../services/TaxCalculationService');
      const taxCalc = TaxCalculationService.calculateTax(newSubtotal, isGovContract);

      await supabase
        .from('invoices')
        .update({
          subtotal: taxCalc.subtotal,
          tax_amount: taxCalc.taxAmount,
          total_amount: taxCalc.totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      console.log(`💰 Recalculated totals: $${(taxCalc.totalAmount/100).toFixed(2)} (${taxCalc.isExempt ? 'TAX EXEMPT' : '8% tax'})`);

      // STEP 8: Log changes to history
      if (changeRequestId) {
        const { data: afterItems } = await supabase
          .from('invoice_line_items')
          .select('*')
          .eq('invoice_id', invoiceId);

        if (afterItems) {
          const { HistoryLogger } = await import('./HistoryLogger');
          const historyLogger = new HistoryLogger();
          await historyLogger.logLineItemChanges(
            quoteId, 
            changeRequestId, 
            beforeItems || [], 
            afterItems
          );
        }
      }

      console.log(`✅ Successfully regenerated invoice line items for invoice ${invoiceId}`);
      
    } catch (error) {
      console.error('❌ Error updating invoice line items:', error);
      throw error;
    }
  }
}
