import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { BRAND_COLORS, EMAIL_STYLES, generateEmailHeader, generateEventDetailsCard, generateFooter, generatePreheader } from "../_shared/emailTemplates.ts";

// Brand accent colors for quote confirmations
const ACCENT_COLORS = {
  success: '#16a34a',      // Green for approved/success states
  warning: '#ea580c',      // Orange for pending/info needed
  info: BRAND_COLORS.gold, // Gold for informational sections
  urgent: BRAND_COLORS.crimson // Crimson for urgent/important
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
    const formatMenuItem = (item: string): string => {
      return item
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const formatMenuItems = (items: any) => {
      if (!items || (Array.isArray(items) && items.length === 0)) return 'None selected';
      if (typeof items === 'string') return formatMenuItem(items);
      if (Array.isArray(items)) return items.map(formatMenuItem).join(', ');
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


    const emailSubject = `Quote Request Received - Reference #${quote_id.slice(0, 8).toUpperCase()}`;
    const preheaderText = "We've received your quote request and will send an estimate within 48 hours - Soul Train's Eatery";
    
    const emailBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Quote Request Received - ${quote.event_name}</title>
        <style>${EMAIL_STYLES}</style>
      </head>
      <body>
        ${generatePreheader(preheaderText)}
        
        <div class="email-container" role="main">
          <div style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <div style="background: rgba(255,215,0,0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
              <span style="color: white; font-weight: bold; font-size: 14px;"><span aria-label="plate with food">🍽️</span> QUOTE RECEIVED</span>
            </div>
            <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;"><span aria-hidden="true">✓</span> Quote Request Received!</h2>
            <p style="color: white; margin: 0; font-size: 16px; opacity: 0.95;">
              Hi ${quote.contact_name},<br><br>
              Thank you for choosing Soul Train's Eatery! We've received your quote request and our team is excited to make your event exceptional.
            </p>
          </div>
          
          <div class="content">

            ${generateEventDetailsCard(quote)}

            <div class="event-card">
              <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.crimson};">📦 Your Additional Selections</h3>
              <p style="margin: 5px 0;"><strong>Supplies:</strong> ${formatSupplies()}</p>
              ${quote.theme_colors ? `<p style="margin: 5px 0;"><strong>Theme/Colors:</strong> ${quote.theme_colors}</p>` : ''}
              <p style="margin: 15px 0 5px 0; font-size: 14px; color: ${BRAND_COLORS.crimson};"><strong>Reference ID:</strong> #${quote_id.slice(0, 8).toUpperCase()}</p>
            </div>

            ${quote.special_requests ? `
            <div class="event-card" style="border-left-color: ${BRAND_COLORS.gold}; background: #FFF9E6;">
              <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.crimson};">📝 Special Requests</h3>
              <p style="margin: 5px 0;">${quote.special_requests}</p>
            </div>
            ` : ''}

            <nav aria-labelledby="next-steps-heading" style="margin: 30px 0;">
              <h3 id="next-steps-heading" style="color: ${BRAND_COLORS.crimson};">What Happens Next?</h3>
              <ol style="color: ${BRAND_COLORS.darkGray}; line-height: 1.8; padding-left: 20px;">
                <li><strong style="color: ${BRAND_COLORS.crimson};">Review (You are here!)</strong> - Our team is carefully reviewing your request</li>
                <li><strong style="color: ${BRAND_COLORS.crimson};">Detailed Estimate</strong> - You'll receive a comprehensive estimate with pricing within 48 hours</li>
                <li><strong style="color: ${BRAND_COLORS.crimson};">Optional Consultation</strong> - We're happy to discuss any details by phone</li>
                <li><strong style="color: ${BRAND_COLORS.crimson};">Finalization</strong> - Once approved, we'll handle all the details for your special day</li>
              </ol>
            </nav>

            <div style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="color: white; margin: 0 0 15px 0;">📅 Next Steps</h3>
              <p style="color: white; margin-bottom: 15px; opacity: 0.95;">
                Our team will review your request and send you a detailed estimate within 48 hours. 
                The estimate will include a secure link to view pricing, approve, or request changes.
              </p>
            </div>

            <aside style="border-top: 3px solid ${BRAND_COLORS.gold}; padding-top: 20px; margin-top: 30px; text-align: center;">
              <h3 style="color: ${BRAND_COLORS.crimson}; margin-top: 0;">Questions? We're Here to Help!</h3>
              <address style="font-style: normal;">
                <p style="color: ${BRAND_COLORS.darkGray}; margin: 10px 0; font-size: 16px;">
                  <span aria-hidden="true">📞</span> <a href="tel:+18439700265" style="color: ${BRAND_COLORS.crimson}; text-decoration: none; font-weight: bold;" aria-label="Call us at (843) 970-0265">(843) 970-0265</a><br>
                  <span aria-hidden="true">📧</span> <a href="mailto:soultrainseatery@gmail.com" style="color: ${BRAND_COLORS.crimson}; text-decoration: none; font-weight: bold;" aria-label="Email us at soultrainseatery@gmail.com">soultrainseatery@gmail.com</a>
                </p>
              </address>
            </aside>
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
      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: quote.email,
          subject: emailSubject,
          html: emailBody,
          from: `Soul Train's Eatery <soultrainseatery@gmail.com>`
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
