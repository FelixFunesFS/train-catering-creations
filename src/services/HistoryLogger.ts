/**
 * HistoryLogger - Handles logging of quote history and changes
 * Maintains audit trail for all quote modifications
 */

import { supabase } from '@/integrations/supabase/client';
import { ChangeItem, ChangeContext, ChangeSource } from '@/utils/changeSummaryGenerator';

export interface HistoryEntryInput {
  quoteId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changeReason?: string;
  changeSource?: ChangeSource;
  contactInfo?: string;
  customerSummary?: string;
}

export class HistoryLogger {
  /**
   * Log a change with full context (initials, source, notes, customer summary)
   * This is the primary method for logging changes from the UI
   */
  async logChangeWithContext(
    quoteId: string,
    invoiceId: string | null,
    changes: ChangeItem[],
    context: ChangeContext
  ): Promise<void> {
    if (changes.length === 0) return;

    // Build contact info string
    const contactInfo = context.contactEmail || context.contactPhone || undefined;

    // Insert history entries for each change
    const entries = changes.map(change => ({
      quote_request_id: quoteId,
      field_name: change.field,
      old_value: change.oldValue,
      new_value: change.newValue,
      changed_by: context.initials,
      change_reason: context.internalNote || null,
      change_source: context.source,
      contact_info: contactInfo,
      customer_summary: context.includeInCustomerNotes ? context.customerSummary : null,
    }));

    const { error: historyError } = await supabase
      .from('quote_request_history')
      .insert(entries);

    if (historyError) {
      console.error('Error logging history:', historyError);
      throw historyError;
    }

    // If including in customer notes and we have an invoice, append to invoice.notes
    if (context.includeInCustomerNotes && context.customerSummary && invoiceId) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('notes')
        .eq('id', invoiceId)
        .single();

      const existingNotes = invoice?.notes || '';
      const newNotes = existingNotes
        ? `${existingNotes}\n\n${context.customerSummary}`
        : context.customerSummary;

      const { error: updateError } = await supabase
        .from('invoices')
        .update({ notes: newNotes })
        .eq('id', invoiceId);

      if (updateError) {
        console.error('Error updating invoice notes:', updateError);
      }
    }
  }

  /**
   * Log a single history entry with full context
   */
  async logEntry(entry: HistoryEntryInput): Promise<void> {
    const { error } = await supabase
      .from('quote_request_history')
      .insert({
        quote_request_id: entry.quoteId,
        field_name: entry.fieldName,
        old_value: entry.oldValue,
        new_value: entry.newValue,
        changed_by: entry.changedBy,
        change_reason: entry.changeReason,
        change_source: entry.changeSource,
        contact_info: entry.contactInfo,
        customer_summary: entry.customerSummary,
      });

    if (error) {
      console.error('Error logging history entry:', error);
    }
  }

  /**
   * Log change request approval with detailed history
   */
  async logChangeRequestApproval(
    quoteId: string,
    changeRequest: any,
    currentQuote: any,
    changes: any
  ): Promise<void> {
    const historyEntries = this.buildHistoryEntries(
      quoteId,
      changeRequest.id,
      currentQuote,
      changes
    );

    if (historyEntries.length > 0) {
      const { error } = await supabase
        .from('quote_request_history')
        .insert(historyEntries);

      if (error) {
        console.error('Error logging history:', error);
      }
    }
  }

  /**
   * Build history entries from changes
   */
  private buildHistoryEntries(
    quoteId: string,
    changeRequestId: string,
    currentQuote: any,
    changes: any
  ): any[] {
    const entries: any[] = [];
    const requestIdShort = changeRequestId.substring(0, 8);

    // Log menu changes
    if (changes.menu_changes) {
      entries.push(...this.buildMenuHistoryEntries(
        quoteId,
        requestIdShort,
        currentQuote,
        changes.menu_changes
      ));
    }

    // Log event detail changes
    entries.push(...this.buildEventDetailEntries(
      quoteId,
      requestIdShort,
      currentQuote,
      changes
    ));

    return entries;
  }

  /**
   * Build history entries for menu changes
   */
  private buildMenuHistoryEntries(
    quoteId: string,
    requestIdShort: string,
    currentQuote: any,
    menuChanges: any
  ): any[] {
    const entries: any[] = [];

    // Handle protein changes (FIXED)
    if (menuChanges.proteins) {
      if (menuChanges.proteins.remove && menuChanges.proteins.remove.length > 0) {
        menuChanges.proteins.remove.forEach((proteinName: string) => {
          entries.push({
            quote_request_id: quoteId,
            field_name: 'protein',
            old_value: proteinName,
            new_value: null,
            changed_by: 'admin',
            change_reason: `Change Request #${requestIdShort} - Removed protein`
          });
        });
      }

      if (menuChanges.proteins.add && menuChanges.proteins.add.length > 0) {
        menuChanges.proteins.add.forEach((proteinName: string) => {
          entries.push({
            quote_request_id: quoteId,
            field_name: 'protein',
            old_value: null,
            new_value: proteinName,
            changed_by: 'admin',
            change_reason: `Change Request #${requestIdShort} - Added protein`
          });
        });
      }
    }

    // Log menu item changes for each category
    const categories = ['appetizers', 'sides', 'desserts', 'drinks'];
    for (const category of categories) {
      if (menuChanges[category]?.remove?.length > 0) {
        entries.push({
          quote_request_id: quoteId,
          field_name: category,
          old_value: menuChanges[category].remove.join(', '),
          new_value: null,
          changed_by: 'admin',
          change_reason: `Change Request #${requestIdShort} - Removed ${category}`
        });
      }
      
      if (menuChanges[category]?.add?.length > 0) {
        entries.push({
          quote_request_id: quoteId,
          field_name: category,
          old_value: null,
          new_value: menuChanges[category].add.join(', '),
          changed_by: 'admin',
          change_reason: `Change Request #${requestIdShort} - Added ${category}`
        });
      }
    }

    return entries;
  }

  /**
   * Build history entries for event detail changes
   */
  private buildEventDetailEntries(
    quoteId: string,
    requestIdShort: string,
    currentQuote: any,
    changes: any
  ): any[] {
    const entries: any[] = [];

    if (changes.event_date && changes.event_date !== currentQuote.event_date) {
      entries.push({
        quote_request_id: quoteId,
        field_name: 'event_date',
        old_value: currentQuote.event_date,
        new_value: changes.event_date,
        changed_by: 'admin',
        change_reason: `Change Request #${requestIdShort} - Event date changed`
      });
    }

    if (changes.guest_count && parseInt(changes.guest_count) !== currentQuote.guest_count) {
      entries.push({
        quote_request_id: quoteId,
        field_name: 'guest_count',
        old_value: String(currentQuote.guest_count),
        new_value: changes.guest_count,
        changed_by: 'admin',
        change_reason: `Change Request #${requestIdShort} - Guest count changed`
      });
    }

    if (changes.location && changes.location !== currentQuote.location) {
      entries.push({
        quote_request_id: quoteId,
        field_name: 'location',
        old_value: currentQuote.location,
        new_value: changes.location,
        changed_by: 'admin',
        change_reason: `Change Request #${requestIdShort} - Location changed`
      });
    }

    return entries;
  }

  /**
   * Log line item changes after invoice update
   */
  async logLineItemChanges(
    quoteId: string,
    changeRequestId: string,
    beforeItems: any[],
    afterItems: any[]
  ): Promise<void> {
    const requestIdShort = changeRequestId.substring(0, 8);
    const entries: any[] = [];

    // Create maps for easy lookup
    const beforeMap = new Map(beforeItems.map(item => [item.title, item]));
    const afterMap = new Map(afterItems.map(item => [item.title, item]));

    // Find removed items
    for (const [title, item] of beforeMap) {
      if (!afterMap.has(title)) {
        entries.push({
          quote_request_id: quoteId,
          field_name: 'line_item_removed',
          old_value: `${item.title} - $${(item.total_price / 100).toFixed(2)}`,
          new_value: null,
          changed_by: 'admin',
          change_reason: `Change Request #${requestIdShort} - Removed line item`
        });
      }
    }

    // Find added items
    for (const [title, item] of afterMap) {
      if (!beforeMap.has(title)) {
        entries.push({
          quote_request_id: quoteId,
          field_name: 'line_item_added',
          old_value: null,
          new_value: `${item.title} - $${(item.total_price / 100).toFixed(2)}`,
          changed_by: 'admin',
          change_reason: `Change Request #${requestIdShort} - Added line item`
        });
      }
    }

    // Find modified items (price or quantity changes)
    for (const [title, afterItem] of afterMap) {
      const beforeItem = beforeMap.get(title);
      if (beforeItem) {
        const priceChanged = beforeItem.total_price !== afterItem.total_price;
        const quantityChanged = beforeItem.quantity !== afterItem.quantity;

        if (priceChanged || quantityChanged) {
          entries.push({
            quote_request_id: quoteId,
            field_name: 'line_item_modified',
            old_value: `${beforeItem.title} - Qty: ${beforeItem.quantity}, Price: $${(beforeItem.total_price / 100).toFixed(2)}`,
            new_value: `${afterItem.title} - Qty: ${afterItem.quantity}, Price: $${(afterItem.total_price / 100).toFixed(2)}`,
            changed_by: 'admin',
            change_reason: `Change Request #${requestIdShort} - Updated line item`
          });
        }
      }
    }

    // Insert all entries
    if (entries.length > 0) {
      const { error } = await supabase
        .from('quote_request_history')
        .insert(entries);

      if (error) {
        console.error('Error logging line item changes:', error);
      }
    }
  }
}
