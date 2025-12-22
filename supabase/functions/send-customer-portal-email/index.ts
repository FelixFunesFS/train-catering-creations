/**
 * SYNC: Customer Portal Emails (Estimate Ready & Approval Confirmation)
 * 
 * This edge function sends customer-facing emails for estimates and approvals.
 * Uses generateStandardEmail for consistent branding.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  generateStandardEmail,
  EMAIL_CONFIGS,
  generateEventDetailsCard, 
  generateServiceAddonsSection,
  generateTrackingPixel,
  formatCurrency,
  formatDate,
  BRAND_COLORS
} from '../_shared/emailTemplates.ts';
import { generateTermsSummaryHTML } from '../_shared/termsAndConditions.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalEmailRequest {
  quote_request_id: string;
  type: 'welcome' | 'estimate_ready' | 'payment_reminder' | 'payment_confirmation' | 'approval_confirmation';
  preview_only?: boolean;
  override_email?: string;
  metadata?: {
    amount?: number;
    payment_type?: string;
    is_full_payment?: boolean;
    first_milestone_amount?: number;
    first_milestone_due?: string;
    milestones?: any[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_request_id, type, preview_only = false, override_email, metadata }: PortalEmailRequest = await req.json();

    if (!quote_request_id || !type) {
      throw new Error('Missing required fields: quote_request_id, type');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch quote request details
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote_request_id)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote request not found: ${quote_request_id}`);
    }

    // Fetch invoice with line items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        customer_access_token,
        invoice_number,
        total_amount,
        subtotal,
        tax_amount,
        version,
        invoice_line_items (
          id,
          title,
          description,
          quantity,
          unit_price,
          total_price,
          category,
          sort_order,
          created_at
        )
      `)
      .eq('quote_request_id', quote_request_id)
      .single();
    
    // Sort line items
    if (invoice?.invoice_line_items) {
      invoice.invoice_line_items.sort((a: any, b: any) => {
        const sortOrderA = a.sort_order ?? 999999;
        const sortOrderB = b.sort_order ?? 999999;
        if (sortOrderA !== sortOrderB) return sortOrderA - sortOrderB;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    }

    if (invoiceError || !invoice?.customer_access_token) {
      throw new Error('Invoice or access token not found for this quote request');
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
    const portalUrl = `${siteUrl}/estimate?token=${invoice.customer_access_token}`;
    const lineItems = invoice.invoice_line_items || [];
    
    console.log(`Generated portal URL: ${portalUrl}`);

    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'welcome':
        subject = `Welcome to Soul Train's Eatery - Access Your Event Details`;
        htmlContent = generateWelcomeEmail(quote, portalUrl);
        break;
        
      case 'estimate_ready':
        subject = `Your Catering Estimate is Ready - ${quote.event_name}`;
        htmlContent = generateEstimateReadyEmail(quote, invoice, lineItems, portalUrl);
        break;
        
      case 'payment_reminder':
        subject = `Payment Reminder - ${quote.event_name}`;
        htmlContent = generatePaymentReminderEmail(quote, portalUrl);
        break;
        
      case 'payment_confirmation': {
        const { amount, is_full_payment } = metadata || {};
        subject = is_full_payment
          ? `🎉 Payment Confirmed - Your Event is Secured!`
          : `💰 Deposit Received - ${quote.event_name}`;
        htmlContent = generatePaymentConfirmationEmail(quote, invoice, amount || 0, is_full_payment || false, portalUrl);
        break;
      }
      
      case 'approval_confirmation': {
        const { data: milestones } = await supabase
          .from('payment_milestones')
          .select('*')
          .eq('invoice_id', invoice.id)
          .order('due_date', { ascending: true });
        
        subject = `✅ Estimate Approved - Next Steps for ${quote.event_name}`;
        htmlContent = generateApprovalConfirmationEmail(quote, invoice, lineItems, portalUrl, milestones || []);
        break;
      }
        
      default:
        throw new Error(`Invalid email type: ${type}`);
    }

    if (preview_only) {
      console.log('Returning email preview HTML');
      return new Response(JSON.stringify({ 
        success: true,
        html: htmlContent,
        subject,
        email: quote.email
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const recipientEmail = override_email || quote.email;
    console.log(`Sending email to: ${recipientEmail}${override_email ? ' (override)' : ''}`);

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: { to: recipientEmail, subject, html: htmlContent }
    });

    if (emailError) throw emailError;

    console.log(`Customer portal email sent successfully to ${recipientEmail}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `${type} email sent successfully`,
      email: quote.email,
      accessToken: invoice.customer_access_token
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-customer-portal-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

// ============================================================================
// EMAIL GENERATORS - Using generateStandardEmail for consistency
// ============================================================================

function generateWelcomeEmail(quote: any, portalUrl: string): string {
  const whatNextHtml = `
    <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">🎯 What Happens Next?</h3>
    <ol style="line-height:1.8;margin:0;padding-left:20px;">
      <li><strong>Review Period:</strong> Our family is carefully reviewing your requirements</li>
      <li><strong>Custom Estimate:</strong> We'll prepare a detailed estimate within 24 hours</li>
      <li><strong>Approval:</strong> Review and approve your estimate through the portal</li>
      <li><strong>Payment:</strong> Secure online payment to confirm your booking</li>
      <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
    </ol>
  `;

  const secureAccessHtml = `
    <div style="background:${BRAND_COLORS.lightGray};padding:15px;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:20px 0;">
      <strong>🔒 Secure Access:</strong> Your personal link is valid for one year and can be used anytime to check your event status.
    </div>
  `;

  return generateStandardEmail({
    preheaderText: EMAIL_CONFIGS.quote_confirmation.customer!.preheaderText,
    heroSection: EMAIL_CONFIGS.quote_confirmation.customer!.heroSection,
    contentBlocks: [
      { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Welcome, ${quote.contact_name}!</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Thank you for choosing Soul Train's Eatery for your upcoming event. We're thrilled to be part of your special occasion!</p>` }},
      { type: 'event_details' },
      { type: 'service_addons' },
      { type: 'custom_html', data: { html: secureAccessHtml }},
      { type: 'custom_html', data: { html: whatNextHtml }},
      { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">Questions? Call us at <strong>(843) 970-0265</strong> or reply to this email. We're here to help!</p>` }}
    ],
    ctaButton: { text: 'Access Your Event Portal', href: portalUrl, variant: 'primary' },
    quote: quote
  });
}

function generateEstimateReadyEmail(quote: any, invoice: any, lineItems: any[], portalUrl: string): string {
  const isUpdated = (invoice.version || 1) > 1;
  const approveUrl = `${portalUrl}&action=approve`;
  const changesUrl = `${portalUrl}&action=changes`;

  const updateBannerHtml = isUpdated ? `
    <div style="background:#fff3cd;border:1px solid ${BRAND_COLORS.gold};padding:15px;border-radius:8px;margin-bottom:20px;">
      <strong>📝 Updated Estimate (Version ${invoice.version})</strong>
      <p style="margin:5px 0 0 0;">We've revised your estimate based on your feedback.</p>
    </div>
  ` : '';

  const actionRequiredHtml = `
    <div style="background:#fff3cd;border:1px solid ${BRAND_COLORS.gold};padding:20px;border-radius:8px;margin:20px 0;">
      <h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.crimson};">⏰ Action Required</h3>
      <p style="margin:0;">Please review and approve your estimate to secure your event date. Our calendar fills up quickly, especially during peak season!</p>
    </div>
  `;

  const termsRefHtml = `
    <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:16px;margin:20px 0;">
      <h4 style="color:${BRAND_COLORS.crimson};margin:0 0 10px 0;">📋 Terms & Conditions</h4>
      <p style="margin:0 0 10px 0;font-size:14px;color:#666;">By approving this estimate, you agree to our catering terms including payment schedule and cancellation policy.</p>
      <p style="margin:0;font-size:13px;"><a href="${portalUrl}" style="color:${BRAND_COLORS.crimson};">View full Terms & Conditions in your portal →</a></p>
    </div>
  `;

  const nextStepsHtml = `
    <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">📋 Once You Approve:</h3>
    <ul style="line-height:1.8;margin:0;padding-left:20px;">
      <li>🔒 Secure your date with online payment</li>
      <li>📞 Schedule a final planning call with our team</li>
      <li>📧 Communicate directly through your portal</li>
      <li>📅 Receive event reminders and updates</li>
    </ul>
  `;

  const buttonsHtml = `
    <div style="text-align:center;margin:30px 0;">
      <a href="${approveUrl}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});color:white;padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:4px;">✅ Review & Approve</a>
      <a href="${changesUrl}" style="display:inline-block;background:${BRAND_COLORS.gold};color:${BRAND_COLORS.darkGray};padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:4px;">✏️ Request Changes</a>
    </div>
    <p style="text-align:center;color:#666;font-size:14px;margin:0;">
      <a href="${portalUrl}" style="color:${BRAND_COLORS.crimson};">Or click here to view full details first</a>
    </p>
  `;

  return generateStandardEmail({
    preheaderText: EMAIL_CONFIGS.estimate_ready.customer!.preheaderText,
    heroSection: {
      ...EMAIL_CONFIGS.estimate_ready.customer!.heroSection,
      subtitle: isUpdated ? 'Updated Estimate Ready' : 'Review your custom catering proposal'
    },
    contentBlocks: [
      { type: 'custom_html', data: { html: updateBannerHtml }},
      { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">${isUpdated ? 'Updated' : 'Great news'}, ${quote.contact_name}!</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We've ${isUpdated ? 'updated your' : 'prepared a custom'} estimate for <strong>${quote.event_name}</strong>.</p>` }},
      { type: 'event_details' },
      { type: 'service_addons' },
      { type: 'menu_with_pricing' },
      { type: 'custom_html', data: { html: termsRefHtml }},
      { type: 'custom_html', data: { html: actionRequiredHtml }},
      { type: 'custom_html', data: { html: buttonsHtml }},
      { type: 'custom_html', data: { html: nextStepsHtml }},
      { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">Questions? Call us at <strong>(843) 970-0265</strong> or reply to this email!</p>` }}
    ],
    quote: quote,
    invoice: invoice,
    lineItems: lineItems
  }) + generateTrackingPixel(invoice.id, 'estimate_ready');
}

function generatePaymentReminderEmail(quote: any, portalUrl: string): string {
  const paymentOptionsHtml = `
    <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">💳 Easy, Secure Payment Options:</h3>
    <ul style="line-height:1.8;margin:0;padding-left:20px;">
      <li>💳 Credit/Debit Cards</li>
      <li>🏦 Bank Transfer</li>
      <li>📱 Digital Wallets (Apple Pay, Google Pay)</li>
    </ul>
  `;

  return generateStandardEmail({
    preheaderText: EMAIL_CONFIGS.payment_reminder.customer!.preheaderText,
    heroSection: EMAIL_CONFIGS.payment_reminder.customer!.heroSection,
    contentBlocks: [
      { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Hi ${quote.contact_name},</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We hope you're as excited as we are about catering <strong>${quote.event_name}</strong>!</p>` }},
      { type: 'text', data: { html: `
        <div style="background:#fff3cd;border-left:4px solid ${BRAND_COLORS.gold};padding:20px;margin:20px 0;border-radius:8px;">
          <h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.crimson};">🔒 Secure Your Event Date</h3>
          <p style="margin:0;">Your approved estimate is waiting for payment to confirm your booking. Don't risk losing your date - our calendar fills up fast!</p>
        </div>
      ` }},
      { type: 'custom_html', data: { html: paymentOptionsHtml }},
      { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;"><strong>Need to make changes?</strong> No problem! Contact us before completing payment if you need to adjust anything.</p>` }}
    ],
    ctaButton: { text: 'Complete Payment Now', href: portalUrl, variant: 'primary' },
    quote: quote
  });
}

function generatePaymentConfirmationEmail(quote: any, invoice: any, amount: number, isFullPayment: boolean, portalUrl: string): string {
  const daysUntilEvent = Math.ceil((new Date(quote.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const paymentStatusHtml = isFullPayment ? `
    <div style="background:linear-gradient(135deg,${BRAND_COLORS.gold}30,${BRAND_COLORS.gold}50);padding:25px;border-radius:12px;margin:20px 0;text-align:center;border:2px solid ${BRAND_COLORS.gold};">
      <h3 style="color:${BRAND_COLORS.crimson};margin:0 0 10px 0;font-size:24px;">✅ Your Event is Fully Confirmed!</h3>
      <p style="margin:0;font-size:18px;font-weight:bold;">We've received your full payment of ${formatCurrency(amount)}</p>
    </div>
  ` : `
    <div style="background:${BRAND_COLORS.lightGray};padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid ${BRAND_COLORS.gold};">
      <h3 style="color:${BRAND_COLORS.crimson};margin:0 0 10px 0;">💰 Deposit Received</h3>
      <p style="margin:0;font-size:16px;">We've received your deposit of ${formatCurrency(amount)}</p>
      <p style="margin:10px 0 0 0;color:#666;">Remaining balance: ${formatCurrency((invoice.total_amount || 0) - amount)}</p>
    </div>
  `;

  const nextStepsHtml = `
    <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">📅 What Happens Next?</h3>
    <div style="background:${BRAND_COLORS.lightGray};padding:20px;border-radius:8px;margin:20px 0;">
      ${!isFullPayment ? `
        <div style="border-bottom:1px solid #dee2e6;padding:12px 0;display:flex;align-items:flex-start;">
          <span style="font-size:24px;margin-right:12px;">💳</span>
          <div>
            <strong style="color:${BRAND_COLORS.crimson};">Final Payment Due</strong>
            <p style="margin:5px 0 0 0;color:#666;">Remaining balance due 7 days before your event</p>
          </div>
        </div>
      ` : ''}
      ${daysUntilEvent > 7 ? `
        <div style="border-bottom:1px solid #dee2e6;padding:12px 0;display:flex;align-items:flex-start;">
          <span style="font-size:24px;margin-right:12px;">📞</span>
          <div>
            <strong style="color:${BRAND_COLORS.crimson};">Final Planning Call</strong>
            <p style="margin:5px 0 0 0;color:#666;">We'll contact you 2 weeks before your event to confirm final details</p>
          </div>
        </div>
      ` : ''}
      <div style="padding:12px 0;display:flex;align-items:flex-start;">
        <span style="font-size:24px;margin-right:12px;">🎉</span>
        <div>
          <strong style="color:${BRAND_COLORS.crimson};">Event Day!</strong>
          <p style="margin:5px 0 0 0;color:#666;">We arrive early to set up and ensure everything is perfect!</p>
        </div>
      </div>
    </div>
  `;

  return generateStandardEmail({
    preheaderText: EMAIL_CONFIGS.payment_received.customer!.preheaderText,
    heroSection: EMAIL_CONFIGS.payment_received.customer!.heroSection,
    contentBlocks: [
      { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Thank you, ${quote.contact_name}!</p>` }},
      { type: 'custom_html', data: { html: paymentStatusHtml }},
      { type: 'event_details' },
      { type: 'custom_html', data: { html: nextStepsHtml }},
      { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">Need to make changes? Reply to this email or call <strong>(843) 970-0265</strong>.</p>` }}
    ],
    ctaButton: { text: 'View My Event Portal', href: portalUrl, variant: 'primary' },
    quote: quote
  });
}

function generateApprovalConfirmationEmail(quote: any, invoice: any, lineItems: any[], portalUrl: string, milestones: any[]): string {
  const total = invoice.total_amount || 0;
  const firstMilestone = milestones[0];
  const firstPaymentDisplay = firstMilestone 
    ? formatCurrency(firstMilestone.amount_cents)
    : formatCurrency(Math.round(total * 0.5));

  const getMilestoneLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'booking_deposit': 'Booking Deposit',
      'deposit': 'Deposit',
      'mid_payment': 'Milestone Payment',
      'final_payment': 'Final Balance',
      'full_payment': 'Full Payment'
    };
    return labels[type] || type.replace('_', ' ');
  };

  const paymentBoxHtml = `
    <div style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});padding:20px;border-radius:8px;margin:20px 0;color:white;">
      <h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.gold};">💳 Next Step: Secure Your Date</h3>
      <p style="margin:0 0 10px 0;">To confirm your booking, complete your first payment:</p>
      <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:8px;margin-top:10px;">
        <div style="font-size:24px;font-weight:bold;color:${BRAND_COLORS.gold};">${firstPaymentDisplay}</div>
        <div style="font-size:14px;opacity:0.9;">${firstMilestone?.is_due_now ? 'Due Now' : 'Due upon approval'}</div>
      </div>
    </div>
  `;

  const paymentScheduleHtml = milestones.length > 0 ? `
    <div style="margin:25px 0;">
      <h3 style="color:${BRAND_COLORS.crimson};margin-bottom:15px;">📅 Your Payment Schedule</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:${BRAND_COLORS.lightGray};">
            <th style="padding:12px 10px;text-align:left;border-bottom:2px solid ${BRAND_COLORS.gold};">Payment</th>
            <th style="padding:12px 10px;text-align:left;border-bottom:2px solid ${BRAND_COLORS.gold};">Due Date</th>
            <th style="padding:12px 10px;text-align:right;border-bottom:2px solid ${BRAND_COLORS.gold};">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${milestones.map((m, i) => `
            <tr style="background:${i === 0 ? '#fff3cd' : (i % 2 === 0 ? '#fafafa' : '#ffffff')};">
              <td style="padding:12px 10px;border-bottom:1px solid #e5e5e5;">
                ${getMilestoneLabel(m.milestone_type)}
                ${i === 0 ? '<span style="color:#d97706;font-weight:bold;margin-left:8px;">← Pay Now</span>' : ''}
              </td>
              <td style="padding:12px 10px;border-bottom:1px solid #e5e5e5;">
                ${m.is_due_now ? '<strong style="color:#d97706;">Due Now</strong>' : formatDate(m.due_date)}
              </td>
              <td style="padding:12px 10px;text-align:right;border-bottom:1px solid #e5e5e5;font-weight:${i === 0 ? 'bold' : 'normal'};">
                ${formatCurrency(m.amount_cents)} (${m.percentage}%)
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background:${BRAND_COLORS.lightGray};">
            <td colspan="2" style="padding:12px 10px;font-weight:bold;border-top:2px solid ${BRAND_COLORS.gold};">Total</td>
            <td style="padding:12px 10px;text-align:right;font-weight:bold;border-top:2px solid ${BRAND_COLORS.gold};color:${BRAND_COLORS.crimson};">${formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  ` : '';

  const nextStepsHtml = `
    <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">📋 What Happens Next:</h3>
    <ol style="line-height:1.8;margin:0;padding-left:20px;">
      <li><strong>Complete Payment:</strong> Click the button above to pay securely online</li>
      <li><strong>Booking Confirmed:</strong> Once payment is received, your date is locked in</li>
      <li><strong>Planning Call:</strong> We'll schedule a call to finalize all the details</li>
      <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
    </ol>
  `;

  return generateStandardEmail({
    preheaderText: EMAIL_CONFIGS.approval_confirmation.customer!.preheaderText,
    heroSection: EMAIL_CONFIGS.approval_confirmation.customer!.heroSection,
    contentBlocks: [
      { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Great news, ${quote.contact_name}!</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">You've approved your catering estimate for <strong>${quote.event_name}</strong>. We're excited to be part of your special event!</p>` }},
      { type: 'event_details' },
      { type: 'service_addons' },
      { type: 'custom_html', data: { html: paymentBoxHtml }},
      { type: 'custom_html', data: { html: paymentScheduleHtml }},
      { type: 'custom_html', data: { html: nextStepsHtml }},
      { type: 'terms' },
      { type: 'text', data: { html: `
        <div style="background:${BRAND_COLORS.lightGray};padding:15px;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:20px 0;">
          <strong>💡 Tip:</strong> You can always access your event portal to view your estimate, make payments, or contact us using the link in this email.
        </div>
        <p style="font-size:15px;margin:20px 0 0 0;">Questions? Call us at <strong>(843) 970-0265</strong> or reply to this email!</p>
      ` }}
    ],
    ctaButton: { text: 'Make Payment Now', href: portalUrl, variant: 'primary' },
    quote: quote,
    invoice: invoice,
    lineItems: lineItems
  });
}

serve(handler);
