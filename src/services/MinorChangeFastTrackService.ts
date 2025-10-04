import { supabase } from '@/integrations/supabase/client';

interface MinorChangeRequest {
  quote_request_id: string;
  invoice_id: string;
  changes: {
    guest_count?: number;
    event_time?: string;
    location?: string;
  };
  reason: string;
}

export class MinorChangeFastTrackService {
  /**
   * Determine if a change qualifies as "minor" (auto-approve)
   */
  static async isMinorChange(request: MinorChangeRequest): Promise<boolean> {
    try {
      // Fetch original quote data
      const { data: quote, error } = await supabase
        .from('quote_requests')
        .select('guest_count, start_time, location')
        .eq('id', request.quote_request_id)
        .single();

      if (error || !quote) {
        return false;
      }

      // Check guest count change
      if (request.changes.guest_count) {
        const originalCount = quote.guest_count;
        const newCount = request.changes.guest_count;
        const percentChange = Math.abs((newCount - originalCount) / originalCount) * 100;
        
        // If guest count changes by more than 10%, it's not minor
        if (percentChange > 10) {
          return false;
        }
      }

      // Time and location changes are always minor (don't affect pricing)
      return true;
    } catch (error) {
      console.error('Error checking if change is minor:', error);
      return false;
    }
  }

  /**
   * Auto-approve minor changes
   */
  static async autoApproveMinorChange(request: MinorChangeRequest): Promise<void> {
    try {
      // Update quote request with new values
      const updates: any = {};
      if (request.changes.guest_count) updates.guest_count = request.changes.guest_count;
      if (request.changes.event_time) updates.start_time = request.changes.event_time;
      if (request.changes.location) updates.location = request.changes.location;

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('quote_requests')
          .update(updates)
          .eq('id', request.quote_request_id);

        if (updateError) throw updateError;
      }

      // Create change request record with auto-approved status
      const { error: changeError } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: request.invoice_id,
          customer_email: '', // Will be filled by trigger
          request_type: 'minor_modification',
          status: 'approved',
          requested_changes: request.changes,
          customer_comments: request.reason,
          admin_response: 'Auto-approved (minor change)',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'system'
        });

      if (changeError) throw changeError;

      console.log('Minor change auto-approved:', request.changes);
    } catch (error) {
      console.error('Error auto-approving minor change:', error);
      throw error;
    }
  }

  /**
   * Submit a change request with auto-approval check
   */
  static async submitChangeRequest(
    quote_request_id: string,
    invoice_id: string,
    changes: any,
    reason: string
  ): Promise<{ isMinor: boolean; autoApproved: boolean }> {
    try {
      const request: MinorChangeRequest = {
        quote_request_id,
        invoice_id,
        changes,
        reason
      };

      const isMinor = await this.isMinorChange(request);

      if (isMinor) {
        await this.autoApproveMinorChange(request);
        return { isMinor: true, autoApproved: true };
      } else {
        // Create regular change request that needs admin review
        const { error } = await supabase
          .from('change_requests')
          .insert({
            invoice_id,
            customer_email: '', // Will be filled by trigger
            request_type: 'modification',
            status: 'pending',
            requested_changes: changes,
            customer_comments: reason
          });

        if (error) throw error;

        return { isMinor: false, autoApproved: false };
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
      throw error;
    }
  }
}
