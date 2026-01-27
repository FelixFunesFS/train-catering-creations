// Supabase Edge Function for sending status notifications
// REFACTORED: Uses getEmailContentBlocks() for consistent branding - SINGLE SOURCE OF TRUTH
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import {
  generateStandardEmail,
  getEmailContentBlocks,
  EMAIL_CONFIGS,
  type StandardEmailConfig,
  type EmailType,
} from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';

interface StatusNotificationRequest {
  entityType: 'quote' | 'invoice';
  entityId: string;
  customerEmail: string;
  newStatus: string;
  transition: string;
  entityData: any;
}

/**
 * Maps workflow status to canonical email type
 * This ensures we use the shared template system's content blocks
 */
function mapStatusToEmailType(status: string): { emailType: EmailType; subject: string } | null {
  switch (status) {
    case 'sent':
      return { emailType: 'estimate_ready', subject: 'Your Catering Estimate is Ready' };
    case 'customer_approved':
    case 'approved':
      return { emailType: 'approval_confirmation', subject: 'Thank You for Approving Your Estimate' };
    case 'revised':
      return { emailType: 'estimate_ready', subject: 'Your Updated Estimate is Ready' };
    case 'confirmed':
      return { emailType: 'event_reminder', subject: 'Your Event is Confirmed' };
    case 'paid':
      return { emailType: 'payment_received', subject: 'Payment Received - Thank You!' };
    case 'expired':
      return null; // Handle with fallback
    default:
      return null; // Handle with fallback for edge cases
  }
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

    // Fetch line items and milestones if we have an invoice
    let lineItems: any[] = [];
    let milestones: any[] = [];
    let invoice: any = null;
    
    if (entityType === 'invoice' && entityId) {
      invoice = entityData;
      
      const [itemsResult, milestonesResult] = await Promise.all([
        supabase
          .from('invoice_line_items')
          .select('*')
          .eq('invoice_id', entityId)
          .order('sort_order', { ascending: true }),
        supabase
          .from('payment_milestones')
          .select('*')
          .eq('invoice_id', entityId)
          .order('due_date', { ascending: true })
      ]);
      
      if (itemsResult.data) lineItems = itemsResult.data;
      if (milestonesResult.data) milestones = milestonesResult.data;
    }

    const portalUrl = invoice?.customer_access_token 
      ? `${siteUrl}/estimate?token=${invoice.customer_access_token}`
      : `${siteUrl}/estimate`;

    // Try to map to canonical email type first
    const emailMapping = mapStatusToEmailType(newStatus);
    
    let subject: string;
    let html: string;
    
    if (emailMapping) {
      // Use the shared getEmailContentBlocks() - SINGLE SOURCE OF TRUTH
      const emailConfig = EMAIL_CONFIGS[emailMapping.emailType];
      const customerConfig = emailConfig?.customer;
      
      const { contentBlocks, ctaButton } = getEmailContentBlocks(
        emailMapping.emailType,
        'customer',
        {
          quote,
          invoice,
          lineItems,
          milestones,
          portalUrl,
          isUpdated: newStatus === 'revised'
        }
      );

      const standardConfig: StandardEmailConfig = {
        preheaderText: customerConfig?.preheaderText || `Update on your catering order for ${quote.event_name}`,
        heroSection: customerConfig?.heroSection || { 
          badge: '📋 UPDATE', 
          title: 'Order Update', 
          variant: 'blue' 
        },
        contentBlocks,
        ctaButton: ctaButton || undefined,
        quote,
        invoice,
        lineItems,
      };

      subject = `${emailMapping.subject} - ${quote.event_name || 'Your Event'}`;
      html = generateStandardEmail(standardConfig);
    } else {
      // Fallback for edge cases (expired, cancelled, etc.)
      const { subject: fallbackSubject, html: fallbackHtml } = buildFallbackStatusEmail(
        newStatus, 
        transition, 
        quote, 
        invoice, 
        portalUrl
      );
      subject = fallbackSubject;
      html = fallbackHtml;
    }

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: customerEmail,
        subject,
        html,
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

/**
 * Fallback for edge case statuses that don't map directly to canonical email types
 * (e.g., expired, cancelled, custom transitions)
 */
function buildFallbackStatusEmail(
  status: string,
  transition: string,
  quote: any,
  invoice: any | null,
  portalUrl: string
): { subject: string; html: string } {
  const eventName = quote?.event_name || 'Your Event';
  const contactName = quote?.contact_name || 'Valued Customer';

  let heroConfig: { badge: string; title: string; subtitle?: string; variant: 'crimson' | 'gold' | 'green' | 'blue' | 'orange' };
  let bodyContent: string;
  let subject: string;

  switch (status) {
    case 'expired':
      subject = `Estimate Expired - ${eventName}`;
      heroConfig = { badge: '⏰ EXPIRED', title: 'Estimate Expired', variant: 'orange' };
      bodyContent = `
        <p style="margin:0 0 16px 0;font-size:15px;color:#333;">Dear ${contactName},</p>
        <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
          Your estimate for <strong>${eventName}</strong> has expired. 
          If you're still interested in our catering services, please contact us and we'll be happy to create a new estimate for you.
        </p>
        <p style="margin:16px 0;font-size:15px;color:#333;">
          Call us at <a href="tel:+18439700265" style="color:#DC143C;font-weight:bold;">(843) 970-0265</a> 
          or reply to this email.
        </p>
      `;
      break;

    case 'cancelled':
      subject = `Order Cancelled - ${eventName}`;
      heroConfig = { badge: '❌ CANCELLED', title: 'Order Cancelled', variant: 'crimson' };
      bodyContent = `
        <p style="margin:0 0 16px 0;font-size:15px;color:#333;">Dear ${contactName},</p>
        <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
          Your catering order for <strong>${eventName}</strong> has been cancelled.
        </p>
        <p style="margin:16px 0;font-size:15px;color:#333;">
          If this was a mistake or you'd like to rebook, please contact us at 
          <a href="tel:+18439700265" style="color:#DC143C;font-weight:bold;">(843) 970-0265</a>.
        </p>
      `;
      break;

    default:
      subject = `Status Update - ${eventName}`;
      heroConfig = { badge: '📋 UPDATE', title: 'Order Status Update', variant: 'blue' };
      bodyContent = `
        <p style="margin:0 0 16px 0;font-size:15px;color:#333;">Dear ${contactName},</p>
        <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
          There's been an update to your order for <strong>${eventName}</strong>.
        </p>
        <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
          <strong>New Status:</strong> ${transition || status}
        </p>
        <p style="margin:16px 0;font-size:15px;color:#333;">
          <a href="${portalUrl}" style="color:#DC143C;font-weight:bold;">View your order portal</a> 
          for complete details.
        </p>
      `;
  }

  // Build using generateStandardEmail for consistent branding
  const config: import("../_shared/emailTemplates.ts").StandardEmailConfig = {
    preheaderText: `Update on your catering order: ${transition || status}`,
    heroSection: heroConfig,
    contentBlocks: [
      { type: 'custom_html', data: { html: bodyContent } }
    ],
    quote,
    invoice,
    lineItems: [],
  };

  return {
    subject,
    html: generateStandardEmail(config),
  };
}

serve(handler);
