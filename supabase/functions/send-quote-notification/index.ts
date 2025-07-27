import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  const safeString = (value: any): string => value || "Not specified";
  
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

    // Send notification to business with retry
    try {
      console.log("Sending business notification...");
      const businessNotification = await resend.emails.send({
        from: "Soul Train Seatery <noreply@soultrainseatery.com>",
        to: ["soultrainseatery@gmail.com"],
        subject: `New Quote Request - ${quoteData.event_name} ${quoteData.quote_id ? `(ID: ${quoteData.quote_id})` : ''}`,
        html: formatQuoteDetails(quoteData),
      });
      console.log("Business notification sent:", businessNotification.id);
      businessSuccess = true;
    } catch (businessError) {
      console.error("Failed to send business notification:", businessError);
    }

    // Send confirmation to customer with retry
    try {
      console.log("Sending customer confirmation...");
      const customerConfirmation = await resend.emails.send({
        from: "Soul Train Seatery <noreply@soultrainseatery.com>",
        to: [quoteData.email],
        subject: "Quote Request Received - Soul Train Seatery",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your quote request!</h2>
          
          <p>Dear ${quoteData.contact_name},</p>
          
          <p>We have received your quote request for <strong>${quoteData.event_name}</strong> on ${quoteData.event_date}. Thank you for considering Soul Train Seatery for your special event!</p>
          
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
            <p><strong>Soul Train Seatery</strong></p>
            <p>Phone: (843) 970-0265</p>
            <p>Email: soultrainseatery@gmail.com</p>
            <p>Proudly serving Charleston, SC and the surrounding Lowcountry</p>
          </div>
        </div>
      `,
    });

      console.log("Customer confirmation sent:", customerConfirmation.id);
      customerSuccess = true;
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