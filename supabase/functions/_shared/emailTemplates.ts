// ============================================================================
// SHARED EMAIL TEMPLATES - Soul Train's Eatery Brand
// ============================================================================
// Brand Colors: Crimson (#DC143C) and Gold (#FFD700)
// All templates use TABLE-BASED layouts for maximum email client compatibility
// SINGLE SOURCE OF TRUTH - All emails MUST use generateStandardEmail()

export const BRAND_COLORS = {
  crimson: '#DC143C',
  crimsonDark: '#B01030',
  gold: '#FFD700',
  goldLight: '#FFED4E',
  darkGray: '#333333',
  lightGray: '#F8F9FA',
  white: '#FFFFFF',
};

// Production URL for logo assets - uses published domain for email compatibility
const SITE_URL = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';

// Logo URLs - PNG format for universal email client compatibility (including Outlook desktop)
export const LOGO_URLS = {
  red: `${SITE_URL}/images/logo-red.png`,
  white: `${SITE_URL}/images/logo-white.png`,
};

// ============================================================================
// EMAIL TYPE DEFINITIONS - Single source of truth for all email types
// ============================================================================

export type EmailType = 
  | 'quote_received' 
  | 'quote_confirmation'
  | 'estimate_ready' 
  | 'estimate_reminder'
  | 'approval_confirmation'
  | 'payment_received' 
  | 'payment_reminder'
  | 'event_reminder'
  | 'change_request_submitted'
  | 'change_request_response'
  | 'admin_notification'
  | 'event_followup';

export type HeroVariant = 'crimson' | 'gold' | 'green' | 'blue' | 'orange';

export interface HeroConfig {
  badge: string;
  title: string;
  subtitle?: string;
  variant: HeroVariant;
}

export interface ContentBlock {
  type: 'event_details' | 'menu' | 'pricing' | 'menu_with_pricing' | 'customer_contact' | 'payment_schedule' | 'cta' | 'custom_html' | 'status_badge' | 'terms' | 'service_addons' | 'text' | 'menu_summary' | 'supplies_summary';
  data?: any;
}

export interface StandardEmailConfig {
  preheaderText: string;
  heroSection: HeroConfig;
  contentBlocks: ContentBlock[];
  ctaButton?: { text: string; href: string; variant: 'primary' | 'secondary' };
  quote?: any;
  invoice?: any;
  lineItems?: any[];
}

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
    timeZone: 'America/New_York',
  });
};

export const formatTime = (timeStr: string | null): string => {
  if (!timeStr) return 'TBD';
  try {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm} ET`;
  } catch {
    return timeStr;
  }
};

/**
 * Minifies HTML to prevent =20 Quoted-Printable encoding issues
 * Removes unnecessary whitespace while preserving content
 */
export function minifyEmailHTML(html: string): string {
  return html
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('')
    // Collapse multiple spaces to single space
    .replace(/\s{2,}/g, ' ')
    // Remove space between tags
    .replace(/>\s+</g, '><')
    // Add space after colons in inline styles for readability
    .replace(/:\s*;/g, ';');
}

// Compact email styles - minimal to avoid =20 encoding
export const EMAIL_STYLES = `
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:${BRAND_COLORS.darkGray};margin:0;padding:0;background-color:#f5f5f5;-webkit-text-size-adjust:100%}
.email-container{background:${BRAND_COLORS.white};max-width:600px;margin:0 auto}
.header{background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});color:${BRAND_COLORS.white};padding:24px 16px;text-align:center}
.content{padding:20px 16px;background:${BRAND_COLORS.white}}
.footer{background:${BRAND_COLORS.lightGray};padding:24px 16px;text-align:center;font-size:13px;color:#666;border-top:3px solid ${BRAND_COLORS.gold}}
.btn{display:inline-block;padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;text-align:center}
.btn-primary{background:${BRAND_COLORS.crimson};color:${BRAND_COLORS.white}}
.btn-secondary{background:${BRAND_COLORS.gold};color:${BRAND_COLORS.darkGray}}
.event-card{background:${BRAND_COLORS.lightGray};padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${BRAND_COLORS.gold}}
a{color:${BRAND_COLORS.crimson};text-decoration:underline}
@media only screen and (min-width:600px){.header{padding:40px 30px}.content{padding:30px}.footer{padding:30px}}
@media only screen and (max-width:480px){.btn{display:block!important;width:100%!important;padding:18px 20px!important}}
`;

export function generateEmailHeader(title: string = "Soul Train's Eatery"): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.crimson}" style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});border-collapse:collapse;">
<tr>
<td align="center" style="padding:30px 20px;">
<table cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:12px;">
<img src="${LOGO_URLS.white}" alt="Soul Train's Eatery" width="80" height="80" style="display:block;width:80px;height:80px;" />
</td>
</tr>
<tr>
<td align="center">
<h1 style="margin:0 0 8px 0;font-size:24px;font-weight:bold;color:${BRAND_COLORS.white};line-height:1.2;">${title}</h1>
<p style="margin:0;font-size:14px;font-style:italic;color:rgba(255,255,255,0.9);line-height:1.3;">Authentic Southern Cooking from the Heart</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
`;
}

export function generateEventDetailsCard(quote: any): string {
  const fmtDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fmtTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Table-based layout for email compatibility
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.lightGray}" style="background:${BRAND_COLORS.lightGray};border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:16px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:18px;">
  ${quote.event_name || 'Your Event'}
  ${quote.event_type === 'military_function' ? `<span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;padding:2px 8px;border-radius:4px;margin-left:8px;vertical-align:middle;">🎖️ Military</span>` : ''}
</h3>
${quote.military_organization ? `
<p style="margin:0 0 10px 0;font-size:14px;color:#1d4ed8;">
  <strong>Organization:</strong> ${quote.military_organization}
</p>
` : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td width="50%" style="padding:4px 8px 4px 0;font-size:14px;vertical-align:top;">
<span style="color:#666;">📅</span> ${fmtDate(quote.event_date)}
</td>
<td width="50%" style="padding:4px 0 4px 8px;font-size:14px;vertical-align:top;">
<span style="color:#666;">⏰</span> ${fmtTime(quote.start_time)}
</td>
</tr>
<tr>
<td width="50%" style="padding:4px 8px 4px 0;font-size:14px;vertical-align:top;">
<span style="color:#666;">📍</span> ${quote.location || 'TBD'}
</td>
<td width="50%" style="padding:4px 0 4px 8px;font-size:14px;vertical-align:top;">
<span style="color:#666;">👥</span> ${quote.guest_count || 0} guests
</td>
</tr>
<tr>
<td colspan="2" style="padding:4px 0;font-size:14px;vertical-align:top;">
<span style="color:#666;">🍽️</span> ${formatServiceType(quote.service_type)}
</td>
</tr>
</table>
${quote.special_requests ? `
<p style="margin:10px 0 0 0;padding-top:10px;border-top:1px solid #ddd;font-size:13px;color:#666;font-style:italic;">
<strong>Note:</strong> ${quote.special_requests}
</p>
` : ''}
</td>
</tr>
</table>
`;
}

/**
 * Generate Service Add-ons section - TABLE-BASED for email compatibility
 */
export function generateServiceAddonsSection(quote: any): string {
  const services: { label: string; emoji: string; bgColor: string; textColor: string }[] = [];

  if (quote.wait_staff_requested) {
    services.push({ label: 'Wait Staff', emoji: '👨‍🍳', bgColor: '#dbeafe', textColor: '#1d4ed8' });
  }
  if (quote.bussing_tables_needed) {
    services.push({ label: 'Table Bussing', emoji: '🧹', bgColor: '#f3e8ff', textColor: '#7c3aed' });
  }
  if (quote.ceremony_included) {
    services.push({ label: 'Ceremony Catering', emoji: '💒', bgColor: '#fce7f3', textColor: '#be185d' });
  }
  if (quote.cocktail_hour) {
    services.push({ label: 'Cocktail Hour', emoji: '🍸', bgColor: '#fef3c7', textColor: '#d97706' });
  }

  if (services.length === 0) {
    return '';
  }

  // Table-based badge layout
  const badgesCells = services.map(s => `
<td style="padding:4px;">
<span style="display:inline-block;background:${s.bgColor};color:${s.textColor};padding:6px 12px;border-radius:6px;font-size:13px;font-weight:600;">${s.emoji} ${s.label}</span>
</td>
`).join('');

  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.lightGray}" style="background:${BRAND_COLORS.lightGray};border-radius:8px;border-left:4px solid ${BRAND_COLORS.crimson};margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:16px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.darkGray};font-size:16px;">🍽️ Services Included</h3>
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
${badgesCells}
</tr>
</table>
${quote.wait_staff_requirements ? `
<p style="margin:12px 0 0 0;font-size:13px;color:#666;font-style:italic;">${quote.wait_staff_requirements}</p>
` : ''}
</td>
</tr>
</table>
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

  const categoryIcons: Record<string, string> = {
    'Proteins': '🥩',
    'Sides': '🥗',
    'dietary': '🌱',
    'Appetizers': '🍤',
    'Desserts': '🍰',
    'Beverages': '🥤',
    'Service Items': '🍴',
    'Other Items': '📦'
  };

  const categoryLabels: Record<string, string> = {
    'dietary': 'Vegetarian Options',
  };

  const categoryOrder = ['Proteins', 'Sides', 'dietary', 'Appetizers', 'Desserts', 'Beverages', 'Service Items', 'Other Items'];
  
  let menuHtml = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.white}" style="background:${BRAND_COLORS.white};border:2px solid ${BRAND_COLORS.lightGray};border-radius:8px;margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td align="center" style="padding-bottom:16px;">
<h3 style="margin:0;color:${BRAND_COLORS.crimson};font-size:20px;">🍽️ Menu Selections</h3>
</td>
</tr>
</table>
`;

  categoryOrder.forEach(category => {
    if (itemsByCategory[category]) {
      const icon = categoryIcons[category] || '📦';
      const isProtein = category === 'Proteins';
      const isDietary = category === 'dietary';
      const displayLabel = categoryLabels[category] || category;
      
      let bgColor = '#ffffff';
      let borderColor = BRAND_COLORS.lightGray;
      if (isProtein) {
        bgColor = '#FFF5E6';
        borderColor = BRAND_COLORS.gold;
      } else if (isDietary) {
        bgColor = '#dcfce7';
        borderColor = '#22c55e';
      }
      
      menuHtml += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bgColor};border:2px solid ${borderColor};border-radius:10px;margin:12px 0;border-collapse:collapse;">
<tr>
<td style="padding:16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td style="padding-bottom:12px;">
<span style="font-size:24px;vertical-align:middle;">${icon}</span>
<span style="font-size:18px;font-weight:bold;color:${isDietary ? '#166534' : BRAND_COLORS.crimson};vertical-align:middle;margin-left:8px;">${displayLabel}</span>
</td>
</tr>
</table>
`;
      
      itemsByCategory[category].forEach((item: any, index: number) => {
        const borderBottom = index < itemsByCategory[category].length - 1 ? 'border-bottom:1px solid #eee;' : '';
        menuHtml += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${borderBottom}border-collapse:collapse;">
<tr>
<td style="padding:10px 0;">
<strong style="color:#2d2d2d;font-size:15px;">${item.title || item.description}</strong>
${item.description && item.title ? `<br><span style="color:#666;font-size:13px;">${item.description}</span>` : ''}
</td>
${item.quantity > 1 ? `<td align="right" style="padding:10px 0;"><span style="color:${BRAND_COLORS.crimson};font-weight:600;font-size:14px;">×${item.quantity}</span></td>` : ''}
</tr>
</table>
`;
      });
      
      if (isProtein && bothProteinsAvailable) {
        menuHtml += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});border-radius:8px;margin-top:12px;border-collapse:collapse;">
<tr>
<td align="center" style="padding:12px 16px;">
<span style="color:white;font-size:14px;font-weight:bold;">⭐ Both proteins served to all guests</span>
</td>
</tr>
</table>
`;
      }
      
      menuHtml += `</td></tr></table>`;
    }
  });

  menuHtml += `</td></tr></table>`;
  return menuHtml;
}

/**
 * Generate Customer Contact Card for Admin emails
 * Shows customer name, email (clickable), phone (clickable)
 */
export function generateCustomerContactCard(quote: any): string {
  const contactName = quote.contact_name || 'Customer';
  const email = quote.email || '';
  const phone = quote.phone || '';

  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,${BRAND_COLORS.gold},${BRAND_COLORS.goldLight});border-radius:10px;margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:20px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.darkGray};font-size:16px;font-weight:bold;">📋 Customer Details</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td style="padding:6px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong>Name:</strong> ${contactName}
</td>
</tr>
<tr>
<td style="padding:6px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong>Email:</strong> <a href="mailto:${email}" style="color:${BRAND_COLORS.crimson};text-decoration:underline;">${email}</a>
</td>
</tr>
<tr>
<td style="padding:6px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong>Phone:</strong> <a href="tel:${phone}" style="color:${BRAND_COLORS.crimson};text-decoration:underline;">${phone}</a>
</td>
</tr>
</table>
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;border-collapse:collapse;">
<tr>
<td style="background:${BRAND_COLORS.crimson};border-radius:6px;">
<a href="mailto:${email}" style="display:inline-block;padding:10px 20px;color:${BRAND_COLORS.white};font-size:13px;font-weight:600;text-decoration:none;">📧 Reply to Customer</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
`;
}

/**
 * Generate Menu Summary Section - Compact display WITHOUT pricing
 * Perfect for payment confirmations and event reminders
 */
export function generateMenuSummarySection(quote: any): string {
  const formatItems = (items: any): string => {
    if (!items || (Array.isArray(items) && items.length === 0)) return '';
    if (typeof items === 'string') return items.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (Array.isArray(items)) return items.map((item: string) => item.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ');
    return '';
  };

  const proteins = formatItems(quote.proteins);
  const sides = formatItems(quote.sides);
  const appetizers = formatItems(quote.appetizers);
  const desserts = formatItems(quote.desserts);
  const drinks = formatItems(quote.drinks);
  const vegetarianEntrees = formatItems(quote.vegetarian_entrees);

  const hasContent = proteins || sides || appetizers || desserts || drinks || vegetarianEntrees;
  if (!hasContent) return '';

  let html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.lightGray}" style="background:${BRAND_COLORS.lightGray};border-radius:10px;border-left:4px solid ${BRAND_COLORS.gold};margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:20px;">
<h3 style="margin:0 0 16px 0;color:${BRAND_COLORS.crimson};font-size:18px;">🍽️ Your Menu</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
`;

  if (proteins) {
    html += `
<tr>
<td style="padding:8px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong style="color:${BRAND_COLORS.crimson};">🥩 Proteins:</strong> ${proteins}
${quote.both_proteins_available ? '<br><span style="color:#D97706;font-size:13px;">⭐ Both proteins served to all guests</span>' : ''}
</td>
</tr>`;
  }

  if (sides) {
    html += `
<tr>
<td style="padding:8px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong style="color:${BRAND_COLORS.crimson};">🥗 Sides:</strong> ${sides}
</td>
</tr>`;
  }

  if (appetizers) {
    html += `
<tr>
<td style="padding:8px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong style="color:${BRAND_COLORS.crimson};">🍤 Appetizers:</strong> ${appetizers}
</td>
</tr>`;
  }

  if (desserts) {
    html += `
<tr>
<td style="padding:8px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong style="color:${BRAND_COLORS.crimson};">🍰 Desserts:</strong> ${desserts}
</td>
</tr>`;
  }

  if (drinks) {
    html += `
<tr>
<td style="padding:8px 0;font-size:14px;color:${BRAND_COLORS.darkGray};">
<strong style="color:${BRAND_COLORS.crimson};">🥤 Beverages:</strong> ${drinks}
</td>
</tr>`;
  }

  if (vegetarianEntrees) {
    html += `
<tr>
<td style="padding:8px 0;font-size:14px;color:#166534;background:#dcfce7;border-radius:6px;padding-left:12px;margin-top:8px;">
<strong>🌱 Vegetarian:</strong> ${vegetarianEntrees}${quote.guest_count_with_restrictions ? ` (${quote.guest_count_with_restrictions} guests)` : ''}
</td>
</tr>`;
  }

  html += `
</table>
</td>
</tr>
</table>
`;

  return html;
}

/**
 * Generate Supplies Summary Section - Compact display of requested supplies
 */
export function generateSuppliesSummarySection(quote: any): string {
  const supplies: string[] = [];
  const serviceType = (quote?.service_type || '').toLowerCase();
  const isFullService = serviceType === 'full-service' || serviceType === 'full_service';
  const chaferLabel = isFullService ? 'Chafing Dishes with Fuel' : 'Food Warmers with Fuel';
  
  if (quote.plates_requested) supplies.push('Plates');
  if (quote.cups_requested) supplies.push('Cups');
  if (quote.napkins_requested) supplies.push('Napkins');
  if (quote.serving_utensils_requested) supplies.push('Serving Utensils');
  if (quote.chafers_requested) supplies.push(chaferLabel);
  if (quote.ice_requested) supplies.push('Ice');

  if (supplies.length === 0 && !quote.theme_colors) return '';

  const suppliesBadges = supplies.map(s => 
    `<span style="display:inline-block;background:${BRAND_COLORS.white};color:${BRAND_COLORS.darkGray};padding:6px 12px;border-radius:6px;font-size:13px;margin:3px;border:1px solid #ddd;">✓ ${s}</span>`
  ).join('');

  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.lightGray};border-radius:10px;border-left:4px solid ${BRAND_COLORS.crimson};margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:20px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:16px;">📦 Supplies & Equipment</h3>
${supplies.length > 0 ? `<div style="margin-bottom:10px;">${suppliesBadges}</div>` : '<p style="margin:0 0 10px 0;font-size:14px;color:#666;">No additional supplies requested</p>'}
${quote.theme_colors ? `<p style="margin:0;font-size:14px;color:${BRAND_COLORS.darkGray};"><strong>🎨 Theme/Colors:</strong> ${quote.theme_colors}</p>` : ''}
</td>
</tr>
</table>
`;
}

/**
 * Generate Menu with Integrated Pricing Section
 * Combines menu items with inline pricing, total at top
 */
export function generateMenuWithPricingSection(
  lineItems: any[], 
  subtotal: number, 
  taxAmount: number, 
  totalAmount: number,
  bothProteinsAvailable?: boolean,
  isGovernment?: boolean,
  guestCount?: number,
  serviceType?: string
): string {
  if (!lineItems || lineItems.length === 0) {
    return '';
  }

  const fmtCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  // Group items by category
  const itemsByCategory = lineItems.reduce((acc: any, item: any) => {
    const category = item.category || 'Other Items';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categoryIcons: Record<string, string> = {
    'Proteins': '🥩',
    'Sides': '🥗',
    'dietary': '🌱',
    'Appetizers': '🍤',
    'appetizers': '🍤',
    'Desserts': '🍰',
    'desserts': '🍰',
    'Beverages': '🥤',
    'Service Items': '🍴',
    'service': '🍴',
    'package': '📦',
    'supplies': '🧊',
    'Other Items': '📦'
  };

  const categoryLabels: Record<string, string> = {
    'dietary': 'Dietary Accommodations',
    'package': 'Main Entrées',
    'appetizers': 'Starters',
    'desserts': 'Sweets',
    'service': 'Service & Staffing',
    'supplies': 'Equipment',
  };

  const categoryOrder = ['package', 'Proteins', 'Sides', 'dietary', 'Appetizers', 'appetizers', 'Desserts', 'desserts', 'Beverages', 'Service Items', 'service', 'supplies', 'Other Items'];

  // Format service type
  const serviceLabel = serviceType ? formatServiceType(serviceType) : 'Catering';

  // Start with prominent total at top
  let html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;border-collapse:collapse;">
<tr>
<td>
<!-- Total Summary Box - bgcolor for Outlook -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.crimson}" style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});border-radius:12px;margin-bottom:20px;border-collapse:collapse;">
<tr>
<td align="center" style="padding:24px;">
<span style="font-size:14px;color:rgba(255,255,255,0.9);text-transform:uppercase;letter-spacing:1px;">Your Total</span>
<h2 style="margin:8px 0 4px 0;font-size:36px;color:${BRAND_COLORS.white};font-weight:bold;">${fmtCurrency(totalAmount)}</h2>
<span style="font-size:14px;color:rgba(255,255,255,0.85);">${guestCount ? `${guestCount} guests • ` : ''}${serviceLabel}</span>
</td>
</tr>
</table>

<!-- Menu & Pricing Section -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.white}" style="background:${BRAND_COLORS.white};border:2px solid ${BRAND_COLORS.lightGray};border-radius:12px;border-collapse:collapse;">
<tr>
<td style="padding:24px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td align="center" style="padding-bottom:16px;">
<h3 style="margin:0;color:${BRAND_COLORS.crimson};font-size:20px;">🍽️ Menu & Pricing</h3>
</td>
</tr>
</table>
`;

  // Render each category with inline pricing - compact mode
  categoryOrder.forEach(category => {
    if (itemsByCategory[category]) {
      const items = itemsByCategory[category];
      const icon = categoryIcons[category] || '📦';
      const isProtein = category === 'Proteins';
      const isDietary = category === 'dietary';
      const displayLabel = categoryLabels[category] || category;
      
      // Check if we should skip the category header (single item with title matching category label)
      const isSingleItem = items.length === 1;
      const firstItemTitle = items[0]?.title?.toLowerCase() || '';
      const categoryLower = (categoryLabels[category] || category).toLowerCase();
      const skipHeader = isSingleItem && (
        firstItemTitle.includes(categoryLower) || 
        categoryLower.includes(firstItemTitle.split(' ')[0]) ||
        firstItemTitle.includes('package') && category === 'package' ||
        firstItemTitle.includes('selection') ||
        firstItemTitle.includes('service')
      );
      
      let bgColor = '#ffffff';
      let borderColor = BRAND_COLORS.lightGray;
      if (isProtein) {
        bgColor = '#FFF5E6';
        borderColor = BRAND_COLORS.gold;
      } else if (isDietary) {
        bgColor = '#dcfce7';
        borderColor = '#22c55e';
      }
      
      html += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bgColor};border:1px solid ${borderColor};border-radius:8px;margin:8px 0;border-collapse:collapse;">
<tr>
<td style="padding:${skipHeader ? '12px' : '14px'};">
`;
      
      // Only show category header if not skipping
      if (!skipHeader) {
        html += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td style="padding-bottom:8px;">
<span style="font-size:18px;vertical-align:middle;">${icon}</span>
<span style="font-size:15px;font-weight:bold;color:${isDietary ? '#166534' : BRAND_COLORS.crimson};vertical-align:middle;margin-left:6px;">${displayLabel}</span>
</td>
</tr>
</table>
`;
      }
      
      // Add each item with inline pricing - more compact
      items.forEach((item: any, index: number) => {
        const borderBottom = index < items.length - 1 ? 'border-bottom:1px solid #eee;' : '';
        const unitPriceStr = item.unit_price ? fmtCurrency(item.unit_price) : '';
        const totalPriceStr = item.total_price ? fmtCurrency(item.total_price) : '';
        const qtyStr = item.quantity > 1 ? `${item.quantity} × ${unitPriceStr}` : '';
        
        // Show icon inline if we skipped the header
        const inlineIcon = skipHeader ? `<span style="font-size:16px;margin-right:6px;">${icon}</span>` : '';
        
        html += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${borderBottom}border-collapse:collapse;">
<tr>
<td style="padding:6px 0;width:65%;">
${inlineIcon}<strong style="color:#2d2d2d;font-size:14px;">${item.title || item.description}</strong>
${item.description && item.title ? `<br><span style="color:#666;font-size:12px;line-height:1.4;">${item.description}</span>` : ''}
${qtyStr ? `<span style="color:#888;font-size:11px;margin-left:8px;">(${qtyStr})</span>` : ''}
</td>
<td style="padding:6px 0;text-align:right;width:35%;vertical-align:top;">
<span style="color:${BRAND_COLORS.crimson};font-weight:bold;font-size:14px;">${totalPriceStr}</span>
</td>
</tr>
</table>
`;
      });
      
      // Add "both proteins" note if applicable
      if (isProtein && bothProteinsAvailable) {
        html += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});border-radius:6px;margin-top:8px;border-collapse:collapse;">
<tr>
<td align="center" style="padding:8px 12px;">
<span style="color:white;font-size:13px;font-weight:bold;">⭐ Both proteins served to all guests</span>
</td>
</tr>
</table>
`;
      }
      
      html += `</td></tr></table>`;
    }
  });

  // Add subtotal, tax, and total at bottom
  html += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-top:2px solid ${BRAND_COLORS.lightGray};border-collapse:collapse;">
<tr>
<td style="padding:12px 0;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td style="padding:6px 0;font-size:14px;color:#666;">Subtotal</td>
<td style="padding:6px 0;text-align:right;font-size:14px;color:#666;">${fmtCurrency(subtotal)}</td>
</tr>
`;

  if (taxAmount > 0) {
    const hospitalityTax = Math.round(subtotal * 0.02);
    const serviceTax = Math.round(subtotal * 0.07);
    html += `
<tr>
<td style="padding:4px 0;font-size:13px;color:#888;">SC Hospitality Tax (2%)</td>
<td style="padding:4px 0;text-align:right;font-size:13px;color:#888;">${fmtCurrency(hospitalityTax)}</td>
</tr>
<tr>
<td style="padding:4px 0;font-size:13px;color:#888;">SC Service Tax (7%)</td>
<td style="padding:4px 0;text-align:right;font-size:13px;color:#888;">${fmtCurrency(serviceTax)}</td>
</tr>
`;
  } else {
    html += `
<tr>
<td style="padding:4px 0;font-size:13px;color:#3B82F6;">Tax (Exempt)</td>
<td style="padding:4px 0;text-align:right;font-size:13px;color:#3B82F6;">$0.00</td>
</tr>
`;
  }

  html += `
<tr>
<td style="padding:12px 0 0 0;font-size:18px;font-weight:bold;color:${BRAND_COLORS.crimson};border-top:2px solid ${BRAND_COLORS.gold};">Total Due</td>
<td style="padding:12px 0 0 0;text-align:right;font-size:18px;font-weight:bold;color:${BRAND_COLORS.crimson};border-top:2px solid ${BRAND_COLORS.gold};">${fmtCurrency(totalAmount)}</td>
</tr>
</table>
</td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>
</table>
`;

  return html;
}

export function generateFooter(): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.lightGray}" style="background:${BRAND_COLORS.lightGray};border-top:3px solid ${BRAND_COLORS.gold};border-collapse:collapse;">
<tr>
<td align="center" style="padding:24px 16px;">
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td align="center" style="padding-bottom:12px;">
<img src="${LOGO_URLS.red}" alt="Soul Train's Eatery" width="50" height="50" style="display:block;width:50px;height:50px;" />
</td>
</tr>
<tr>
<td align="center">
<h3 style="margin:0 0 8px 0;color:${BRAND_COLORS.crimson};font-size:18px;">Soul Train's Eatery</h3>
<p style="margin:5px 0;font-weight:600;color:#666;font-size:13px;">A Family-Run Business Since Day One</p>
</td>
</tr>
<tr>
<td align="center" style="padding:15px 0;">
<table width="80%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr><td style="border-top:1px solid #ddd;"></td></tr>
</table>
</td>
</tr>
<tr>
<td align="center">
<p style="margin:5px 0;font-size:13px;color:#666;">Phone: <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};text-decoration:none;font-weight:600;">(843) 970-0265</a></p>
<p style="margin:5px 0;font-size:13px;color:#666;">Email: <a href="mailto:soultrainseatery@gmail.com" style="color:${BRAND_COLORS.crimson};text-decoration:none;font-weight:600;">soultrainseatery@gmail.com</a></p>
</td>
</tr>
<tr>
<td align="center" style="padding-top:12px;">
<p style="margin:0 0 5px 0;font-size:12px;color:#888;">Proudly serving Charleston's Lowcountry and surrounding areas</p>
<p style="margin:0;font-size:11px;color:#999;">Trusted catering partner for weddings, graduations, military functions, corporate events & social gatherings</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
`;
}

export function generateLineItemsTable(lineItems: any[], subtotal: number, taxAmount: number, total: number): string {
  const fmtCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  let tableHtml = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border-collapse:collapse;">
<tr>
<td>
<h3 style="color:${BRAND_COLORS.crimson};margin:0 0 12px 0;font-size:18px;">📋 Detailed Pricing Breakdown</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
<tr style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});">
<th style="padding:10px 8px;text-align:left;color:white;font-size:14px;">Item</th>
<th style="padding:10px 8px;text-align:right;color:white;font-size:14px;width:50px;">Qty</th>
<th style="padding:10px 8px;text-align:right;color:white;font-size:13px;width:70px;">Price</th>
<th style="padding:10px 8px;text-align:right;color:white;font-size:14px;width:70px;">Total</th>
</tr>
`;

  lineItems.forEach((item: any, index: number) => {
    const bgColor = index % 2 === 0 ? '#FFF5E6' : '#ffffff';
    tableHtml += `
<tr style="background:${bgColor};">
<td style="padding:10px 8px;border-bottom:1px solid #e9ecef;">
<div style="font-weight:600;color:#333;font-size:14px;">${item.title}</div>
${item.description ? `<div style="font-size:12px;color:#666;margin-top:2px;">${item.description}</div>` : ''}
</td>
<td style="padding:10px 8px;text-align:right;font-size:14px;border-bottom:1px solid #e9ecef;">${item.quantity}</td>
<td style="padding:10px 8px;text-align:right;font-size:13px;border-bottom:1px solid #e9ecef;">${fmtCurrency(item.unit_price)}</td>
<td style="padding:10px 8px;text-align:right;font-weight:600;font-size:14px;border-bottom:1px solid #e9ecef;">${fmtCurrency(item.total_price)}</td>
</tr>
`;
  });

  tableHtml += `
<tr style="background:#f8f9fa;border-top:2px solid ${BRAND_COLORS.gold};">
<td colspan="3" style="padding:10px 8px;text-align:right;font-weight:600;font-size:14px;">Subtotal:</td>
<td style="padding:10px 8px;text-align:right;font-weight:600;font-size:14px;">${fmtCurrency(subtotal)}</td>
</tr>
`;

  if (taxAmount > 0) {
    const hospitalityTax = Math.round(subtotal * 0.02);
    const serviceTax = Math.round(subtotal * 0.07);
    tableHtml += `
<tr style="background:#f8f9fa;">
<td colspan="3" style="padding:8px;text-align:right;font-size:13px;color:#666;">SC Hospitality Tax (2%):</td>
<td style="padding:8px;text-align:right;font-size:13px;color:#666;">${fmtCurrency(hospitalityTax)}</td>
</tr>
<tr style="background:#f8f9fa;">
<td colspan="3" style="padding:8px;text-align:right;font-size:13px;color:#666;">SC Service Tax (7%):</td>
<td style="padding:8px;text-align:right;font-size:13px;color:#666;">${fmtCurrency(serviceTax)}</td>
</tr>
`;
  } else {
    tableHtml += `
<tr style="background:#f8f9fa;">
<td colspan="3" style="padding:8px;text-align:right;font-size:13px;color:#3B82F6;">Tax (Exempt):</td>
<td style="padding:8px;text-align:right;font-size:13px;color:#3B82F6;">$0.00</td>
</tr>
`;
  }

  tableHtml += `
<tr style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});">
<td colspan="3" style="padding:12px 8px;text-align:right;font-size:16px;font-weight:bold;color:white;">TOTAL:</td>
<td style="padding:12px 8px;text-align:right;font-size:16px;font-weight:bold;color:white;">${fmtCurrency(total)}</td>
</tr>
</table>
</td>
</tr>
</table>
`;

  return tableHtml;
}

export function generateTrackingPixel(invoiceId: string, emailType: string): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) return '';
  return `<img src="${supabaseUrl}/functions/v1/track-email-open?invoice=${invoiceId}&type=${emailType}&t=${Date.now()}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" />`;
}

export function generatePreheader(text: string): string {
  return `<div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${text}</div>`;
}

/**
 * Status badge - TABLE-BASED, no embedded styles
 */
export function generateStatusBadge(
  status: 'approved' | 'rejected' | 'pending' | 'info',
  title: string,
  description: string
): string {
  const statusConfig = {
    approved: { icon: '✅', bgColor: '#16a34a', bgColorDark: '#15803d' },
    rejected: { icon: '❌', bgColor: '#dc2626', bgColorDark: '#b91c1c' },
    pending: { icon: '⚠️', bgColor: '#ea580c', bgColorDark: '#c2410c' },
    info: { icon: '💡', bgColor: BRAND_COLORS.gold, bgColorDark: '#f59e0b' }
  };

  const config = statusConfig[status];

  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${config.bgColor}" style="background-color:${config.bgColor};background:linear-gradient(135deg,${config.bgColor},${config.bgColorDark});border-radius:12px;margin:25px 0;border-collapse:collapse;">
<tr>
<td style="padding:20px;">
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td style="vertical-align:top;padding-right:15px;">
<span style="font-size:40px;line-height:1;">${config.icon}</span>
</td>
<td style="vertical-align:top;">
<h3 style="margin:0 0 8px 0;color:white;font-size:20px;font-weight:bold;">${title}</h3>
<p style="margin:0;color:rgba(255,255,255,0.95);font-size:15px;line-height:1.5;">${description}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
`;
}

export function generatePaymentConfirmationEmail(quote: any, amount: number, isFullPayment: boolean): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-collapse:collapse;">
<tr><td>${generateEmailHeader()}</td></tr>
<tr>
<td style="padding:30px;">
<h2 style="color:${BRAND_COLORS.crimson};margin:0 0 16px 0;">💰 Payment Received!</h2>
<p style="font-size:16px;margin:0 0 20px 0;">We've received your ${isFullPayment ? 'full' : 'deposit'} payment of <strong>$${(amount / 100).toFixed(2)}</strong>.</p>
${isFullPayment ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.gold}20;border-radius:8px;margin:20px 0;border-collapse:collapse;">
<tr><td style="padding:20px;"><h3 style="color:${BRAND_COLORS.crimson};margin:0;">✅ Your Event is Confirmed!</h3></td></tr>
</table>
` : ''}
${generateEventDetailsCard(quote)}
<p style="margin-top:30px;">We're looking forward to making your event special!</p>
</td>
</tr>
<tr><td>${generateFooter()}</td></tr>
</table>
`;
}

// Default catering agreement terms
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Georgia,serif;background:#f9fafb;border-radius:12px;margin:24px 0;border-collapse:collapse;">
<tr>
<td style="padding:24px;">
<h3 style="color:${BRAND_COLORS.crimson};margin:0 0 16px 0;font-size:20px;">📝 ${terms.agreement_title}</h3>
<p style="color:#666;font-size:13px;line-height:1.6;margin:0 0 20px 0;font-style:italic;">${terms.intro_text}</p>
${sections.map((section: any) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border-collapse:collapse;">
<tr>
<td>
<h4 style="color:#333;font-size:15px;font-weight:600;margin:0 0 8px 0;border-bottom:2px solid ${BRAND_COLORS.gold};padding-bottom:4px;">${section.title}</h4>
${section.description ? `<p style="color:#666;font-size:13px;line-height:1.6;margin:0 0 8px 0;">${section.description}</p>` : ''}
${section.items && section.items.length > 0 ? `
<ul style="margin:0;padding-left:20px;">
${section.items.map((item: string) => `<li style="color:#666;font-size:13px;line-height:1.6;margin-bottom:6px;">${item}</li>`).join('')}
</ul>
` : ''}
</td>
</tr>
</table>
`).join('')}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin-top:20px;border-collapse:collapse;">
<tr>
<td style="padding:16px;">
<p style="font-size:13px;color:#333;margin:0 0 8px 0;font-weight:600;">${terms.acceptance_text}</p>
<p style="font-size:13px;color:#666;margin:0;font-style:italic;">${terms.closing_text}</p>
</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-top:1px solid #ddd;border-collapse:collapse;">
<tr>
<td style="padding-top:16px;">
<p style="margin:0;font-weight:600;color:#333;font-size:14px;">${terms.owner_signature.name}</p>
<p style="margin:4px 0 0 0;font-size:12px;color:#666;">${terms.owner_signature.title}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
`;
}

/**
 * Generate CTA button - bulletproof for all email clients
 */
export function generateCTAButton(text: string, href: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const bgColor = variant === 'primary' 
    ? `linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark})`
    : BRAND_COLORS.gold;
  const textColor = variant === 'primary' ? BRAND_COLORS.white : BRAND_COLORS.darkGray;

  return `
<table cellpadding="0" cellspacing="0" border="0" style="margin:20px auto;border-collapse:collapse;">
<tr>
<td align="center" bgcolor="${variant === 'primary' ? BRAND_COLORS.crimson : BRAND_COLORS.gold}" style="background-color:${variant === 'primary' ? BRAND_COLORS.crimson : BRAND_COLORS.gold};background:${bgColor};border-radius:8px;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="16%" stroke="f" fillcolor="${variant === 'primary' ? BRAND_COLORS.crimson : BRAND_COLORS.gold}">
<w:anchorlock/>
<center>
<![endif]-->
<a href="${href}" style="display:inline-block;padding:16px 32px;color:${textColor};font-weight:bold;font-size:16px;text-decoration:none;border-radius:8px;text-align:center;min-width:150px;">${text}</a>
<!--[if mso]>
</center>
</v:roundrect>
<![endif]-->
</td>
</tr>
</table>
<p style="margin:8px 0 0 0;text-align:center;font-size:12px;color:#666;line-height:1.4;">
  If the button doesn't work, copy and paste this link:<br>
  <a href="${href}" style="color:${BRAND_COLORS.crimson};text-decoration:underline;">${href}</a>
</p>
`;
}

/**
 * Generate multi-button CTA section for estimate emails
 * Allows customers to take action directly from email
 */
export function generateEstimateActionButtons(portalUrl: string): string {
  // Ensure proper URL parameter handling
  const separator = portalUrl.includes('?') ? '&' : '?';
  // Default/fallback (older flow): approve inside portal
  let approveUrl = `${portalUrl}${separator}action=approve`;
  const changesUrl = `${portalUrl}${separator}action=changes`;

  // Preferred flow: one-click approve page (keeps approval out of the portal UI)
  // /approve?token=...
  try {
    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
    const u = new URL(portalUrl);
    const token = u.searchParams.get('token');
    if (token) {
      const approve = new URL('/approve', siteUrl);
      approve.searchParams.set('token', token);
      approveUrl = approve.toString();
    }
  } catch {
    // keep fallback
  }

  return `
<div style="margin:30px 0;text-align:center;">
  <p style="margin:0 0 20px 0;font-size:16px;color:#666;">Ready to move forward?</p>
  
  <!-- Primary: Approve Button -->
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 15px auto;border-collapse:collapse;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});border-radius:8px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${approveUrl}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" stroke="f" fillcolor="${BRAND_COLORS.crimson}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-weight:bold;font-size:16px;">✅ Approve Estimate</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
         <a href="${approveUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:16px 40px;color:${BRAND_COLORS.white};font-weight:bold;font-size:16px;text-decoration:none;border-radius:8px;text-align:center;">✅ Approve Estimate</a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>
  
  <!-- Secondary buttons row -->
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
    <tr>
      <!-- Request Changes Button -->
      <td align="center" style="padding:0 8px;">
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td align="center" style="background:${BRAND_COLORS.gold};border-radius:6px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${changesUrl}" style="height:44px;v-text-anchor:middle;width:160px;" arcsize="14%" stroke="f" fillcolor="${BRAND_COLORS.gold}">
              <w:anchorlock/>
              <center style="color:#333333;font-weight:600;font-size:14px;">💬 Request Changes</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
               <a href="${changesUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;color:${BRAND_COLORS.darkGray};font-weight:600;font-size:14px;text-decoration:none;border-radius:6px;text-align:center;">💬 Request Changes</a>
              <!--<![endif]-->
            </td>
          </tr>
        </table>
      </td>
      
      <!-- View Details Button -->
      <td align="center" style="padding:0 8px;">
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td align="center" style="background:#f5f5f5;border-radius:6px;border:1px solid #ddd;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${portalUrl}" style="height:44px;v-text-anchor:middle;width:140px;" arcsize="14%" stroke="t" strokecolor="#dddddd" fillcolor="#f5f5f5">
              <w:anchorlock/>
              <center style="color:#333333;font-size:14px;">View Full Details</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
               <a href="${portalUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;color:${BRAND_COLORS.darkGray};font-size:14px;text-decoration:none;border-radius:6px;text-align:center;">View Full Details</a>
              <!--<![endif]-->
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
`;
}

// ============================================================================
// HERO SECTION GENERATOR - Consistent branded hero for all emails
// ============================================================================

/**
 * Generate a branded hero section - replaces inconsistent headers across emails
 * This is the ONLY hero generator that should be used in emails
 */
export function generateHeroSection(config: HeroConfig): string {
  const variantColors: Record<HeroVariant, { bg: string; bgDark: string }> = {
    crimson: { bg: BRAND_COLORS.crimson, bgDark: BRAND_COLORS.crimsonDark },
    gold: { bg: '#d4a017', bgDark: '#b8860b' },
    green: { bg: '#16a34a', bgDark: '#15803d' },
    blue: { bg: '#2563eb', bgDark: '#1d4ed8' },
    orange: { bg: '#ea580c', bgDark: '#c2410c' },
  };

  const colors = variantColors[config.variant] || variantColors.crimson;

  // Use VML for Outlook gradient fallback + bgcolor attribute for plain fallback
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${colors.bg}" style="background:linear-gradient(135deg,${colors.bg},${colors.bgDark});border-collapse:collapse;">
<!--[if gte mso 9]>
<tr><td bgcolor="${colors.bg}" style="background-color:${colors.bg};">
<![endif]-->
<tr>
<td align="center" style="padding:30px 20px;">
<table cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:12px;">
<img src="${LOGO_URLS.white}" alt="Soul Train's Eatery" width="70" height="70" style="display:block;width:70px;height:70px;" />
</td>
</tr>
<tr>
<td align="center">
<div style="display:inline-block;background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:20px;margin-bottom:12px;">
<span style="color:${BRAND_COLORS.white};font-size:13px;font-weight:600;letter-spacing:0.5px;">${config.badge}</span>
</div>
</td>
</tr>
<tr>
<td align="center">
<h1 style="margin:0;font-size:26px;font-weight:bold;color:${BRAND_COLORS.white};line-height:1.2;">${config.title}</h1>
${config.subtitle ? `<p style="margin:8px 0 0 0;font-size:14px;color:rgba(255,255,255,0.9);line-height:1.3;">${config.subtitle}</p>` : ''}
</td>
</tr>
</table>
</td>
</tr>
<!--[if gte mso 9]>
</td></tr>
<![endif]-->
</table>
`;
}

// ============================================================================
// MASTER EMAIL GENERATOR - Single source of truth for all emails
// ============================================================================

/**
 * Render a content block based on its type
 * Internal helper for generateStandardEmail
 */
function renderContentBlock(block: ContentBlock, config: StandardEmailConfig): string {
  switch (block.type) {
    case 'event_details':
      return config.quote ? generateEventDetailsCard(config.quote) : '';
    
    case 'menu':
      return config.lineItems && config.lineItems.length > 0 
        ? generateMenuSection(config.lineItems, config.quote?.both_proteins_available)
        : '';
    
    case 'pricing':
      if (!config.lineItems || !config.invoice) return '';
      return generateLineItemsTable(
        config.lineItems,
        config.invoice.subtotal || 0,
        config.invoice.tax_amount || 0,
        config.invoice.total_amount || 0
      );
    
    case 'menu_with_pricing':
      if (!config.lineItems || !config.invoice) return '';
      return generateMenuWithPricingSection(
        config.lineItems,
        config.invoice.subtotal || 0,
        config.invoice.tax_amount || 0,
        config.invoice.total_amount || 0,
        config.quote?.both_proteins_available,
        config.quote?.compliance_level === 'government',
        config.quote?.guest_count,
        config.quote?.service_type
      );
    
    case 'customer_contact':
      return config.quote ? generateCustomerContactCard(config.quote) : '';
    
    case 'service_addons':
      return config.quote ? generateServiceAddonsSection(config.quote) : '';
    
    case 'status_badge':
      if (!block.data) return '';
      return generateStatusBadge(block.data.status, block.data.title, block.data.description);
    
    case 'terms':
      const eventType = config.quote?.compliance_level === 'government' ? 'government' : 'standard';
      return generateCateringAgreementHTML(eventType);
    
    case 'text':
      return block.data?.html || `<p style="margin:16px 0;font-size:15px;color:#333;line-height:1.6;">${block.data?.text || ''}</p>`;
    
    case 'custom_html':
      return block.data?.html || '';
    
    case 'cta':
      if (!block.data) return '';
      return generateCTAButton(block.data.text, block.data.href, block.data.variant || 'primary');
    
    case 'menu_summary':
      return config.quote ? generateMenuSummarySection(config.quote) : '';
    
    case 'supplies_summary':
      return config.quote ? generateSuppliesSummarySection(config.quote) : '';
    
    default:
      return '';
  }
}

/**
 * MASTER EMAIL GENERATOR
 * All emails MUST use this function to ensure consistent branding.
 * This is the single source of truth for email structure.
 * 
 * @param config - Email configuration with hero, content blocks, and optional CTA
 * @returns Minified HTML string ready for email sending
 */
export function generateStandardEmail(config: StandardEmailConfig): string {
  const contentHtml = config.contentBlocks
    .map(block => renderContentBlock(block, config))
    .filter(html => html.length > 0)
    .join('');

  const ctaHtml = config.ctaButton 
    ? generateCTAButton(config.ctaButton.text, config.ctaButton.href, config.ctaButton.variant)
    : '';

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${config.heroSection.title}</title>
<style>${EMAIL_STYLES}</style>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
${generatePreheader(config.preheaderText)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
<tr>
<td align="center" style="padding:20px 10px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND_COLORS.white}" style="max-width:600px;background:${BRAND_COLORS.white};border-collapse:collapse;">
<tr>
<td>
${generateHeroSection(config.heroSection)}
</td>
</tr>
<tr>
<td style="padding:24px 20px;background:${BRAND_COLORS.white};">
${contentHtml}
${ctaHtml}
</td>
</tr>
<tr>
<td>
${generateFooter()}
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;

  return minifyEmailHTML(emailHtml);
}

// ============================================================================
// EMAIL CONFIGURATION PRESETS - For use with preview and consistent emails
// ============================================================================

// ============================================================================
// EMAIL CONTENT BLOCKS GENERATOR - Single source of truth for email content
// ============================================================================

export interface EmailContentContext {
  quote: any;
  invoice?: any;
  lineItems?: any[];
  milestones?: any[];
  portalUrl?: string;
  isUpdated?: boolean;
  paymentAmount?: number;
  isFullPayment?: boolean;
}

/**
 * Get standardized content blocks for any email type
 * This is the SINGLE SOURCE OF TRUTH for email content structure
 * Both preview-email and send-customer-portal-email MUST use this function
 */
export function getEmailContentBlocks(
  emailType: EmailType,
  variant: 'customer' | 'admin',
  context: EmailContentContext
): { contentBlocks: ContentBlock[]; ctaButton?: { text: string; href: string; variant: 'primary' | 'secondary' } } {
  const { quote, invoice, lineItems, milestones, portalUrl, isUpdated, paymentAmount, isFullPayment } = context;
  const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
  const effectivePortalUrl = portalUrl || `${siteUrl}/estimate?token=${invoice?.customer_access_token || 'sample-token'}`;

  let contentBlocks: ContentBlock[] = [];
  let ctaButton: { text: string; href: string; variant: 'primary' | 'secondary' } | undefined;

  switch (emailType) {
    case 'quote_received':
      // Admin notification of new quote
      contentBlocks = [
        { type: 'text', data: { html: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;"><strong>${quote.contact_name}</strong> has submitted a new quote request for <strong>${quote.event_name}</strong>.</p>` }},
        { type: 'customer_contact' },
        { type: 'event_details' },
        { type: 'menu_summary' },
        { type: 'supplies_summary' },
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'View in Admin Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      break;

    case 'quote_confirmation':
      // Customer welcome/confirmation - now includes menu selections
      contentBlocks = [
        { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Welcome, ${quote.contact_name}!</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Thank you for choosing Soul Train's Eatery for your upcoming event. We're thrilled to be part of your special occasion!</p>` }},
        { type: 'event_details' },
        { type: 'menu_summary' },
        { type: 'supplies_summary' },
        { type: 'service_addons' },
        { type: 'custom_html', data: { html: `
          <div style="background:${BRAND_COLORS.lightGray};padding:15px;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:20px 0;">
            <strong>🔒 Secure Access:</strong> Your personal link is valid for one year and can be used anytime to check your event status.
          </div>
        ` }},
        { type: 'custom_html', data: { html: `
          <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">🎯 What Happens Next?</h3>
          <ol style="line-height:1.8;margin:0;padding-left:20px;">
            <li><strong>Review Period:</strong> Our family is carefully reviewing your requirements</li>
            <li><strong>Custom Estimate:</strong> We'll prepare a detailed estimate within 24 hours</li>
            <li><strong>Approval:</strong> Review and approve your estimate through the portal</li>
            <li><strong>Payment:</strong> Secure online payment to confirm your booking</li>
            <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
          </ol>
        ` }},
        { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">Questions? Just reply to this email — our family is happy to help.</p>` }}
      ];
      ctaButton = { text: 'Access Your Event Portal', href: effectivePortalUrl, variant: 'primary' };
      break;

    case 'estimate_ready':
      // Add multi-button CTA for direct actions from email
      const estimateActionButtonsHtml = generateEstimateActionButtons(effectivePortalUrl);

      const isGovernment = String(quote?.compliance_level || '').toLowerCase() === 'government';
      const firstMilestone = milestones?.[0];
      const depositText = isGovernment
        ? `Government contract terms apply. Payment is due Net 30 (after services are completed).`
        : (firstMilestone
            ? `To secure your date, your first payment is <strong>${formatCurrency(firstMilestone.amount_cents)}</strong>${firstMilestone.percentage != null ? ` (${firstMilestone.percentage}%)` : ''}.`
            : `To secure your date, a deposit is required after you approve your estimate.`);

      const estimateValidityHtml = `
        <div style="background:${BRAND_COLORS.lightGray};padding:16px 16px;border-radius:10px;border-left:4px solid ${BRAND_COLORS.gold};margin:18px 0;">
          <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;">
            <strong>⏳ Estimate Validity:</strong> This estimate is valid for <strong>7 days</strong> from the date this email was sent.
          </p>
          <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;">
            <strong>📅 Dates Fill Up Quickly:</strong> We recommend approving your estimate as soon as you’re ready.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;">${depositText}</p>
        </div>
      `;

      // Optional schedule preview (when milestones exist)
      const estimatePaymentScheduleHtml = milestones && milestones.length > 0 ? `
        <div style="margin:25px 0;">
          <h3 style="color:${BRAND_COLORS.crimson};margin-bottom:15px;">📅 Your Payment Schedule</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:${BRAND_COLORS.lightGray};">
                <th style="padding:12px 10px;text-align:left;border-bottom:2px solid ${BRAND_COLORS.gold};">Payment</th>
                <th style="padding:12px 10px;text-align:left;border-bottom:2px solid ${BRAND_COLORS.gold};">Due</th>
                <th style="padding:12px 10px;text-align:right;border-bottom:2px solid ${BRAND_COLORS.gold};">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${milestones.map((m: any, i: number) => `
                <tr style="background:${i === 0 ? '#fff3cd' : (i % 2 === 0 ? '#fafafa' : '#ffffff')};">
                  <td style="padding:12px 10px;border-bottom:1px solid #e5e5e5;">
                    ${(m.milestone_type || 'payment').replaceAll('_', ' ')}
                    ${i === 0 ? '<span style="color:#d97706;font-weight:bold;margin-left:8px;">← First Payment</span>' : ''}
                  </td>
                  <td style="padding:12px 10px;border-bottom:1px solid #e5e5e5;">
                    ${m.is_due_now ? '<strong style="color:#d97706;">Due Now</strong>' : (m.due_date ? formatDate(m.due_date) : 'Due upon approval')}
                  </td>
                  <td style="padding:12px 10px;text-align:right;border-bottom:1px solid #e5e5e5;font-weight:${i === 0 ? 'bold' : 'normal'};">
                    ${formatCurrency(m.amount_cents)}${m.percentage != null ? ` (${m.percentage}%)` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin:10px 0 0 0;font-size:13px;color:#666;">Your full payment options will appear in the portal after you approve the estimate.</p>
        </div>
      ` : '';

      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="font-size:16px;margin:0 0 12px 0;">Thank you for reaching out, ${quote.contact_name}!</p>
          <p style="font-size:15px;margin:0 0 0 0;line-height:1.6;">We’ve prepared ${isUpdated ? 'an updated' : 'your'} catering estimate for <strong>${quote.event_name}</strong>. Review the details below, then approve when you’re ready.</p>
        ` }},
        { type: 'event_details' },
        { type: 'menu_with_pricing' },
        { type: 'service_addons' },
        { type: 'custom_html', data: { html: estimateValidityHtml } },
        ...(estimatePaymentScheduleHtml ? [{ type: 'custom_html', data: { html: estimatePaymentScheduleHtml } }] : []),
        { type: 'custom_html', data: { html: estimateActionButtonsHtml }},
        { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">If you have any questions, just reply to this email — our family is happy to help.</p>` }}
      ];
      ctaButton = undefined; // Multi-button layout replaces single CTA
      break;

    case 'estimate_reminder':
      contentBlocks = [
        { type: 'text', data: { html: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;">Dear ${quote.contact_name},</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">Just a friendly reminder that your catering estimate for <strong>${quote.event_name}</strong> is still waiting for your review!</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">Your event is coming up on <strong>${formatDate(quote.event_date)}</strong>. To ensure we can accommodate your request, please review and approve your estimate soon.</p>` }},
        { type: 'event_details' },
        { type: 'menu_summary' },
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'Review Your Estimate', href: effectivePortalUrl, variant: 'primary' };
      break;

    case 'approval_confirmation':
      if (variant === 'customer') {
        const total = invoice?.total_amount || 0;
        const firstMilestone = milestones?.[0];
        const firstPaymentDisplay = firstMilestone 
          ? formatCurrency(firstMilestone.amount_cents)
          : formatCurrency(Math.round(total * 0.5));

        const getMilestoneLabel = (type: string): string => {
          const labels: Record<string, string> = {
            'booking_deposit': 'Booking Deposit',
            'deposit': 'Deposit',
            'mid_payment': 'Milestone Payment',
            'final_payment': 'Final Balance',
            'full_payment': 'Full Payment'
          };
          return labels[type] || type.replace('_', ' ');
        };

        const paymentBoxHtml = `
          <div style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});padding:20px;border-radius:8px;margin:20px 0;color:white;">
            <h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.gold};">💳 Next Step: Secure Your Date</h3>
            <p style="margin:0 0 10px 0;">To confirm your booking, complete your first payment:</p>
            <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:8px;margin-top:10px;">
              <div style="font-size:24px;font-weight:bold;color:${BRAND_COLORS.gold};">${firstPaymentDisplay}</div>
              <div style="font-size:14px;opacity:0.9;">${firstMilestone?.is_due_now ? 'Due Now' : 'Due upon approval'}</div>
            </div>
          </div>
        `;

        const paymentScheduleHtml = milestones && milestones.length > 0 ? `
          <div style="margin:25px 0;">
            <h3 style="color:${BRAND_COLORS.crimson};margin-bottom:15px;">📅 Your Payment Schedule</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead>
                <tr style="background:${BRAND_COLORS.lightGray};">
                  <th style="padding:12px 10px;text-align:left;border-bottom:2px solid ${BRAND_COLORS.gold};">Payment</th>
                  <th style="padding:12px 10px;text-align:left;border-bottom:2px solid ${BRAND_COLORS.gold};">Due Date</th>
                  <th style="padding:12px 10px;text-align:right;border-bottom:2px solid ${BRAND_COLORS.gold};">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${milestones.map((m: any, i: number) => `
                  <tr style="background:${i === 0 ? '#fff3cd' : (i % 2 === 0 ? '#fafafa' : '#ffffff')};">
                    <td style="padding:12px 10px;border-bottom:1px solid #e5e5e5;">
                      ${getMilestoneLabel(m.milestone_type)}
                      ${i === 0 ? '<span style="color:#d97706;font-weight:bold;margin-left:8px;">← Pay Now</span>' : ''}
                    </td>
                    <td style="padding:12px 10px;border-bottom:1px solid #e5e5e5;">
                      ${m.is_due_now ? '<strong style="color:#d97706;">Due Now</strong>' : formatDate(m.due_date)}
                    </td>
                    <td style="padding:12px 10px;text-align:right;border-bottom:1px solid #e5e5e5;font-weight:${i === 0 ? 'bold' : 'normal'};">
                      ${formatCurrency(m.amount_cents)} (${m.percentage}%)
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background:${BRAND_COLORS.lightGray};">
                  <td colspan="2" style="padding:12px 10px;font-weight:bold;border-top:2px solid ${BRAND_COLORS.gold};">Total</td>
                  <td style="padding:12px 10px;text-align:right;font-weight:bold;border-top:2px solid ${BRAND_COLORS.gold};color:${BRAND_COLORS.crimson};">${formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ` : '';

        contentBlocks = [
          { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Great news, ${quote.contact_name}!</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">You've approved your catering estimate for <strong>${quote.event_name}</strong>. We're excited to be part of your special event!</p>` }},
          { type: 'event_details' },
          { type: 'service_addons' },
          { type: 'custom_html', data: { html: paymentBoxHtml }},
          { type: 'custom_html', data: { html: paymentScheduleHtml }},
          { type: 'custom_html', data: { html: `
            <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">📋 What Happens Next:</h3>
            <ol style="line-height:1.8;margin:0;padding-left:20px;">
              <li><strong>Complete Payment:</strong> Click the button above to pay securely online</li>
              <li><strong>Booking Confirmed:</strong> Once payment is received, your date is locked in</li>
              <li><strong>Planning Call:</strong> We'll schedule a call to finalize all the details</li>
              <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
            </ol>
          ` }},
          { type: 'terms' },
          { type: 'text', data: { html: `
            <div style="background:${BRAND_COLORS.lightGray};padding:15px;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:20px 0;">
              <strong>💡 Tip:</strong> You can always access your event portal to view your estimate, make payments, or contact us using the link in this email.
            </div>
            <p style="font-size:15px;margin:20px 0 0 0;">Questions? Call us at <strong>(843) 970-0265</strong> or reply to this email!</p>
          ` }}
        ];
        ctaButton = { text: 'Make Payment Now', href: effectivePortalUrl, variant: 'primary' };
      } else {
        // Admin variant
        contentBlocks = [
          { type: 'status_badge', data: { status: 'approved', title: 'Customer Approved Estimate', description: `${quote.contact_name} has approved their estimate for ${quote.event_name}.` }},
          { type: 'customer_contact' },
          { type: 'event_details' },
          { type: 'menu_with_pricing' },
          { type: 'service_addons' },
          { type: 'text', data: { html: `<p style="margin:16px 0;font-size:15px;color:#333;"><strong>Total Amount:</strong> ${formatCurrency(invoice?.total_amount || 0)}<br><strong>Payment Status:</strong> Awaiting deposit</p>` }},
        ];
        ctaButton = { text: 'View in Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      }
      break;

    case 'payment_received':
      if (variant === 'customer') {
        const daysUntilEvent = Math.ceil((new Date(quote.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const amount = paymentAmount || 0;
        const fullPay = isFullPayment || false;

        const paymentStatusHtml = fullPay ? `
          <div style="background:linear-gradient(135deg,${BRAND_COLORS.gold}30,${BRAND_COLORS.gold}50);padding:25px;border-radius:12px;margin:20px 0;text-align:center;border:2px solid ${BRAND_COLORS.gold};">
            <h3 style="color:${BRAND_COLORS.crimson};margin:0 0 10px 0;font-size:24px;">✅ Your Event is Fully Confirmed!</h3>
            <p style="margin:0;font-size:18px;font-weight:bold;">We've received your full payment of ${formatCurrency(amount)}</p>
          </div>
        ` : `
          <div style="background:${BRAND_COLORS.lightGray};padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid ${BRAND_COLORS.gold};">
            <h3 style="color:${BRAND_COLORS.crimson};margin:0 0 10px 0;">💰 Deposit Received</h3>
            <p style="margin:0;font-size:16px;">We've received your deposit of ${formatCurrency(amount)}</p>
            <p style="margin:10px 0 0 0;color:#666;">Remaining balance: ${formatCurrency((invoice?.total_amount || 0) - amount)}</p>
          </div>
        `;

        const nextStepsHtml = `
          <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">📅 What Happens Next?</h3>
          <div style="background:${BRAND_COLORS.lightGray};padding:20px;border-radius:8px;margin:20px 0;">
            ${!fullPay ? `
              <div style="border-bottom:1px solid #dee2e6;padding:12px 0;display:flex;align-items:flex-start;">
                <span style="font-size:24px;margin-right:12px;">💳</span>
                <div>
                  <strong style="color:${BRAND_COLORS.crimson};">Final Payment Due</strong>
                  <p style="margin:5px 0 0 0;color:#666;">Remaining balance due 7 days before your event</p>
                </div>
              </div>
            ` : ''}
            ${daysUntilEvent > 7 ? `
              <div style="border-bottom:1px solid #dee2e6;padding:12px 0;display:flex;align-items:flex-start;">
                <span style="font-size:24px;margin-right:12px;">📞</span>
                <div>
                  <strong style="color:${BRAND_COLORS.crimson};">Final Planning Call</strong>
                  <p style="margin:5px 0 0 0;color:#666;">We'll contact you 2 weeks before your event to confirm final details</p>
                </div>
              </div>
            ` : ''}
            <div style="padding:12px 0;display:flex;align-items:flex-start;">
              <span style="font-size:24px;margin-right:12px;">🎉</span>
              <div>
                <strong style="color:${BRAND_COLORS.crimson};">Event Day!</strong>
                <p style="margin:5px 0 0 0;color:#666;">We arrive early to set up and ensure everything is perfect!</p>
              </div>
            </div>
          </div>
        `;

        contentBlocks = [
          { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Thank you, ${quote.contact_name}!</p>` }},
          { type: 'custom_html', data: { html: paymentStatusHtml }},
          { type: 'event_details' },
          { type: 'menu_summary' },
          { type: 'custom_html', data: { html: nextStepsHtml }},
          { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">Need to make changes? Reply to this email or call <strong>(843) 970-0265</strong>.</p>` }}
        ];
        ctaButton = { text: 'View My Event Portal', href: effectivePortalUrl, variant: 'primary' };
      } else {
        // Admin variant
        const amount = paymentAmount || 0;
        contentBlocks = [
          { type: 'status_badge', data: { status: 'approved', title: 'Payment Received', description: `${quote.contact_name} has made a payment of ${formatCurrency(amount)}.` }},
          { type: 'customer_contact' },
          { type: 'event_details' },
          { type: 'menu_with_pricing' },
          { type: 'text', data: { html: `<p style="margin:16px 0;font-size:15px;color:#333;"><strong>Invoice:</strong> ${invoice?.invoice_number || 'N/A'}<br><strong>Amount Paid:</strong> ${formatCurrency(amount)}<br><strong>Remaining Balance:</strong> ${formatCurrency((invoice?.total_amount || 0) - amount)}</p>` }},
        ];
        ctaButton = { text: 'View Payment Details', href: `${siteUrl}/admin?view=billing`, variant: 'primary' };
      }
      break;

    case 'payment_reminder':
      contentBlocks = [
        { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Hi ${quote.contact_name},</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We hope you're as excited as we are about catering <strong>${quote.event_name}</strong>!</p>` }},
        { type: 'custom_html', data: { html: `
          <div style="background:#fff3cd;border-left:4px solid ${BRAND_COLORS.gold};padding:20px;margin:20px 0;border-radius:8px;">
            <h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.crimson};">🔒 Secure Your Event Date</h3>
            <p style="margin:0;">Your approved estimate is waiting for payment to confirm your booking. Don't risk losing your date - our calendar fills up fast!</p>
          </div>
        ` }},
        { type: 'event_details' },
        { type: 'menu_summary' },
        { type: 'service_addons' },
        { type: 'custom_html', data: { html: `
          <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">💳 Easy, Secure Payment Options:</h3>
          <ul style="line-height:1.8;margin:0;padding-left:20px;">
            <li>💳 Credit/Debit Cards</li>
            <li>🏦 Bank Transfer</li>
            <li>📱 Digital Wallets (Apple Pay, Google Pay)</li>
          </ul>
        ` }},
        { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;"><strong>Need to make changes?</strong> No problem! Contact us before completing payment if you need to adjust anything.</p>` }}
      ];
      ctaButton = { text: 'Complete Payment Now', href: effectivePortalUrl, variant: 'primary' };
      break;

    case 'event_reminder':
      if (variant === 'customer') {
        contentBlocks = [
          { type: 'text', data: { html: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;">Dear ${quote.contact_name},</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">Your event is just around the corner! We're getting everything ready to make <strong>${quote.event_name}</strong> a memorable occasion.</p>` }},
          { type: 'event_details' },
          { type: 'menu_summary' },
          { type: 'service_addons' },
          { type: 'text', data: { html: `<p style="margin:16px 0;font-size:15px;color:#333;">If you have any last-minute questions or changes, please don't hesitate to contact us at <a href="tel:+18439700265">(843) 970-0265</a>.</p>` }},
        ];
      } else {
        contentBlocks = [
          { type: 'text', data: { html: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;"><strong>${quote.event_name}</strong> is coming up soon! Here are the event details:</p>` }},
          { type: 'customer_contact' },
          { type: 'event_details' },
          { type: 'menu_summary' },
          { type: 'service_addons' },
        ];
        ctaButton = { text: 'View Event Details', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      }
      break;

    case 'change_request_submitted':
      if (variant === 'customer') {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'info', title: 'Change Request Received', description: "We've received your change request and will review it shortly." }},
          { type: 'text', data: { html: `<p style="margin:16px 0;font-size:15px;color:#333;">Dear ${quote.contact_name},</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">Thank you for submitting your change request. Our team will review it and get back to you within 24-48 hours with an updated estimate if needed.</p>` }},
          { type: 'event_details' },
          { type: 'menu_summary' },
        ];
      } else {
        contentBlocks = [
          { type: 'status_badge', data: { status: 'pending', title: 'New Change Request', description: `${quote.contact_name} has requested changes to their order.` }},
          { type: 'customer_contact' },
          { type: 'text', data: { html: `<p style="margin:16px 0;font-size:15px;color:#333;"><strong>Request Type:</strong> Menu Modification<br><strong>Customer Comments:</strong> "I'd like to add an appetizer course and increase the guest count by 10."</p>` }},
          { type: 'event_details' },
          { type: 'menu_summary' },
          { type: 'service_addons' },
        ];
        ctaButton = { text: 'Review Change Request', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      }
      break;

    case 'change_request_response':
      contentBlocks = [
        { type: 'status_badge', data: { status: 'approved', title: 'Change Request Approved', description: "We've updated your order based on your request." }},
        { type: 'text', data: { html: `<p style="margin:16px 0;font-size:15px;color:#333;">Dear ${quote.contact_name},</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">Great news! We've reviewed and approved your change request. Your updated estimate is now available for review.</p>` }},
        { type: 'event_details' },
        { type: 'menu_with_pricing' },
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'View Updated Estimate', href: effectivePortalUrl, variant: 'primary' };
      break;

    case 'admin_notification':
      contentBlocks = [
        { type: 'customer_contact' },
        { type: 'text', data: { html: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;"><strong>Notification Type:</strong> Customer Action Required<br><strong>Event:</strong> ${quote.event_name}</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">A customer action requires your attention. Please review the details in the admin dashboard.</p>` }},
        { type: 'event_details' },
        { type: 'menu_summary' },
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'View in Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      break;

    case 'event_followup':
      contentBlocks = [
        { type: 'text', data: { html: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;">Dear ${quote.contact_name},</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">Thank you so much for choosing Soul Train's Eatery for your ${quote.event_name}! We hope everyone enjoyed the food and that your event was everything you dreamed of.</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;">We'd love to hear how we did! Your feedback helps us continue to provide the best Southern catering experience in the Lowcountry.</p><p style="margin:0 0 16px 0;font-size:15px;color:#333;"><em>— The Soul Train's Eatery Family</em></p>` }},
        { type: 'menu_summary' },
      ];
      break;

    default:
      contentBlocks = [
        { type: 'text', data: { html: `<p>No content available for ${emailType}</p>` }},
      ];
  }

  return { contentBlocks, ctaButton };
}

// ============================================================================
// EMAIL CONFIGURATION PRESETS - Hero sections and preheaders only
// ============================================================================

export const EMAIL_CONFIGS: Record<EmailType, { 
  customer?: { heroSection: HeroConfig; preheaderText: string };
  admin?: { heroSection: HeroConfig; preheaderText: string };
}> = {
  quote_received: {
    admin: {
      heroSection: { badge: '🚂 NEW QUOTE', title: 'New Quote Submission', variant: 'crimson' },
      preheaderText: 'New catering quote request received'
    }
  },
  quote_confirmation: {
    customer: {
      heroSection: { badge: '✅ REQUEST RECEIVED', title: 'Thank You for Your Request!', variant: 'blue' },
      preheaderText: "Thank you for your quote request - we'll be in touch soon!"
    }
  },
  estimate_ready: {
    customer: {
      heroSection: { badge: '📋 ESTIMATE READY', title: 'Thank You for Reaching Out!', subtitle: 'Please review your estimate', variant: 'gold' },
      preheaderText: 'Your catering estimate is ready — valid for 7 days from send date'
    }
  },
  estimate_reminder: {
    customer: {
      heroSection: { badge: '⏰ FRIENDLY REMINDER', title: 'Your Estimate Awaits', variant: 'orange' },
      preheaderText: 'Reminder: Your catering estimate is waiting for your review'
    }
  },
  approval_confirmation: {
    customer: {
      heroSection: { badge: '🎉 BOOKING CONFIRMED', title: "You're All Set!", variant: 'green' },
      preheaderText: 'Your catering estimate has been approved - next steps inside'
    },
    admin: {
      heroSection: { badge: '✅ APPROVED', title: 'Customer Approved Estimate', variant: 'green' },
      preheaderText: 'Customer has approved their catering estimate'
    }
  },
  payment_received: {
    customer: {
      heroSection: { badge: '💰 PAYMENT CONFIRMED', title: 'Thank You!', variant: 'green' },
      preheaderText: 'Payment confirmation for your catering order'
    },
    admin: {
      heroSection: { badge: '💵 PAYMENT RECEIVED', title: 'Payment Confirmed', variant: 'green' },
      preheaderText: 'Payment received for catering order'
    }
  },
  payment_reminder: {
    customer: {
      heroSection: { badge: '⏰ PAYMENT DUE', title: 'Payment Reminder', variant: 'orange' },
      preheaderText: 'Reminder: Payment due for your upcoming catering event'
    }
  },
  event_reminder: {
    customer: {
      heroSection: { badge: '📅 COMING UP', title: 'Your Event is Approaching!', variant: 'blue' },
      preheaderText: 'Reminder: Your catering event is approaching'
    },
    admin: {
      heroSection: { badge: '📅 UPCOMING', title: 'Event Reminder', variant: 'blue' },
      preheaderText: 'Reminder: Upcoming catering event'
    }
  },
  change_request_submitted: {
    customer: {
      heroSection: { badge: '📝 RECEIVED', title: 'Change Request Submitted', variant: 'blue' },
      preheaderText: "We've received your change request"
    },
    admin: {
      heroSection: { badge: '📝 CHANGE REQUEST', title: 'Customer Requested Changes', variant: 'orange' },
      preheaderText: 'New change request from customer'
    }
  },
  change_request_response: {
    customer: {
      heroSection: { badge: '📋 UPDATE', title: 'Your Request Has Been Reviewed', variant: 'blue' },
      preheaderText: 'Update on your change request'
    }
  },
  admin_notification: {
    admin: {
      heroSection: { badge: '🔔 ALERT', title: 'Admin Notification', variant: 'crimson' },
      preheaderText: 'Admin notification from Soul Train\'s Eatery'
    }
  },
  event_followup: {
    customer: {
      heroSection: { badge: '🙏 THANK YOU', title: 'We Hope You Enjoyed!', variant: 'gold' },
      preheaderText: 'Thank you for choosing Soul Train\'s Eatery!'
    }
  }
};
