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
    return arr.length > 0 ? arr.map(item => item.replace(/-/g, ' ')).join(", ") : "None selected";
  };
  const safeString = (value: any): string => String(value || "Not specified");
  
  const formatServiceType = (type: string) => {
    const types: { [key: string]: string } = {
      "drop-off": "Drop-Off Service",
      "delivery-setup": "Delivery + Setup", 
      "full-service": "Full-Service Catering"
    };
    return types[type] || type;
  };
  
  return `
    <div style="font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; background: #fafafa; padding: 30px; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Soul Train's Eatery</h1>
        <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">New Quote Request</p>
      </div>
      
      ${quote.quote_id ? `<div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;"><strong>Quote Reference ID:</strong> <span style="background-color: #fff; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-weight: bold;">${quote.quote_id}</span></div>` : ''}
      
      <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #8B4513; border-bottom: 2px solid #D2691E; padding-bottom: 10px; margin-top: 0;">📋 Event Overview</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
          <div><strong>Event Name:</strong> ${quote.event_name}</div>
          <div><strong>Event Type:</strong> ${quote.event_type.replace(/-/g, ' ')}</div>
          <div><strong>Date:</strong> ${quote.event_date}</div>
          <div><strong>Start Time:</strong> ${quote.start_time}</div>
          <div><strong>Guest Count:</strong> ${quote.guest_count}</div>
          <div><strong>Service:</strong> ${formatServiceType(quote.service_type)}</div>
        </div>
        <div style="margin-top: 15px;"><strong>Location:</strong> ${quote.location}</div>
        ${quote.theme_colors ? `<div style="margin-top: 10px;"><strong>Theme/Event Colors:</strong> ${quote.theme_colors}</div>` : ''}
      </div>

      <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #8B4513; border-bottom: 2px solid #D2691E; padding-bottom: 10px; margin-top: 0;">👥 Contact Information</h2>
        <div style="margin-top: 20px;">
          <div style="margin-bottom: 10px;"><strong>Name:</strong> ${quote.contact_name}</div>
          <div style="margin-bottom: 10px;"><strong>Email:</strong> <a href="mailto:${quote.email}" style="color: #D2691E;">${quote.email}</a></div>
          <div><strong>Phone:</strong> <a href="tel:${quote.phone}" style="color: #D2691E;">${quote.phone}</a></div>
        </div>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #8B4513; border-bottom: 2px solid #D2691E; padding-bottom: 10px; margin-top: 0;">🍽️ Menu Selections</h2>
        <div style="margin-top: 20px;">
          ${quote.primary_protein ? `<div style="margin-bottom: 10px;"><strong>Primary Protein:</strong> ${safeString(quote.primary_protein).replace(/-/g, ' ')}</div>` : ''}
          ${quote.secondary_protein ? `<div style="margin-bottom: 10px;"><strong>Secondary Protein:</strong> ${safeString(quote.secondary_protein).replace(/-/g, ' ')}</div>` : ''}
          ${quote.both_proteins_available ? `<div style="margin-bottom: 10px;"><strong>Both Proteins Available:</strong> Yes</div>` : ''}
          <div style="margin-bottom: 10px;"><strong>Appetizers:</strong> ${formatArray(quote.appetizers)}</div>
          <div style="margin-bottom: 10px;"><strong>Sides:</strong> ${formatArray(quote.sides)}</div>
          <div style="margin-bottom: 10px;"><strong>Desserts:</strong> ${formatArray(quote.desserts)}</div>
          <div style="margin-bottom: 10px;"><strong>Beverages:</strong> ${formatArray(quote.drinks)}</div>
          ${quote.custom_menu_requests ? `<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px;"><strong>Custom Menu Requests:</strong><br>${quote.custom_menu_requests}</div>` : ''}
        </div>
      </div>

      <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #8B4513; border-bottom: 2px solid #D2691E; padding-bottom: 10px; margin-top: 0;">⚙️ Service Details</h2>
        <div style="margin-top: 20px;">
          <div style="margin-bottom: 10px;"><strong>Service Type:</strong> ${formatServiceType(quote.service_type)}</div>
          ${quote.serving_start_time ? `<div style="margin-bottom: 10px;"><strong>Serving Start Time:</strong> ${quote.serving_start_time}</div>` : ''}
          <div style="margin-bottom: 10px;"><strong>Professional Wait Staff:</strong> ${quote.wait_staff_requested ? 'Yes' : 'No'}</div>
          ${quote.wait_staff_requirements ? `<div style="margin-bottom: 10px;"><strong>Wait Staff Requirements:</strong> ${quote.wait_staff_requirements}</div>` : ''}
          ${quote.wait_staff_setup_areas ? `<div style="margin-bottom: 10px;"><strong>Wait Staff Setup Areas:</strong> ${quote.wait_staff_setup_areas}</div>` : ''}
        </div>
        
        <h3 style="color: #8B4513; margin-top: 25px; margin-bottom: 15px;">Additional Services Requested:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>• Tables & Chairs: ${quote.tables_chairs_requested ? 'Yes' : 'No'}</div>
          <div>• Linens: ${quote.linens_requested ? 'Yes' : 'No'}</div>
          <div>• Plates: ${quote.plates_requested ? 'Yes' : 'No'}</div>
          <div>• Cups: ${quote.cups_requested ? 'Yes' : 'No'}</div>
          <div>• Napkins: ${quote.napkins_requested ? 'Yes' : 'No'}</div>
          <div>• Serving Utensils: ${quote.serving_utensils_requested ? 'Yes' : 'No'}</div>
          <div>• Chafing Dishes: ${quote.chafers_requested ? 'Yes' : 'No'}</div>
          <div>• Ice: ${quote.ice_requested ? 'Yes' : 'No'}</div>
        </div>
        
        ${quote.separate_serving_area ? `<div style="margin-top: 15px;"><strong>Separate Serving Area:</strong> Yes</div>` : ''}
        ${quote.serving_setup_area ? `<div style="margin-top: 10px;"><strong>Serving Setup Area:</strong> ${quote.serving_setup_area}</div>` : ''}
        ${quote.bussing_tables_needed ? `<div style="margin-top: 10px;"><strong>Bussing Tables Needed:</strong> Yes</div>` : ''}
      </div>

      ${(quote.dietary_restrictions && quote.dietary_restrictions.length > 0) || quote.guest_count_with_restrictions || quote.special_requests || quote.referral_source ? `
      <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #8B4513; border-bottom: 2px solid #D2691E; padding-bottom: 10px; margin-top: 0;">📝 Additional Information</h2>
        <div style="margin-top: 20px;">
          ${quote.dietary_restrictions && quote.dietary_restrictions.length > 0 ? `<div style="margin-bottom: 15px;"><strong>Dietary Restrictions:</strong> ${formatArray(quote.dietary_restrictions)}</div>` : ''}
          ${quote.guest_count_with_restrictions ? `<div style="margin-bottom: 15px;"><strong>Guests with Dietary Restrictions:</strong> ${quote.guest_count_with_restrictions}</div>` : ''}
          ${quote.special_requests ? `<div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;"><strong>Special Requests:</strong><br>${quote.special_requests}</div>` : ''}
          ${quote.referral_source ? `<div style="margin-bottom: 10px;"><strong>How did you hear about us:</strong> ${quote.referral_source}</div>` : ''}
        </div>
      </div>` : ''}

      <div style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; border-radius: 10px; text-align: center;">
        <h3 style="margin: 0 0 10px 0;">Next Steps</h3>
        <p style="margin: 0; opacity: 0.9;">Our team will review this request and respond within 48 hours with a detailed quote.</p>
        <div style="margin-top: 15px; font-size: 14px;">
          <p style="margin: 0;">Soul Train's Eatery • (843) 970-0265 • soultrainseatery@gmail.com</p>
        </div>
      </div>
    </div>
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

    // Base64url encode the message with proper UTF-8 handling
    const base64urlEncode = (str: string) => {
      // First convert string to UTF-8 bytes, then to Latin1 for btoa
      const utf8Bytes = new TextEncoder().encode(str);
      const latin1String = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
      return btoa(latin1String)
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
      
      const formatServiceType = (type: string) => {
        const types: { [key: string]: string } = {
          "drop-off": "Drop-Off Service",
          "delivery-setup": "Delivery + Setup", 
          "full-service": "Full-Service Catering"
        };
        return types[type] || type;
      };
      
      const formatArray = (arr: string[] | undefined) => {
        if (!arr || !Array.isArray(arr)) return "None selected";
        return arr.length > 0 ? arr.map(item => item.replace(/-/g, ' ')).join(", ") : "None selected";
      };
      
      const customerHtml = `
        <div style="font-family: 'Georgia', serif; max-width: 700px; margin: 0 auto; background: #fafafa; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Soul Train's Eatery</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Charleston's Authentic Southern Catering</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #8B4513; margin-top: 0;">Thank You, ${quoteData.contact_name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">We have received your quote request for <strong>${quoteData.event_name}</strong> and are excited about the opportunity to cater your special event! Our family-run business takes pride in bringing people together around exceptional Southern food.</p>
            
            ${quoteData.quote_id ? `<div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;"><strong>Your Reference ID:</strong> <span style="background-color: #fff; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-weight: bold;">${quoteData.quote_id}</span></div>` : ''}
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #8B4513;">What Happens Next?</h3>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Our catering team will review your request within <strong>48 hours</strong></li>
                <li>We'll prepare a customized quote tailored to your event</li>
                <li>You'll receive a detailed proposal via email with pricing and options</li>
                <li>We'll schedule a call to discuss any questions and finalize details</li>
              </ul>
            </div>
          </div>

          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #8B4513; margin-top: 0; border-bottom: 2px solid #D2691E; padding-bottom: 10px;">📋 Your Event Summary</h3>
            <div style="margin-top: 20px;">
              <div style="margin-bottom: 12px;"><strong>Event:</strong> ${quoteData.event_name}</div>
              <div style="margin-bottom: 12px;"><strong>Date:</strong> ${quoteData.event_date}</div>
              <div style="margin-bottom: 12px;"><strong>Time:</strong> ${quoteData.start_time}</div>
              <div style="margin-bottom: 12px;"><strong>Guests:</strong> ${quoteData.guest_count}</div>
              <div style="margin-bottom: 12px;"><strong>Service Type:</strong> ${formatServiceType(quoteData.service_type)}</div>
              <div style="margin-bottom: 12px;"><strong>Location:</strong> ${quoteData.location}</div>
              ${quoteData.theme_colors ? `<div style="margin-bottom: 12px;"><strong>Theme/Event Colors:</strong> ${quoteData.theme_colors}</div>` : ''}
              ${quoteData.wait_staff_requested ? `<div style="margin-bottom: 12px;"><strong>Professional Wait Staff:</strong> Requested</div>` : ''}
            </div>
          </div>

          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #8B4513; margin-top: 0; border-bottom: 2px solid #D2691E; padding-bottom: 10px;">🍽️ Your Menu Selections</h3>
            <div style="margin-top: 20px;">
              ${quoteData.primary_protein ? `<div style="margin-bottom: 12px;"><strong>Primary Protein:</strong> ${String(quoteData.primary_protein).replace(/-/g, ' ')}</div>` : ''}
              ${quoteData.secondary_protein ? `<div style="margin-bottom: 12px;"><strong>Secondary Protein:</strong> ${String(quoteData.secondary_protein).replace(/-/g, ' ')}</div>` : ''}
              ${quoteData.appetizers && quoteData.appetizers.length > 0 ? `<div style="margin-bottom: 12px;"><strong>Appetizers:</strong> ${formatArray(quoteData.appetizers)}</div>` : ''}
              ${quoteData.sides && quoteData.sides.length > 0 ? `<div style="margin-bottom: 12px;"><strong>Sides:</strong> ${formatArray(quoteData.sides)}</div>` : ''}
              ${quoteData.desserts && quoteData.desserts.length > 0 ? `<div style="margin-bottom: 12px;"><strong>Desserts:</strong> ${formatArray(quoteData.desserts)}</div>` : ''}
              ${quoteData.drinks && quoteData.drinks.length > 0 ? `<div style="margin-bottom: 12px;"><strong>Beverages:</strong> ${formatArray(quoteData.drinks)}</div>` : ''}
              ${quoteData.custom_menu_requests ? `<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px;"><strong>Custom Menu Requests:</strong><br>${quoteData.custom_menu_requests}</div>` : ''}
            </div>
          </div>

          ${(quoteData.dietary_restrictions && quoteData.dietary_restrictions.length > 0) || quoteData.guest_count_with_restrictions || quoteData.special_requests ? `
          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #8B4513; margin-top: 0; border-bottom: 2px solid #D2691E; padding-bottom: 10px;">📝 Special Notes & Dietary Needs</h3>
            <div style="margin-top: 20px;">
              ${quoteData.dietary_restrictions && quoteData.dietary_restrictions.length > 0 ? `<div style="margin-bottom: 12px;"><strong>Dietary Restrictions:</strong> ${formatArray(quoteData.dietary_restrictions)}</div>` : ''}
              ${quoteData.guest_count_with_restrictions ? `<div style="margin-bottom: 12px;"><strong>Number of Guests with Restrictions:</strong> ${quoteData.guest_count_with_restrictions}</div>` : ''}
              ${quoteData.special_requests ? `<div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 15px;"><strong>Special Requests:</strong><br>${quoteData.special_requests}</div>` : ''}
            </div>
          </div>` : ''}
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">🕐 Response Time Commitment</p>
            <p style="margin: 10px 0 0 0;">If you don't hear back from us within 48 hours, please call us directly at <strong>(843) 970-0265</strong>. Your event is important to us!</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="margin: 0 0 15px 0;">Contact Soul Train's Eatery</h3>
            <div style="font-size: 16px; line-height: 1.8;">
              <p style="margin: 0;"><strong>📞 Phone:</strong> (843) 970-0265</p>
              <p style="margin: 0;"><strong>📧 Email:</strong> soultrainseatery@gmail.com</p>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Proudly serving Charleston's Lowcountry and surrounding areas</p>
              <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; font-style: italic;">Family-run • Authentic Southern Cooking • Bringing People Together</p>
            </div>
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