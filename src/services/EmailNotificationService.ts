/**
 * EmailNotificationService - Handles email notifications for change requests
 * Uses send-change-request-notification edge function with shared brand templates
 */

import { supabase } from '@/integrations/supabase/client';

export interface EmailNotificationOptions {
  to: string;
  customerName: string;
  eventName: string;
  action: 'approved' | 'rejected' | 'request_more_info';
  adminResponse?: string;
  costChange?: number;
  estimateLink?: string;
}

export class EmailNotificationService {
  /**
   * Send change request response notification via edge function
   */
  async sendChangeRequestResponse(options: EmailNotificationOptions): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Sending change request notification via edge function:', options);

      const { data, error } = await supabase.functions.invoke('send-change-request-notification', {
        body: options
      });

      if (error) {
        console.error('Failed to send email notification:', error);
        return { success: false, error: error.message };
      }

      console.log('Email notification sent successfully to:', options.to);
      return data || { success: true };
    } catch (error) {
      console.error('Error in sendChangeRequestResponse:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}
