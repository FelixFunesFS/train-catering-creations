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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Quote notification request received');

    // Sanitize user-provided data for HTML embedding
    const safeContactName = escapeHtml(requestData.contact_name);
    const safeEmail = escapeHtml(requestData.email);
    const safePhone = escapeHtml(requestData.phone);
    const safeEventName = escapeHtml(requestData.event_name);
    const safeLocation = escapeHtml(requestData.location);
    const safeThemeColors = escapeHtml(requestData.theme_colors);
    const safeSpecialRequests = escapeHtml(requestData.special_requests);
    const safeGuestCountWithRestrictions = escapeHtml(requestData.guest_count_with_restrictions);

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
      const supplies = [];
      if (requestData.plates_requested) supplies.push('Plates');
      if (requestData.cups_requested) supplies.push('Cups');
      if (requestData.napkins_requested) supplies.push('Napkins');
      if (requestData.serving_utensils_requested) supplies.push('Serving Utensils');
      if (requestData.chafers_requested) supplies.push('Chafing Dishes with Fuel');
      if (requestData.ice_requested) supplies.push('Ice');
      return supplies.length > 0 ? supplies.join(', ') : 'None requested';
    };

    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';

    // Build menu section HTML for admin notification
    const menuSectionHtml = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.white};border:2px solid ${BRAND_COLORS.lightGray};border-radius:8px;margin:16px 0;padding:20px;border-collapse:collapse;">
<tr>
<td style="padding:20px;">
<h3 style="margin:0 0 20px 0;color:${BRAND_COLORS.crimson};text-align:center;">🍽️ Menu Selections</h3>

${requestData.proteins && Array.isArray(requestData.proteins) && requestData.proteins.length > 0 ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🥩 Proteins</h4>
<p style="margin:5px 0;padding:8px 0;">${requestData.proteins.map(formatMenuItem).join(', ')}</p>
${requestData.both_proteins_available && requestData.proteins.length === 2 ? `<p style="margin:5px 0;padding:8px 0;font-style:italic;color:${BRAND_COLORS.crimson};">⭐ Both proteins served to all guests</p>` : ''}
</div>
` : ''}

${requestData.sides && (Array.isArray(requestData.sides) ? requestData.sides.length > 0 : requestData.sides) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🥗 Sides</h4>
<p style="margin:5px 0;padding:8px 0;">${formatMenuItems(requestData.sides)}</p>
</div>
` : ''}

${requestData.appetizers && (Array.isArray(requestData.appetizers) ? requestData.appetizers.length > 0 : requestData.appetizers) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🍤 Appetizers</h4>
<p style="margin:5px 0;padding:8px 0;">${formatMenuItems(requestData.appetizers)}</p>
</div>
` : ''}

${requestData.desserts && (Array.isArray(requestData.desserts) ? requestData.desserts.length > 0 : requestData.desserts) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🍰 Desserts</h4>
<p style="margin:5px 0;padding:8px 0;">${formatMenuItems(requestData.desserts)}</p>
</div>
` : ''}

${requestData.drinks && (Array.isArray(requestData.drinks) ? requestData.drinks.length > 0 : requestData.drinks) ? `
<div style="margin:15px 0;padding-bottom:10px;border-bottom:2px solid ${BRAND_COLORS.gold};">
<h4 style="color:${BRAND_COLORS.crimson};margin:10px 0 5px 0;font-size:16px;">🥤 Beverages</h4>
<p style="margin:5px 0;padding:8px 0;">${formatMenuItems(requestData.drinks)}</p>
</div>
` : ''}

${(safeGuestCountWithRestrictions || (requestData.vegetarian_entrees && Array.isArray(requestData.vegetarian_entrees) && requestData.vegetarian_entrees.length > 0)) ? `
<div style="margin:15px 0;padding:12px;background:#f0fdf4;border-radius:6px;border-left:4px solid #22c55e;">
<h4 style="color:#166534;margin:0 0 8px 0;font-size:16px;">🌱 Vegetarian Options</h4>
${safeGuestCountWithRestrictions ? `<p style="margin:5px 0;color:#166534;">${safeGuestCountWithRestrictions} vegetarian portions requested</p>` : ''}
${requestData.vegetarian_entrees && Array.isArray(requestData.vegetarian_entrees) && requestData.vegetarian_entrees.length > 0 ? `<p style="margin:5px 0;color:#166534;"><strong>Entrées:</strong> ${requestData.vegetarian_entrees.map(formatMenuItem).join(', ')}</p>` : ''}
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
      preheaderText: `New quote from ${safeContactName} for ${safeEventName} - ${requestData.guest_count} guests`,
      heroSection: heroConfig,
      contentBlocks,
      ctaButton: { text: 'View in Admin Dashboard →', href: `${siteUrl}/admin?view=events`, variant: 'primary' },
      quote: requestData,
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