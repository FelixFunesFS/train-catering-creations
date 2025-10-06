/**
 * Centralized Email Template System for Soul Train's Eatery
 * Consistent Crimson/Gold branding across all customer communications
 */

// Brand Colors
const BRAND_COLORS = {
  primary: '#DC143C',      // Crimson
  primaryDark: '#8B0000',  // Deep Red
  gold: '#FFD700',         // Gold
  warmBg: '#FFF5E6',       // Warm background
  lightBg: '#FFE4E1',      // Light crimson background
  text: '#333333',
  textLight: '#666666',
};

// Utility Functions
export const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatCustomerName = (name: string): string => {
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export const formatEventName = (name: string): string => {
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export const formatLocation = (location: string): string => {
  return location.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Reusable Components
export const generateEmailHeader = (title: string = "Soul Train's Eatery"): string => {
  return `
    <div style="
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      padding: 40px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    ">
      <h1 style="
        color: white;
        margin: 0 0 10px 0;
        font-size: 32px;
        font-family: Georgia, 'Times New Roman', serif;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      ">
        🍽️ ${title}
      </h1>
      <p style="
        color: ${BRAND_COLORS.gold};
        margin: 0;
        font-size: 16px;
        font-family: Georgia, 'Times New Roman', serif;
        font-style: italic;
      ">
        Where Southern Soul Meets Lowcountry Love
      </p>
    </div>
  `;
};

export const generateFooter = (): string => {
  return `
    <div style="
      margin-top: 40px;
      padding-top: 30px;
      border-top: 3px solid ${BRAND_COLORS.gold};
      text-align: center;
      color: ${BRAND_COLORS.textLight};
      font-family: Georgia, 'Times New Roman', serif;
    ">
      <p style="margin: 10px 0; font-size: 16px;">
        <strong style="color: ${BRAND_COLORS.primary};">📞 (843) 970-0265</strong>
      </p>
      <p style="margin: 10px 0; font-size: 16px;">
        <strong style="color: ${BRAND_COLORS.primary};">✉️ soultrainseatery@gmail.com</strong>
      </p>
      <p style="margin: 20px 0 10px 0; font-size: 14px; color: ${BRAND_COLORS.textLight};">
        Proudly serving Charleston's Lowcountry and surrounding areas
      </p>
      <p style="margin: 10px 0; font-size: 14px; font-style: italic; color: ${BRAND_COLORS.primary};">
        Bringing people together around exceptional Southern food
      </p>
    </div>
  `;
};

export const generateEventDetailsCard = (eventDetails: {
  eventName: string;
  eventDate: string;
  startTime: string;
  guestCount: number;
  location: string;
  serviceType: string;
}): string => {
  const serviceTypeLabels: Record<string, string> = {
    'delivery-setup': 'Delivery & Setup',
    'full-service': 'Full Service with Staff',
    'drop-off': 'Drop-off Only',
  };

  return `
    <div style="
      background: linear-gradient(135deg, ${BRAND_COLORS.warmBg} 0%, ${BRAND_COLORS.lightBg} 100%);
      border-left: 5px solid ${BRAND_COLORS.gold};
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    ">
      <h2 style="
        color: ${BRAND_COLORS.primary};
        margin: 0 0 20px 0;
        font-size: 24px;
        font-family: Georgia, 'Times New Roman', serif;
        border-bottom: 2px solid ${BRAND_COLORS.gold};
        padding-bottom: 10px;
      ">
        📅 Event Details
      </h2>
      <table style="width: 100%; font-family: Georgia, 'Times New Roman', serif;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold; width: 40%;">
            Event Name:
          </td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">
            ${formatEventName(eventDetails.eventName)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold;">
            Date:
          </td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">
            ${formatDate(eventDetails.eventDate)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold;">
            Time:
          </td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">
            ${formatTime(eventDetails.startTime)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold;">
            Guest Count:
          </td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">
            ${eventDetails.guestCount} guests
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold;">
            Location:
          </td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">
            ${formatLocation(eventDetails.location)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold;">
            Service Type:
          </td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.text};">
            ${serviceTypeLabels[eventDetails.serviceType] || eventDetails.serviceType}
          </td>
        </tr>
      </table>
    </div>
  `;
};

export const generateMenuSection = (menuData: {
  primary_protein?: string | string[];
  secondary_protein?: string | string[];
  appetizers?: string[];
  sides?: string[];
  desserts?: string[];
  drinks?: string[];
  dietary_restrictions?: string[];
  custom_menu_requests?: string;
}): string => {
  const formatMenuItems = (items: string | string[] | undefined, category: string): string => {
    if (!items) return '';
    
    const itemArray = Array.isArray(items) ? items : [items];
    if (itemArray.length === 0) return '';

    const itemLabels: Record<string, string> = {
      // Proteins
      'smothered-pork-chops': 'Smothered Pork Chops',
      'fried-pork-chops': 'Fried Pork Chops',
      'bbq-chicken': 'BBQ Chicken',
      'fried-chicken': 'Fried Chicken',
      'baked-chicken': 'Baked Chicken',
      'meatloaf': 'Meatloaf',
      'turkey-wings': 'Turkey Wings',
      'oxtails': 'Oxtails',
      'short-ribs': 'Short Ribs',
      'salmon': 'Salmon',
      'tilapia': 'Tilapia',
      'shrimp': 'Shrimp',
      
      // Appetizers
      'deviled-eggs': 'Deviled Eggs',
      'fruit-platter': 'Fresh Fruit Platter',
      'vegetable-platter': 'Vegetable Platter',
      'cheese-platter': 'Cheese Platter',
      'meat-platter': 'Meat & Cheese Platter',
      
      // Sides
      'mac-cheese': 'Mac & Cheese',
      'collard-greens': 'Collard Greens',
      'candied-yams': 'Candied Yams',
      'green-beans': 'Green Beans',
      'white-rice': 'White Rice',
      'dirty-rice': 'Dirty Rice',
      'potato-salad': 'Potato Salad',
      'coleslaw': 'Coleslaw',
      'cornbread': 'Cornbread',
      
      // Desserts
      'peach-cobbler': 'Peach Cobbler',
      'banana-pudding': 'Banana Pudding',
      'red-velvet-cake': 'Red Velvet Cake',
      'strawberry-cake': 'Strawberry Cake',
      'chocolate-cake': 'Chocolate Cake',
      
      // Drinks
      'sweet-tea': 'Sweet Tea',
      'lemonade': 'Lemonade',
      'soft-drinks': 'Soft Drinks',
      'water': 'Bottled Water',
      'coffee': 'Coffee',
    };

    const formattedItems = itemArray.map(item => 
      itemLabels[item] || item.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    );

    return `
      <div style="margin-bottom: 15px;">
        <strong style="color: ${BRAND_COLORS.primary}; font-size: 16px;">
          ${category}:
        </strong>
        <ul style="margin: 5px 0 0 0; padding-left: 25px; color: ${BRAND_COLORS.text};">
          ${formattedItems.map(item => `<li style="margin: 5px 0;">${item}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  let menuHtml = `
    <div style="
      background: white;
      border: 2px solid ${BRAND_COLORS.gold};
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    ">
      <h2 style="
        color: ${BRAND_COLORS.primary};
        margin: 0 0 20px 0;
        font-size: 24px;
        font-family: Georgia, 'Times New Roman', serif;
        border-bottom: 2px solid ${BRAND_COLORS.gold};
        padding-bottom: 10px;
      ">
        🍽️ Menu Selections
      </h2>
  `;

  if (menuData.primary_protein) {
    menuHtml += formatMenuItems(menuData.primary_protein, '🥩 Primary Protein');
  }
  if (menuData.secondary_protein) {
    menuHtml += formatMenuItems(menuData.secondary_protein, '🍗 Secondary Protein');
  }
  if (menuData.appetizers && menuData.appetizers.length > 0) {
    menuHtml += formatMenuItems(menuData.appetizers, '🧀 Appetizers');
  }
  if (menuData.sides && menuData.sides.length > 0) {
    menuHtml += formatMenuItems(menuData.sides, '🥗 Sides');
  }
  if (menuData.desserts && menuData.desserts.length > 0) {
    menuHtml += formatMenuItems(menuData.desserts, '🍰 Desserts');
  }
  if (menuData.drinks && menuData.drinks.length > 0) {
    menuHtml += formatMenuItems(menuData.drinks, '🥤 Drinks');
  }
  if (menuData.dietary_restrictions && menuData.dietary_restrictions.length > 0) {
    menuHtml += formatMenuItems(menuData.dietary_restrictions, '⚠️ Dietary Restrictions');
  }
  if (menuData.custom_menu_requests) {
    menuHtml += `
      <div style="margin-top: 15px; padding: 15px; background: ${BRAND_COLORS.warmBg}; border-radius: 6px;">
        <strong style="color: ${BRAND_COLORS.primary};">💭 Special Menu Requests:</strong>
        <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.text};">${menuData.custom_menu_requests}</p>
      </div>
    `;
  }

  menuHtml += `</div>`;
  return menuHtml;
};

// Complete Email Templates
export const generateQuoteConfirmationEmail = (quoteData: any): string => {
  const setupRequirements = [];
  if (quoteData.plates_requested) setupRequirements.push('Plates');
  if (quoteData.cups_requested) setupRequirements.push('Cups');
  if (quoteData.napkins_requested) setupRequirements.push('Napkins');
  if (quoteData.serving_utensils_requested) setupRequirements.push('Serving Utensils');
  if (quoteData.chafers_requested) setupRequirements.push('Chafers');
  if (quoteData.ice_requested) setupRequirements.push('Ice');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Request Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        ${generateEmailHeader()}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0 0 20px 0; font-size: 28px;">
            Thank You for Your Quote Request!
          </h2>
          
          <p style="color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Dear ${formatCustomerName(quoteData.contact_name)},
          </p>
          
          <p style="color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We've received your catering quote request for <strong style="color: ${BRAND_COLORS.primary};">${formatEventName(quoteData.event_name)}</strong> and are excited to help make your event memorable!
          </p>

          <div style="
            background: ${BRAND_COLORS.gold};
            color: ${BRAND_COLORS.primaryDark};
            padding: 15px 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
          ">
            ⏱️ We'll respond within 48 hours with your custom quote
          </div>

          ${generateEventDetailsCard({
            eventName: quoteData.event_name,
            eventDate: quoteData.event_date,
            startTime: quoteData.start_time,
            guestCount: quoteData.guest_count,
            location: quoteData.location,
            serviceType: quoteData.service_type,
          })}

          ${generateMenuSection({
            primary_protein: quoteData.primary_protein,
            secondary_protein: quoteData.secondary_protein,
            appetizers: quoteData.appetizers,
            sides: quoteData.sides,
            desserts: quoteData.desserts,
            drinks: quoteData.drinks,
            dietary_restrictions: quoteData.dietary_restrictions,
            custom_menu_requests: quoteData.custom_menu_requests,
          })}

          ${setupRequirements.length > 0 ? `
            <div style="
              background: ${BRAND_COLORS.lightBg};
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
              border-left: 5px solid ${BRAND_COLORS.primary};
            ">
              <h3 style="color: ${BRAND_COLORS.primary}; margin: 0 0 15px 0; font-size: 20px;">
                🛠️ Setup Requirements
              </h3>
              <ul style="margin: 0; padding-left: 25px; color: ${BRAND_COLORS.text};">
                ${setupRequirements.map(item => `<li style="margin: 5px 0;">${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${quoteData.special_requests ? `
            <div style="
              background: ${BRAND_COLORS.warmBg};
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            ">
              <h3 style="color: ${BRAND_COLORS.primary}; margin: 0 0 10px 0; font-size: 20px;">
                💭 Your Special Requests
              </h3>
              <p style="margin: 0; color: ${BRAND_COLORS.text}; line-height: 1.6;">
                ${quoteData.special_requests}
              </p>
            </div>
          ` : ''}

          <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, ${BRAND_COLORS.warmBg} 0%, white 100%); border-radius: 8px; border: 2px solid ${BRAND_COLORS.gold};">
            <h3 style="color: ${BRAND_COLORS.primary}; margin: 0 0 15px 0; font-size: 22px;">
              📋 Next Steps
            </h3>
            <ol style="margin: 0; padding-left: 25px; color: ${BRAND_COLORS.text}; line-height: 1.8;">
              <li>Our team is reviewing your request and preparing a custom quote</li>
              <li>You'll receive a detailed estimate within 48 hours</li>
              <li>We'll work with you to finalize the perfect menu for your event</li>
            </ol>
          </div>

          <p style="color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; margin: 25px 0;">
            If you have any immediate questions or need to make changes to your request, please don't hesitate to contact us at <strong style="color: ${BRAND_COLORS.primary};">(843) 970-0265</strong>.
          </p>

          <p style="color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
            Thank you for choosing Soul Train's Eatery!
          </p>
          
          <p style="color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; margin: 10px 0 0 0;">
            <strong>Best regards,</strong><br>
            <span style="color: ${BRAND_COLORS.primary}; font-size: 18px;">The Soul Train's Eatery Team</span>
          </p>

          ${generateFooter()}
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateAdminQuoteNotification = (quoteData: any): string => {
  const setupItems = [];
  if (quoteData.plates_requested) setupItems.push('✓ Plates');
  if (quoteData.cups_requested) setupItems.push('✓ Cups');
  if (quoteData.napkins_requested) setupItems.push('✓ Napkins');
  if (quoteData.serving_utensils_requested) setupItems.push('✓ Serving Utensils');
  if (quoteData.chafers_requested) setupItems.push('✓ Chafers');
  if (quoteData.ice_requested) setupItems.push('✓ Ice');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Quote Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f5f5;">
      <div style="max-width: 700px; margin: 0 auto; background-color: white;">
        ${generateEmailHeader()}
        
        <div style="padding: 40px 30px;">
          <div style="
            background: ${BRAND_COLORS.gold};
            color: ${BRAND_COLORS.primaryDark};
            padding: 20px;
            border-radius: 8px;
            margin: 0 0 30px 0;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
          ">
            🔔 New Quote Request Received
          </div>

          <div style="
            background: ${BRAND_COLORS.lightBg};
            border-left: 5px solid ${BRAND_COLORS.primary};
            padding: 20px;
            margin: 0 0 25px 0;
            border-radius: 8px;
          ">
            <h3 style="color: ${BRAND_COLORS.primary}; margin: 0 0 15px 0; font-size: 22px;">
              👤 Contact Information
            </h3>
            <table style="width: 100%; font-family: Georgia, 'Times New Roman', serif;">
              <tr>
                <td style="padding: 5px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold; width: 30%;">Name:</td>
                <td style="padding: 5px 0; color: ${BRAND_COLORS.text}; font-size: 16px;">${formatCustomerName(quoteData.contact_name)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold;">Email:</td>
                <td style="padding: 5px 0;"><a href="mailto:${quoteData.email}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">${quoteData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: ${BRAND_COLORS.textLight}; font-weight: bold;">Phone:</td>
                <td style="padding: 5px 0;"><a href="tel:${quoteData.phone}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">${quoteData.phone}</a></td>
              </tr>
            </table>
          </div>

          ${generateEventDetailsCard({
            eventName: quoteData.event_name,
            eventDate: quoteData.event_date,
            startTime: quoteData.start_time,
            guestCount: quoteData.guest_count,
            location: quoteData.location,
            serviceType: quoteData.service_type,
          })}

          ${generateMenuSection({
            primary_protein: quoteData.primary_protein,
            secondary_protein: quoteData.secondary_protein,
            appetizers: quoteData.appetizers,
            sides: quoteData.sides,
            desserts: quoteData.desserts,
            drinks: quoteData.drinks,
            dietary_restrictions: quoteData.dietary_restrictions,
            custom_menu_requests: quoteData.custom_menu_requests,
          })}

          ${setupItems.length > 0 ? `
            <div style="
              background: white;
              border: 2px solid ${BRAND_COLORS.primary};
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            ">
              <h3 style="color: ${BRAND_COLORS.primary}; margin: 0 0 15px 0; font-size: 20px;">
                🛠️ Setup Requirements
              </h3>
              <div style="color: ${BRAND_COLORS.text}; line-height: 2;">
                ${setupItems.join('<br>')}
              </div>
            </div>
          ` : ''}

          ${quoteData.special_requests ? `
            <div style="
              background: ${BRAND_COLORS.warmBg};
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
              border-left: 5px solid ${BRAND_COLORS.gold};
            ">
              <h3 style="color: ${BRAND_COLORS.primary}; margin: 0 0 10px 0; font-size: 20px;">
                💭 Special Requests
              </h3>
              <p style="margin: 0; color: ${BRAND_COLORS.text}; line-height: 1.6;">
                ${quoteData.special_requests}
              </p>
            </div>
          ` : ''}

          ${quoteData.referral_source ? `
            <div style="margin: 20px 0; padding: 15px; background: ${BRAND_COLORS.lightBg}; border-radius: 6px;">
              <strong style="color: ${BRAND_COLORS.primary};">📢 Referral Source:</strong>
              <span style="color: ${BRAND_COLORS.text}; margin-left: 10px;">
                ${quoteData.referral_source.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </div>
          ` : ''}

          ${quoteData.theme_colors ? `
            <div style="margin: 20px 0; padding: 15px; background: ${BRAND_COLORS.lightBg}; border-radius: 6px;">
              <strong style="color: ${BRAND_COLORS.primary};">🎨 Theme/Colors:</strong>
              <span style="color: ${BRAND_COLORS.text}; margin-left: 10px;">${quoteData.theme_colors}</span>
            </div>
          ` : ''}

          <div style="
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
            border-radius: 8px;
            text-align: center;
          ">
            <p style="color: white; margin: 0 0 5px 0; font-size: 14px;">Quote ID</p>
            <p style="color: ${BRAND_COLORS.gold}; margin: 0; font-size: 16px; font-family: monospace; font-weight: bold;">
              ${quoteData.quote_id}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: ${BRAND_COLORS.textLight}; font-size: 14px; margin: 0 0 15px 0;">
              Review this request in the admin dashboard
            </p>
          </div>

          ${generateFooter()}
        </div>
      </div>
    </body>
    </html>
  `;
};
