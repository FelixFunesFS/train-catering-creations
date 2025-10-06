/**
 * EmailNotificationService - Handles email notifications for change requests
 * Integrates with send-gmail-email edge function
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
   * Send change request response notification
   */
  async sendChangeRequestResponse(options: EmailNotificationOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const emailHtml = this.generateResponseEmail(options);
      const subject = this.generateSubject(options);

      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: options.to,
          subject,
          html: emailHtml
        }
      });

      if (error) {
        console.error('Failed to send email notification:', error);
        return { success: false, error: error.message };
      }

      console.log('Email notification sent successfully to:', options.to);
      return { success: true };
    } catch (error) {
      console.error('Error in sendChangeRequestResponse:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Generate email subject line
   */
  private generateSubject(options: EmailNotificationOptions): string {
    const actionMap = {
      approved: 'Approved - Review Updated Estimate',
      rejected: 'Update on Your Request',
      request_more_info: 'More Information Needed'
    };

    return `Change Request ${actionMap[options.action]} - ${options.eventName}`;
  }

  /**
   * Generate HTML email body
   */
  private generateResponseEmail(options: EmailNotificationOptions): string {
    const { customerName, eventName, action, adminResponse, costChange, estimateLink } = options;

    let statusMessage = '';
    let nextSteps = '';
    let ctaButton = '';

    switch (action) {
      case 'approved':
        statusMessage = '<span style="color: #16a34a; font-weight: bold;">APPROVED</span>';
        nextSteps = `
          <p>Great news! We've approved your change request and updated your estimate.</p>
          ${costChange ? `<p><strong>Price adjustment:</strong> ${costChange > 0 ? '+' : ''}$${(Math.abs(costChange) / 100).toFixed(2)}</p>` : ''}
          <p><strong>View your updated estimate using your permanent portal link.</strong></p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
            💡 <em>Your estimate link remains the same - no new link needed!</em>
          </p>
        `;
        if (estimateLink) {
          ctaButton = `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${estimateLink}" 
                 style="background: linear-gradient(135deg, #DC143C, #8B0000); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(220, 20, 60, 0.3);">
                View Updated Estimate
              </a>
              <p style="margin-top: 15px; color: #6b7280; font-size: 13px;">
                🔗 Bookmark this link - it's your permanent estimate portal
              </p>
            </div>
          `;
        }
        break;
      case 'rejected':
        statusMessage = '<span style="color: #dc2626; font-weight: bold;">UNABLE TO ACCOMMODATE</span>';
        nextSteps = `
          <p>Unfortunately, we're unable to accommodate this specific change request at this time.</p>
          ${adminResponse ? `<p><strong>Reason:</strong> ${adminResponse}</p>` : ''}
          <p>However, we'd love to discuss alternative options! Please call or email us to explore other possibilities.</p>
        `;
        break;
      case 'request_more_info':
        statusMessage = '<span style="color: #ea580c; font-weight: bold;">MORE INFORMATION NEEDED</span>';
        nextSteps = `
          <p>We need additional details to process your request. Please review our questions below and get back to us.</p>
          ${adminResponse ? `<p><strong>We need to know:</strong> ${adminResponse}</p>` : ''}
        `;
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #DC143C, #8B0000); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🍽️ Soul Train's Eatery</h1>
            <p style="color: #FFD700; margin: 10px 0 0 0; font-size: 16px; font-style: italic;">Where Southern Soul Meets Lowcountry Love</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hello ${customerName},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We've reviewed your change request for <strong>${eventName}</strong>.
            </p>
            
            <!-- Status Box -->
            <div style="background: #FFF5E6; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FFD700;">
              <h3 style="margin-top: 0; color: #374151; font-size: 18px;">
                Request Status: ${statusMessage}
              </h3>
              ${adminResponse && action !== 'approved' ? `
                <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 6px;">
                  <p style="margin: 0; color: #4b5563;"><strong>Our Response:</strong></p>
                  <p style="margin: 10px 0 0 0; color: #6b7280;">${adminResponse}</p>
                </div>
              ` : ''}
            </div>
            
            <!-- Next Steps -->
            <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              ${nextSteps}
            </div>
            
            <!-- CTA Button -->
            ${ctaButton}
            
            <!-- Contact Info -->
            <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
              <p style="margin: 0 0 15px 0; color: #1f2937; font-weight: bold; font-size: 16px;">Need to discuss this?</p>
              <p style="margin: 5px 0; color: #4b5563;">
                📞 Call us at <a href="tel:8439700265" style="color: #DC143C; text-decoration: none; font-weight: bold;">(843) 970-0265</a>
              </p>
              <p style="margin: 5px 0; color: #4b5563;">
                ✉️ Email us at <a href="mailto:soultrainseatery@gmail.com" style="color: #DC143C; text-decoration: none; font-weight: bold;">soultrainseatery@gmail.com</a>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 3px solid #FFD700;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Thank you for choosing Soul Train's Eatery!
            </p>
            <p style="margin: 10px 0 0 0; color: #DC143C; font-size: 12px; font-style: italic;">
              Bringing people together around exceptional Southern food
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }
}
