/**
 * SYNC: Customer Portal Emails (Estimate Ready & Approval Confirmation)
 * 
 * This edge function sends customer-facing emails for estimates and approvals.
 * Keep in sync with:
 * - src/components/customer/CustomerEstimateView.tsx (portal display)
 * - supabase/functions/generate-invoice-pdf/index.ts (PDF generation)
 * - supabase/functions/_shared/emailTemplates.ts (shared email components)
 * 
 * See CUSTOMER_DISPLAY_CHECKLIST.md for full sync requirements.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  EMAIL_STYLES, 
  generateEmailHeader, 
  generateEventDetailsCard, 
  generateMenuSection,
  generateLineItemsTable,
  generateFooter,
  generateTrackingPixel,
  BRAND_COLORS
} from '../_shared/emailTemplates.ts';
import { generatePaymentConfirmationEmailWithNextSteps, generateEventReminderEmail } from './paymentConfirmationTemplate.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalEmailRequest {
  quote_request_id: string;
  type: 'welcome' | 'estimate_ready' | 'payment_reminder' | 'payment_confirmation' | 'approval_confirmation';
  preview_only?: boolean;
  override_email?: string;  // Send to different recipient than quote.email
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
  // Handle CORS preflight requests
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

    // Fetch invoice with line items to get customer access token and pricing details
    // Order line items by sort_order to match admin/portal display
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
    
    // Sort line items by sort_order, then created_at for consistent ordering
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

    // Create portal URL using token-based system
    const siteUrl = Deno.env.get('SITE_URL') || 'https://c4c8d2d1-63da-4772-a95b-bf211f87a132.lovableproject.com';
    const portalUrl = `${siteUrl}/estimate?token=${invoice.customer_access_token}`;
    
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
        htmlContent = generateEstimateReadyEmail(quote, invoice, portalUrl, invoice.id);
        break;
        
      case 'payment_reminder':
        subject = `Payment Reminder - ${quote.event_name}`;
        htmlContent = generatePaymentReminderEmail(quote, portalUrl);
        break;
        
      case 'payment_confirmation': {
        const { amount, payment_type, is_full_payment } = metadata || {};
        subject = is_full_payment
          ? `🎉 Payment Confirmed - Your Event is Secured!`
          : `💰 Deposit Received - ${quote.event_name}`;
        htmlContent = generatePaymentConfirmationEmailWithNextSteps(quote, invoice, amount || 0, is_full_payment || false, portalUrl);
        break;
      }
      
      case 'approval_confirmation': {
        // Fetch milestones for this invoice to include full payment schedule
        const { data: milestones } = await supabase
          .from('payment_milestones')
          .select('*')
          .eq('invoice_id', invoice.id)
          .order('due_date', { ascending: true });
        
        subject = `✅ Estimate Approved - Next Steps for ${quote.event_name}`;
        htmlContent = generateApprovalConfirmationEmail(quote, invoice, portalUrl, milestones || []);
        break;
      }
        
      default:
        throw new Error(`Invalid email type: ${type}`);
    }

    // If preview_only, return the HTML without sending
    if (preview_only) {
      console.log('Returning email preview HTML');
      return new Response(JSON.stringify({ 
        success: true,
        html: htmlContent,
        subject,
        email: quote.email
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Determine recipient - use override if provided, otherwise use quote email
    const recipientEmail = override_email || quote.email;
    console.log(`Sending email to: ${recipientEmail}${override_email ? ' (override)' : ''}`);

    // Send email via the gmail email function
    const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: recipientEmail,
        subject,
        html: htmlContent
      }
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
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-customer-portal-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function generateWelcomeEmail(quote: any, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Soul Train's Eatery</title>
      <style>${EMAIL_STYLES}</style>
    </head>
    <body>
      <div class="email-container">
        <div style="background: linear-gradient(135deg, #3B82F6, #2563EB); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
            <span style="color: white; font-weight: bold; font-size: 14px;">📋 QUOTE RECEIVED</span>
          </div>
          <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;">Welcome to Soul Train's Eatery!</h2>
          <p style="color: white; margin: 0; font-size: 16px; opacity: 0.95;">
            Hi ${quote.contact_name},<br>
            We're excited to cater your event!
          </p>
        </div>
        
        <div class="content">
          <h2 style="color: ${BRAND_COLORS.crimson};">Welcome, ${quote.contact_name}!</h2>
          
          <p>Thank you for choosing Soul Train's Eatery for your upcoming event. We're thrilled to be part of your special occasion and can't wait to serve you our authentic Southern cuisine!</p>
          
          ${generateEventDetailsCard(quote)}
          
          <h3 style="color: ${BRAND_COLORS.crimson};">📱 Access Your Personal Event Portal</h3>
          <p>We've created a personalized portal where you can track your event planning progress, view estimates, make payments, and communicate with our team.</p>
          
          <div style="background: ${BRAND_COLORS.lightGray}; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLORS.gold}; margin: 20px 0;">
            <strong>Secure Access:</strong> Click the button below to access your portal. Your personal link is valid for one year and can be used anytime to check your event status.
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" class="btn btn-primary">Access Your Event Portal</a>
          </div>
          
          <h3 style="color: ${BRAND_COLORS.crimson};">🎯 What Happens Next?</h3>
          <ol style="line-height: 1.8;">
            <li><strong>Review Period:</strong> Our family is carefully reviewing your requirements</li>
            <li><strong>Custom Estimate:</strong> We'll prepare a detailed estimate within 24 hours</li>
            <li><strong>Approval:</strong> Review and approve your estimate through the portal</li>
            <li><strong>Payment:</strong> Secure online payment to confirm your booking</li>
            <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
          </ol>
          
          <p>If you have any questions or need to make changes, simply reply to this email or call us at <span class="highlight">(843) 970-0265</span>.</p>
          
          <p>We're here to make your event absolutely delicious!</p>
          
          <p>Warm regards,<br>
          <strong>The Soul Train's Eatery Family</strong><br>
          <em>Bringing people together around exceptional food</em></p>
        </div>
        
        ${generateFooter()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates a payment schedule preview based on days until event and customer type
 */
function generatePaymentSchedulePreview(quote: any, totalAmountCents: number): string {
  const eventDate = new Date(quote.event_date);
  const now = new Date();
  const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const isGovernment = quote.compliance_level === 'government' || quote.requires_po_number;
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  // Determine tier and generate schedule rows
  let tierLabel = '';
  let scheduleRows = '';
  
  if (isGovernment) {
    tierLabel = 'Government (Net 30)';
    scheduleRows = `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Full Payment</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">100%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(totalAmountCents)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">Net 30 after event</td>
      </tr>
    `;
  } else if (daysUntilEvent <= 14) {
    tierLabel = 'Rush Event';
    scheduleRows = `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Full Payment</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">100%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(totalAmountCents)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">Due upon approval</td>
      </tr>
    `;
  } else if (daysUntilEvent <= 30) {
    tierLabel = 'Short Notice';
    const deposit = Math.round(totalAmountCents * 0.6);
    const final = totalAmountCents - deposit;
    scheduleRows = `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Deposit</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">60%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(deposit)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">Due upon approval</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Final Balance</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">40%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(final)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">7 days before event</td>
      </tr>
    `;
  } else if (daysUntilEvent <= 44) {
    tierLabel = 'Mid-Range';
    const deposit = Math.round(totalAmountCents * 0.6);
    const final = totalAmountCents - deposit;
    scheduleRows = `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Deposit</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">60%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(deposit)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">Due upon approval</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Final Balance</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">40%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(final)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">14 days before event</td>
      </tr>
    `;
  } else {
    tierLabel = 'Standard';
    const booking = Math.round(totalAmountCents * 0.1);
    const milestone = Math.round(totalAmountCents * 0.5);
    const final = totalAmountCents - booking - milestone;
    scheduleRows = `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Booking Deposit</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">10%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(booking)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">Due upon approval</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Milestone Payment</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">50%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(milestone)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">30 days before event</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Final Balance</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">40%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(final)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">14 days before event</td>
      </tr>
    `;
  }

  return `
    <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: ${BRAND_COLORS.crimson}; margin: 0 0 10px 0;">💰 Your Payment Schedule</h3>
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
        Based on your event date (${daysUntilEvent} days away), here's how payments will be structured:
      </p>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: ${BRAND_COLORS.crimson}; color: white;">
            <th style="padding: 12px; text-align: left; font-weight: 600;">Payment</th>
            <th style="padding: 12px; text-align: center; font-weight: 600;">%</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Amount</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">When Due</th>
          </tr>
        </thead>
        <tbody>
          ${scheduleRows}
        </tbody>
      </table>
      
      <p style="margin: 15px 0 0 0; font-size: 12px; color: #888; font-style: italic;">
        * Exact due dates will be confirmed upon approval. ${isGovernment ? 'Tax exempt - no sales tax applied.' : ''}
      </p>
    </div>
  `;
}

function generateEstimateReadyEmail(quote: any, invoice: any, portalUrl: string, invoiceId: string): string {
  const approveUrl = `${portalUrl}&action=approve`;
  const changesUrl = `${portalUrl}&action=changes`;
  const isUpdated = (invoice.version || 1) > 1;
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  const lineItems = invoice.invoice_line_items || [];
  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.tax_amount || 0;
  const total = invoice.total_amount || 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Catering Estimate is Ready</title>
      <style>${EMAIL_STYLES}</style>
    </head>
    <body>
      <div class="email-container">
        <div style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <div style="background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
            <span style="color: ${BRAND_COLORS.darkGray}; font-weight: bold; font-size: 14px;">📋 ESTIMATE READY</span>
          </div>
          <h2 style="color: white; margin: 0; font-size: 24px;">Your Custom Estimate is Ready!</h2>
        </div>
        
        <div class="content">
          ${isUpdated ? `
            <div style="background: #fff3cd; border: 1px solid ${BRAND_COLORS.gold}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong>📝 Updated Estimate (Version ${invoice.version})</strong>
              <p style="margin: 5px 0 0 0;">We've revised your estimate based on your feedback.</p>
            </div>
          ` : ''}
          
          <h2 style="color: ${BRAND_COLORS.crimson};">${isUpdated ? 'Updated' : 'Great news'}, ${quote.contact_name}!</h2>
          
          <p>We've ${isUpdated ? 'updated your' : 'carefully reviewed your event requirements and prepared a'} custom estimate for <strong>${quote.event_name}</strong>.</p>
          
          ${generateEventDetailsCard(quote)}
          
          ${generateLineItemsTable(lineItems, subtotal, taxAmount, total)}
          
          ${generatePaymentSchedulePreview(quote, total)}
          
          <div style="background: #fff3cd; border: 1px solid ${BRAND_COLORS.gold}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.crimson};">⏰ Action Required</h3>
            <p style="margin: 0;">Please review and approve your estimate to secure your event date. Our calendar fills up quickly, especially during peak season!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${approveUrl}" class="btn btn-primary">✅ Approve Estimate</a>
            <a href="${changesUrl}" class="btn btn-secondary">✏️ Request Changes</a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            <a href="${portalUrl}" style="color: ${BRAND_COLORS.crimson};">Or click here to view full details first</a>
          </p>
          
          <h3 style="color: ${BRAND_COLORS.crimson};">📋 Once You Approve:</h3>
          <ul style="line-height: 1.8;">
            <li>🔒 Secure your date with online payment</li>
            <li>📞 Schedule a final planning call with our team</li>
            <li>📧 Communicate directly through your portal</li>
            <li>📅 Receive event reminders and updates</li>
          </ul>
          
          <p>Questions? Call us at <span class="highlight">(843) 970-0265</span> or reply to this email. Our family is here to help!</p>
          
          <p>We can't wait to cater your event!</p>
          
          <p>Best regards,<br>
          <strong>The Soul Train's Eatery Family</strong></p>
        </div>
        
        ${generateFooter()}
        ${generateTrackingPixel(invoiceId, 'estimate_ready')}
      </div>
    </body>
    </html>
  `;
}

function generatePaymentReminderEmail(quote: any, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder - Secure Your Event Date</title>
      <style>${EMAIL_STYLES}</style>
    </head>
    <body>
      <div class="email-container">
        <div style="background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <div style="background: rgba(220, 20, 60, 0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
            <span style="color: ${BRAND_COLORS.crimsonDark}; font-weight: bold; font-size: 14px;">⏰ PAYMENT REMINDER</span>
          </div>
          <h2 style="color: ${BRAND_COLORS.crimsonDark}; margin: 0 0 10px 0; font-size: 24px;">Payment Due Soon</h2>
          <p style="color: ${BRAND_COLORS.darkGray}; margin: 0; font-size: 16px;">
            Hi ${quote.contact_name},<br>
            This is a friendly reminder about your upcoming payment
          </p>
        </div>
        
        <div class="content">
          <h2 style="color: ${BRAND_COLORS.crimson};">Hi ${quote.contact_name},</h2>
          
          <p>We hope you're as excited as we are about catering <strong>${quote.event_name}</strong>!</p>
          
          <div style="background: #fff3cd; border-left: 4px solid ${BRAND_COLORS.gold}; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.crimson};">🔒 Secure Your Event Date</h3>
            <p style="margin: 0;">Your approved estimate is waiting for payment to confirm your booking. Don't risk losing your date - our calendar fills up fast!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" class="btn btn-primary">Complete Payment Now</a>
          </div>
          
          <h3 style="color: ${BRAND_COLORS.crimson};">💳 Easy, Secure Payment Options:</h3>
          <ul style="line-height: 1.8;">
            <li>💳 Credit/Debit Cards</li>
            <li>🏦 Bank Transfer</li>
            <li>📱 Digital Wallets (Apple Pay, Google Pay)</li>
          </ul>
          
          <p><strong>Need to make changes?</strong> No problem! Contact us before completing payment if you need to adjust anything about your order.</p>
          
          <p>Questions about payment or your event? Call us at <span class="highlight">(843) 970-0265</span> or reply to this email. We're here to help!</p>
          
          <p>Thank you for choosing Soul Train's Eatery!</p>
          
          <p>Best regards,<br>
          <strong>The Soul Train's Eatery Family</strong></p>
        </div>
        
        ${generateFooter()}
      </div>
    </body>
    </html>
  `;
}

function generateApprovalConfirmationEmail(quote: any, invoice: any, portalUrl: string, milestones: any[]): string {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };
  
  const formatDueDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Due upon approval';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMilestoneLabel = (type: string): string => {
    switch (type) {
      case 'booking_deposit': return 'Booking Deposit';
      case 'deposit': return 'Deposit';
      case 'mid_payment': return 'Milestone Payment';
      case 'final_payment': return 'Final Balance';
      case 'full_payment': return 'Full Payment';
      default: return type.replace('_', ' ');
    }
  };
  
  const total = invoice.total_amount || 0;
  const firstMilestone = milestones[0];
  const firstPaymentDisplay = firstMilestone 
    ? formatCurrency(firstMilestone.amount_cents)
    : formatCurrency(Math.round(total * 0.5));
  
  const dueDateDisplay = firstMilestone?.is_due_now 
    ? 'Due Now' 
    : formatDueDate(firstMilestone?.due_date);
  
  // Generate payment schedule table
  const paymentScheduleHtml = milestones.length > 0 ? `
    <div style="margin: 25px 0;">
      <h3 style="color: ${BRAND_COLORS.crimson}; margin-bottom: 15px;">📅 Your Payment Schedule</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: ${BRAND_COLORS.lightGray};">
            <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid ${BRAND_COLORS.gold};">Payment</th>
            <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid ${BRAND_COLORS.gold};">Due Date</th>
            <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid ${BRAND_COLORS.gold};">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${milestones.map((m, i) => `
            <tr style="background: ${i === 0 ? '#fff3cd' : (i % 2 === 0 ? '#fafafa' : '#ffffff')};">
              <td style="padding: 12px 10px; border-bottom: 1px solid #e5e5e5;">
                ${getMilestoneLabel(m.milestone_type)}
                ${i === 0 ? '<span style="color: #d97706; font-weight: bold; margin-left: 8px;">← Pay Now</span>' : ''}
              </td>
              <td style="padding: 12px 10px; border-bottom: 1px solid #e5e5e5;">
                ${m.is_due_now ? '<strong style="color: #d97706;">Due Now</strong>' : formatDueDate(m.due_date)}
              </td>
              <td style="padding: 12px 10px; text-align: right; border-bottom: 1px solid #e5e5e5; font-weight: ${i === 0 ? 'bold' : 'normal'};">
                ${formatCurrency(m.amount_cents)}
                <span style="color: #888; font-size: 12px;">(${m.percentage}%)</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background: ${BRAND_COLORS.lightGray};">
            <td colspan="2" style="padding: 12px 10px; font-weight: bold; border-top: 2px solid ${BRAND_COLORS.gold};">Total</td>
            <td style="padding: 12px 10px; text-align: right; font-weight: bold; border-top: 2px solid ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.crimson};">
              ${formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Estimate Approved - Next Steps</title>
      <style>${EMAIL_STYLES}</style>
    </head>
    <body>
      <div class="email-container">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
            <span style="color: white; font-weight: bold; font-size: 14px;">✅ APPROVED</span>
          </div>
          <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;">Thank You for Approving!</h2>
          <p style="color: white; margin: 0; font-size: 16px; opacity: 0.95;">
            Your estimate for ${quote.event_name} has been approved
          </p>
        </div>
        
        <div class="content">
          <h2 style="color: ${BRAND_COLORS.crimson};">Great news, ${quote.contact_name}!</h2>
          
          <p>You've approved your catering estimate for <strong>${quote.event_name}</strong>. We're excited to be part of your special event!</p>
          
          ${generateEventDetailsCard(quote)}
          
          <div style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); padding: 20px; border-radius: 8px; margin: 20px 0; color: white;">
            <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.gold};">💳 Next Step: Secure Your Date</h3>
            <p style="margin: 0 0 10px 0;">To confirm your booking, complete your first payment:</p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: ${BRAND_COLORS.gold};">${firstPaymentDisplay}</div>
              <div style="font-size: 14px; opacity: 0.9;">${dueDateDisplay}</div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" class="btn btn-primary" style="font-size: 18px; padding: 18px 36px;">Make Payment Now</a>
          </div>
          
          ${paymentScheduleHtml}
          
          <h3 style="color: ${BRAND_COLORS.crimson};">📋 What Happens Next:</h3>
          <ol style="line-height: 1.8;">
            <li><strong>Complete Payment:</strong> Click the button above to pay securely online</li>
            <li><strong>Booking Confirmed:</strong> Once payment is received, your date is locked in</li>
            <li><strong>Planning Call:</strong> We'll schedule a call to finalize all the details</li>
            <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
          </ol>
          
          <div style="background: ${BRAND_COLORS.lightGray}; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLORS.gold}; margin: 20px 0;">
            <strong>💡 Tip:</strong> You can always access your event portal to view your estimate, make payments, or contact us using the link in this email.
          </div>
          
          <p>Questions? Call us at <span class="highlight">(843) 970-0265</span> or reply to this email. We're here to help!</p>
          
          <p>We can't wait to cater your event!</p>
          
          <p>Best regards,<br>
          <strong>The Soul Train's Eatery Family</strong></p>
        </div>
        
        ${generateFooter()}
      </div>
    </body>
    </html>
  `;
}

serve(handler);