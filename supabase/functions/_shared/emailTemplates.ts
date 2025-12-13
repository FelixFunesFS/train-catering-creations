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

// Exported formatting helpers - single source of truth
export const formatServiceType = (serviceType: string): string => {
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

export const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
};

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (timeStr: string | null): string => {
  if (!timeStr) return 'TBD';
  try {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export const EMAIL_STYLES = `
  /* Base Styles - Mobile First with Accessibility */
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
  
  /* Skip Link for Screen Readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border-width: 0;
  }
  
  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
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
  
  .btn:focus {
    outline: 3px solid ${BRAND_COLORS.white};
    outline-offset: 2px;
    box-shadow: 0 0 0 4px ${BRAND_COLORS.gold};
  }
  
  .btn-primary {
    background: ${BRAND_COLORS.crimson};
    color: ${BRAND_COLORS.white};
  }
  
  .btn-primary:hover {
    background: ${BRAND_COLORS.crimsonDark};
  }
  
  .btn-secondary {
    background: ${BRAND_COLORS.gold};
    color: ${BRAND_COLORS.darkGray};
  }
  
  .btn-secondary:hover {
    background: ${BRAND_COLORS.goldLight};
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
  
  /* Pricing Table - Mobile Responsive with Accessibility */
  table.pricing-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  table.pricing-table caption {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border-width: 0;
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
  
  /* Links - Touch Friendly with Focus States */
  a {
    color: ${BRAND_COLORS.crimson};
    text-decoration: underline;
  }
  
  a:focus {
    outline: 3px solid ${BRAND_COLORS.gold};
    outline-offset: 2px;
  }
  
  a:hover {
    color: ${BRAND_COLORS.crimsonDark};
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
  
  /* Dark Mode Support */
  @media (prefers-color-scheme: dark) {
    .email-container {
      background: #1a1a1a !important;
    }
    
    .content {
      background: #2d2d2d !important;
      color: #e0e0e0 !important;
    }
    
    .event-card {
      background: #3a3a3a !important;
      color: #e0e0e0 !important;
    }
    
    .menu-section {
      background: #2d2d2d !important;
      border-color: #4a4a4a !important;
      color: #e0e0e0 !important;
    }
    
    .menu-item {
      border-bottom-color: #4a4a4a !important;
      color: #e0e0e0 !important;
    }
    
    table.pricing-table tbody tr {
      color: #e0e0e0 !important;
    }
    
    table.pricing-table tbody tr:nth-child(even) {
      background: #3a3a3a !important;
    }
    
    .footer {
      background: #2d2d2d !important;
      color: #b0b0b0 !important;
    }
  }
  
  /* High Contrast Mode Support */
  @media (prefers-contrast: high) {
    .btn-primary {
      border: 3px solid #000 !important;
    }
    
    .event-card {
      border: 2px solid #000 !important;
    }
    
    .menu-section {
      border: 2px solid #000 !important;
    }
  }
`;

export function generateEmailHeader(title: string = "Soul Train's Eatery"): string {
  return `
    <header class="header" role="banner">
      <h1><span aria-label="Soul Train's Eatery">🚂 ${title}</span></h1>
      <p class="tagline">Authentic Southern Cooking from the Heart</p>
    </header>
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
    <section class="event-card" aria-labelledby="event-details-heading">
      <h3 id="event-details-heading" style="margin: 0 0 15px 0; color: ${BRAND_COLORS.crimson};"><span aria-label="celebration">🎉</span> Your Event Details</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; width: 120px;"><strong>Event:</strong></td>
          <td style="padding: 8px 0;">${quote.event_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;"><time datetime="${quote.event_date}">${formatDate(quote.event_date)}</time></td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Time:</strong></td>
          <td style="padding: 8px 0;"><time datetime="${quote.start_time}">${formatTime(quote.start_time)}</time></td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Location:</strong></td>
          <td style="padding: 8px 0;">${quote.location}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Guests:</strong></td>
          <td style="padding: 8px 0;">${quote.guest_count} people</td>
        </tr>
        ${quote.guest_count_with_restrictions ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Vegetarian:</strong></td>
          <td style="padding: 8px 0;">${quote.guest_count_with_restrictions} guests</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0;"><strong>Service:</strong></td>
          <td style="padding: 8px 0;">${formatServiceType(quote.service_type)}</td>
        </tr>
        ${quote.special_requests ? `
        <tr>
          <td style="padding: 8px 0; vertical-align: top;"><strong>Special Requests:</strong></td>
          <td style="padding: 8px 0; font-style: italic;">${quote.special_requests}</td>
        </tr>
        ` : ''}
      </table>
    </section>
  `;
}

export function generateMenuSection(lineItems: any[], bothProteinsAvailable?: boolean): string {
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

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'Proteins': '🥩',
    'Sides': '🥗',
    'Appetizers': '🍤',
    'Desserts': '🍰',
    'Beverages': '🥤',
    'Service Items': '🍴',
    'Other Items': '📦'
  };

  const categoryOrder = ['Proteins', 'Sides', 'Appetizers', 'Desserts', 'Beverages', 'Service Items', 'Other Items'];
  
  let menuHtml = `
    <section class="menu-section" aria-labelledby="menu-heading">
      <div style="text-align: center; margin-bottom: 24px;">
        <h3 id="menu-heading" style="margin: 0 0 8px 0; color: ${BRAND_COLORS.crimson}; font-size: 22px;">
          <span aria-label="plate with food">🍽️</span> Your Custom Menu
        </h3>
        <p style="margin: 0; color: #666; font-size: 14px; font-style: italic;">
          Carefully curated Southern cuisine
        </p>
      </div>
  `;

  categoryOrder.forEach(category => {
    if (itemsByCategory[category]) {
      const icon = categoryIcons[category] || '📦';
      const isProtein = category === 'Proteins';
      
      menuHtml += `
        <article class="menu-category" aria-labelledby="category-${category.toLowerCase().replace(/\s+/g, '-')}" style="
          background: ${isProtein ? 'linear-gradient(135deg, #FFF5E6, #FFE8CC)' : '#ffffff'};
          border: 2px solid ${isProtein ? BRAND_COLORS.gold : BRAND_COLORS.lightGray};
          border-radius: 10px;
          padding: 16px;
          margin: 16px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        ">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span aria-hidden="true" style="font-size: 28px; line-height: 1;">${icon}</span>
            <h4 id="category-${category.toLowerCase().replace(/\s+/g, '-')}" style="
              margin: 0;
              color: ${BRAND_COLORS.crimson};
              font-size: 18px;
              flex: 1;
              border-bottom: 2px solid ${BRAND_COLORS.gold};
              padding-bottom: 6px;
            ">${category}</h4>
          </div>
      `;
      
      itemsByCategory[category].forEach((item: any, index: number) => {
        menuHtml += `
          <div class="menu-item" style="
            padding: 10px 0;
            border-bottom: ${index < itemsByCategory[category].length - 1 ? '1px solid #eee' : 'none'};
            line-height: 1.6;
          ">
            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 200px;">
                <strong style="color: #2d2d2d; font-size: 15px;">${item.title || item.description}</strong>
                ${item.description && item.title ? `<br><small style="color: #666; font-size: 13px; line-height: 1.4;">${item.description}</small>` : ''}
              </div>
              ${item.quantity > 1 ? `<span style="color: ${BRAND_COLORS.crimson}; font-weight: 600; font-size: 14px; margin-left: 10px;">×${item.quantity}</span>` : ''}
            </div>
          </div>
        `;
      });
      
      // Add special badge for proteins if both are available
      if (isProtein && bothProteinsAvailable) {
        menuHtml += `
          <div style="
            background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark});
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 12px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3);
          ">
            ⭐ Both proteins served to all guests
          </div>
        `;
      }
      
      menuHtml += `</article>`;
    }
  });

  menuHtml += `</section>`;
  return menuHtml;
}

export function generateFooter(): string {
  return `
    <footer class="footer" role="contentinfo">
      <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.crimson};">Soul Train's Eatery</h3>
      <p style="margin: 5px 0;"><strong>A Family-Run Business Since Day One</strong></p>
      <hr role="separator" style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <address style="font-style: normal;">
        <p style="margin: 5px 0;"><span aria-hidden="true">📞</span> <strong>Phone:</strong> <a href="tel:+18439700265" style="color: ${BRAND_COLORS.crimson}; text-decoration: none;">(843) 970-0265</a></p>
        <p style="margin: 5px 0;"><span aria-hidden="true">📧</span> <strong>Email:</strong> <a href="mailto:soultrainseatery@gmail.com" style="color: ${BRAND_COLORS.crimson}; text-decoration: none;">soultrainseatery@gmail.com</a></p>
      </address>
      <p style="margin: 15px 0 5px 0; font-size: 12px;">
        Proudly serving Charleston's Lowcountry and surrounding areas
      </p>
      <p style="margin: 5px 0; font-size: 12px; color: #999;">
        Trusted catering partner for weddings, graduations, military functions, corporate events & social gatherings
      </p>
    </footer>
  `;
}

export function generateLineItemsTable(lineItems: any[], subtotal: number, taxAmount: number, total: number): string {
  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  let tableHtml = `
    <div style="margin: 24px 0; overflow-x: auto;" role="region" aria-labelledby="pricing-heading">
      <h3 id="pricing-heading" style="color: ${BRAND_COLORS.crimson}; margin-bottom: 12px; font-size: 18px;"><span aria-hidden="true">💰</span> Detailed Pricing Breakdown</h3>
      <table class="pricing-table" style="width: 100%; min-width: 280px; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <caption class="sr-only">Line item pricing breakdown with quantities and totals</caption>
        <thead>
          <tr style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); color: white;">
            <th scope="col" style="padding: 10px 8px; text-align: left; font-size: 14px;">Item</th>
            <th scope="col" style="padding: 10px 8px; text-align: right; width: 50px; font-size: 14px;">Qty</th>
            <th scope="col" style="padding: 10px 8px; text-align: right; width: 70px; font-size: 13px;">Price</th>
            <th scope="col" style="padding: 10px 8px; text-align: right; width: 70px; font-size: 14px;">Total</th>
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
      <th scope="row" colspan="3" style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 14px;">Subtotal:</th>
      <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 14px;">${formatCurrency(subtotal)}</td>
    </tr>
  `;

  if (taxAmount > 0) {
    const hospitalityTax = Math.round(subtotal * 0.02);
    const serviceTax = Math.round(subtotal * 0.07);
    tableHtml += `
      <tr style="background: #f8f9fa;">
        <th scope="row" colspan="3" style="padding: 8px; text-align: right; font-size: 13px; color: #666;">SC Hospitality Tax (2%):</th>
        <td style="padding: 8px; text-align: right; font-size: 13px; color: #666;">${formatCurrency(hospitalityTax)}</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <th scope="row" colspan="3" style="padding: 8px; text-align: right; font-size: 13px; color: #666;">SC Service Tax (7%):</th>
        <td style="padding: 8px; text-align: right; font-size: 13px; color: #666;">${formatCurrency(serviceTax)}</td>
      </tr>
    `;
  } else {
    tableHtml += `
      <tr style="background: #f8f9fa;">
        <th scope="row" colspan="3" style="padding: 8px; text-align: right; font-size: 13px; color: #3B82F6;">Tax (Exempt):</th>
        <td style="padding: 8px; text-align: right; font-size: 13px; color: #3B82F6;">$0.00</td>
      </tr>
    `;
  }

  tableHtml += `
    <tr style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); color: white;">
      <th scope="row" colspan="3" style="padding: 12px 8px; text-align: right; font-size: 16px; font-weight: bold;">TOTAL:</th>
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

// Enhanced status badge helper
export function generateStatusBadge(
  status: 'approved' | 'rejected' | 'pending' | 'info',
  title: string,
  description: string
): string {
  const statusConfig = {
    approved: {
      icon: '✅',
      gradient: `linear-gradient(135deg, #16a34a, #15803d)`,
      borderColor: '#16a34a'
    },
    rejected: {
      icon: '❌',
      gradient: `linear-gradient(135deg, #dc2626, #b91c1c)`,
      borderColor: '#dc2626'
    },
    pending: {
      icon: '⚠️',
      gradient: `linear-gradient(135deg, #ea580c, #c2410c)`,
      borderColor: '#ea580c'
    },
    info: {
      icon: '💡',
      gradient: `linear-gradient(135deg, ${BRAND_COLORS.gold}, #f59e0b)`,
      borderColor: BRAND_COLORS.gold
    }
  };

  const config = statusConfig[status];

  return `
    <div class="status-badge" style="
      background: ${config.gradient};
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin: 25px 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ">
      <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
        <div style="font-size: 48px; min-width: 60px; text-align: center; line-height: 1;">
          ${config.icon}
        </div>
        <div style="flex: 1; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: white; font-size: 20px; font-weight: bold;">
            ${title}
          </h3>
          <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 15px; line-height: 1.5;">
            ${description}
          </p>
        </div>
      </div>
    </div>
    
    <style>
      @media only screen and (max-width: 480px) {
        .status-badge {
          padding: 18px 16px !important;
        }
        .status-badge > div {
          flex-direction: column !important;
          text-align: center !important;
        }
        .status-badge h3 {
          font-size: 18px !important;
        }
        .status-badge p {
          font-size: 14px !important;
        }
      }
      
      @media only screen and (max-width: 360px) {
        .status-badge {
          padding: 16px 12px !important;
        }
        .status-badge > div > div:first-child {
          font-size: 36px !important;
        }
      }
    </style>
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

// Default catering agreement terms for edge functions
const DEFAULT_CATERING_TERMS = {
  agreement_title: "Catering Services Agreement",
  intro_text: "This Catering Services Agreement (\"Agreement\") is entered into by and between Soul Train's Eatery (\"Caterer\") and the undersigned client (\"Client\"). By engaging the services of the Caterer, you agree to the following terms and conditions:",
  sections: [
    {
      title: "Booking and Payments",
      items: [
        "A non-refundable deposit of 10% is required to secure your event date in our calendar. This deposit will be credited towards your final payment.",
        "50% Required no later than 30 days prior to event date.",
        "The final payment is due no later than 14 days prior to the event date."
      ]
    },
    {
      title: "Services",
      description: "The Caterer shall ensure the following:",
      items: [
        "The provision of fresh food maintained at appropriate temperatures.",
        "If applicable, the setting up of a buffet line and service to all guests until everyone has had the opportunity to dine.",
        "A clean-up of the buffet/food area after service.",
        "For drop-off and set-up services, delivery and arrangement of items at the correct temperatures."
      ]
    },
    {
      title: "Adjustments",
      items: [
        "Please notify us promptly of any changes in guest count to facilitate necessary adjustments.",
        "If there is a delay in the start time of the event, the service duration will commence as per the time stipulated in this Agreement.",
        "A service window of 3 hours, inclusive of set-up and breakdown, applies for events with fewer than 400 guests.",
        "Extended service beyond the 3-hour window may incur a charge of $100 per additional hour."
      ]
    },
    {
      title: "Customization",
      description: "We understand that every event is unique. If there are any provisions in this Agreement that do not suit your requirements, please communicate with us to tailor our services to make your event special. We are committed to ensuring your satisfaction."
    }
  ],
  acceptance_text: "By making the required deposit, you acknowledge and agree to the terms set out in this Agreement.",
  closing_text: "Thank you for choosing Soul Train's Eatery. We look forward to serving you!!",
  owner_signature: {
    name: "Dominick Ward",
    title: "Owner, Soul Train's Eatery"
  }
};

export function generateCateringAgreementHTML(eventType: 'standard' | 'wedding' | 'government' = 'standard'): string {
  const terms = DEFAULT_CATERING_TERMS;
  
  const sections = eventType === 'government' 
    ? [...terms.sections, {
        title: "Government Contract Compliance",
        description: "Payment terms follow Net 30 schedule (100% due 30 days after event completion). Tax-exempt status applies. PO number required for billing."
      }]
    : terms.sections;
  
  return `
    <div style="font-family: Georgia, serif; padding: 24px; background: #f9fafb; border-radius: 12px; margin: 24px 0;">
      <h3 style="color: ${BRAND_COLORS.crimson}; margin: 0 0 16px 0; font-size: 20px;">
        📝 ${terms.agreement_title}
      </h3>
      
      <p style="color: #666; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0; font-style: italic;">
        ${terms.intro_text}
      </p>
      
      ${sections.map((section: any) => `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; font-size: 15px; font-weight: 600; margin: 0 0 8px 0; border-bottom: 2px solid ${BRAND_COLORS.gold}; padding-bottom: 4px;">
            ${section.title}
          </h4>
          ${section.description ? `<p style="color: #666; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">${section.description}</p>` : ''}
          ${section.items && section.items.length > 0 ? `
            <ul style="margin: 0; padding-left: 20px;">
              ${section.items.map((item: string) => `<li style="color: #666; font-size: 13px; line-height: 1.6; margin-bottom: 6px;">${item}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
      
      <div style="background: #fff; padding: 16px; border-radius: 8px; margin-top: 20px; border-left: 4px solid ${BRAND_COLORS.gold};">
        <p style="font-size: 13px; color: #333; margin: 0 0 8px 0; font-weight: 600;">
          ${terms.acceptance_text}
        </p>
        <p style="font-size: 13px; color: #666; margin: 0; font-style: italic;">
          ${terms.closing_text}
        </p>
      </div>
      
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd;">
        <p style="margin: 0; font-weight: 600; color: #333; font-size: 14px;">${terms.owner_signature.name}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${terms.owner_signature.title}</p>
      </div>
    </div>
  `;
}
