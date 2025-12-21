import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BRAND_COLORS, EMAIL_STYLES, generateEmailHeader, generateEventDetailsCard, generateFooter, generatePreheader } from "../_shared/emailTemplates.ts";
import { escapeHtml, createErrorResponse } from "../_shared/security.ts";

// Brand accent colors for admin notifications
const ACCENT_COLORS = {
  success: '#16a34a',      // Green for approved/success states
  warning: '#ea580c',      // Orange for pending/info needed
  info: BRAND_COLORS.gold, // Gold for informational sections
  urgent: BRAND_COLORS.crimson // Crimson for urgent/important
};

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

    // Build menu section HTML with sanitized content
    const menuSectionHtml = `
      <div style="background: ${BRAND_COLORS.white}; border: 2px solid ${BRAND_COLORS.lightGray}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.crimson}; text-align: center;">🍽️ Menu Selections</h3>
        
        ${requestData.proteins && Array.isArray(requestData.proteins) && requestData.proteins.length > 0 ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Proteins</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${requestData.proteins.map(formatMenuItem).join(', ')}</p>
          ${requestData.both_proteins_available && requestData.proteins.length === 2 ? `<p style="margin: 5px 0; padding: 8px 0; font-style: italic; color: ${BRAND_COLORS.crimson};">Both proteins served to all guests</p>` : ''}
        </div>
        ` : ''}

        ${requestData.sides && (Array.isArray(requestData.sides) ? requestData.sides.length > 0 : requestData.sides) ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Sides</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(requestData.sides)}</p>
        </div>
        ` : ''}

        ${requestData.appetizers && (Array.isArray(requestData.appetizers) ? requestData.appetizers.length > 0 : requestData.appetizers) ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Appetizers</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(requestData.appetizers)}</p>
        </div>
        ` : ''}

        ${requestData.desserts && (Array.isArray(requestData.desserts) ? requestData.desserts.length > 0 : requestData.desserts) ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Desserts</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(requestData.desserts)}</p>
        </div>
        ` : ''}

        ${requestData.drinks && (Array.isArray(requestData.drinks) ? requestData.drinks.length > 0 : requestData.drinks) ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Beverages</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(requestData.drinks)}</p>
        </div>
        ` : ''}

        ${(safeGuestCountWithRestrictions || (requestData.vegetarian_entrees && Array.isArray(requestData.vegetarian_entrees) && requestData.vegetarian_entrees.length > 0)) ? `
        <div style="margin: 15px 0; padding: 12px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #22c55e;">
          <h4 style="color: #166534; margin: 0 0 8px 0; font-size: 16px;">🌱 Vegetarian Options</h4>
          ${safeGuestCountWithRestrictions ? `<p style="margin: 5px 0; color: #166534;">${safeGuestCountWithRestrictions} vegetarian portions requested</p>` : ''}
          ${requestData.vegetarian_entrees && Array.isArray(requestData.vegetarian_entrees) && requestData.vegetarian_entrees.length > 0 ? `<p style="margin: 5px 0; color: #166534;"><strong>Entrées:</strong> ${requestData.vegetarian_entrees.map(formatMenuItem).join(', ')}</p>` : ''}
        </div>
        ` : ''}
      </div>
    `;

    const preheaderText = `New quote from ${safeContactName} for ${safeEventName} - ${requestData.guest_count} guests`;
    
    // Admin notification email with comprehensive details and brand colors
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>New Quote Request from ${safeContactName}</title>
        <style>${EMAIL_STYLES}</style>
      </head>
      <body>
        ${generatePreheader(preheaderText)}
        
        <div class="email-container" role="main">
          <div style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); padding: 25px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="background: rgba(255,215,0,0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
              <span style="color: white; font-weight: bold; font-size: 14px;"><span aria-label="Soul Train">🚂</span> NEW QUOTE SUBMISSION</span>
            </div>
            <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;"><span aria-hidden="true">📧</span> New Quote Request From:</h2>
            <h3 style="color: white; margin: 0; font-size: 24px;">${safeContactName}</h3>
            <p style="color: white; margin: 5px 0; font-size: 16px;">
              <span aria-hidden="true">📧</span> <a href="mailto:${safeEmail}" style="color: white; text-decoration: none;">${safeEmail}</a> | <span aria-hidden="true">📞</span> <a href="tel:${safePhone}" style="color: white; text-decoration: none;">${safePhone}</a>
            </p>
            <p style="color: white; margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
              <a href="mailto:${safeEmail}" style="color: white; text-decoration: underline;" aria-label="Reply directly to ${safeContactName}">
                Click to reply directly to customer →
              </a>
            </p>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.95;">Event: ${safeEventName}</p>
          </div>
          
          <div class="content">
            <section style="background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); padding: 20px; border-radius: 8px; margin-bottom: 25px;" aria-labelledby="customer-details-heading">
              <h2 id="customer-details-heading" style="color: ${BRAND_COLORS.darkGray}; margin: 0 0 10px 0;"><span aria-hidden="true">📋</span> Customer Details</h2>
              <table role="presentation" style="width: 100%;">
                <tr><td style="padding: 5px 0;"><strong>Name:</strong></td><td>${safeContactName}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td><a href="mailto:${safeEmail}" style="color: ${BRAND_COLORS.crimson};" aria-label="Email ${safeContactName}">${safeEmail}</a></td></tr>
                <tr><td style="padding: 5px 0;"><strong>Phone:</strong></td><td><a href="tel:${safePhone}" style="color: ${BRAND_COLORS.crimson};" aria-label="Call ${safeContactName}">${safePhone}</a></td></tr>
              </table>
            </section>

            ${generateEventDetailsCard(requestData)}
            
            ${menuSectionHtml}

            <div class="event-card" style="border-left-color: ${BRAND_COLORS.crimson};">
              <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.crimson};">📦 Supplies & Equipment Requested</h3>
              <p style="margin: 5px 0; font-size: 15px;">${formatSupplies()}</p>
            </div>

            ${safeThemeColors ? `
            <div class="event-card" style="border-left-color: ${BRAND_COLORS.gold};">
              <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.crimson};">🎨 Theme/Colors</h3>
              <p style="margin: 5px 0;">${safeThemeColors}</p>
            </div>
            ` : ''}

            ${safeSpecialRequests ? `
            <div class="event-card" style="border-left-color: ${BRAND_COLORS.crimson}; background: #FFF0F0;">
              <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.crimson};">💬 Special Requests</h3>
              <p style="margin: 5px 0; white-space: pre-wrap;">${safeSpecialRequests}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://qptprrqjlcvfkhfdnnoa.supabase.co/admin/workflow" class="btn btn-primary" role="button" aria-label="View quote request in admin dashboard">
                View in Admin Dashboard →
              </a>
            </div>
          </div>
          
          ${generateFooter()}
        </div>
      </body>
      </html>
    `;

    // Send admin email only (customer email handled by send-quote-confirmation)
    let adminEmailSent = false;
    let emailError = null;

    try {
      console.log('Sending admin notification email...');
      const { error: adminEmailError } = await supabase.functions.invoke('send-gmail-email', {
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
