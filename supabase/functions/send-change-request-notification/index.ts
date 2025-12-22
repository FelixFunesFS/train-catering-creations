import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import { generateStandardEmail, EMAIL_CONFIGS, formatCurrency, BRAND_COLORS } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailNotificationRequest {
  to: string;
  customerName: string;
  eventName: string;
  action: 'approved' | 'rejected' | 'request_more_info';
  adminResponse?: string;
  costChange?: number;
  estimateLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, eventName, action, adminResponse, costChange, estimateLink }: EmailNotificationRequest = await req.json();

    console.log('Sending change request notification:', { to, customerName, eventName, action });

    // Determine status content based on action
    let statusTitle = '';
    let statusDescription = '';
    let statusType: 'approved' | 'rejected' | 'pending' | 'info' = 'info';
    let heroVariant: 'green' | 'crimson' | 'orange' = 'orange';
    let nextStepsHtml = '';

    switch (action) {
      case 'approved':
        statusTitle = 'Request Approved';
        statusDescription = "Great news! We've approved your change request and updated your estimate.";
        statusType = 'approved';
        heroVariant = 'green';
        nextStepsHtml = `
          ${costChange ? `
            <div style="background:#fff3cd;border-left:4px solid ${BRAND_COLORS.gold};padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
              <p style="margin:0;font-size:15px;"><strong>Price adjustment:</strong> ${costChange > 0 ? '+' : ''}${formatCurrency(Math.abs(costChange))}</p>
            </div>
          ` : ''}
          <p style="font-size:15px;margin:16px 0;line-height:1.6;"><strong>View your updated estimate using your permanent portal link.</strong></p>
          <p style="color:#666;font-size:14px;margin:0;">💡 <em>Your estimate link remains the same - no new link needed!</em></p>
        `;
        break;
      case 'rejected':
        statusTitle = 'Unable to Accommodate';
        statusDescription = "Unfortunately, we're unable to accommodate this specific change request at this time.";
        statusType = 'rejected';
        heroVariant = 'crimson';
        nextStepsHtml = `
          ${adminResponse ? `
            <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
              <p style="margin:0 0 8px 0;font-weight:600;font-size:15px;">Reason:</p>
              <p style="margin:0;font-size:15px;color:#4b5563;">${adminResponse}</p>
            </div>
          ` : ''}
          <p style="font-size:15px;margin:16px 0;line-height:1.6;">However, we'd love to discuss alternative options! Please call or email us to explore other possibilities.</p>
        `;
        break;
      case 'request_more_info':
        statusTitle = 'More Information Needed';
        statusDescription = "We need additional details to process your request. Please review our questions below.";
        statusType = 'pending';
        heroVariant = 'orange';
        nextStepsHtml = `
          ${adminResponse ? `
            <div style="background:#fef3c7;border-left:4px solid ${BRAND_COLORS.gold};padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
              <p style="margin:0 0 8px 0;font-weight:600;font-size:15px;">We need to know:</p>
              <p style="margin:0;font-size:15px;color:#4b5563;">${adminResponse}</p>
            </div>
          ` : ''}
        `;
        break;
    }

    const subject = `Change Request ${action === 'approved' ? 'Approved' : action === 'rejected' ? 'Update' : 'Information Needed'} - ${eventName}`;
    const preheaderText = action === 'approved' 
      ? "Your menu change request has been approved! View your updated estimate."
      : action === 'rejected' 
        ? "Update on your menu change request - Let's discuss alternative options"
        : "We need a bit more information to process your menu change request";

    const contactHtml = `
      <div style="margin-top:30px;padding-top:20px;border-top:2px solid #e5e7eb;">
        <p style="margin:0 0 12px 0;color:#1f2937;font-weight:bold;font-size:16px;">Need to discuss this?</p>
        <p style="margin:5px 0;color:#4b5563;font-size:15px;">
          📞 Call us at <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};text-decoration:none;font-weight:bold;">(843) 970-0265</a>
        </p>
        <p style="margin:5px 0;color:#4b5563;font-size:15px;">
          ✉️ Email us at <a href="mailto:soultrainseatery@gmail.com" style="color:${BRAND_COLORS.crimson};text-decoration:none;font-weight:bold;">soultrainseatery@gmail.com</a>
        </p>
      </div>
    `;

    const emailHtml = generateStandardEmail({
      preheaderText,
      heroSection: {
        badge: action === 'approved' ? '✅ APPROVED' : action === 'rejected' ? '📋 UPDATE' : '⚠️ INFO NEEDED',
        title: 'Change Request Update',
        subtitle: eventName,
        variant: heroVariant
      },
      contentBlocks: [
        { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Hello ${customerName},</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We've reviewed your change request for <strong>${eventName}</strong>.</p>` }},
        { type: 'status_badge', data: { status: statusType, title: statusTitle, description: statusDescription }},
        { type: 'custom_html', data: { html: nextStepsHtml }},
        { type: 'custom_html', data: { html: contactHtml }}
      ],
      ctaButton: action === 'approved' && estimateLink ? { text: 'View Updated Estimate', href: estimateLink, variant: 'primary' } : undefined
    });

    const { error } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to,
        subject,
        html: emailHtml
      }
    });

    if (error) {
      console.error('Failed to send email notification:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Email notification sent successfully to:', to);
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in send-change-request-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
