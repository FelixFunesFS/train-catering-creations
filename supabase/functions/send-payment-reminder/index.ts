import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { generateStandardEmail, EMAIL_CONFIGS, formatCurrency, BRAND_COLORS } from '../_shared/emailTemplates.ts';

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
  milestoneType?: string;  // DEPOSIT, MILESTONE, FINAL, FULL
  isDueNow?: boolean;      // Is this the first payment due now?
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
      urgency,
      milestoneType,
      isDueNow
    } = body;

    console.log(`Sending payment reminder for invoice ${invoiceId} to ${customerEmail}`, { milestoneType, isDueNow });

    // Get invoice details including access token
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('customer_access_token, invoice_number, due_date')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Build payment link
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://www.soultrainseatery.com';
    const paymentLink = `${frontendUrl}/estimate?token=${invoice.customer_access_token}`;

    // Determine subject and content based on urgency and milestone type
    let subject = '';
    let urgencyBadge = '';
    let urgencyMessage = '';
    let heroVariant: 'orange' | 'crimson' | 'gold' = 'orange';
    let heroTitle = 'Payment Reminder';
    
    if (urgency === 'high') {
      // Overdue - keep urgent messaging
      subject = `URGENT: Payment Overdue - ${eventName || 'Your Event'}`;
      urgencyBadge = `OVERDUE ${daysOverdue} DAYS`;
      urgencyMessage = `Your payment of <strong>${formatCurrency(balanceRemaining)}</strong> is now <strong>${daysOverdue} days overdue</strong>. Please complete your payment immediately to avoid service disruption.`;
      heroVariant = 'crimson';
      heroTitle = 'Payment Overdue';
    } else if (milestoneType === 'DEPOSIT' || isDueNow) {
      // Initial deposit - emphasize date security
      subject = `Secure Your Date - Deposit Due for ${eventName || 'Your Event'}`;
      urgencyBadge = 'DEPOSIT DUE';
      urgencyMessage = `Complete your deposit of <strong>${formatCurrency(balanceRemaining)}</strong> to lock in your event date. Our calendar fills up fast!`;
      heroVariant = 'gold';
      heroTitle = 'Secure Your Event Date';
    } else if (milestoneType === 'FINAL') {
      // Final payment - emphasize completion
      subject = `Final Payment Due - ${eventName || 'Your Event'}`;
      urgencyBadge = 'FINAL PAYMENT';
      urgencyMessage = `Your final payment of <strong>${formatCurrency(balanceRemaining)}</strong> is due to complete your booking.`;
      heroTitle = 'Final Payment Due';
    } else if (milestoneType === 'MILESTONE') {
      // Mid-schedule milestone
      subject = `Payment Due - ${eventName || 'Your Event'}`;
      urgencyBadge = 'PAYMENT DUE';
      urgencyMessage = `Your scheduled payment of <strong>${formatCurrency(balanceRemaining)}</strong> is due.`;
      heroTitle = 'Scheduled Payment Due';
    } else {
      // Default/fallback
      subject = `Payment Reminder - ${eventName || 'Your Event'}`;
      urgencyBadge = 'REMINDER';
      urgencyMessage = `This is a friendly reminder that you have an outstanding balance of <strong>${formatCurrency(balanceRemaining)}</strong>.`;
      heroTitle = 'Payment Due';
    }

    // Build urgency box HTML
    const urgencyBoxHtml = urgency === 'high' ? `
      <div style="background:#fee2e2;border:2px solid #dc2626;padding:20px;border-radius:10px;margin:20px 0;">
        <div style="display:inline-block;background:#dc2626;color:white;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:bold;margin-bottom:10px;">${urgencyBadge}</div>
        <p style="margin:0;font-size:16px;line-height:1.6;">${urgencyMessage}</p>
      </div>
    ` : `
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;border-radius:0 8px 8px 0;margin:20px 0;">
        <div style="display:inline-block;background:#f59e0b;color:white;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:bold;margin-bottom:10px;">${urgencyBadge}</div>
        <p style="margin:0;font-size:16px;line-height:1.6;">${urgencyMessage}</p>
      </div>
    `;

    // Invoice details HTML
    const invoiceDetailsHtml = `
      <div style="background:${BRAND_COLORS.lightGray};border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;margin:20px 0;">
        <div style="background:#f9fafb;padding:12px 16px;border-bottom:1px solid #e5e5e5;">
          <span style="color:#666;font-size:14px;">Invoice Number</span>
          <span style="float:right;font-weight:bold;color:#333;">${invoice.invoice_number || 'N/A'}</span>
        </div>
        <div style="padding:16px;">
          <span style="color:#666;font-size:14px;">Amount Due</span>
          <div style="font-size:28px;font-weight:bold;color:${BRAND_COLORS.crimson};margin-top:8px;">${formatCurrency(balanceRemaining)}</div>
        </div>
      </div>
    `;

    // Generate email using standard template
    const emailHtml = generateStandardEmail({
      preheaderText: EMAIL_CONFIGS.payment_reminder.customer!.preheaderText,
      heroSection: {
        badge: urgencyBadge,
        title: heroTitle,
        subtitle: eventName || 'Your Catering Event',
        variant: heroVariant
      },
      contentBlocks: [
        { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Dear ${customerName || 'Valued Customer'},</p>` }},
        { type: 'custom_html', data: { html: urgencyBoxHtml }},
        { type: 'custom_html', data: { html: invoiceDetailsHtml }},
        { type: 'text', data: { html: `
          <p style="font-size:14px;color:#666;margin:20px 0;text-align:center;line-height:1.6;">
            If you have already made this payment, please disregard this reminder.<br/>
            Questions? Contact us at <a href="mailto:soultrainseatery@gmail.com" style="color:${BRAND_COLORS.crimson};">soultrainseatery@gmail.com</a>
          </p>
        ` }}
      ],
      ctaButton: { text: 'Pay Now', href: paymentLink, variant: 'primary' }
    });

    // Send email
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
