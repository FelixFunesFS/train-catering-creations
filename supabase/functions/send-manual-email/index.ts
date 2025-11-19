import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
          guest_count
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

    // Generate email content based on type
    let subject = '';
    let emailContent = '';

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    switch (email_type) {
      case 'estimate_sent':
        subject = `Your Catering Estimate - ${quote?.event_name || 'Event'}`;
        emailContent = `
          <h2>Your Catering Estimate from Soul Train's Eatery</h2>
          <p>Dear ${customer.name},</p>
          <p>Thank you for choosing Soul Train's Eatery for your upcoming event. Please find your catering estimate attached.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${quote?.event_name}</p>
            <p><strong>Date:</strong> ${new Date(quote?.event_date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${quote?.location}</p>
            <p><strong>Guest Count:</strong> ${quote?.guest_count}</p>
            <p><strong>Total Estimate:</strong> ${formatCurrency(invoiceData.total_amount)}</p>
          </div>
          
          <p>Please review the estimate and let us know if you have any questions or would like to make any changes.</p>
          
          ${custom_message ? `<div style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 20px 0;"><p><strong>Additional Message:</strong></p><p>${custom_message}</p></div>` : ''}
          
          <p>We look forward to making your event memorable!</p>
          <p>Best regards,<br>Soul Train's Eatery Team<br>(843) 970-0265</p>
        `;
        break;

      case 'payment_reminder':
        subject = `Payment Reminder - ${quote?.event_name || 'Event'}`;
        emailContent = `
          <h2>Payment Reminder - Soul Train's Eatery</h2>
          <p>Dear ${customer.name},</p>
          <p>This is a friendly reminder that payment is due for your upcoming catering event.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${quote?.event_name}</p>
            <p><strong>Date:</strong> ${new Date(quote?.event_date).toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> ${formatCurrency(invoiceData.total_amount)}</p>
            <p><strong>Invoice #:</strong> ${invoiceData.invoice_number}</p>
          </div>
          
          ${custom_message ? `<div style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 20px 0;"><p><strong>Additional Message:</strong></p><p>${custom_message}</p></div>` : ''}
          
          <p>Please contact us at (843) 970-0265 if you have any questions about your payment.</p>
          <p>Thank you for choosing Soul Train's Eatery!</p>
          <p>Best regards,<br>Soul Train's Eatery Team</p>
        `;
        break;

      case 'follow_up':
        subject = `Following Up - ${quote?.event_name || 'Event'}`;
        emailContent = `
          <h2>Following Up on Your Catering Request</h2>
          <p>Dear ${customer.name},</p>
          <p>We wanted to follow up on your catering estimate for ${quote?.event_name}.</p>
          
          ${custom_message ? `<div style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 20px 0;"><p>${custom_message}</p></div>` : ''}
          
          <p>If you have any questions or would like to make changes to your estimate, please don't hesitate to reach out.</p>
          <p>We're here to help make your event perfect!</p>
          <p>Best regards,<br>Soul Train's Eatery Team<br>(843) 970-0265</p>
        `;
        break;

      default:
        throw new Error('Invalid email type');
    }

    // Send email using the existing gmail function
    const emailResponse = await supabaseClient.functions.invoke('send-gmail-email', {
      body: {
        to: customer.email,
        subject: subject,
        html: emailContent
      }
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    logStep('Email sent successfully', { 
      to: customer.email,
      type: email_type,
      messageId: emailResponse.data?.messageId 
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