import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  generateStandardEmail,
  generateMenuSection,
  EMAIL_CONFIGS,
  BRAND_COLORS,
  type StandardEmailConfig,
  type ContentBlock,
  formatServiceType,
} from "../_shared/emailTemplates.ts";
import { escapeHtml, createErrorResponse } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface QuoteNotificationRequest {
  quote_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_id }: QuoteNotificationRequest = await req.json();
    console.log('Quote notification request received');

    if (!quote_id) {
      throw new Error('Missing required field: quote_id');
    }

    // Load canonical quote data (submit-quote-request invokes this function with quote_id)
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote_id)
      .maybeSingle();

    if (quoteError) {
      console.error('Failed to load quote_requests row:', quoteError);
      throw new Error('Failed to load quote data');
    }
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Sanitize user-provided data for HTML embedding
    const safeContactName = escapeHtml(quote.contact_name);
    const safeEmail = escapeHtml(quote.email);
    const safePhone = escapeHtml(quote.phone);
    const safeEventName = escapeHtml(quote.event_name);
    const safeLocation = escapeHtml(quote.location);
    const safeThemeColors = escapeHtml(quote.theme_colors);
    const safeSpecialRequests = escapeHtml(quote.special_requests);
    const safeGuestCountWithRestrictions = escapeHtml(quote.guest_count_with_restrictions);

    // Helper to format menu items with proper title case and sanitization
    const formatMenuItem = (item: string): string => {
      return escapeHtml(item)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const formatMenuItems = (items: any) => {
      if (!items || (Array.isArray(items) && items.length === 0)) return 'None selected';
      if (typeof items === 'string') return formatMenuItem(items);
      if (Array.isArray(items)) return items.map(formatMenuItem).join(', ');
      return escapeHtml(JSON.stringify(items));
    };

    // Helper to format supplies
    const formatSupplies = () => {
      const serviceType = (quote.service_type || '').toLowerCase();
      const isFullService = serviceType === 'full-service' || serviceType === 'full_service';
      const chaferLabel = isFullService ? 'Chafing Dishes with Fuel' : 'Food Warmers with Fuel';

      const supplies = [];
       if (quote.plates_requested) supplies.push('Plates');
       if (quote.cups_requested) supplies.push('Cups');
       if (quote.napkins_requested) supplies.push('Napkins');
       if (quote.serving_utensils_requested) supplies.push('Serving Utensils');
       if (quote.chafers_requested) supplies.push(chaferLabel);
       if (quote.ice_requested) supplies.push('Ice');
      return supplies.length > 0 ? supplies.join(', ') : 'None requested';
    };

    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';

    // Build menu section HTML for admin notification
    const menuSectionHtml = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.white};border:2px solid ${BRAND_COLORS.lightGray};border-radius:8px;margin:16px 0;padding:20px;border-collapse:collapse;">
<tr>
<td style="padding:20px;">
<h3 style="margin:0 0 20px 0;color:${BRAND_COLORS.crimson};text-align:center;">🍽️ Menu Selections</h3>

 ${quote.proteins && Array.isArray(quote.proteins) && quote.proteins.length > 0 ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🥩 Proteins</h4>
 <p style="margin:5px 0;padding:8px 0;">${quote.proteins.map(formatMenuItem).join(', ')}</p>
 ${quote.both_proteins_available && quote.proteins.length === 2 ? `<p style="margin:5px 0;padding:8px 0;font-style:italic;color:${BRAND_COLORS.crimson};">⭐ Both proteins served to all guests</p>` : ''}
</div>
` : ''}

 ${quote.sides && (Array.isArray(quote.sides) ? quote.sides.length > 0 : quote.sides) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🥗 Sides</h4>
 <p style="margin:5px 0;padding:8px 0;">${formatMenuItems(quote.sides)}</p>
</div>
` : ''}

 ${quote.appetizers && (Array.isArray(quote.appetizers) ? quote.appetizers.length > 0 : quote.appetizers) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🍤 Appetizers</h4>
 <p style="margin:5px 0;padding:8px 0;">${formatMenuItems(quote.appetizers)}</p>
</div>
` : ''}

 ${quote.desserts && (Array.isArray(quote.desserts) ? quote.desserts.length > 0 : quote.desserts) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🍰 Desserts</h4>
 <p style="margin:5px 0;padding:8px 0;">${formatMenuItems(quote.desserts)}</p>
</div>
` : ''}

 ${quote.drinks && (Array.isArray(quote.drinks) ? quote.drinks.length > 0 : quote.drinks) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🥤 Beverages</h4>
 <p style="margin:5px 0;padding:8px 0;">${formatMenuItems(quote.drinks)}</p>
</div>
` : ''}

 ${(safeGuestCountWithRestrictions || (quote.vegetarian_entrees && Array.isArray(quote.vegetarian_entrees) && quote.vegetarian_entrees.length > 0)) ? `
<div style="margin:15px 0;padding:12px;background:#f0fdf4;border-radius:6px;border-left:4px solid #22c55e;">
<h4 style="color:#166534;margin:0 0 8px 0;font-size:16px;">🌱 Vegetarian Options</h4>
${safeGuestCountWithRestrictions ? `<p style="margin:5px 0;color:#166534;">${safeGuestCountWithRestrictions} vegetarian portions requested</p>` : ''}
 ${quote.vegetarian_entrees && Array.isArray(quote.vegetarian_entrees) && quote.vegetarian_entrees.length > 0 ? `<p style="margin:5px 0;color:#166534;"><strong>Entrées:</strong> ${quote.vegetarian_entrees.map(formatMenuItem).join(', ')}</p>` : ''}
</div>
` : ''}

</td>
</tr>
</table>
`;

    // Build supplies section
    const suppliesHtml = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.lightGray};border-radius:8px;border-left:4px solid ${BRAND_COLORS.crimson};margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:16px;">
<h3 style="margin:0 0 15px 0;color:${BRAND_COLORS.crimson};">📦 Supplies & Equipment Requested</h3>
<p style="margin:5px 0;font-size:15px;">${formatSupplies()}</p>
</td>
</tr>
</table>
`;

    // Build special notes section
    const notesHtml = `
${safeThemeColors ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.lightGray};border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:16px;">
<h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.crimson};">🎨 Theme/Colors</h3>
<p style="margin:5px 0;">${safeThemeColors}</p>
</td>
</tr>
</table>
` : ''}

${safeSpecialRequests ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF0F0;border-radius:8px;border-left:4px solid ${BRAND_COLORS.crimson};margin:16px 0;border-collapse:collapse;">
<tr>
<td style="padding:16px;">
<h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.crimson};">💬 Special Requests</h3>
<p style="margin:5px 0;white-space:pre-wrap;">${safeSpecialRequests}</p>
</td>
</tr>
</table>
` : ''}
`;

    // Get hero config
    const heroConfig = EMAIL_CONFIGS.quote_received.admin?.heroSection || {
      badge: '🚂 NEW QUOTE REQUEST',
      title: 'New Quote Submission',
      subtitle: `From ${safeContactName}`,
      variant: 'crimson' as const
    };

    // Build content blocks for admin email
    const contentBlocks: ContentBlock[] = [
      { type: 'customer_contact' },
      { type: 'event_details' },
      { type: 'service_addons' },
      { 
        type: 'custom_html', 
        data: { html: menuSectionHtml + suppliesHtml + notesHtml }
      },
    ];

    // Build email using generateStandardEmail
      const emailConfig: StandardEmailConfig = {
        preheaderText: `New quote from ${safeContactName} for ${safeEventName} - ${quote.guest_count} guests`,
      heroSection: heroConfig,
      contentBlocks,
      ctaButton: { text: 'View in Admin Dashboard →', href: `${siteUrl}/admin?view=events`, variant: 'primary' },
        quote,
    };

    const adminEmailHtml = generateStandardEmail(emailConfig);

    // Send admin email only (customer email handled by send-quote-confirmation)
    let adminEmailSent = false;
    let emailError = null;

    try {
      console.log('Sending admin notification email...');
      const { error: adminEmailError } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          to: 'soultrainseatery@gmail.com',
          subject: `🚂 NEW QUOTE from ${safeContactName} - ${safeEventName}`,
          html: adminEmailHtml,
          from: `Soul Train's Eatery <soultrainseatery@gmail.com>`,
          replyTo: `${safeContactName} <${safeEmail}>`
        }
      });

      if (adminEmailError) {
        console.warn('Admin email failed (non-critical):', adminEmailError);
        emailError = 'Failed to send admin notification';
      } else {
        console.log('Admin notification email sent successfully');
        adminEmailSent = true;
      }
    } catch (error) {
      console.warn('Admin email exception (non-critical):', error);
      emailError = 'Exception sending admin notification';
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: adminEmailSent 
          ? "Admin notification sent successfully" 
          : "Quote received (admin notification pending)",
        admin_email_sent: adminEmailSent,
        email_error: emailError || undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return createErrorResponse(error, 'send-quote-notification', corsHeaders);
  }
};

serve(handler);