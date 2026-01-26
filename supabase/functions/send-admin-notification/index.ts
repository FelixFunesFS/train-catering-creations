// Supabase Edge Function for sending admin notifications
// REFACTORED: Uses generateStandardEmail() for consistent branding
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import {
  generateStandardEmail,
  EMAIL_CONFIGS,
  type StandardEmailConfig,
  type ContentBlock,
  type HeroConfig,
  formatCurrency,
} from '../_shared/emailTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminNotificationRequest {
  invoiceId: string;
  notificationType: 'customer_approval' | 'change_request' | 'payment_received' | 'payment_failed';
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, notificationType, metadata = {} }: AdminNotificationRequest = await req.json();

    console.log(`[Admin Notification] Type: ${notificationType}, Invoice: ${invoiceId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice with quote data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`*,quote_requests!invoices_quote_request_id_fkey(*)`)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    const quote = invoice.quote_requests as any;

    // Fetch line items for menu context
    const { data: lineItems } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true });

    const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';

    // Build email based on notification type
    const emailContent = buildAdminNotificationEmail(
      notificationType,
      quote,
      invoice,
      lineItems || [],
      metadata,
      siteUrl
    );

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: 'soultrainseatery@gmail.com',
        subject: emailContent.subject,
        html: emailContent.html,
      }
    });

    if (emailError) {
      console.error('[Admin Notification] Email failed:', emailError);
      throw emailError;
    }

    console.log(`[Admin Notification] Sent successfully: ${notificationType}`);

    return new Response(
      JSON.stringify({ success: true, notificationType }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Admin Notification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

function buildAdminNotificationEmail(
  notificationType: string,
  quote: any,
  invoice: any,
  lineItems: any[],
  metadata: Record<string, any>,
  siteUrl: string
): { subject: string; html: string } {
  const eventName = quote?.event_name || 'Event';
  const contactName = quote?.contact_name || 'Customer';
  const hasLineItems = lineItems && lineItems.length > 0;

  let subject = '';
  let preheaderText = '';
  let heroConfig: HeroConfig;
  let contentBlocks: ContentBlock[] = [];
  let ctaButton: { text: string; href: string; variant: 'primary' | 'secondary' } | undefined;

  switch (notificationType) {
    case 'customer_approval':
      subject = `✅ Customer Approved: ${eventName}`;
      preheaderText = `${contactName} has approved their estimate`;
      heroConfig = {
        badge: '✅ CUSTOMER APPROVED',
        title: 'Estimate Approved!',
        subtitle: `${contactName} has approved their catering order`,
        variant: 'green'
      };

      contentBlocks = [
        { type: 'status_badge', data: { 
          status: 'approved', 
          title: 'Customer Approved Estimate', 
          description: `${contactName} has approved their estimate for ${eventName}. Total: ${formatCurrency(invoice.total_amount || 0)}` 
        }},
        { type: 'customer_contact' },
        { type: 'event_details' },
        ...(hasLineItems ? [{ type: 'menu_with_pricing' as const }] : [{ type: 'menu_summary' as const }]),
        { type: 'service_addons' },
      ];

      if (metadata.feedback) {
        contentBlocks.push({
          type: 'text',
          data: { html: `
            <div style="margin:16px 0;padding:16px;background:#f0fdf4;border-left:4px solid #22c55e;border-radius:4px;">
              <strong style="color:#166534;">Customer Feedback:</strong>
              <p style="margin:8px 0 0 0;color:#333;">${metadata.feedback}</p>
            </div>
          `}
        });
      }

      ctaButton = { text: 'View in Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      break;

    case 'change_request':
      subject = `📝 Change Request: ${eventName}`;
      preheaderText = `${contactName} has requested changes to their order`;
      heroConfig = {
        badge: '📝 CHANGE REQUEST',
        title: 'Change Request Received',
        subtitle: `${contactName} has requested changes`,
        variant: 'orange'
      };

      contentBlocks = [
        { type: 'status_badge', data: { 
          status: 'pending', 
          title: 'Change Request Submitted', 
          description: `${contactName} has requested modifications to their order` 
        }},
        { type: 'customer_contact' },
        { type: 'event_details' },
        { type: 'text', data: { html: `
          <div style="margin:16px 0;padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;">
            <strong style="color:#92400e;">Requested Changes:</strong>
            <p style="margin:8px 0 0 0;color:#333;">${metadata.changes || 'See admin dashboard for details'}</p>
            ${metadata.urgency === 'high' ? '<p style="margin:8px 0 0 0;color:#dc2626;font-weight:bold;">⚠️ HIGH PRIORITY</p>' : ''}
          </div>
        `}},
        { type: 'menu_summary' },
        { type: 'service_addons' },
      ];

      ctaButton = { text: 'Review Change Request', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      break;

    case 'payment_received':
      const paymentAmount = metadata.amount || 0;
      const isFullPayment = metadata.full_payment || false;
      const paymentType = metadata.payment_type === 'full' ? 'Full Payment' : '50% Deposit';

      subject = `💰 Payment Received: ${eventName}`;
      preheaderText = `${formatCurrency(paymentAmount)} received from ${contactName}`;
      heroConfig = {
        badge: '💰 PAYMENT RECEIVED',
        title: isFullPayment ? 'Paid in Full!' : 'Payment Received',
        subtitle: `${formatCurrency(paymentAmount)} - ${paymentType}`,
        variant: 'green'
      };

      contentBlocks = [
        { type: 'status_badge', data: { 
          status: 'approved', 
          title: isFullPayment ? 'Paid in Full!' : 'Payment Received', 
          description: `${contactName} has made a ${paymentType.toLowerCase()} of ${formatCurrency(paymentAmount)}` 
        }},
        { type: 'customer_contact' },
        { type: 'event_details' },
        { type: 'text', data: { html: `
          <div style="margin:16px 0;padding:16px;background:#d1fae5;border-left:4px solid #22c55e;border-radius:4px;">
            <strong style="color:#166534;">Payment Details:</strong>
            <p style="margin:8px 0 4px 0;color:#333;"><strong>Amount:</strong> ${formatCurrency(paymentAmount)}</p>
            <p style="margin:4px 0;color:#333;"><strong>Type:</strong> ${paymentType}</p>
            <p style="margin:4px 0;color:#333;"><strong>Invoice:</strong> ${invoice.invoice_number || 'N/A'}</p>
            <p style="margin:4px 0;color:#333;"><strong>Total Invoice:</strong> ${formatCurrency(invoice.total_amount || 0)}</p>
            ${isFullPayment ? '<p style="margin:8px 0 0 0;color:#22c55e;font-weight:bold;">✅ PAID IN FULL</p>' : ''}
          </div>
        `}},
        ...(hasLineItems ? [{ type: 'menu_with_pricing' as const }] : [{ type: 'menu_summary' as const }]),
      ];

      ctaButton = { text: 'View Payment Details', href: `${siteUrl}/admin?view=billing`, variant: 'primary' };
      break;

    case 'payment_failed':
      subject = `❌ Payment Failed: ${eventName}`;
      preheaderText = `Payment attempt failed for ${contactName}`;
      heroConfig = {
        badge: '❌ PAYMENT FAILED',
        title: 'Payment Failed',
        subtitle: 'Customer payment attempt was unsuccessful',
        variant: 'crimson'
      };

      contentBlocks = [
        { type: 'status_badge', data: { 
          status: 'rejected', 
          title: 'Payment Failed', 
          description: `Payment attempt by ${contactName} was unsuccessful` 
        }},
        { type: 'customer_contact' },
        { type: 'event_details' },
        { type: 'text', data: { html: `
          <div style="margin:16px 0;padding:16px;background:#fee2e2;border-left:4px solid #dc2626;border-radius:4px;">
            <strong style="color:#991b1b;">Failure Details:</strong>
            <p style="margin:8px 0 0 0;color:#333;"><strong>Reason:</strong> ${metadata.error || 'Unknown error'}</p>
            <p style="margin:8px 0 0 0;color:#666;font-style:italic;">You may need to follow up with the customer.</p>
          </div>
        `}},
        { type: 'menu_summary' },
      ];

      ctaButton = { text: 'View in Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
      break;

    default:
      subject = `🔔 Notification: ${eventName}`;
      preheaderText = `Admin notification for ${eventName}`;
      heroConfig = EMAIL_CONFIGS.admin_notification.admin!.heroSection;

      contentBlocks = [
        { type: 'customer_contact' },
        { type: 'event_details' },
        { type: 'menu_summary' },
      ];

      ctaButton = { text: 'View in Dashboard', href: `${siteUrl}/admin?view=events`, variant: 'primary' };
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
