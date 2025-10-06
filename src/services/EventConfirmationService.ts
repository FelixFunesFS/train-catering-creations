import { supabase } from '@/integrations/supabase/client';
import { addDays, addWeeks } from 'date-fns';

export class EventConfirmationService {
  /**
   * Confirm an event when payment is completed
   * This generates timeline tasks and sends confirmation email
   */
  static async confirmEvent(quoteRequestId: string): Promise<void> {
    try {
      // Fetch quote data
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteRequestId)
        .single();

      if (quoteError || !quote) {
        throw new Error('Quote request not found');
      }

      // Check if already confirmed
      if (quote.workflow_status === 'confirmed') {
        console.log('Event already confirmed');
        return;
      }

      // Generate timeline tasks
      await this.generateTimelineTasks(quoteRequestId, new Date(quote.event_date));

      // Send confirmation email
      await this.sendConfirmationEmail(quote);

      console.log(`Event confirmed for quote ${quoteRequestId}`);
    } catch (error) {
      console.error('Error confirming event:', error);
      throw error;
    }
  }

  /**
   * Generate timeline tasks for an event
   */
  private static async generateTimelineTasks(
    quoteRequestId: string,
    eventDate: Date
  ): Promise<void> {
    try {
      // Check if tasks already exist
      const { data: existingTasks } = await supabase
        .from('event_timeline_tasks')
        .select('id')
        .eq('quote_request_id', quoteRequestId);

      if (existingTasks && existingTasks.length > 0) {
        console.log('Timeline tasks already exist');
        return;
      }

      // Generate default tasks based on event date
      const defaultTasks = [
        {
          quote_request_id: quoteRequestId,
          task_name: 'Final menu confirmation',
          task_type: 'pre_event',
          due_date: addWeeks(eventDate, -2).toISOString(),
          notes: 'Confirm final menu selections and guest count with customer'
        },
        {
          quote_request_id: quoteRequestId,
          task_name: 'Equipment & supplies check',
          task_type: 'pre_event',
          due_date: addWeeks(eventDate, -1).toISOString(),
          notes: 'Verify all chafers, linens, and serving equipment are ready'
        },
        {
          quote_request_id: quoteRequestId,
          task_name: 'Staff scheduling',
          task_type: 'pre_event',
          due_date: addDays(eventDate, -5).toISOString(),
          notes: 'Schedule wait staff and kitchen team for event'
        },
        {
          quote_request_id: quoteRequestId,
          task_name: 'Grocery shopping & prep',
          task_type: 'pre_event',
          due_date: addDays(eventDate, -2).toISOString(),
          notes: 'Purchase ingredients and begin food prep'
        },
        {
          quote_request_id: quoteRequestId,
          task_name: 'Final prep & packing',
          task_type: 'day_of',
          due_date: addDays(eventDate, -1).toISOString(),
          notes: 'Complete cooking, pack equipment and supplies'
        },
        {
          quote_request_id: quoteRequestId,
          task_name: 'Event execution',
          task_type: 'day_of',
          due_date: eventDate.toISOString(),
          notes: 'Setup, service, and breakdown at event location'
        },
        {
          quote_request_id: quoteRequestId,
          task_name: 'Send thank you email',
          task_type: 'post_event',
          due_date: addDays(eventDate, 1).toISOString(),
          notes: 'Send follow-up thank you and request feedback'
        }
      ];

      const { error } = await supabase
        .from('event_timeline_tasks')
        .insert(defaultTasks);

      if (error) {
        throw error;
      }

      console.log(`Generated ${defaultTasks.length} timeline tasks`);
    } catch (error) {
      console.error('Error generating timeline tasks:', error);
      throw error;
    }
  }

  /**
   * Send confirmation email to customer
   */
  private static async sendConfirmationEmail(quote: any): Promise<void> {
    try {
      // Call the send-confirmation edge function
      const { error } = await supabase.functions.invoke('send-confirmation', {
        body: {
          customer_email: quote.email,
          customer_name: quote.contact_name,
          event_name: quote.event_name,
          event_date: quote.event_date,
          event_time: quote.start_time,
          location: quote.location,
          guest_count: quote.guest_count
        }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        // Don't throw - confirmation is not critical
      } else {
        console.log('Confirmation email sent successfully');
      }
    } catch (error) {
      console.error('Error in sendConfirmationEmail:', error);
      // Don't throw - confirmation is not critical
    }
  }

  /**
   * Sync quote and invoice status
   */
  static async syncStatus(invoiceId: string): Promise<void> {
    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('workflow_status, quote_request_id')
        .eq('id', invoiceId)
        .single();

      if (!invoice || !invoice.quote_request_id) return;

      // When invoice is paid, mark quote as confirmed
      if (invoice.workflow_status === 'paid') {
        await supabase
          .from('quote_requests')
          .update({
            workflow_status: 'confirmed'
          })
          .eq('id', invoice.quote_request_id);
      }

      console.log('Status synced between invoice and quote');
    } catch (error) {
      console.error('Error syncing status:', error);
    }
  }
}
