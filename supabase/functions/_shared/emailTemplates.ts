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

const formatServiceType = (serviceType: string): string => {
  if (!serviceType) return 'Full Service';
  
  const typeMap: Record<string, string> = {
    'drop-off': 'Drop-Off',
    'delivery-setup': 'Delivery + Setup',
    'full-service': 'Full-Service Catering'
  };
  
  return typeMap[serviceType] || serviceType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const EMAIL_STYLES = `
  /* Base Styles - Mobile First */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: ${BRAND_COLORS.darkGray};
    max-width: 100%;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  
  .email-container {
    background: ${BRAND_COLORS.white};
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  /* Header - Mobile Optimized */
  .header {
    background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark});
    color: ${BRAND_COLORS.white};
    padding: 24px 16px;
    text-align: center;
  }
  
  .header h1 {
    margin: 0 0 8px 0;
    font-size: 22px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    line-height: 1.2;
  }
  
  .header .tagline {
    margin: 0;
    font-size: 14px;
    font-style: italic;
    opacity: 0.95;
    line-height: 1.3;
  }
  
  /* Content - Mobile Padding */
  .content {
    padding: 20px 16px;
    background: ${BRAND_COLORS.white};
  }
  
  /* Footer - Mobile Optimized */
  .footer {
    background: ${BRAND_COLORS.lightGray};
    padding: 24px 16px;
    text-align: center;
    font-size: 13px;
    color: #666;
    border-top: 3px solid ${BRAND_COLORS.gold};
  }
  
  .footer p {
    margin: 8px 0;
    line-height: 1.5;
  }
  
  /* Buttons - Touch-Friendly */
  .btn {
    display: inline-block;
    padding: 16px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    margin: 8px 4px;
    transition: all 0.3s ease;
    min-height: 48px;
    line-height: 1.4;
    text-align: center;
    border: 2px solid transparent;
    mso-padding-alt: 16px 32px;
    -webkit-text-size-adjust: none;
    mso-hide: none;
    mso-style-priority: 99;
  }
  
  .btn-primary {
    background: ${BRAND_COLORS.crimson};
    color: ${BRAND_COLORS.white};
  }
  
  .btn-secondary {
    background: ${BRAND_COLORS.gold};
    color: ${BRAND_COLORS.darkGray};
  }
  
  /* Event Card - Mobile Responsive */
  .event-card {
    background: ${BRAND_COLORS.lightGray};
    padding: 16px;
    border-radius: 8px;
    margin: 16px 0;
    border-left: 4px solid ${BRAND_COLORS.gold};
  }
  
  .event-card h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
  }
  
  .event-card table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .event-card td {
    padding: 6px 0;
    vertical-align: top;
    word-wrap: break-word;
  }
  
  .event-card td:first-child {
    width: 100px;
    font-weight: 600;
    padding-right: 8px;
  }
  
  /* Menu Section - Mobile Optimized */
  .menu-section {
    background: ${BRAND_COLORS.white};
    border: 2px solid ${BRAND_COLORS.lightGray};
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }
  
  .menu-section h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .menu-category h4 {
    color: ${BRAND_COLORS.crimson};
    margin: 12px 0 8px 0;
    font-size: 15px;
    border-bottom: 2px solid ${BRAND_COLORS.gold};
    padding-bottom: 4px;
  }
  
  .menu-item {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    line-height: 1.5;
  }
  
  /* Pricing Table - Mobile Responsive */
  table.pricing-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  table.pricing-table th,
  table.pricing-table td {
    padding: 10px 8px;
    text-align: left;
  }
  
  table.pricing-table th:nth-child(2),
  table.pricing-table td:nth-child(2),
  table.pricing-table th:nth-child(3),
  table.pricing-table td:nth-child(3),
  table.pricing-table th:nth-child(4),
  table.pricing-table td:nth-child(4) {
    text-align: right;
  }
  
  /* Typography - Mobile Readable */
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.3;
    margin-top: 0;
  }
  
  p {
    margin: 12px 0;
    line-height: 1.6;
  }
  
  /* Links - Touch Friendly */
  a {
    color: ${BRAND_COLORS.crimson};
    text-decoration: underline;
  }
  
  /* Desktop Enhancements (600px+) */
  @media only screen and (min-width: 600px) {
    .header {
      padding: 40px 30px;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header .tagline {
      font-size: 16px;
    }
    
    .content {
      padding: 30px;
    }
    
    .footer {
      padding: 30px;
      font-size: 14px;
    }
    
    .event-card {
      padding: 20px;
      margin: 20px 0;
    }
    
    .event-card h3 {
      font-size: 20px;
      margin-bottom: 15px;
    }
    
    .event-card td {
      padding: 8px 0;
    }
    
    .event-card td:first-child {
      width: 120px;
    }
    
    .menu-section {
      padding: 20px;
      margin: 20px 0;
    }
    
    .menu-section h3 {
      font-size: 20px;
      margin-bottom: 20px;
    }
    
    .menu-category h4 {
      font-size: 16px;
      margin: 15px 0 8px 0;
    }
    
    table.pricing-table {
      font-size: 15px;
    }
    
    table.pricing-table th,
    table.pricing-table td {
      padding: 12px;
    }
    
    .btn {
      padding: 16px 32px;
      margin: 10px 5px;
    }
  }
  
  /* Mobile full-width buttons (480px and below) */
  @media only screen and (max-width: 480px) {
    .btn {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      padding: 18px 20px !important;
      font-size: 17px !important;
      margin: 10px 0 !important;
    }
  }
  
  /* Small Mobile Devices (<400px) */
  @media only screen and (max-width: 400px) {
    .header h1 {
      font-size: 20px;
    }
    
    .header .tagline {
      font-size: 13px;
    }
    
    .event-card td:first-child {
      width: 80px;
      font-size: 13px;
    }
    
    .event-card td {
      word-break: break-word;
      line-height: 1.4;
    }
    
    table.pricing-table {
      font-size: 13px !important;
    }
    
    table.pricing-table th,
    table.pricing-table td {
      padding: 10px 6px !important;
    }
  }
  
  /* Ultra-small devices (iPhone SE, Galaxy Fold - <360px) */
  @media only screen and (max-width: 360px) {
    .header {
      padding: 20px 12px !important;
    }
    
    .header h1 {
      font-size: 18px !important;
      line-height: 1.2;
    }
    
    .header .tagline {
      font-size: 12px !important;
    }
    
    .content {
      padding: 16px 12px !important;
    }
    
    .event-card {
      padding: 14px 12px !important;
      margin: 12px 0 !important;
    }
    
    .event-card table {
      font-size: 13px;
    }
    
    .event-card td:first-child {
      width: 75px !important;
      font-size: 12px !important;
      padding-right: 6px !important;
    }
    
    .menu-section {
      padding: 14px 12px !important;
    }
    
    .btn {
      padding: 20px 16px !important;
      min-height: 52px !important;
      font-size: 16px !important;
    }
    
    table.pricing-table th:nth-child(2),
    table.pricing-table td:nth-child(2) {
      display: none;
    }
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
          <td style="padding: 8px 0;">${formatServiceType(quote.service_type)}</td>
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

  menuHtml += `</div>`;
  return menuHtml;
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

export function generateLineItemsTable(lineItems: any[], subtotal: number, taxAmount: number, total: number): string {
  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  let tableHtml = `
    <div style="margin: 24px 0; overflow-x: auto;">
      <h3 style="color: ${BRAND_COLORS.crimson}; margin-bottom: 12px; font-size: 18px;">💰 Detailed Pricing Breakdown</h3>
      <table class="pricing-table" style="width: 100%; min-width: 280px; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); color: white;">
            <th style="padding: 10px 8px; text-align: left; font-size: 14px;">Item</th>
            <th style="padding: 10px 8px; text-align: right; width: 50px; font-size: 14px;">Qty</th>
            <th style="padding: 10px 8px; text-align: right; width: 70px; font-size: 13px;">Price</th>
            <th style="padding: 10px 8px; text-align: right; width: 70px; font-size: 14px;">Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  lineItems.forEach((item: any, index: number) => {
    const bgColor = index % 2 === 0 ? '#FFF5E6' : '#ffffff';
    tableHtml += `
      <tr style="background: ${bgColor}; border-bottom: 1px solid #e9ecef;">
        <td style="padding: 10px 8px;">
          <div style="font-weight: 600; color: #333; font-size: 14px; line-height: 1.4;">${item.title}</div>
          ${item.description ? `<div style="font-size: 12px; color: #666; margin-top: 2px; line-height: 1.3;">${item.description}</div>` : ''}
        </td>
        <td style="padding: 10px 8px; text-align: right; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; font-size: 13px;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 14px;">${formatCurrency(item.total_price)}</td>
      </tr>
    `;
  });

  tableHtml += `
    <tr style="background: #f8f9fa; border-top: 2px solid ${BRAND_COLORS.gold};">
      <td colspan="3" style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 14px;">Subtotal:</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 14px;">${formatCurrency(subtotal)}</td>
    </tr>
  `;

  if (taxAmount > 0) {
    tableHtml += `
      <tr style="background: #f8f9fa;">
        <td colspan="3" style="padding: 10px 8px; text-align: right; font-size: 14px;">Tax (8%):</td>
        <td style="padding: 10px 8px; text-align: right; font-size: 14px;">${formatCurrency(taxAmount)}</td>
      </tr>
    `;
  }

  tableHtml += `
    <tr style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); color: white;">
      <td colspan="3" style="padding: 12px 8px; text-align: right; font-size: 16px; font-weight: bold;">TOTAL:</td>
      <td style="padding: 12px 8px; text-align: right; font-size: 16px; font-weight: bold;">${formatCurrency(total)}</td>
    </tr>
        </tbody>
      </table>
    </div>
  `;

  return tableHtml;
}

export function generateTrackingPixel(invoiceId: string, emailType: string): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  return `<img src="${supabaseUrl}/functions/v1/track-email-open?invoice=${invoiceId}&type=${emailType}&t=${Date.now()}" alt="" style="width:1px;height:1px;border:0;" />`;
}

// Preheader helper for inbox preview text
export function generatePreheader(text: string): string {
  return `
    <div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${text}
    </div>
  `;
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
