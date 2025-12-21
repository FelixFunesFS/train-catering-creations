// Supabase Edge Function for sending status notifications
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import { BRAND_COLORS, LOGO_URLS, generateEmailHeader, generateFooter } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StatusNotificationRequest {
  entityType: 'quote' | 'invoice';
  entityId: string;
  customerEmail: string;
  newStatus: string;
  transition: string;
  entityData: any;
}

const handler = async (req: Request): Promise<Response> => {
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

    const emailContent = generateStatusEmail(entityType, newStatus, transition, entityData);

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      }
    });

    if (emailError) {
      console.error("Failed to send status notification:", emailError);
      throw emailError;
    }

    console.log("Status notification sent to:", customerEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending status notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">Great news! Your ${entityName} for <strong>${eventName}</strong> is ready for your review.</p>
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">Please take a moment to review the details and let us know if you have any questions or need any adjustments.</p>
        <div style="margin:20px 0;padding:16px;background-color:${BRAND_COLORS.lightGray};border-left:4px solid ${BRAND_COLORS.gold};border-radius:4px;">
          <strong style="color:${BRAND_COLORS.crimson};">Event Details:</strong><br/>
          <span style="color:${BRAND_COLORS.darkGray};">Event: ${eventName}</span><br/>
          <span style="color:${BRAND_COLORS.darkGray};">Date: ${new Date(eventDate).toLocaleDateString()}</span><br/>
          ${entityType === 'invoice' && entityData.total_amount ? `<span style="color:${BRAND_COLORS.darkGray};">Total: $${(entityData.total_amount / 100).toFixed(2)}</span>` : ''}
        </div>
      `;
      break;

    case 'customer_approved':
      subject = `Thank you for approving your ${entityName} - ${eventName}`;
      content = `
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">Wonderful! We've received your approval for the ${entityName} for <strong>${eventName}</strong>.</p>
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">We're excited to cater your event and will be in touch soon with next steps and final details.</p>
      `;
      break;

    case 'revised':
      subject = `Updated ${entityName} available - ${eventName}`;
      content = `
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">We've updated your ${entityName} for <strong>${eventName}</strong> based on your feedback.</p>
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">Please review the revised ${entityName} and let us know if everything looks good or if you need any additional changes.</p>
      `;
      break;

    case 'confirmed':
      subject = `Event confirmed - ${eventName}`;
      content = `
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">Fantastic! Your event <strong>${eventName}</strong> has been confirmed.</p>
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">We're looking forward to making your event delicious and memorable. We'll be in touch with final details as your event date approaches.</p>
      `;
      break;

    case 'expired':
      subject = `${entityName} expired - ${eventName}`;
      content = `
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">Your ${entityName} for <strong>${eventName}</strong> has expired.</p>
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">If you're still interested in our catering services for this event, please contact us and we'll be happy to create a new ${entityName} for you.</p>
      `;
      break;

    default:
      subject = `${entityName} status update - ${eventName}`;
      content = `
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">There's been an update to your ${entityName} for <strong>${eventName}</strong>.</p>
        <p style="margin:12px 0;line-height:1.6;font-size:16px;">Status: <strong>${transition}</strong></p>
      `;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:${BRAND_COLORS.darkGray};background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px 0;">
<tr>
<td align="center">
<table width="100%" style="max-width:600px;background:${BRAND_COLORS.white};border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
<tr>
<td style="background:linear-gradient(135deg,${BRAND_COLORS.crimson} 0%,${BRAND_COLORS.crimsonDark} 100%);padding:30px;text-align:center;">
<img src="${LOGO_URLS.white}" alt="Soul Train's Eatery" width="70" height="70" style="display:block;width:70px;height:70px;margin:0 auto 12px auto;" />
<h1 style="color:${BRAND_COLORS.gold};margin:0;font-size:26px;font-weight:bold;">Soul Train's Eatery</h1>
<p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:14px;">Charleston's Trusted Catering Partner</p>
</td>
</tr>
<tr>
<td style="padding:30px;">
<h2 style="color:${BRAND_COLORS.crimson};margin:0 0 20px 0;font-size:22px;">Hello ${contactName || 'there'}!</h2>
${content}
<div style="margin:30px 0;text-align:center;">
<a href="#" style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});color:${BRAND_COLORS.white};padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
View ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}
</a>
</div>
<div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#666;">
<p style="margin:0;">Questions? Contact us:</p>
<p style="margin:5px 0;"><a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};text-decoration:none;">(843) 970-0265</a></p>
<p style="margin:5px 0;"><a href="mailto:soultrainseatery@gmail.com" style="color:${BRAND_COLORS.crimson};text-decoration:none;">soultrainseatery@gmail.com</a></p>
</div>
</td>
</tr>
<tr>
<td style="background:${BRAND_COLORS.darkGray};padding:20px;text-align:center;">
<img src="${LOGO_URLS.white}" alt="" width="40" height="40" style="display:block;width:40px;height:40px;margin:0 auto 8px auto;opacity:0.8;" />
<p style="color:${BRAND_COLORS.gold};margin:0 0 4px 0;font-weight:bold;font-size:14px;">Soul Train's Eatery</p>
<p style="color:rgba(255,255,255,0.6);margin:0;font-size:11px;">Authentic Southern Cooking from the Heart</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

  return { subject, html };
}

serve(handler);