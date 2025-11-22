import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

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

    // Format event date
    const eventDate = new Date(quote.event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create portal link (will be used when estimate is created)
    const portalLink = `${Deno.env.get('FRONTEND_URL') || 'https://qptprrqjlcvfkhfdnnoa.supabase.co'}/customer/quote/${quote_id}`;

    const emailSubject = `Quote Request Received - Reference #${quote_id.slice(0, 8).toUpperCase()}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D97706; margin: 0;">Soul Train's Eatery</h1>
          <p style="color: #666; margin-top: 5px;">Charleston's Premier Catering Service</p>
        </div>

        <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #92400E; margin-top: 0;">✓ Quote Request Received!</h2>
          <p style="color: #78350F; margin-bottom: 0;">
            Hi ${quote.contact_name},<br><br>
            Thank you for choosing Soul Train's Eatery! We've received your quote request and our team is excited to make your event exceptional.
          </p>
        </div>

        <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1F2937; margin-top: 0;">Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-weight: 500;">Event:</td>
              <td style="padding: 8px 0; color: #1F2937;">${quote.event_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-weight: 500;">Date:</td>
              <td style="padding: 8px 0; color: #1F2937;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-weight: 500;">Guest Count:</td>
              <td style="padding: 8px 0; color: #1F2937;">${quote.guest_count} guests</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-weight: 500;">Reference ID:</td>
              <td style="padding: 8px 0; color: #D97706; font-weight: 600;">#${quote_id.slice(0, 8).toUpperCase()}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #1F2937;">What Happens Next?</h3>
          <ol style="color: #4B5563; line-height: 1.8; padding-left: 20px;">
            <li><strong>Review (You are here!)</strong> - Our team is carefully reviewing your request</li>
            <li><strong>Detailed Quote</strong> - You'll receive a comprehensive quote within 48 hours</li>
            <li><strong>Optional Consultation</strong> - We're happy to discuss any details by phone</li>
            <li><strong>Finalization</strong> - Once approved, we'll handle all the details for your special day</li>
          </ol>
        </div>

        <div style="background-color: #DBEAFE; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1E40AF; margin-top: 0;">Track Your Quote</h3>
          <p style="color: #1E3A8A; margin-bottom: 15px;">
            Bookmark this link to check your quote status anytime:
          </p>
          <a href="${portalLink}" 
             style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Quote Status →
          </a>
        </div>

        <div style="border-top: 2px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
          <h3 style="color: #1F2937; margin-top: 0;">Questions? We're Here to Help!</h3>
          <p style="color: #4B5563; margin: 10px 0;">
            📞 Phone: <a href="tel:8439700265" style="color: #D97706; text-decoration: none;">(843) 970-0265</a><br>
            📧 Email: <a href="mailto:soultrainseatery@gmail.com" style="color: #D97706; text-decoration: none;">soultrainseatery@gmail.com</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
            Soul Train's Eatery - Family-Run, Charleston-Based Catering
          </p>
          <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
            Proudly serving Charleston's Lowcountry and surrounding areas
          </p>
        </div>
      </div>
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
