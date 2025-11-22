import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('Quote notification request:', requestData);

    // Format event date
    const eventDate = new Date(requestData.event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Admin notification email
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D97706;">🚂 New Quote Request</h1>
        
        <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #92400E; margin-top: 0;">Customer Details</h2>
          <p><strong>Name:</strong> ${requestData.contact_name}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Phone:</strong> ${requestData.phone}</p>
        </div>

        <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1F2937; margin-top: 0;">Event Information</h2>
          <p><strong>Event Name:</strong> ${requestData.event_name}</p>
          <p><strong>Event Type:</strong> ${requestData.event_type}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${requestData.start_time}</p>
          <p><strong>Guest Count:</strong> ${requestData.guest_count}</p>
          <p><strong>Location:</strong> ${requestData.location}</p>
          <p><strong>Service Type:</strong> ${requestData.service_type}</p>
        </div>

        ${requestData.theme_colors ? `
        <div style="background-color: #E0E7FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Theme/Colors:</strong> ${requestData.theme_colors}</p>
        </div>
        ` : ''}

        ${requestData.special_requests ? `
        <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Special Requests:</strong> ${requestData.special_requests}</p>
        </div>
        ` : ''}

        <p style="margin-top: 30px;"><a href="https://qptprrqjlcvfkhfdnnoa.supabase.co/admin/quotes" 
           style="display: inline-block; background-color: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View in Admin Dashboard →
        </a></p>
      </div>
    `;

    // Customer confirmation email
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #D97706; text-align: center;">Soul Train's Eatery</h1>
        <p style="text-align: center; color: #666;">Charleston's Premier Catering Service</p>

        <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h2 style="color: #92400E; margin-top: 0;">✓ Quote Request Received!</h2>
          <p style="color: #78350F;">
            Hi ${requestData.contact_name},<br><br>
            Thank you for choosing Soul Train's Eatery! We've received your quote request and our team is excited to make your event exceptional.
          </p>
        </div>

        <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #1F2937; margin-top: 0;">Your Event Details</h3>
          <p><strong>Event:</strong> ${requestData.event_name}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Guest Count:</strong> ${requestData.guest_count} guests</p>
        </div>

        <div style="margin: 25px 0;">
          <h3 style="color: #1F2937;">What Happens Next?</h3>
          <ol style="color: #4B5563; line-height: 1.8;">
            <li><strong>Review</strong> - Our team is carefully reviewing your request</li>
            <li><strong>Detailed Quote</strong> - You'll receive a comprehensive quote within 48 hours</li>
            <li><strong>Optional Consultation</strong> - We're happy to discuss any details by phone</li>
            <li><strong>Finalization</strong> - Once approved, we'll handle all the details for your special day</li>
          </ol>
        </div>

        <div style="border-top: 2px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
          <h3 style="color: #1F2937;">Questions? We're Here to Help!</h3>
          <p style="color: #4B5563;">
            📞 Phone: <a href="tel:8439700265" style="color: #D97706;">(843) 970-0265</a><br>
            📧 Email: <a href="mailto:soultrainseatery@gmail.com" style="color: #D97706;">soultrainseatery@gmail.com</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px;">
            Soul Train's Eatery - Family-Run, Charleston-Based Catering<br>
            Proudly serving Charleston's Lowcountry and surrounding areas
          </p>
        </div>
      </div>
    `;

    console.log('Sending admin email...');
    const { error: adminEmailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: 'soultrainseatery@gmail.com',
        subject: `New Quote Request: ${requestData.event_name}`,
        html: adminEmailHtml,
        from: 'soultrainseatery@gmail.com'
      }
    });

    if (adminEmailError) {
      console.error('Failed to send admin email:', adminEmailError);
      throw new Error(`Admin email failed: ${adminEmailError.message}`);
    }

    console.log('Sending customer confirmation email...');
    const { error: customerEmailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: requestData.email,
        subject: `Quote Request Received - ${requestData.event_name}`,
        html: customerEmailHtml,
        from: 'soultrainseatery@gmail.com'
      }
    });

    if (customerEmailError) {
      console.error('Failed to send customer email:', customerEmailError);
      throw new Error(`Customer email failed: ${customerEmailError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Quote notifications sent successfully via Gmail" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-quote-notification:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);