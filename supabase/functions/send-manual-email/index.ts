import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyAdminAuth, createUnauthorizedResponse, escapeHtml } from "../_shared/security.ts";
import { generateStandardEmail, BRAND_COLORS } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[SEND-MANUAL-EMAIL] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // SECURITY: Verify admin authentication
    const { isAdmin, userId, error: authError } = await verifyAdminAuth(req);
    if (!isAdmin) {
      logStep('Admin auth failed', { error: authError });
      return createUnauthorizedResponse(authError || 'Admin access required', corsHeaders);
    }

    logStep('Admin authenticated', { userId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { invoice_id, email_type, custom_message } = await req.json();
    logStep('Request received', { invoice_id, email_type });

    // Fetch invoice and related data
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        customers (
          name,
          email,
          phone
        ),
        quote_requests (
          event_name,
          event_date,
          location,
          guest_count,
          service_type,
          contact_name,
          phone,
          email
        )
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error(`Failed to fetch invoice: ${invoiceError?.message}`);
    }

    logStep('Invoice data fetched', { 
      invoiceNumber: invoiceData.invoice_number,
      customerEmail: invoiceData.customers?.email 
    });

    const customer = invoiceData.customers;
    const quote = invoiceData.quote_requests;

    if (!customer?.email) {
      throw new Error('Customer email not found');
    }

    // Sanitize user-provided content
    const safeCustomerName = escapeHtml(customer.name);
    const safeEventName = escapeHtml(quote?.event_name);
    const safeCustomMessage = escapeHtml(custom_message);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return 'TBD';
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/New_York',
      });
    };

    // Generate email content based on type using shared template system
    let subject = '';
    let heroSection: any;
    let contentBlocks: any[] = [];

    switch (email_type) {
      case 'estimate_sent':
        subject = `Your Catering Estimate - ${quote?.event_name || 'Event'}`;
        heroSection = {
          badge: '📋 ESTIMATE READY',
          title: 'Your Catering Estimate',
          subtitle: safeEventName,
          variant: 'gold'
        };
        contentBlocks = [
          { type: 'text', data: { html: `
            <p style="font-size:16px;margin:0 0 16px 0;">Dear ${safeCustomerName},</p>
            <p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Thank you for choosing Soul Train's Eatery for your upcoming event. Please find your catering estimate details below.</p>
          ` }},
          { type: 'custom_html', data: { html: `
            <div style="background:${BRAND_COLORS.lightGray};padding:20px;margin:20px 0;border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};">
              <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};">Event Details</h3>
              <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:14px;">
                <tr><td style="color:#666;width:120px;">Event:</td><td><strong>${safeEventName}</strong></td></tr>
                <tr><td style="color:#666;">Date:</td><td>${quote?.event_date ? formatDate(quote.event_date) : 'TBD'}</td></tr>
                <tr><td style="color:#666;">Location:</td><td>${escapeHtml(quote?.location) || 'TBD'}</td></tr>
                <tr><td style="color:#666;">Guest Count:</td><td>${quote?.guest_count || 'TBD'}</td></tr>
                <tr><td style="color:#666;">Total Estimate:</td><td><strong style="color:${BRAND_COLORS.crimson};">${formatCurrency(invoiceData.total_amount)}</strong></td></tr>
              </table>
            </div>
          ` }},
          { type: 'text', data: { html: `
            <p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Please review the estimate and let us know if you have any questions or would like to make any changes.</p>
            ${safeCustomMessage ? `<div style="border-left:4px solid ${BRAND_COLORS.gold};padding-left:16px;margin:20px 0;"><p style="margin:0;font-size:15px;"><strong>Additional Message:</strong></p><p style="margin:8px 0 0 0;font-size:15px;">${safeCustomMessage}</p></div>` : ''}
            <p style="font-size:15px;margin:16px 0 0 0;line-height:1.6;">We look forward to making your event memorable!</p>
          ` }}
        ];
        break;

      case 'payment_reminder':
        subject = `Payment Reminder - ${quote?.event_name || 'Event'}`;
        heroSection = {
          badge: '⏰ PAYMENT DUE',
          title: 'Payment Reminder',
          subtitle: safeEventName,
          variant: 'orange'
        };
        contentBlocks = [
          { type: 'text', data: { html: `
            <p style="font-size:16px;margin:0 0 16px 0;">Dear ${safeCustomerName},</p>
            <p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">This is a friendly reminder that payment is due for your upcoming catering event.</p>
          ` }},
          { type: 'custom_html', data: { html: `
            <div style="background:${BRAND_COLORS.lightGray};padding:20px;margin:20px 0;border-radius:8px;border-left:4px solid ${BRAND_COLORS.crimson};">
              <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};">Payment Details</h3>
              <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:14px;">
                <tr><td style="color:#666;width:120px;">Event:</td><td><strong>${safeEventName}</strong></td></tr>
                <tr><td style="color:#666;">Date:</td><td>${quote?.event_date ? formatDate(quote.event_date) : 'TBD'}</td></tr>
                <tr><td style="color:#666;">Amount Due:</td><td><strong style="color:${BRAND_COLORS.crimson};">${formatCurrency(invoiceData.total_amount)}</strong></td></tr>
                <tr><td style="color:#666;">Invoice #:</td><td>${escapeHtml(invoiceData.invoice_number)}</td></tr>
              </table>
            </div>
          ` }},
          { type: 'text', data: { html: `
            ${safeCustomMessage ? `<div style="border-left:4px solid ${BRAND_COLORS.gold};padding-left:16px;margin:20px 0;"><p style="margin:0;font-size:15px;"><strong>Additional Message:</strong></p><p style="margin:8px 0 0 0;font-size:15px;">${safeCustomMessage}</p></div>` : ''}
            <p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Please contact us at <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};text-decoration:none;">(843) 970-0265</a> if you have any questions about your payment.</p>
            <p style="font-size:15px;margin:0;line-height:1.6;">Thank you for choosing Soul Train's Eatery!</p>
          ` }}
        ];
        break;

      case 'follow_up':
        subject = `Following Up - ${quote?.event_name || 'Event'}`;
        heroSection = {
          badge: '📧 FOLLOW UP',
          title: 'Following Up',
          subtitle: safeEventName,
          variant: 'blue'
        };
        contentBlocks = [
          { type: 'text', data: { html: `
            <p style="font-size:16px;margin:0 0 16px 0;">Dear ${safeCustomerName},</p>
            <p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We wanted to follow up on your catering estimate for <strong>${safeEventName}</strong>.</p>
            ${safeCustomMessage ? `<div style="border-left:4px solid ${BRAND_COLORS.gold};padding-left:16px;margin:20px 0;"><p style="margin:0;font-size:15px;">${safeCustomMessage}</p></div>` : ''}
            <p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">If you have any questions or would like to make changes to your estimate, please don't hesitate to reach out.</p>
            <p style="font-size:15px;margin:0;line-height:1.6;">We're here to help make your event perfect!</p>
          ` }}
        ];
        break;

      default:
        throw new Error('Invalid email type');
    }

    // Generate email using shared template system
    const emailHtml = generateStandardEmail({
      preheaderText: subject,
      heroSection,
      contentBlocks,
      quote: quote || {},
    });

    // Send email using the existing SMTP function
    const emailResponse = await supabaseClient.functions.invoke('send-smtp-email', {
      body: {
        to: customer.email,
        subject: subject,
        html: emailHtml
      }
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    logStep('Email sent successfully', { 
      to: customer.email,
      type: email_type,
      sentBy: userId
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent successfully',
        email_type,
        recipient: customer.email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    logStep('ERROR', { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
