import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  guest_count: number;
  location: string;
  service_type: string;
  serving_start_time?: string;
  wait_staff_requested?: boolean;
  wait_staff_requirements?: string;
  wait_staff_setup_areas?: string;
  primary_protein?: string;
  secondary_protein?: string;
  both_proteins_available?: boolean;
  appetizers?: string[];
  sides?: string[];
  desserts?: string[];
  drinks?: string[];
  dietary_restrictions?: string[];
  guest_count_with_restrictions?: string;
  custom_menu_requests?: string;
  tables_chairs_requested?: boolean;
  linens_requested?: boolean;
  plates_requested?: boolean;
  cups_requested?: boolean;
  napkins_requested?: boolean;
  serving_utensils_requested?: boolean;
  chafers_requested?: boolean;
  ice_requested?: boolean;
  utensils?: string[];
  extras?: string[];
  separate_serving_area?: boolean;
  serving_setup_area?: string;
  bussing_tables_needed?: boolean;
  special_requests?: string;
  referral_source?: string;
  theme_colors?: string;
  quote_id?: string;
}

const formatQuoteDetails = (quote: QuoteRequest) => {
  const formatArray = (arr: string[] | undefined) => {
    if (!arr || !Array.isArray(arr)) return "None selected";
    return arr.length > 0 ? arr.join(", ") : "None selected";
  };
  const safeString = (value: any): string => String(value || "Not specified");
  
  return `
    <h2>New Quote Request - ${quote.event_name}</h2>
    ${quote.quote_id ? `<p><strong>Quote Reference ID:</strong> <span style="background-color: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${quote.quote_id}</span></p>` : ''}
    
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${quote.contact_name}</p>
    <p><strong>Email:</strong> ${quote.email}</p>
    <p><strong>Phone:</strong> ${quote.phone}</p>
    
    <h3>Event Details</h3>
    <p><strong>Event Name:</strong> ${quote.event_name}</p>
    <p><strong>Event Type:</strong> ${quote.event_type}</p>
    <p><strong>Date:</strong> ${quote.event_date}</p>
    <p><strong>Start Time:</strong> ${quote.start_time}</p>
    <p><strong>Guest Count:</strong> ${quote.guest_count}</p>
    <p><strong>Location:</strong> ${quote.location}</p>
    ${quote.theme_colors ? `<p><strong>Theme/Event Colors:</strong> ${quote.theme_colors}</p>` : ''}
    <p><strong>Service Type:</strong> ${quote.service_type}</p>
    ${quote.serving_start_time ? `<p><strong>Serving Start Time:</strong> ${quote.serving_start_time}</p>` : ''}
    
    <h3>Menu Selections</h3>
    ${quote.primary_protein ? `<p><strong>Primary Protein:</strong> ${safeString(quote.primary_protein).replace(/-/g, ' ')}</p>` : ''}
    ${quote.secondary_protein ? `<p><strong>Secondary Protein:</strong> ${safeString(quote.secondary_protein).replace(/-/g, ' ')}</p>` : ''}
    ${quote.both_proteins_available ? `<p><strong>Both Proteins Available:</strong> Yes</p>` : ''}
    <p><strong>Appetizers:</strong> ${formatArray(quote.appetizers)}</p>
    <p><strong>Sides:</strong> ${formatArray(quote.sides)}</p>
    <p><strong>Desserts:</strong> ${formatArray(quote.desserts)}</p>
    <p><strong>Drinks:</strong> ${formatArray(quote.drinks)}</p>
    
    <h3>Service Requirements</h3>
    <p><strong>Wait Staff Requested:</strong> ${quote.wait_staff_requested ? 'Yes' : 'No'}</p>
    ${quote.wait_staff_requirements ? `<p><strong>Wait Staff Requirements:</strong> ${quote.wait_staff_requirements}</p>` : ''}
    ${quote.wait_staff_setup_areas ? `<p><strong>Wait Staff Setup Areas:</strong> ${quote.wait_staff_setup_areas}</p>` : ''}
    <p><strong>Tables & Chairs:</strong> ${quote.tables_chairs_requested ? 'Yes' : 'No'}</p>
    <p><strong>Linens:</strong> ${quote.linens_requested ? 'Yes' : 'No'}</p>
    <p><strong>Plates:</strong> ${quote.plates_requested ? 'Yes' : 'No'}</p>
    <p><strong>Cups:</strong> ${quote.cups_requested ? 'Yes' : 'No'}</p>
    <p><strong>Napkins:</strong> ${quote.napkins_requested ? 'Yes' : 'No'}</p>
    <p><strong>Serving Utensils:</strong> ${quote.serving_utensils_requested ? 'Yes' : 'No'}</p>
    <p><strong>Chafers:</strong> ${quote.chafers_requested ? 'Yes' : 'No'}</p>
    <p><strong>Ice:</strong> ${quote.ice_requested ? 'Yes' : 'No'}</p>
    <p><strong>Utensils:</strong> ${formatArray(quote.utensils)}</p>
    <p><strong>Extras:</strong> ${formatArray(quote.extras)}</p>
    <p><strong>Separate Serving Area:</strong> ${quote.separate_serving_area ? 'Yes' : 'No'}</p>
    ${quote.serving_setup_area ? `<p><strong>Serving Setup Area:</strong> ${quote.serving_setup_area}</p>` : ''}
    <p><strong>Bussing Tables Needed:</strong> ${quote.bussing_tables_needed ? 'Yes' : 'No'}</p>
    
    <h3>Additional Information</h3>
    <p><strong>Dietary Restrictions:</strong> ${formatArray(quote.dietary_restrictions)}</p>
    ${quote.guest_count_with_restrictions ? `<p><strong>Guests with Restrictions:</strong> ${quote.guest_count_with_restrictions}</p>` : ''}
    ${quote.custom_menu_requests ? `<p><strong>Custom Menu Requests:</strong> ${quote.custom_menu_requests}</p>` : ''}
    ${quote.special_requests ? `<p><strong>Special Requests:</strong> ${quote.special_requests}</p>` : ''}
    ${quote.referral_source ? `<p><strong>Referral Source:</strong> ${quote.referral_source}</p>` : ''}
  `;
};

async function sendEmailViaGmailAPI(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase credentials not configured');
      return false;
    }

    // Import Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.52.1');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Sending email via Gmail API to: ${to}`);

    // Get Gmail tokens from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('email', 'soultrainseatery@gmail.com')
      .single();

    if (tokenError || !tokenData) {
      console.error('No Gmail tokens found for soultrainseatery@gmail.com:', tokenError);
      return false;
    }

    let accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresAt = new Date(tokenData.expires_at);

    // Check if token is expired and refresh if needed
    if (expiresAt <= new Date()) {
      console.log('Access token expired, refreshing...');
      
      const clientId = Deno.env.get('GMAIL_CLIENT_ID');
      const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
      
      if (!clientId || !clientSecret) {
        console.error('Gmail OAuth credentials not configured');
        return false;
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Failed to refresh access token:', await tokenResponse.text());
        return false;
      }

      const tokens = await tokenResponse.json();
      accessToken = tokens.access_token;
      
      // Update token in database
      const newExpiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();
      await supabase
        .from('gmail_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt,
        })
        .eq('email', 'soultrainseatery@gmail.com');

      console.log('Access token refreshed successfully');
    }

    // Create email message
    const emailMessage = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `From: Soul Train's Eatery <soultrainseatery@gmail.com>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      html
    ].join('\r\n');

    // Base64url encode the message
    const base64urlEncode = (str: string) => {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    const encodedMessage = base64urlEncode(emailMessage);

    // Send email via Gmail API
    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();
      console.error('Gmail API error:', errorText);
      return false;
    }

    const result = await gmailResponse.json();
    console.log(`Email sent successfully via Gmail API to: ${to}`, result.id);
    return true;

  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quoteData: QuoteRequest = await req.json();
    console.log("Processing quote request:", { 
      quote_id: quoteData.quote_id, 
      event_name: quoteData.event_name,
      email: quoteData.email 
    });

    // Validate required fields
    if (!quoteData.contact_name || !quoteData.email || !quoteData.event_name) {
      throw new Error("Missing required fields: contact_name, email, or event_name");
    }

    let businessSuccess = false;
    let customerSuccess = false;

    // Send notification to business
    try {
      console.log("Sending business notification...");
      const businessSubject = `New Quote Request - ${quoteData.event_name} ${quoteData.quote_id ? `(ID: ${quoteData.quote_id})` : ''}`;
      const businessHtml = formatQuoteDetails(quoteData);
      
      businessSuccess = await sendEmailViaGmailAPI(
        "soultrainseatery@gmail.com",
        businessSubject,
        businessHtml
      );
      console.log("Business notification sent:", businessSuccess);
    } catch (businessError) {
      console.error("Failed to send business notification:", businessError);
    }

    // Send confirmation to customer
    try {
      console.log("Sending customer confirmation...");
      const customerSubject = "Quote Request Received - Soul Train's Eatery";
      const customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your quote request!</h2>
          
          <p>Dear ${quoteData.contact_name},</p>
          
          <p>We have received your quote request for <strong>${quoteData.event_name}</strong> on ${quoteData.event_date}. Thank you for considering Soul Train's Eatery for your special event!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Our team will review your request within 48 hours</li>
              <li>We'll prepare a customized quote for your event</li>
              <li>You'll receive a detailed proposal via email</li>
            </ul>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>Important:</strong> If you don't hear back from us within 48 hours, please call us at <strong>(843) 970-0265</strong></p>
          </div>
          
          ${quoteData.quote_id ? `<p><strong>Your Reference ID:</strong> <span style="background-color: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${quoteData.quote_id}</span></p>` : ''}
          
          <h3>Your Event Details:</h3>
          <p><strong>Event:</strong> ${quoteData.event_name}</p>
          <p><strong>Date:</strong> ${quoteData.event_date}</p>
          <p><strong>Time:</strong> ${quoteData.start_time}</p>
          <p><strong>Guests:</strong> ${quoteData.guest_count}</p>
          <p><strong>Location:</strong> ${quoteData.location}</p>
          ${quoteData.theme_colors ? `<p><strong>Theme/Event Colors:</strong> ${quoteData.theme_colors}</p>` : ''}
          
          <hr style="margin: 30px 0;">
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p><strong>Soul Train's Eatery</strong></p>
            <p>Phone: (843) 970-0265</p>
            <p>Email: soultrainseatery@gmail.com</p>
            <p>Proudly serving Charleston, SC and the surrounding Lowcountry</p>
          </div>
        </div>
      `;

      customerSuccess = await sendEmailViaGmailAPI(
        quoteData.email,
        customerSubject,
        customerHtml
      );
      console.log("Customer confirmation sent:", customerSuccess);
    } catch (customerError) {
      console.error("Failed to send customer confirmation:", customerError);
    }

    // Return status based on email success
    const allSuccess = businessSuccess && customerSuccess;
    const partialSuccess = businessSuccess || customerSuccess;
    
    console.log("Email sending completed:", { businessSuccess, customerSuccess, allSuccess });

    if (allSuccess) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "All emails sent successfully",
        quote_id: quoteData.quote_id 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else if (partialSuccess) {
      return new Response(JSON.stringify({ 
        success: false, 
        partial: true,
        message: "Some emails failed to send",
        quote_id: quoteData.quote_id 
      }), {
        status: 207, // Multi-Status
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      throw new Error("All email notifications failed");
    }
  } catch (error: any) {
    console.error("Error in send-quote-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);