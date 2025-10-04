import { supabase } from '@/integrations/supabase/client';

interface SMSNotification {
  phone: string;
  message: string;
  type: 'payment_reminder' | 'event_confirmation' | 'change_approved' | 'event_reminder';
}

export class SMSNotificationService {
  /**
   * Send SMS notification via edge function
   */
  static async sendSMS(notification: SMSNotification): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          phone: notification.phone,
          message: notification.message,
          type: notification.type
        }
      });

      if (error) {
        console.error('Error sending SMS:', error);
        throw error;
      }

      console.log('SMS sent successfully to', notification.phone);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  /**
   * Send payment reminder SMS
   */
  static async sendPaymentReminder(phone: string, eventName: string, daysUntil: number): Promise<void> {
    const message = `Soul Train's Eatery: Your event "${eventName}" is in ${daysUntil} days! Please complete payment to secure your booking. Reply HELP for assistance.`;
    
    await this.sendSMS({
      phone,
      message,
      type: 'payment_reminder'
    });
  }

  /**
   * Send event confirmation SMS
   */
  static async sendEventConfirmation(phone: string, eventName: string, eventDate: string): Promise<void> {
    const message = `Soul Train's Eatery: Your event "${eventName}" on ${eventDate} is confirmed! We're excited to serve you. Check your email for details.`;
    
    await this.sendSMS({
      phone,
      message,
      type: 'event_confirmation'
    });
  }

  /**
   * Send change approved SMS
   */
  static async sendChangeApproved(phone: string, eventName: string): Promise<void> {
    const message = `Soul Train's Eatery: Your changes to "${eventName}" have been approved! Check your email for the updated estimate.`;
    
    await this.sendSMS({
      phone,
      message,
      type: 'change_approved'
    });
  }

  /**
   * Send event reminder (day before)
   */
  static async sendEventReminder(phone: string, eventName: string, eventTime: string): Promise<void> {
    const message = `Soul Train's Eatery: Your event "${eventName}" is tomorrow at ${eventTime}! We're all set and ready to serve. See you soon!`;
    
    await this.sendSMS({
      phone,
      message,
      type: 'event_reminder'
    });
  }

  /**
   * Send WhatsApp message (uses same infrastructure with different routing)
   */
  static async sendWhatsApp(phone: string, message: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phone,
          message
        }
      });

      if (error) {
        console.error('Error sending WhatsApp:', error);
        throw error;
      }

      console.log('WhatsApp sent successfully to', phone);
    } catch (error) {
      console.error('Failed to send WhatsApp:', error);
      throw error;
    }
  }
}
