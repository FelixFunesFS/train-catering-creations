import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { BRAND_COLORS, EMAIL_STYLES, generateEmailHeader, generateEventDetailsCard, generateFooter } from "../_shared/emailTemplates.ts";

// Blue color scheme for quote confirmations (to differentiate from estimates/invoices)
const BLUE_COLORS = {
  primary: '#3B82F6',
  dark: '#2563EB',
  light: '#DBEAFE'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface QuoteConfirmationRequest {
  quote_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_id }: QuoteConfirmationRequest = await req.json();
    
    console.log(`Sending confirmation email for quote: ${quote_id}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      console.error('Error fetching quote:', quoteError);
      throw new Error('Quote not found');
    }

    // Helper functions for formatting
    const formatMenuItems = (items: any) => {
      if (!items || (Array.isArray(items) && items.length === 0)) return 'None selected';
      if (typeof items === 'string') return items;
      if (Array.isArray(items)) return items.join(', ');
      return JSON.stringify(items);
    };

    const formatSupplies = () => {
      const supplies = [];
      if (quote.plates_requested) supplies.push('Plates');
      if (quote.cups_requested) supplies.push('Cups');
      if (quote.napkins_requested) supplies.push('Napkins');
      if (quote.serving_utensils_requested) supplies.push('Serving Utensils');
      if (quote.chafers_requested) supplies.push('Chafing Dishes with Fuel');
      if (quote.ice_requested) supplies.push('Ice');
      return supplies.length > 0 ? supplies.join(', ') : 'None requested';
    };

    // Build comprehensive menu section
    const menuSectionHtml = `
      <div style="background: ${BRAND_COLORS.white}; border: 2px solid ${BRAND_COLORS.lightGray}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.crimson}; text-align: center;">🍽️ Your Custom Menu</h3>
        
        ${quote.primary_protein || quote.secondary_protein ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Proteins</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${[quote.primary_protein, quote.secondary_protein].filter(Boolean).join(', ')}</p>
        </div>
        ` : ''}

        ${quote.sides && (Array.isArray(quote.sides) ? quote.sides.length > 0 : quote.sides) ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Sides</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(quote.sides)}</p>
        </div>
        ` : ''}

        ${quote.appetizers && (Array.isArray(quote.appetizers) ? quote.appetizers.length > 0 : quote.appetizers) ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Appetizers</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(quote.appetizers)}</p>
        </div>
        ` : ''}

        ${quote.desserts && (Array.isArray(quote.desserts) ? quote.desserts.length > 0 : quote.desserts) ? `
        <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 2px solid ${BRAND_COLORS.gold};">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Desserts</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(quote.desserts)}</p>
        </div>
        ` : ''}

        ${quote.drinks && (Array.isArray(quote.drinks) ? quote.drinks.length > 0 : quote.drinks) ? `
        <div style="margin: 15px 0;">
          <h4 style="color: ${BRAND_COLORS.crimson}; margin: 10px 0 5px 0; font-size: 16px;">Beverages</h4>
          <p style="margin: 5px 0; padding: 8px 0;">${formatMenuItems(quote.drinks)}</p>
        </div>
        ` : ''}
      </div>
    `;

    const emailSubject = `Quote Request Received - Reference #${quote_id.slice(0, 8).toUpperCase()}`;
    
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${EMAIL_STYLES}</style>
      </head>
      <body>
        <div class="email-container">
          <div style="background: linear-gradient(135deg, ${BLUE_COLORS.primary}, ${BLUE_COLORS.dark}); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
              <span style="color: white; font-weight: bold; font-size: 14px;">📋 QUOTE RECEIVED</span>
            </div>
            <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;">✓ Quote Request Received!</h2>
            <p style="color: white; margin: 0; font-size: 16px; opacity: 0.95;">
              Hi ${quote.contact_name},<br><br>
              Thank you for choosing Soul Train's Eatery! We've received your quote request and our team is excited to make your event exceptional.
            </p>
          </div>
          
          <div class="content">

            ${generateEventDetailsCard(quote)}
            
            ${menuSectionHtml}

            <div class="event-card">
              <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.crimson};">📦 Your Additional Selections</h3>
              <p style="margin: 5px 0;"><strong>Supplies:</strong> ${formatSupplies()}</p>
              ${quote.dietary_restrictions && (Array.isArray(quote.dietary_restrictions) ? quote.dietary_restrictions.length > 0 : quote.dietary_restrictions) ? `
              <p style="margin: 5px 0;"><strong>Dietary Restrictions:</strong> ${formatMenuItems(quote.dietary_restrictions)}</p>
              ${quote.guest_count_with_restrictions ? `<p style="margin: 5px 0; font-size: 14px; color: #666;"><em>${quote.guest_count_with_restrictions} guests</em></p>` : ''}
              ` : ''}
              ${quote.theme_colors ? `<p style="margin: 5px 0;"><strong>Theme/Colors:</strong> ${quote.theme_colors}</p>` : ''}
              ${quote.special_requests ? `<p style="margin: 5px 0;"><strong>Special Requests:</strong> ${quote.special_requests}</p>` : ''}
              <p style="margin: 15px 0 5px 0; font-size: 14px; color: ${BRAND_COLORS.crimson};"><strong>Reference ID:</strong> #${quote_id.slice(0, 8).toUpperCase()}</p>
            </div>

            <div style="margin: 30px 0;">
              <h3 style="color: ${BRAND_COLORS.crimson};">What Happens Next?</h3>
              <ol style="color: ${BRAND_COLORS.darkGray}; line-height: 1.8; padding-left: 20px;">
                <li><strong style="color: ${BLUE_COLORS.dark};">Review (You are here!)</strong> - Our team is carefully reviewing your request</li>
                <li><strong style="color: ${BLUE_COLORS.dark};">Detailed Estimate</strong> - You'll receive a comprehensive estimate with pricing within 48 hours</li>
                <li><strong style="color: ${BLUE_COLORS.dark};">Optional Consultation</strong> - We're happy to discuss any details by phone</li>
                <li><strong style="color: ${BLUE_COLORS.dark};">Finalization</strong> - Once approved, we'll handle all the details for your special day</li>
              </ol>
            </div>

            <div style="background: linear-gradient(135deg, ${BLUE_COLORS.primary}, ${BLUE_COLORS.dark}); padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="color: white; margin: 0 0 15px 0;">📅 Next Steps</h3>
              <p style="color: white; margin-bottom: 15px; opacity: 0.95;">
                Our team will review your request and send you a detailed estimate within 48 hours. 
                The estimate will include a secure link to view pricing, approve, or request changes.
              </p>
            </div>

            <div style="border-top: 3px solid ${BRAND_COLORS.gold}; padding-top: 20px; margin-top: 30px; text-align: center;">
              <h3 style="color: ${BRAND_COLORS.crimson}; margin-top: 0;">Questions? We're Here to Help!</h3>
              <p style="color: ${BRAND_COLORS.darkGray}; margin: 10px 0; font-size: 16px;">
                📞 <a href="tel:8439700265" style="color: ${BRAND_COLORS.crimson}; text-decoration: none; font-weight: bold;">(843) 970-0265</a><br>
                📧 <a href="mailto:soultrainseatery@gmail.com" style="color: ${BRAND_COLORS.crimson}; text-decoration: none; font-weight: bold;">soultrainseatery@gmail.com</a>
              </p>
            </div>
          </div>
          
          ${generateFooter()}
        </div>
      </body>
      </html>
    `;

    // Send email using Gmail function (non-blocking - log failures but don't throw)
    let emailSent = false;
    let emailError = null;

    try {
      const { error } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          to: quote.email,
          subject: emailSubject,
          html: emailBody,
          from: 'Soul Train\'s Eatery <soultrainseatery@gmail.com>'
        }
      });

      if (error) {
        console.warn('Email sending failed (non-critical):', error);
        emailError = error.message || 'Email delivery failed';
      } else {
        console.log(`Confirmation email sent successfully to ${quote.email}`);
        emailSent = true;
      }
    } catch (error) {
      console.warn('Email sending exception (non-critical):', error);
      emailError = error instanceof Error ? error.message : 'Email delivery failed';
    }

    // Always return success if quote was found (email is optional)
    return new Response(
      JSON.stringify({ 
        success: true,
        message: emailSent ? 'Confirmation email sent' : 'Quote confirmed (email pending setup)',
        quote_id,
        email_sent: emailSent,
        email_note: emailError || undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in send-quote-confirmation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
