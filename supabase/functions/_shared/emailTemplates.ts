// ============================================================================
// SHARED EMAIL TEMPLATES - Soul Train's Eatery Brand
// ============================================================================
// Brand Colors: Crimson (#DC143C) and Gold (#FFD700)

export const BRAND_COLORS = {
  crimson: '#DC143C',
  crimsonDark: '#B01030',
  gold: '#FFD700',
  goldLight: '#FFED4E',
  darkGray: '#333333',
  lightGray: '#F8F9FA',
  white: '#FFFFFF',
};

export const EMAIL_STYLES = `
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.6;
    color: ${BRAND_COLORS.darkGray};
    max-width: 600px;
    margin: 0 auto;
    padding: 0;
    background-color: #f5f5f5;
  }
  .email-container {
    background: ${BRAND_COLORS.white};
    margin: 20px auto;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .header {
    background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark});
    color: ${BRAND_COLORS.white};
    padding: 40px 30px;
    text-align: center;
  }
  .header h1 {
    margin: 0 0 10px 0;
    font-size: 32px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  }
  .header .tagline {
    margin: 0;
    font-size: 16px;
    font-style: italic;
    opacity: 0.95;
  }
  .content {
    padding: 30px;
    background: ${BRAND_COLORS.white};
  }
  .footer {
    background: ${BRAND_COLORS.lightGray};
    padding: 30px;
    text-align: center;
    font-size: 14px;
    color: #666;
    border-top: 3px solid ${BRAND_COLORS.gold};
  }
  .btn {
    display: inline-block;
    padding: 16px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    margin: 10px 5px;
    transition: all 0.3s ease;
  }
  .btn-primary {
    background: ${BRAND_COLORS.crimson};
    color: ${BRAND_COLORS.white};
  }
  .btn-secondary {
    background: ${BRAND_COLORS.gold};
    color: ${BRAND_COLORS.darkGray};
  }
  .highlight {
    color: ${BRAND_COLORS.crimson};
    font-weight: bold;
  }
  .event-card {
    background: ${BRAND_COLORS.lightGray};
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 4px solid ${BRAND_COLORS.gold};
  }
  .menu-section {
    background: ${BRAND_COLORS.white};
    border: 2px solid ${BRAND_COLORS.lightGray};
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }
  .menu-category {
    margin: 15px 0;
  }
  .menu-category h4 {
    color: ${BRAND_COLORS.crimson};
    margin: 10px 0 5px 0;
    font-size: 16px;
    border-bottom: 2px solid ${BRAND_COLORS.gold};
    padding-bottom: 5px;
  }
  .menu-item {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  .menu-item:last-child {
    border-bottom: none;
  }
  .tracking-pixel {
    width: 1px;
    height: 1px;
    display: block;
  }
  @media only screen and (max-width: 600px) {
    body { padding: 0 !important; }
    .email-container { margin: 0 !important; box-shadow: none !important; }
    .header { padding: 30px 20px !important; }
    .header h1 { font-size: 24px !important; }
    .header .tagline { font-size: 14px !important; }
    .content { padding: 20px !important; }
    .btn { 
      display: block !important; 
      width: 100% !important; 
      margin: 10px 0 !important; 
      padding: 14px 20px !important;
      font-size: 15px !important;
      box-sizing: border-box !important;
    }
    .event-card { padding: 15px !important; margin: 15px 0 !important; }
    .event-card h3 { font-size: 16px !important; }
    .event-card table { font-size: 14px !important; }
    .menu-section { padding: 15px !important; }
    .menu-category h4 { font-size: 15px !important; }
    .menu-item { font-size: 14px !important; padding: 6px 0 !important; }
    h2 { font-size: 20px !important; }
    h3 { font-size: 18px !important; }
    table { font-size: 14px !important; }
  }
`;

export function generateEmailHeader(title: string = "Soul Train's Eatery"): string {
  return `
    <div class="header">
      <h1>🚂 ${title}</h1>
      <p class="tagline">Authentic Southern Cooking from the Heart</p>
    </div>
  `;
}

export function generateEventDetailsCard(quote: any): string {
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

  return `
    <div class="event-card">
      <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.crimson};">🎉 Your Event Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; width: 120px;"><strong>Event:</strong></td>
          <td style="padding: 8px 0;">${quote.event_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;">${formatDate(quote.event_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Time:</strong></td>
          <td style="padding: 8px 0;">${formatTime(quote.start_time)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Location:</strong></td>
          <td style="padding: 8px 0;">${quote.location}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Guests:</strong></td>
          <td style="padding: 8px 0;">${quote.guest_count} people</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Service:</strong></td>
          <td style="padding: 8px 0;">${quote.service_type?.replace('_', ' ').toUpperCase() || 'Full Service'}</td>
        </tr>
      </table>
    </div>
  `;
}

export function generateMenuSection(lineItems: any[]): string {
  if (!lineItems || lineItems.length === 0) {
    return '';
  }

  // Group items by category
  const itemsByCategory = lineItems.reduce((acc: any, item: any) => {
    const category = item.category || 'Other Items';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categoryOrder = ['Proteins', 'Sides', 'Appetizers', 'Desserts', 'Beverages', 'Service Items', 'Other Items'];
  
  let menuHtml = `
    <div class="menu-section">
      <h3 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.crimson}; text-align: center;">
        🍽️ Your Custom Menu
      </h3>
  `;

  // Show categorized items first
  categoryOrder.forEach(category => {
    if (itemsByCategory[category]) {
      menuHtml += `
        <div class="menu-category">
          <h4>${category}</h4>
      `;
      
      itemsByCategory[category].forEach((item: any) => {
        menuHtml += `
          <div class="menu-item">
            <strong>${item.title || item.description}</strong>
            ${item.quantity > 1 ? ` <span style="color: #666;">(${item.quantity})</span>` : ''}
            ${item.description && item.title ? `<br><small style="color: #666;">${item.description}</small>` : ''}
          </div>
        `;
      });
      
      menuHtml += `</div>`;
    }
  });

  // Show any uncategorized items that weren't in the predefined category list
  const displayedCategories = new Set(categoryOrder);
  const remainingCategories = Object.keys(itemsByCategory).filter(cat => !displayedCategories.has(cat));
  
  if (remainingCategories.length > 0) {
    remainingCategories.forEach(category => {
      menuHtml += `
        <div class="menu-category">
          <h4>${category}</h4>
      `;
      
      itemsByCategory[category].forEach((item: any) => {
        menuHtml += `
          <div class="menu-item">
            <strong>${item.title || item.description}</strong>
            ${item.quantity > 1 ? ` <span style="color: #666;">(${item.quantity})</span>` : ''}
            ${item.description && item.title ? `<br><small style="color: #666;">${item.description}</small>` : ''}
          </div>
        `;
      });
      
      menuHtml += `</div>`;
    });
  }

  menuHtml += `</div>`;
  return menuHtml;
}

export function generateTermsSection(eventType: 'standard' | 'wedding' | 'government' = 'standard'): string {
  const terms = getTermsByType(eventType);
  
  return `
    <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin: 30px 0; border: 2px solid #e9ecef;">
      <h3 style="color: ${BRAND_COLORS.crimson}; margin: 0 0 20px 0; font-size: 22px; border-bottom: 3px solid ${BRAND_COLORS.gold}; padding-bottom: 10px;">📋 Terms & Conditions</h3>
      ${terms.map(section => `
        <div style="margin-bottom: 18px;">
          <h4 style="color: #333; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">${section.title}</h4>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">${section.content}</p>
        </div>
      `).join('')}
      <p style="font-size: 13px; color: #999; margin-top: 25px; padding-top: 20px; border-top: 2px solid #ddd; font-style: italic;">
        ✅ By approving this estimate, you acknowledge that you have read and agree to these terms and conditions.
      </p>
    </div>
  `;
}

function getTermsByType(eventType: 'standard' | 'wedding' | 'government') {
  const baseTerms = [
    {
      title: '1. Payment Terms',
      content: 'A deposit of 50% is required to secure your event date. The remaining balance is due 10 days prior to your event. Accepted payment methods include credit card, debit card, or bank transfer.'
    },
    {
      title: '2. Cancellation Policy',
      content: 'Cancellations made more than 30 days before the event will receive a full refund minus a $100 processing fee. Cancellations made 15-30 days before will receive a 50% refund. Cancellations made less than 15 days before the event are non-refundable.'
    },
    {
      title: '3. Guest Count Changes',
      content: 'Final guest count must be confirmed 7 days prior to the event. You will be charged for the confirmed guest count or actual guests served, whichever is greater. Additional guests above the confirmed count will be charged at the per-person rate.'
    },
    {
      title: '4. Service & Delivery',
      content: 'Soul Train\'s Eatery will arrive at the designated time to set up and serve. Client is responsible for providing adequate space, access, and facilities. Any special requirements must be communicated in advance.'
    },
    {
      title: '5. Food Safety & Liability',
      content: 'All food is prepared in licensed kitchen facilities following food safety regulations. Client assumes responsibility for any food allergies or dietary restrictions not communicated in advance. Soul Train\'s Eatery is not liable for food left unrefrigerated after service.'
    },
    {
      title: '6. Equipment & Rentals',
      content: 'Standard serving equipment, chafing dishes, and utensils are included. Specialty rentals (tables, chairs, linens) are available for an additional fee and must be arranged in advance.'
    }
  ];

  if (eventType === 'wedding') {
    return [
      ...baseTerms,
      {
        title: '7. Wedding Specific Terms',
        content: 'A tasting session is included for events over 100 guests. Menu changes must be finalized 30 days before the event. Coordination with venue and other vendors is required. Setup time may vary based on venue access.'
      }
    ];
  }

  if (eventType === 'government') {
    return [
      ...baseTerms,
      {
        title: '7. Government Contract Compliance',
        content: 'All services rendered comply with applicable government procurement regulations. Proper documentation and invoicing will be provided as required. Additional compliance requirements must be specified in writing.'
      }
    ];
  }

  return baseTerms;
}

export function generateFooter(): string {
  return `
    <div class="footer">
      <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.crimson};">Soul Train's Eatery</h3>
      <p style="margin: 5px 0;"><strong>A Family-Run Business Since Day One</strong></p>
      <p style="margin: 5px 0;">Bringing people together around exceptional Southern food</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="margin: 5px 0;">📞 <strong>Phone:</strong> (843) 970-0265</p>
      <p style="margin: 5px 0;">📧 <strong>Email:</strong> soultrainseatery@gmail.com</p>
      <p style="margin: 15px 0 5px 0; font-size: 12px;">
        Proudly serving Charleston's Lowcountry and surrounding areas
      </p>
      <p style="margin: 5px 0; font-size: 12px; color: #999;">
        Trusted catering partner for weddings, graduations, military functions, corporate events & social gatherings
      </p>
    </div>
  `;
}

export function generateTrackingPixel(invoiceId: string, emailType: string): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  return `<img src="${supabaseUrl}/functions/v1/track-email-open?invoice=${invoiceId}&type=${emailType}&t=${Date.now()}" alt="" style="width:1px;height:1px;border:0;" />`;
}

export function generatePaymentConfirmationEmail(quote: any, amount: number, isFullPayment: boolean): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      ${generateEmailHeader()}
      <div style="${EMAIL_STYLES}">
        <h2 style="color: ${BRAND_COLORS.crimson};">💰 Payment Received!</h2>
        <p style="font-size: 16px;">We've received your ${isFullPayment ? 'full' : 'deposit'} payment of <strong>$${(amount / 100).toFixed(2)}</strong>.</p>
        ${isFullPayment ? `<div style="background: ${BRAND_COLORS.gold}15; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="color: ${BRAND_COLORS.crimson}; margin-top: 0;">✅ Your Event is Confirmed!</h3></div>` : ''}
        ${generateEventDetailsCard(quote)}
        <p style="margin-top: 30px;">We're looking forward to making your event special!</p>
      </div>
      ${generateFooter()}
    </div>
  `;
}
