import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  EMAIL_STYLES, 
  generateEmailHeader, 
  generateEventDetailsCard, 
  generateMenuSection, 
  generateFooter,
  generateTrackingPixel,
  generatePaymentConfirmationEmail,
  BRAND_COLORS
} from '../_shared/emailTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalEmailRequest {
  quote_request_id: string;
  type: 'welcome' | 'estimate_ready' | 'payment_reminder' | 'payment_confirmation';
  metadata?: {
    amount?: number;
    payment_type?: string;
    is_full_payment?: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_request_id, type }: PortalEmailRequest = await req.json();

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
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        customer_access_token,
        invoice_number,
        total_amount,
        subtotal,
        tax_amount,
        invoice_line_items (
          title,
          description,
          quantity,
          unit_price,
          total_price,
          category
        )
      `)
      .eq('quote_request_id', quote_request_id)
      .single();

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
        
      default:
        throw new Error(`Invalid email type: ${type}`);
    }

    // Send email via the gmail email function
    const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: quote.email,
        subject,
        html: htmlContent
      }
    });

    if (emailError) throw emailError;

    console.log(`Customer portal email sent successfully to ${quote.email}`);

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
        ${generateEmailHeader("Welcome to Soul Train's Eatery")}
        
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

function generateEstimateReadyEmail(quote: any, invoice: any, portalUrl: string, invoiceId: string): string {
  const approveUrl = `${portalUrl}&action=approve`;
  const changesUrl = `${portalUrl}&action=changes`;
  
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
        ${generateEmailHeader("Your Estimate is Ready!")}
        
        <div class="content">
          <h2 style="color: ${BRAND_COLORS.crimson};">Great news, ${quote.contact_name}!</h2>
          
          <p>We've carefully reviewed your event requirements and prepared a custom estimate for <strong>${quote.event_name}</strong>.</p>
          
          ${generateEventDetailsCard(quote)}
          
          ${generateMenuSection(lineItems)}
          
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
          
          <h3 style="color: ${BRAND_COLORS.crimson};">💰 Investment Summary</h3>
          <div style="background: ${BRAND_COLORS.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 2px solid #dee2e6;">
                <td style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="text-align: right; padding: 10px; width: 120px;"><strong>${formatCurrency(subtotal)}</strong></td>
              </tr>
              ${taxAmount > 0 ? `
                <tr style="border-bottom: 2px solid #dee2e6;">
                  <td style="padding: 10px; text-align: right;">Tax (8%):</td>
                  <td style="text-align: right; padding: 10px;">${formatCurrency(taxAmount)}</td>
                </tr>
              ` : ''}
              <tr style="background: ${BRAND_COLORS.crimson}; color: white;">
                <td style="padding: 15px; text-align: right; font-size: 20px;"><strong>TOTAL:</strong></td>
                <td style="text-align: right; padding: 15px; font-size: 20px;"><strong>${formatCurrency(total)}</strong></td>
              </tr>
            </table>
          </div>
          
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
        ${generateEmailHeader("Payment Reminder")}
        
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

serve(handler);