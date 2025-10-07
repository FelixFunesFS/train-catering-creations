import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminNotificationRequest {
  invoiceId: string;
  notificationType: 'customer_approval' | 'payment_received' | 'change_request' | 'urgent_action';
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, notificationType, metadata = {} }: AdminNotificationRequest = await req.json();
    
    console.log(`[ADMIN-NOTIFY] Sending ${notificationType} notification for invoice ${invoiceId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get invoice and quote details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        quote_requests!invoices_quote_request_id_fkey(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    const quote = invoice.quote_requests as any;

    // Generate notification email based on type
    let subject = '';
    let html = '';

    switch (notificationType) {
      case 'customer_approval':
        subject = `🎉 Customer Approved: ${quote.event_name}`;
        html = generateApprovalEmail(invoice, quote, siteUrl, metadata);
        break;
      
      case 'payment_received':
        subject = `💰 Payment Received: ${quote.event_name}`;
        html = generatePaymentEmail(invoice, quote, siteUrl, metadata);
        break;
      
      case 'change_request':
        subject = `✏️ Change Request: ${quote.event_name}`;
        html = generateChangeRequestEmail(invoice, quote, siteUrl, metadata);
        break;
      
      case 'urgent_action':
        subject = `🚨 URGENT: ${metadata.action_required || 'Action Required'}`;
        html = generateUrgentActionEmail(invoice, quote, siteUrl, metadata);
        break;
      
      default:
        throw new Error(`Unknown notification type: ${notificationType}`);
    }

    // Send email via Gmail
    const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: 'soultrainseatery@gmail.com',
        subject,
        html
      }
    });

    if (emailError) {
      console.error('[ADMIN-NOTIFY] Email send error:', emailError);
      throw emailError;
    }

    console.log(`[ADMIN-NOTIFY] ✅ Notification sent successfully`);

    return new Response(
      JSON.stringify({ success: true, notification_type: notificationType }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[ADMIN-NOTIFY] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

function generateApprovalEmail(invoice: any, quote: any, siteUrl: string, metadata: any): string {
  const total = ((invoice.total_amount || 0) / 100).toFixed(2);
  const eventDate = new Date(quote.event_date).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Customer Approved Estimate!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Immediate action required</p>
        </div>
        
        <div class="content">
          <h2 style="color: #10b981; margin-top: 0;">Event Details</h2>
          
          <div class="detail-row">
            <strong>Event Name:</strong>
            <span>${quote.event_name}</span>
          </div>
          <div class="detail-row">
            <strong>Customer:</strong>
            <span>${quote.contact_name}</span>
          </div>
          <div class="detail-row">
            <strong>Email:</strong>
            <span>${quote.email}</span>
          </div>
          <div class="detail-row">
            <strong>Phone:</strong>
            <span>${quote.phone || 'Not provided'}</span>
          </div>
          <div class="detail-row">
            <strong>Event Date:</strong>
            <span>${eventDate}</span>
          </div>
          <div class="detail-row">
            <strong>Location:</strong>
            <span>${quote.location}</span>
          </div>
          <div class="detail-row">
            <strong>Guest Count:</strong>
            <span>${quote.guest_count} guests</span>
          </div>
          <div class="detail-row" style="border-bottom: none; font-size: 18px; margin-top: 10px;">
            <strong>Total Amount:</strong>
            <strong style="color: #10b981;">$${total}</strong>
          </div>

          ${metadata.feedback ? `
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <strong>Customer Feedback:</strong>
              <p style="margin: 10px 0 0 0; color: #6b7280;">${metadata.feedback}</p>
            </div>
          ` : ''}

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
            <strong style="color: #92400e;">⚡ Next Steps:</strong>
            <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
              <li>Generate payment milestones (if not already done)</li>
              <li>Send contract for signature</li>
              <li>Await payment confirmation</li>
              <li>Add event to calendar</li>
            </ol>
          </div>

          <a href="${siteUrl}/admin/workflow?quote=${quote.id}" class="button">
            View in Admin Dashboard →
          </a>
        </div>

        <div class="footer">
          <p>This is an automated notification from Soul Train's Eatery Admin System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentEmail(invoice: any, quote: any, siteUrl: string, metadata: any): string {
  const amount = ((metadata.amount || 0) / 100).toFixed(2);
  const total = ((invoice.total_amount || 0) / 100).toFixed(2);
  const eventDate = new Date(quote.event_date).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .amount-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #3b82f6; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">💰 Payment Received!</h1>
        </div>
        
        <div class="content">
          <div class="amount-box">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Payment Amount</div>
            <div style="font-size: 36px; font-weight: bold; color: #3b82f6;">$${amount}</div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">
              ${metadata.full_payment ? '✅ Full payment received' : `Partial payment (Total: $${total})`}
            </div>
          </div>

          <h3>${quote.event_name}</h3>
          <p><strong>Customer:</strong> ${quote.contact_name}</p>
          <p><strong>Event Date:</strong> ${eventDate}</p>
          
          <a href="${siteUrl}/admin/workflow?quote=${quote.id}" class="button">
            View Details →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateChangeRequestEmail(invoice: any, quote: any, siteUrl: string, metadata: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✏️ Change Request</h1>
          <p style="margin: 5px 0 0 0;">Customer requested modifications</p>
        </div>
        
        <div class="content">
          <h3>${quote.event_name}</h3>
          <p><strong>Customer:</strong> ${quote.contact_name}</p>
          
          ${metadata.changes ? `
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong>Requested Changes:</strong>
              <p style="margin: 10px 0 0 0;">${metadata.changes}</p>
            </div>
          ` : ''}
          
          <a href="${siteUrl}/admin/workflow?quote=${quote.id}" class="button">
            Review Changes →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateUrgentActionEmail(invoice: any, quote: any, siteUrl: string, metadata: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; border-radius: 8px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🚨 URGENT ACTION REQUIRED</h1>
        </div>
        
        <div class="content">
          <h3>${metadata.action_required || 'Immediate attention needed'}</h3>
          <p>${metadata.description || 'Please review the admin dashboard for details.'}</p>
          
          <a href="${siteUrl}/admin/workflow?quote=${quote.id}" class="button">
            Take Action →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
