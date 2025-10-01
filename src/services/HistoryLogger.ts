/**
 * HistoryLogger - Handles logging of quote history and changes
 * Maintains audit trail for all quote modifications
 */

import { supabase } from '@/integrations/supabase/client';

export class HistoryLogger {
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

    // Log protein removals
    if (menuChanges.proteins?.remove) {
      const removedProteins = [];
      if (menuChanges.proteins.remove.includes('primary') && currentQuote.primary_protein) {
        removedProteins.push(currentQuote.primary_protein);
      }
      if (menuChanges.proteins.remove.includes('secondary') && currentQuote.secondary_protein) {
        removedProteins.push(currentQuote.secondary_protein);
      }
      
      if (removedProteins.length > 0) {
        entries.push({
          quote_request_id: quoteId,
          field_name: 'proteins',
          old_value: removedProteins.join(', '),
          new_value: null,
          changed_by: 'admin',
          change_reason: `Change Request #${requestIdShort} - Removed proteins`
        });
      }
    }

    // Log protein additions
    if (menuChanges.proteins?.add) {
      const addedProteins = [];
      if (menuChanges.proteins.add.primary) addedProteins.push(menuChanges.proteins.add.primary);
      if (menuChanges.proteins.add.secondary) addedProteins.push(menuChanges.proteins.add.secondary);
      
      if (addedProteins.length > 0) {
        entries.push({
          quote_request_id: quoteId,
          field_name: 'proteins',
          old_value: null,
          new_value: addedProteins.join(', '),
          changed_by: 'admin',
          change_reason: `Change Request #${requestIdShort} - Added proteins`
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
}
