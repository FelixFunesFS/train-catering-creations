import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ReminderRequest {
  invoiceId: string;
  customerEmail: string;
  customerName?: string;
  eventName?: string;
  balanceRemaining: number;
  daysOverdue: number;
  urgency: 'low' | 'medium' | 'high';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: ReminderRequest = await req.json();
    
    const {
      invoiceId,
      customerEmail,
      customerName,
      eventName,
      balanceRemaining,
      daysOverdue,
      urgency
    } = body;

    console.log(`Sending payment reminder for invoice ${invoiceId} to ${customerEmail}`);

    // Get invoice details including access token
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('customer_access_token, invoice_number, due_date')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Format currency
    const formatCurrency = (cents: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

    // Build payment link
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://soultrainseatery.lovable.app';
    const paymentLink = `${frontendUrl}/estimate?token=${invoice.customer_access_token}`;

    // Determine subject and tone based on urgency
    let subject = '';
    let urgencyBadge = '';
    let urgencyMessage = '';
    
    switch (urgency) {
      case 'high':
        subject = `⚠️ URGENT: Payment Overdue - ${eventName || 'Your Event'}`;
        urgencyBadge = `<span style="background: #DC143C; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">OVERDUE ${daysOverdue} DAYS</span>`;
        urgencyMessage = `Your payment of <strong>${formatCurrency(balanceRemaining)}</strong> is now <strong>${daysOverdue} days overdue</strong>. Please complete your payment immediately to avoid service disruption.`;
        break;
      case 'medium':
        subject = `Payment Reminder - ${eventName || 'Your Event'}`;
        urgencyBadge = `<span style="background: #F59E0B; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">PAYMENT DUE</span>`;
        urgencyMessage = `Your payment of <strong>${formatCurrency(balanceRemaining)}</strong> is due. Please complete your payment at your earliest convenience.`;
        break;
      default:
        subject = `Payment Reminder - ${eventName || 'Your Event'}`;
        urgencyBadge = `<span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">REMINDER</span>`;
        urgencyMessage = `This is a friendly reminder that you have an outstanding balance of <strong>${formatCurrency(balanceRemaining)}</strong>.`;
    }

    // Build email HTML with logo
    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Payment Reminder - Soul Train's Eatery</title>
</head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background-color:#FDF8F3;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDF8F3;padding:20px 0;">
<tr>
<td align="center">
<table width="100%" style="max-width:600px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
<tr>
<td style="background:linear-gradient(135deg,#DC143C 0%,#8B0000 100%);padding:30px;text-align:center;">
<img src="${Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app'}/images/logo-white.svg" alt="Soul Train's Eatery" width="70" height="70" style="display:block;width:70px;height:70px;margin:0 auto 12px auto;" />
<h1 style="color:#FFD700;margin:0;font-size:26px;font-weight:bold;">Soul Train's Eatery</h1>
<p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:14px;">Payment Reminder</p>
</td>
</tr>
<tr>
<td style="padding:20px 30px 0;text-align:center;">
${urgencyBadge}
</td>
</tr>
<tr>
<td style="padding:30px;">
<p style="font-size:16px;color:#333;margin:0 0 20px;">Dear ${customerName || 'Valued Customer'},</p>
<p style="font-size:16px;color:#333;margin:0 0 20px;line-height:1.6;">${urgencyMessage}</p>
${eventName ? `
<div style="background:#FDF8F3;border-left:4px solid #DC143C;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
<p style="margin:0;color:#666;font-size:14px;">Event</p>
<p style="margin:5px 0 0;color:#333;font-size:16px;font-weight:bold;">${eventName}</p>
</div>
` : ''}
<table width="100%" style="margin:25px 0;border:1px solid #E5E5E5;border-radius:8px;overflow:hidden;border-collapse:collapse;">
<tr style="background:#F9FAFB;">
<td style="padding:15px 20px;border-bottom:1px solid #E5E5E5;">
<span style="color:#666;font-size:14px;">Invoice Number</span>
</td>
<td style="padding:15px 20px;border-bottom:1px solid #E5E5E5;text-align:right;">
<span style="color:#333;font-weight:bold;">${invoice.invoice_number || 'N/A'}</span>
</td>
</tr>
<tr>
<td style="padding:15px 20px;">
<span style="color:#666;font-size:14px;">Amount Due</span>
</td>
<td style="padding:15px 20px;text-align:right;">
<span style="color:#DC143C;font-size:24px;font-weight:bold;">${formatCurrency(balanceRemaining)}</span>
</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
<tr>
<td align="center">
<a href="${paymentLink}" style="display:inline-block;background:linear-gradient(135deg,#DC143C 0%,#8B0000 100%);color:white;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:bold;box-shadow:0 4px 15px rgba(220,20,60,0.3);">Pay Now</a>
</td>
</tr>
</table>
<p style="font-size:14px;color:#666;margin:0;line-height:1.6;text-align:center;">
If you have already made this payment, please disregard this reminder.<br/>
Questions? Contact us at <a href="mailto:soultrainseatery@gmail.com" style="color:#DC143C;">soultrainseatery@gmail.com</a>
</p>
</td>
</tr>
<tr>
<td style="background:#1A1A1A;padding:25px 30px;text-align:center;">
<img src="${Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app'}/images/logo-white.svg" alt="" width="40" height="40" style="display:block;width:40px;height:40px;margin:0 auto 8px auto;opacity:0.8;" />
<p style="color:#FFD700;margin:0 0 4px;font-weight:bold;font-size:14px;">Soul Train's Eatery</p>
<p style="color:rgba(255,255,255,0.7);margin:0;font-size:12px;">Charleston's Trusted Catering Partner</p>
<p style="color:rgba(255,255,255,0.5);margin:10px 0 0;font-size:11px;">(843) 970-0265 | soultrainseatery@gmail.com</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

    // Send email using Gmail API
    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: {
        to: customerEmail,
        subject,
        html: emailHtml
      }
    });

    if (emailError) {
      console.error('Failed to send email:', emailError);
      throw new Error('Failed to send reminder email');
    }

    // Log the reminder
    await supabase.from('reminder_logs').insert({
      invoice_id: invoiceId,
      reminder_type: urgency === 'high' ? 'overdue_payment' : 'payment_due',
      recipient_email: customerEmail,
      urgency
    });

    // Update invoice reminder tracking
    const { data: currentInvoice } = await supabase
      .from('invoices')
      .select('reminder_count')
      .eq('id', invoiceId)
      .single();

    await supabase
      .from('invoices')
      .update({
        last_reminder_sent_at: new Date().toISOString(),
        reminder_count: (currentInvoice?.reminder_count || 0) + 1
      })
      .eq('id', invoiceId);

    console.log(`Payment reminder sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Reminder sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);