// Supabase Edge Function for sending status notifications
// REFACTORED: Uses generateStandardEmail() for consistent branding
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import {
  generateStandardEmail,
  EMAIL_CONFIGS,
  type StandardEmailConfig,
  type ContentBlock,
  formatCurrency,
  formatDate,
} from "../_shared/emailTemplates.ts";

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

    console.log(`[Status Notification] Type: ${entityType}, Status: ${newStatus}, Entity: ${entityId}`);

    // Get quote data for context
    const quote = entityType === 'quote' 
      ? entityData 
      : entityData.quote_requests || {};

    // Fetch line items if we have an invoice
    let lineItems: any[] = [];
    let invoice: any = null;
    
    if (entityType === 'invoice' && entityId) {
      invoice = entityData;
      
      const { data: items } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', entityId)
        .order('sort_order', { ascending: true });
      
      if (items) {
        lineItems = items;
      }
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
    const estimateLink = invoice?.customer_access_token 
      ? `${siteUrl}/estimate?token=${invoice.customer_access_token}`
      : `${siteUrl}/estimate`;

    // Build email based on status
    const emailContent = buildStatusEmail(newStatus, transition, quote, invoice, lineItems, estimateLink);

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      }
    });

    if (emailError) {
      console.error("[Status Notification] Email failed:", emailError);
      throw emailError;
    }

    console.log("[Status Notification] Sent successfully to:", customerEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("[Status Notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function buildStatusEmail(
  status: string,
  transition: string,
  quote: any,
  invoice: any | null,
  lineItems: any[],
  estimateLink: string
): { subject: string; html: string } {
  const eventName = quote?.event_name || 'Your Event';
  const contactName = quote?.contact_name || 'Valued Customer';
  const hasLineItems = lineItems && lineItems.length > 0;

  // Determine email type and content based on status
  let emailType: 'estimate_ready' | 'approval_confirmation' | 'payment_received' | 'event_reminder' = 'estimate_ready';
  let contentBlocks: ContentBlock[] = [];
  let ctaButton: { text: string; href: string; variant: 'primary' | 'secondary' } | undefined;
  let subject = '';
  let preheaderText = '';
  let heroConfig = EMAIL_CONFIGS.estimate_ready.customer!.heroSection;

  switch (status) {
    case 'sent':
      emailType = 'estimate_ready';
      subject = `Your Estimate is Ready - ${eventName}`;
      preheaderText = 'Your personalized catering estimate is ready for review';
      heroConfig = EMAIL_CONFIGS.estimate_ready.customer!.heroSection;
      
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Dear ${contactName},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Great news! Your personalized catering estimate for <strong>${eventName}</strong> is ready for your review. 
            We've carefully crafted a menu and service package tailored to your event.
          </p>
        `}},
        { type: 'event_details' },
        ...(hasLineItems ? [{ type: 'menu_with_pricing' as const }] : [{ type: 'menu_summary' as const }]),
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'Review Your Estimate', href: estimateLink, variant: 'primary' };
      break;

    case 'customer_approved':
    case 'approved':
      emailType = 'approval_confirmation';
      subject = `Thank You for Approving - ${eventName}`;
      preheaderText = 'Your catering order has been confirmed!';
      heroConfig = EMAIL_CONFIGS.approval_confirmation.customer!.heroSection;
      
      const totalAmount = invoice?.total_amount || 0;
      
      contentBlocks = [
        { type: 'status_badge', data: { status: 'approved', title: 'Estimate Approved!', description: 'Your catering order has been confirmed. Next step: complete your deposit payment.' }},
        { type: 'text', data: { html: `
          <p style="margin:16px 0;font-size:15px;color:#333;">
            Dear ${contactName},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Thank you for approving your estimate! We're excited to cater your 
            <strong>${eventName}</strong>.
          </p>
          ${totalAmount > 0 ? `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            <strong>Total Amount:</strong> ${formatCurrency(totalAmount)}
          </p>
          ` : ''}
        `}},
        { type: 'event_details' },
        ...(hasLineItems ? [{ type: 'menu_with_pricing' as const }] : [{ type: 'menu_summary' as const }]),
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'View Your Order', href: estimateLink, variant: 'primary' };
      break;

    case 'revised':
      subject = `Updated Estimate Available - ${eventName}`;
      preheaderText = "We've updated your estimate based on your feedback";
      heroConfig = { badge: '📋 REVISED ESTIMATE', title: 'Estimate Updated', subtitle: 'Review your revised catering proposal', variant: 'gold' };
      
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Dear ${contactName},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            We've updated your estimate for <strong>${eventName}</strong> based on your feedback. 
            Please review the revised details and let us know if everything looks good.
          </p>
        `}},
        { type: 'event_details' },
        ...(hasLineItems ? [{ type: 'menu_with_pricing' as const }] : [{ type: 'menu_summary' as const }]),
        { type: 'service_addons' },
      ];
      ctaButton = { text: 'Review Updated Estimate', href: estimateLink, variant: 'primary' };
      break;

    case 'confirmed':
      subject = `Event Confirmed - ${eventName}`;
      preheaderText = 'Your event has been confirmed on our calendar!';
      heroConfig = { badge: '✅ CONFIRMED', title: 'Event Confirmed!', subtitle: "We're excited to serve you", variant: 'green' };
      
      contentBlocks = [
        { type: 'status_badge', data: { status: 'approved', title: 'Event Confirmed!', description: 'Your event is now on our calendar. We can\'t wait to serve you!' }},
        { type: 'text', data: { html: `
          <p style="margin:16px 0;font-size:15px;color:#333;">
            Dear ${contactName},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Fantastic! Your event <strong>${eventName}</strong> has been confirmed on our calendar. 
            We're looking forward to making your event delicious and memorable!
          </p>
        `}},
        { type: 'event_details' },
        { type: 'menu_summary' },
        { type: 'service_addons' },
        { type: 'text', data: { html: `
          <p style="margin:16px 0;font-size:15px;color:#333;">
            We'll be in touch with final details as your event date approaches. If you have any questions, 
            don't hesitate to reach out!
          </p>
        `}},
      ];
      break;

    case 'expired':
      subject = `Estimate Expired - ${eventName}`;
      preheaderText = 'Your catering estimate has expired';
      heroConfig = { badge: '⏰ EXPIRED', title: 'Estimate Expired', subtitle: 'Contact us to get a new quote', variant: 'orange' };
      
      contentBlocks = [
        { type: 'status_badge', data: { status: 'pending', title: 'Estimate Expired', description: 'Your estimate has expired, but we\'d love to work with you!' }},
        { type: 'text', data: { html: `
          <p style="margin:16px 0;font-size:15px;color:#333;">
            Dear ${contactName},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Your estimate for <strong>${eventName}</strong> has expired. 
            If you're still interested in our catering services, please contact us and we'll be happy to create a new estimate for you.
          </p>
        `}},
        { type: 'event_details' },
      ];
      break;

    default:
      subject = `Status Update - ${eventName}`;
      preheaderText = `Status update for your catering order: ${transition}`;
      heroConfig = { badge: '📋 UPDATE', title: 'Status Update', subtitle: transition, variant: 'blue' };
      
      contentBlocks = [
        { type: 'text', data: { html: `
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            Dear ${contactName},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            There's been an update to your order for <strong>${eventName}</strong>.
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
            <strong>New Status:</strong> ${transition}
          </p>
        `}},
        { type: 'event_details' },
        { type: 'menu_summary' },
      ];
      ctaButton = { text: 'View Details', href: estimateLink, variant: 'primary' };
  }

  // Build the email using generateStandardEmail
  const emailConfig: StandardEmailConfig = {
    preheaderText,
    heroSection: heroConfig,
    contentBlocks,
    ctaButton,
    quote,
    invoice,
    lineItems,
  };

  return {
    subject,
    html: generateStandardEmail(emailConfig),
  };
}

serve(handler);
