import { 
  EMAIL_STYLES, 
  generateEmailHeader, 
  generateEventDetailsCard, 
  generateFooter,
  BRAND_COLORS,
  LOGO_URLS
} from '../_shared/emailTemplates.ts';

export function generatePaymentConfirmationEmailWithNextSteps(
  quote: any, 
  invoice: any,
  amount: number, 
  isFullPayment: boolean,
  portalUrl: string
): string {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const daysUntilEvent = Math.ceil((new Date(quote.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmed - Soul Train's Eatery</title>
      <style>${EMAIL_STYLES}</style>
    </head>
    <body>
      <div class="email-container">
        ${generateEmailHeader("🎉 Payment Confirmed!")}
        
        <div class="content">
          <h2 style="color: ${BRAND_COLORS.crimson};">Thank you, ${quote.contact_name}!</h2>
          
          ${isFullPayment ? `
            <div style="background: linear-gradient(135deg, ${BRAND_COLORS.gold}20, ${BRAND_COLORS.gold}40); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px solid ${BRAND_COLORS.gold};">
              <h3 style="color: ${BRAND_COLORS.crimson}; margin: 0 0 10px 0; font-size: 24px;">✅ Your Event is Fully Confirmed!</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold;">We've received your full payment of ${formatCurrency(amount)}</p>
            </div>
          ` : `
            <div style="background: ${BRAND_COLORS.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.gold};">
              <h3 style="color: ${BRAND_COLORS.crimson}; margin: 0 0 10px 0;">💰 Deposit Received</h3>
              <p style="margin: 0; font-size: 16px;">We've received your deposit of ${formatCurrency(amount)}</p>
              <p style="margin: 10px 0 0 0; color: #666;">Remaining balance: ${formatCurrency((invoice.total_amount || 0) - amount)}</p>
            </div>
          `}
          
          ${generateEventDetailsCard(quote)}
          
          <h3 style="color: ${BRAND_COLORS.crimson}; margin-top: 30px;">📅 What Happens Next?</h3>
          
          <div style="background: ${BRAND_COLORS.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              ${!isFullPayment ? `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 12px 0; vertical-align: top; width: 50px;">
                    <span style="font-size: 24px;">💳</span>
                  </td>
                  <td style="padding: 12px 0;">
                    <strong style="color: ${BRAND_COLORS.crimson};">Final Payment Due</strong>
                    <p style="margin: 5px 0 0 0; color: #666;">Remaining balance of ${formatCurrency((invoice.total_amount || 0) - amount)} due 7 days before your event</p>
                  </td>
                </tr>
              ` : ''}
              
              ${daysUntilEvent > 7 ? `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 24px;">📞</span>
                  </td>
                  <td style="padding: 12px 0;">
                    <strong style="color: ${BRAND_COLORS.crimson};">Final Planning Call</strong>
                    <p style="margin: 5px 0 0 0; color: #666;">We'll contact you 2 weeks before your event to confirm final details, guest count, and setup requirements</p>
                  </td>
                </tr>
              ` : ''}
              
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px 0; vertical-align: top;">
                  <span style="font-size: 24px;">🚚</span>
                </td>
                <td style="padding: 12px 0;">
                  <strong style="color: ${BRAND_COLORS.crimson};">Day Before Setup</strong>
                  <p style="margin: 5px 0 0 0; color: #666;">We'll prep all your menu items and confirm arrival time with you</p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 12px 0; vertical-align: top;">
                  <span style="font-size: 24px;">🎉</span>
                </td>
                <td style="padding: 12px 0;">
                  <strong style="color: ${BRAND_COLORS.crimson};">Event Day!</strong>
                  <p style="margin: 5px 0 0 0; color: #666;">We arrive early to set up and ensure everything is perfect. You relax and enjoy your event!</p>
                </td>
              </tr>
            </table>
          </div>
          
          <h3 style="color: ${BRAND_COLORS.crimson};">💡 Your Event Portal</h3>
          <p>You can always access your event details, menu, and invoices through your personal portal:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${portalUrl}" class="btn btn-primary">View My Event Portal</a>
          </div>
          
          <div style="background: #e7f3ff; border: 1px solid #2196F3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1976D2;">📝 Pre-Event Checklist</h4>
            <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li>Confirm final guest count (if changes occur)</li>
              <li>Ensure event location has adequate access for delivery</li>
              <li>Have serving tables/areas ready for setup</li>
              <li>Designate a contact person for day-of coordination</li>
              ${quote.service_type === 'full_service' ? '<li>Confirm if you need additional wait staff or bussing</li>' : ''}
            </ul>
          </div>
          
          <h3 style="color: ${BRAND_COLORS.crimson};">Need to Make Changes?</h3>
          <p>If you need to adjust your guest count, menu items, or have any questions, just reply to this email or call us at <span class="highlight">(843) 970-0265</span>.</p>
          
          <p style="margin-top: 30px;">We're so excited to cater your event and create wonderful memories with you!</p>
          
          <p>Warmest regards,<br>
          <strong>The Soul Train's Eatery Family</strong><br>
          <em>Bringing people together around exceptional food</em></p>
        </div>
        
        ${generateFooter()}
      </div>
    </body>
    </html>
  `;
}

export function generateEventReminderEmail(quote: any, daysUntil: number, portalUrl: string): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const urgencyLevel = daysUntil === 1 ? 'high' : 'medium';
  const reminderType = daysUntil === 1 ? 'Tomorrow' : `${daysUntil} Days Away`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Reminder - Soul Train's Eatery</title>
      <style>${EMAIL_STYLES}</style>
    </head>
    <body>
      <div class="email-container">
        ${generateEmailHeader(`📅 Your Event is ${reminderType}!`)}
        
        <div class="content">
          <h2 style="color: ${BRAND_COLORS.crimson};">Hi ${quote.contact_name},</h2>
          
          ${daysUntil === 1 ? `
            <div style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}20, ${BRAND_COLORS.crimson}40); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px solid ${BRAND_COLORS.crimson};">
              <h3 style="color: ${BRAND_COLORS.crimson}; margin: 0; font-size: 28px;">🎉 Tomorrow is the Big Day!</h3>
            </div>
          ` : `
            <div style="background: ${BRAND_COLORS.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.gold};">
              <h3 style="color: ${BRAND_COLORS.crimson}; margin: 0 0 10px 0;">Your Event is Coming Up!</h3>
              <p style="margin: 0; font-size: 18px;">Just <strong>${daysUntil} days</strong> until we cater your special occasion</p>
            </div>
          `}
          
          ${generateEventDetailsCard(quote)}
          
          <h3 style="color: ${BRAND_COLORS.crimson};">⏰ What to Expect on Event Day</h3>
          <ul style="line-height: 1.8;">
            <li><strong>Arrival Time:</strong> We'll arrive 1-2 hours before ${formatTime(quote.start_time)} to set up</li>
            <li><strong>Setup:</strong> Our team will arrange food stations and ensure everything is perfect</li>
            <li><strong>Service:</strong> ${quote.service_type === 'full_service' ? 'Full-service catering with our professional staff' : 'Drop-off service with all necessary serving equipment'}</li>
            <li><strong>Cleanup:</strong> We'll handle all food-related cleanup after service</li>
          </ul>
          
          ${daysUntil === 1 ? `
            <div style="background: #fff3cd; border: 1px solid ${BRAND_COLORS.gold}; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.crimson};">📋 Final Checklist for Tomorrow:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Ensure clear access to delivery/setup area</li>
                <li>Have serving tables/surfaces ready and cleared</li>
                <li>Designate someone as our point of contact</li>
                <li>Confirm power outlets are available (if needed)</li>
              </ul>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" class="btn btn-primary">View Event Details</a>
          </div>
          
          <h3 style="color: ${BRAND_COLORS.crimson};">Questions or Last-Minute Changes?</h3>
          <p>If you need to reach us for any reason, we're here to help!</p>
          <p>📞 <span class="highlight">(843) 970-0265</span> (Call or text)<br>
          📧 <strong>soultrainseatery@gmail.com</strong></p>
          
          <p style="margin-top: 30px;">We can't wait to make your event delicious and memorable!</p>
          
          <p>See you ${daysUntil === 1 ? 'tomorrow' : 'soon'},<br>
          <strong>The Soul Train's Eatery Family</strong></p>
        </div>
        
        ${generateFooter()}
      </div>
    </body>
    </html>
  `;
}
