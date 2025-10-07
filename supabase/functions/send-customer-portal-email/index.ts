import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalEmailRequest {
  quote_request_id: string;
  type: 'welcome' | 'estimate_ready' | 'payment_reminder';
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

    // Fetch invoice to get customer access token
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('customer_access_token')
      .eq('quote_request_id', quote_request_id)
      .single();

    if (invoiceError || !invoice?.customer_access_token) {
      throw new Error('Invoice or access token not found for this quote request');
    }

    // Create portal URL using token-based system
    const portalUrl = `${Deno.env.get('SITE_URL') || 'https://localhost:5173'}/estimate?token=${invoice.customer_access_token}`;

    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'welcome':
        subject = `Welcome to Soul Train's Eatery - Access Your Event Details`;
        htmlContent = generateWelcomeEmail(quote, accessCode, portalUrl);
        break;
        
      case 'estimate_ready':
        subject = `Your Catering Estimate is Ready - ${quote.event_name}`;
        htmlContent = generateEstimateReadyEmail(quote, accessCode, portalUrl);
        break;
        
      case 'payment_reminder':
        subject = `Payment Reminder - ${quote.event_name}`;
        htmlContent = generatePaymentReminderEmail(quote, accessCode, portalUrl);
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

function generateWelcomeEmail(quote: any, _accessCode: string, portalUrl: string): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Soul Train's Eatery</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
        .btn { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .access-code { background: #f8f9fa; border: 2px solid #ff6b35; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .highlight { color: #ff6b35; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚂 Soul Train's Eatery</h1>
        <p>Authentic Southern Catering from the Heart</p>
      </div>
      
      <div class="content">
        <h2>Welcome, ${quote.contact_name}!</h2>
        
        <p>Thank you for choosing Soul Train's Eatery for your upcoming event. We're thrilled to be part of your special occasion and excited to serve up some authentic Southern hospitality!</p>
        
        <div class="event-details">
          <h3>🎉 Your Event Details</h3>
          <p><strong>Event:</strong> ${quote.event_name}</p>
          <p><strong>Date:</strong> ${formatDate(quote.event_date)}</p>
          <p><strong>Location:</strong> ${quote.location}</p>
          <p><strong>Guests:</strong> ${quote.guest_count} people</p>
        </div>
        
        <h3>📱 Access Your Personal Event Portal</h3>
        <p>We've created a personalized portal where you can track your event planning progress, view estimates, make payments, and communicate with our team.</p>
        
        <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 20px 0;">
          <strong>Secure Access:</strong> Click the button below to access your portal. Your personal link is valid for one year and can be used anytime to check your event status.
        </p>
        
        <div style="text-align: center;">
          <a href="${portalUrl}" class="btn">Access Your Event Portal</a>
        </div>
        
        <h3>🎯 What Happens Next?</h3>
        <ol>
          <li><strong>Review Period:</strong> Our team is carefully reviewing your requirements</li>
          <li><strong>Custom Estimate:</strong> We'll prepare a detailed estimate within 24 hours</li>
          <li><strong>Approval:</strong> Review and approve your estimate through the portal</li>
          <li><strong>Payment:</strong> Secure online payment to confirm your booking</li>
          <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
        </ol>
        
        <p>If you have any questions or need to make changes, simply reply to this email or call us at <span class="highlight">(843) 970-0265</span>.</p>
        
        <p>We're here to make your event absolutely delicious!</p>
        
        <p>Warm regards,<br>
        <strong>The Soul Train's Eatery Team</strong><br>
        <em>Bringing families together around exceptional food</em></p>
      </div>
      
      <div class="footer">
        <p><strong>Soul Train's Eatery</strong><br>
        Charleston's trusted catering partner<br>
        Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com</p>
        <p>Proudly serving Charleston's Lowcountry and surrounding areas</p>
      </div>
    </body>
    </html>
  `;
}

function generateEstimateReadyEmail(quote: any, _accessCode: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Catering Estimate is Ready</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
        .btn { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .highlight { color: #28a745; font-weight: bold; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Your Estimate is Ready!</h1>
        <p>Soul Train's Eatery</p>
      </div>
      
      <div class="content">
        <h2>Great news, ${quote.contact_name}!</h2>
        
        <p>We've carefully reviewed your event requirements and prepared a custom estimate for <strong>${quote.event_name}</strong>.</p>
        
        <div class="urgent">
          <h3>⏰ Action Required</h3>
          <p>Please review and approve your estimate to secure your event date. Our calendar fills up quickly, especially during peak season!</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${portalUrl}" class="btn">Review Your Estimate</a>
        </div>
        
        <h3>What's included in your estimate:</h3>
        <ul>
          <li>✅ Complete menu breakdown with pricing</li>
          <li>✅ Service details and staff requirements</li>
          <li>✅ Equipment and setup information</li>
          <li>✅ Payment terms and event timeline</li>
        </ul>
        
        <p>Once you approve the estimate, you can:</p>
        <ul>
          <li>🔒 Secure your date with online payment</li>
          <li>📞 Schedule a final planning call</li>
          <li>📧 Communicate directly with our event team</li>
        </ul>
        
        <p>Questions? Call us at <span class="highlight">(843) 970-0265</span> or reply to this email.</p>
        
        <p>We can't wait to cater your event!</p>
        
        <p>Best regards,<br>
        <strong>The Soul Train's Eatery Team</strong></p>
      </div>
      
      <div class="footer">
        <p><strong>Soul Train's Eatery</strong><br>
        Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com</p>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentReminderEmail(quote: any, _accessCode: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder - Secure Your Event Date</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffc107, #fd7e14); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
        .btn { display: inline-block; background: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .highlight { color: #fd7e14; font-weight: bold; }
        .reminder { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⏰ Payment Reminder</h1>
        <p>Soul Train's Eatery</p>
      </div>
      
      <div class="content">
        <h2>Hi ${quote.contact_name},</h2>
        
        <p>We hope you're as excited as we are about catering <strong>${quote.event_name}</strong>!</p>
        
        <div class="reminder">
          <h3>🔒 Secure Your Event Date</h3>
          <p>Your approved estimate is waiting for payment to confirm your booking. Don't risk losing your date - our calendar fills up fast!</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${portalUrl}" class="btn">Complete Payment Now</a>
        </div>
        
        <h3>💳 Easy, Secure Payment Options:</h3>
        <ul>
          <li>💳 Credit/Debit Cards</li>
          <li>🏦 Bank Transfer</li>
          <li>📱 Digital Wallets</li>
        </ul>
        
        <p><strong>Need to make changes?</strong> No problem! Contact us before completing payment if you need to adjust anything about your order.</p>
        
        <p>Questions about payment or your event? Call us at <span class="highlight">(843) 970-0265</span> or reply to this email.</p>
        
        <p>Thank you for choosing Soul Train's Eatery!</p>
        
        <p>Best regards,<br>
        <strong>The Soul Train's Eatery Team</strong></p>
      </div>
      
      <div class="footer">
        <p><strong>Soul Train's Eatery</strong><br>
        Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com</p>
      </div>
    </body>
    </html>
  `;
}

serve(handler);