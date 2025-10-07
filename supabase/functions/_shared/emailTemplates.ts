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
    .email-container { margin: 0 !important; }
    .header { padding: 30px 20px !important; }
    .header h1 { font-size: 24px !important; }
    .content { padding: 20px !important; }
    .btn { display: block !important; width: 100% !important; margin: 10px 0 !important; }
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

export function generateTrackingPixel(invoiceId: string, emailType: string): string {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://c4c8d2d1-63da-4772-a95b-bf211f87a132.lovableproject.com';
  return `<img src="${siteUrl}/api/track-email?invoice=${invoiceId}&type=${emailType}&t=${Date.now()}" alt="" class="tracking-pixel" />`;
}
