/**
 * SYNC: Quote Submission Confirmation Email
 * 
 * This edge function sends the confirmation email after customer submits a quote.
 * Uses generateStandardEmail for consistent branding.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  generateStandardEmail,
  EMAIL_CONFIGS,
  BRAND_COLORS
} from "../_shared/emailTemplates.ts";

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

    const emailSubject = `Quote Request Received - Reference #${quote_id.slice(0, 8).toUpperCase()}`;
    
    // Build next steps HTML
    const nextStepsHtml = `
      <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">📋 What Happens Next?</h3>
      <ol style="line-height:1.8;margin:0;padding-left:20px;">
        <li><strong style="color:${BRAND_COLORS.crimson};">Review (You are here!)</strong> - Our team is carefully reviewing your request</li>
        <li><strong style="color:${BRAND_COLORS.crimson};">Detailed Estimate</strong> - You'll receive a comprehensive estimate with pricing within 48 hours</li>
        <li><strong style="color:${BRAND_COLORS.crimson};">Optional Consultation</strong> - We're happy to discuss any details by phone</li>
        <li><strong style="color:${BRAND_COLORS.crimson};">Finalization</strong> - Once approved, we'll handle all the details for your special day</li>
      </ol>
    `;

    const referenceHtml = `
      <div style="background:${BRAND_COLORS.lightGray};padding:16px;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:20px 0;">
        <p style="margin:0;font-size:14px;"><strong>📎 Reference ID:</strong> #${quote_id.slice(0, 8).toUpperCase()}</p>
        <p style="margin:8px 0 0 0;font-size:13px;color:#666;">Keep this for your records - you'll receive your secure portal link within 48 hours.</p>
      </div>
    `;

    const emailBody = generateStandardEmail({
      preheaderText: EMAIL_CONFIGS.quote_confirmation.customer!.preheaderText,
      heroSection: {
        badge: '🍽️ QUOTE RECEIVED',
        title: 'Quote Request Received!',
        subtitle: `Hi ${quote.contact_name}, thank you for choosing Soul Train's Eatery!`,
        variant: 'crimson'
      },
      contentBlocks: [
        { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;line-height:1.6;">We've received your quote request and our team is excited to make your event exceptional. Here's a summary of what you submitted:</p>` }},
        { type: 'event_details' },
        { type: 'menu_summary' },
        { type: 'supplies_summary' },
        { type: 'service_addons' },
        { type: 'custom_html', data: { html: referenceHtml }},
        { type: 'custom_html', data: { html: nextStepsHtml }},
        { type: 'text', data: { html: `
          <div style="border-top:3px solid ${BRAND_COLORS.gold};padding-top:20px;margin-top:30px;text-align:center;">
            <h3 style="color:${BRAND_COLORS.crimson};margin-top:0;">Questions? We're Here to Help!</h3>
            <p style="color:${BRAND_COLORS.darkGray};margin:10px 0;font-size:16px;line-height:1.6;">
              Just reply to this email and our family will get back to you as soon as possible.
            </p>
          </div>
        ` }}
      ],
      quote: quote
    });

    // Send email using SMTP function (non-blocking - log failures but don't throw)
    let emailSent = false;
    let emailError = null;

    try {
      const { error } = await supabase.functions.invoke('send-smtp-email', {
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
