import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { BRAND_COLORS, LOGO_URLS } from '../_shared/emailTemplates.ts';

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

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`*,quote_requests!invoices_quote_request_id_fkey(*)`)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    const quote = invoice.quote_requests as any;

    let subject = '';
    let body = '';
    let statusColor = BRAND_COLORS.crimson;

    switch (notificationType) {
      case 'customer_approval':
        subject = `Customer Approved: ${quote.event_name}`;
        statusColor = '#16a34a';
        body = `
          <h2 style="margin:0 0 16px 0;color:${statusColor};font-size:20px;">Great news! Customer has approved the estimate.</h2>
          <div style="margin:20px 0;padding:20px;background:${BRAND_COLORS.lightGray};border-radius:8px;border-left:4px solid ${statusColor};">
            <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.darkGray};font-size:16px;">Event Details:</h3>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Event:</strong> ${quote.event_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Customer:</strong> ${quote.contact_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Email:</strong> ${quote.email}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Guests:</strong> ${quote.guest_count}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Total:</strong> $${(invoice.total_amount / 100).toFixed(2)}</p>
          </div>
          ${metadata.feedback ? `<p style="margin:16px 0;"><strong>Customer Feedback:</strong> ${metadata.feedback}</p>` : ''}
        `;
        break;

      case 'change_request':
        subject = `Change Request: ${quote.event_name}`;
        statusColor = '#f59e0b';
        body = `
          <h2 style="margin:0 0 16px 0;color:${statusColor};font-size:20px;">Customer has requested changes to their estimate.</h2>
          <div style="margin:20px 0;padding:20px;background:#fef3c7;border-radius:8px;border-left:4px solid ${statusColor};">
            <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.darkGray};font-size:16px;">Event Details:</h3>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Event:</strong> ${quote.event_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Customer:</strong> ${quote.contact_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Email:</strong> ${quote.email}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}</p>
          </div>
          <div style="margin:20px 0;padding:20px;background:#fff5e6;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};">
            <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.darkGray};font-size:16px;">Requested Changes:</h3>
            <p style="margin:0;color:${BRAND_COLORS.darkGray};">${metadata.changes || 'See admin dashboard for details'}</p>
            ${metadata.urgency === 'high' ? `<p style="margin:12px 0 0 0;color:${BRAND_COLORS.crimson};font-weight:bold;">HIGH PRIORITY</p>` : ''}
          </div>
        `;
        break;

      case 'payment_received':
        subject = `Payment Received: ${quote.event_name}`;
        statusColor = '#16a34a';
        body = `
          <h2 style="margin:0 0 16px 0;color:${statusColor};font-size:20px;">Payment has been received!</h2>
          <div style="margin:20px 0;padding:20px;background:#d1fae5;border-radius:8px;border-left:4px solid ${statusColor};">
            <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.darkGray};font-size:16px;">Payment Details:</h3>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Event:</strong> ${quote.event_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Customer:</strong> ${quote.contact_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Amount:</strong> $${((metadata.amount || 0) / 100).toFixed(2)}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Type:</strong> ${metadata.payment_type === 'full' ? 'Full Payment' : '50% Deposit'}</p>
            ${metadata.full_payment ? `<p style="margin:12px 0 0 0;color:${statusColor};font-weight:bold;">PAID IN FULL</p>` : ''}
          </div>
        `;
        break;

      case 'payment_failed':
        subject = `Payment Failed: ${quote.event_name}`;
        statusColor = BRAND_COLORS.crimson;
        body = `
          <h2 style="margin:0 0 16px 0;color:${statusColor};font-size:20px;">Payment attempt failed</h2>
          <div style="margin:20px 0;padding:20px;background:#fee2e2;border-radius:8px;border-left:4px solid ${statusColor};">
            <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.darkGray};font-size:16px;">Event Details:</h3>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Event:</strong> ${quote.event_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Customer:</strong> ${quote.contact_name}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Email:</strong> ${quote.email}</p>
            <p style="margin:6px 0;color:${BRAND_COLORS.darkGray};"><strong>Reason:</strong> ${metadata.error || 'Unknown'}</p>
          </div>
          <p style="margin:16px 0;color:${BRAND_COLORS.darkGray};">You may need to follow up with the customer.</p>
        `;
        break;
    }

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: 'soultrainseatery@gmail.com',
        subject,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px 0;">
<tr>
<td align="center">
<table width="100%" style="max-width:600px;background:${BRAND_COLORS.white};border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
<tr>
<td style="background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});padding:24px;text-align:center;">
<img src="${LOGO_URLS.white}" alt="Soul Train's Eatery" width="60" height="60" style="display:block;width:60px;height:60px;margin:0 auto 8px auto;" />
<h1 style="color:${BRAND_COLORS.gold};margin:0;font-size:20px;font-weight:bold;">Admin Notification</h1>
</td>
</tr>
<tr>
<td style="padding:24px;">
${body}
<div style="margin:24px 0;text-align:center;">
<a href="${Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app'}/admin" style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});color:${BRAND_COLORS.white};padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">View in Admin Dashboard</a>
</div>
</td>
</tr>
<tr>
<td style="background:${BRAND_COLORS.lightGray};padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:12px;margin:0;">Soul Train's Eatery - Admin Notification</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`
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

serve(handler);
