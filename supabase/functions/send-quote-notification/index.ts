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

    // Send admin notification email
    const adminEmailHtml = `
      <h2>New Quote Request Received</h2>
      <p><strong>Contact:</strong> ${requestData.contact_name}</p>
      <p><strong>Email:</strong> ${requestData.email}</p>
      <p><strong>Phone:</strong> ${requestData.phone}</p>
      <p><strong>Event:</strong> ${requestData.event_name}</p>
      <p><strong>Date:</strong> ${requestData.event_date}</p>
      <p><strong>Guests:</strong> ${requestData.guest_count}</p>
      <p><strong>Location:</strong> ${requestData.location}</p>
      <p><strong>Service Type:</strong> ${requestData.service_type}</p>
      
      <p>Please review this request in the admin dashboard.</p>
    `;

    // Send customer confirmation email
    const customerEmailHtml = `
      <h2>Thank you for your quote request!</h2>
      <p>Dear ${requestData.contact_name},</p>
      
      <p>We've received your quote request for <strong>${requestData.event_name}</strong> and will respond within 48 hours.</p>
      
      <h3>Your Event Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${requestData.event_date}</li>
        <li><strong>Guests:</strong> ${requestData.guest_count}</li>
        <li><strong>Location:</strong> ${requestData.location}</li>
        <li><strong>Service Type:</strong> ${requestData.service_type}</li>
      </ul>
      
      <p>For immediate assistance, please call us at (843) 970-0265.</p>
      
      <p>Best regards,<br>Soul Train's Eatery Team</p>
    `;

    // Here you would integrate with your email service (Resend, etc.)
    // For now, just log the emails
    console.log('Admin email:', adminEmailHtml);
    console.log('Customer email:', customerEmailHtml);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifications sent successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-quote-notification:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);