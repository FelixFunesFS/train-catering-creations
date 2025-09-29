// Supabase Edge Function for sending status notifications
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@6.0.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  entityType: 'quote' | 'invoice';
  entityId: string;
  customerEmail: string;
  newStatus: string;
  transition: string;
  entityData: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      entityType,
      entityId,
      customerEmail,
      newStatus,
      transition,
      entityData
    }: StatusNotificationRequest = await req.json();

    // Generate email content based on status
    const emailContent = generateStatusEmail(entityType, newStatus, transition, entityData);

    const emailResponse = await resend.emails.send({
      from: "Soul Train's Eatery <notifications@soultrainseatery.com>",
      to: [customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Status notification sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending status notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateStatusEmail(
  entityType: 'quote' | 'invoice',
  status: string,
  transition: string,
  entityData: any
) {
  const isQuote = entityType === 'quote';
  const entityName = isQuote ? 'quote' : 'estimate';
  const eventName = isQuote ? entityData.event_name : entityData.quote_requests?.event_name;
  const eventDate = isQuote ? entityData.event_date : entityData.quote_requests?.event_date;
  const contactName = isQuote ? entityData.contact_name : entityData.quote_requests?.contact_name;

  let subject = '';
  let content = '';

  switch (status) {
    case 'sent':
      subject = `Your ${entityName} is ready for review - ${eventName}`;
      content = `
        <p>Great news! Your ${entityName} for <strong>${eventName}</strong> is ready for your review.</p>
        <p>Please take a moment to review the details and let us know if you have any questions or need any adjustments.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid: #1a73e8;">
          <strong>Event Details:</strong><br>
          Event: ${eventName}<br>
          Date: ${new Date(eventDate).toLocaleDateString()}<br>
          ${entityType === 'invoice' && entityData.total_amount ? `Total: $${(entityData.total_amount / 100).toFixed(2)}` : ''}
        </div>
      `;
      break;

    case 'customer_approved':
      subject = `Thank you for approving your ${entityName} - ${eventName}`;
      content = `
        <p>Wonderful! We've received your approval for the ${entityName} for <strong>${eventName}</strong>.</p>
        <p>We're excited to cater your event and will be in touch soon with next steps and final details.</p>
      `;
      break;

    case 'revised':
      subject = `Updated ${entityName} available - ${eventName}`;
      content = `
        <p>We've updated your ${entityName} for <strong>${eventName}</strong> based on your feedback.</p>
        <p>Please review the revised ${entityName} and let us know if everything looks good or if you need any additional changes.</p>
      `;
      break;

    case 'confirmed':
      subject = `Event confirmed - ${eventName}`;
      content = `
        <p>Fantastic! Your event <strong>${eventName}</strong> has been confirmed.</p>
        <p>We're looking forward to making your event delicious and memorable. We'll be in touch with final details as your event date approaches.</p>
      `;
      break;

    case 'expired':
      subject = `${entityName} expired - ${eventName}`;
      content = `
        <p>Your ${entityName} for <strong>${eventName}</strong> has expired.</p>
        <p>If you're still interested in our catering services for this event, please contact us and we'll be happy to create a new ${entityName} for you.</p>
      `;
      break;

    default:
      subject = `${entityName} status update - ${eventName}`;
      content = `
        <p>There's been an update to your ${entityName} for <strong>${eventName}</strong>.</p>
        <p>Status: <strong>${transition}</strong></p>
      `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Soul Train's Eatery</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Charleston's Trusted Catering Partner</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #8B4513; margin-top: 0;">Hello ${contactName || 'there'}!</h2>
        
        ${content}
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="#" style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            View ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <p style="margin: 0;">Questions? Contact us:</p>
          <p style="margin: 5px 0;">📞 (843) 970-0265</p>
          <p style="margin: 5px 0;">✉️ soultrainseatery@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

serve(handler);