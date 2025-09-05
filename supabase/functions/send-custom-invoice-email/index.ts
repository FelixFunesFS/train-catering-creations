import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  invoice_id?: string;
  preview_only?: boolean;
  custom_subject?: string;
  custom_message?: string;
  estimate_data?: any;
  quote_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      invoice_id, 
      preview_only = false, 
      custom_subject, 
      custom_message,
      estimate_data,
      quote_data 
    }: EmailRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let estimateDetails = estimate_data;
    let quoteDetails = quote_data;

    // If no estimate_data provided, fetch from database
    if (!estimateDetails && invoice_id) {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name, email, phone),
          quote_requests (event_name, event_date, location, guest_count, event_type)
        `)
        .eq('id', invoice_id)
        .single();

      if (invoiceError) {
        console.error('Error fetching invoice:', invoiceError);
        throw invoiceError;
      }

      estimateDetails = invoiceData;

      // Fetch line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoice_id)
        .order('created_at', { ascending: true });

      if (lineItemsError) {
        console.error('Error fetching line items:', lineItemsError);
        throw lineItemsError;
      }

      estimateDetails.line_items = lineItems || [];
    }

    // Generate email HTML
    const emailHtml = generateEstimateEmailHtml(estimateDetails, quoteDetails, custom_subject, custom_message);

    if (preview_only) {
      return new Response(
        JSON.stringify({ html: emailHtml }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          },
        }
      );
    }

    // Send email via Gmail integration
    const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: estimateDetails.customer_email || estimateDetails.customers?.email,
        subject: custom_subject || `Your Estimate - Soul Train's Eatery`,
        html: emailHtml,
        from: 'Soul Train\'s Eatery <soultrainseatery@gmail.com>'
      }
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    // Update invoice status if not preview
    if (invoice_id) {
      await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          workflow_status: 'sent' 
        })
        .eq('id', invoice_id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );

  } catch (error) {
    console.error('Error in send-custom-invoice-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
});

function generateEstimateEmailHtml(estimate: any, quote: any, customSubject?: string, customMessage?: string): string {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const customerName = estimate.customer_name || estimate.customers?.name || 'Valued Customer';
  const customerEmail = estimate.customer_email || estimate.customers?.email || '';
  const eventName = estimate.event_details?.name || estimate.quote_requests?.event_name || quote?.event_name || 'Your Event';
  const eventDate = estimate.event_details?.date || estimate.quote_requests?.event_date || quote?.event_date || '';
  const eventLocation = estimate.event_details?.location || estimate.quote_requests?.location || quote?.location || '';
  const guestCount = estimate.event_details?.guest_count || estimate.quote_requests?.guest_count || quote?.guest_count || 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${customSubject || `Your ${eventName} Estimate - Soul Train's Eatery`}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; }
    .header { background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 5px 0 0 0; font-size: 16px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .message-section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513; }
    .event-details { background: #fff; border: 2px solid #8B4513; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .event-details h3 { color: #8B4513; margin-top: 0; border-bottom: 2px solid #8B4513; padding-bottom: 8px; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .detail-label { font-weight: bold; color: #666; }
    .line-items { margin: 20px 0; }
    .line-items h3 { color: #8B4513; border-bottom: 2px solid #8B4513; padding-bottom: 8px; }
    .line-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee; }
    .line-item:last-child { border-bottom: none; }
    .item-details { flex: 1; }
    .item-title { font-weight: bold; margin-bottom: 4px; }
    .item-description { color: #666; font-size: 14px; margin-bottom: 4px; }
    .item-quantity { color: #888; font-size: 14px; }
    .item-price { font-weight: bold; color: #8B4513; min-width: 80px; text-align: right; }
    .totals { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .total-row.final { font-size: 18px; font-weight: bold; color: #8B4513; border-top: 2px solid #8B4513; padding-top: 12px; margin-top: 12px; }
    .footer { background: #f0f8ff; padding: 20px; text-align: center; border-top: 3px solid #8B4513; }
    .contact-info { margin: 10px 0; }
    .contact-info strong { color: #8B4513; }
    @media (max-width: 600px) {
      .detail-row, .total-row, .line-item { flex-direction: column; }
      .item-price { text-align: left; margin-top: 8px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Soul Train's Eatery</h1>
      <p>Authentic Southern Catering • Charleston's Lowcountry</p>
    </div>

    <div class="content">
      <h2 style="color: #8B4513; margin-bottom: 20px;">Estimate for ${eventName}</h2>

      <div class="message-section">
        <div style="white-space: pre-line; line-height: 1.6;">
${customMessage || `Dear ${customerName},

Thank you for considering Soul Train's Eatery for your upcoming ${eventName}. We're excited to be part of your special day!

Please review the estimate below for catering services. We've carefully crafted a menu that will bring authentic Southern flavors to your celebration.

If you have any questions or would like to make adjustments, please don't hesitate to reach out. We're here to make your event memorable.

Best regards,
Soul Train's Eatery Team`}
        </div>
      </div>

      <div class="event-details">
        <h3>Event Details</h3>
        ${eventDate ? `<div class="detail-row"><span class="detail-label">Date:</span> <span>${formatDate(eventDate)}</span></div>` : ''}
        ${eventLocation ? `<div class="detail-row"><span class="detail-label">Location:</span> <span>${eventLocation}</span></div>` : ''}
        ${guestCount ? `<div class="detail-row"><span class="detail-label">Expected Guests:</span> <span>${guestCount}</span></div>` : ''}
        <div class="detail-row"><span class="detail-label">Customer:</span> <span>${customerName}</span></div>
        ${customerEmail ? `<div class="detail-row"><span class="detail-label">Email:</span> <span>${customerEmail}</span></div>` : ''}
      </div>

      <div class="line-items">
        <h3>Services & Items</h3>
        ${(estimate.line_items || []).map((item: any) => `
          <div class="line-item">
            <div class="item-details">
              <div class="item-title">${item.title}</div>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
              <div class="item-quantity">${item.quantity} × ${formatCurrency(item.unit_price)}</div>
            </div>
            <div class="item-price">${formatCurrency(item.total_price)}</div>
          </div>
        `).join('')}
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(estimate.subtotal || 0)}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>${formatCurrency(estimate.tax_amount || 0)}</span>
        </div>
        <div class="total-row final">
          <span>Total Amount:</span>
          <span>${formatCurrency(estimate.total_amount || 0)}</span>
        </div>
        ${estimate.deposit_required && estimate.deposit_required > 0 ? `
        <div class="total-row" style="color: #666; font-size: 14px; margin-top: 10px;">
          <span>Deposit Required:</span>
          <span>${formatCurrency(estimate.deposit_required)}</span>
        </div>
        ` : ''}
      </div>

      ${estimate.notes ? `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #8B4513; margin-top: 0;">Additional Notes</h4>
        <p style="margin: 0;">${estimate.notes}</p>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <h3 style="color: #8B4513; margin-top: 0;">Ready to Move Forward?</h3>
      <div class="contact-info">
        <strong>Phone:</strong> (843) 970-0265
      </div>
      <div class="contact-info">
        <strong>Email:</strong> soultrainseatery@gmail.com
      </div>
      <p style="margin-top: 15px; color: #666; font-size: 14px;">
        Proudly serving Charleston's Lowcountry and surrounding areas
      </p>
    </div>
  </div>
</body>
</html>
  `;
}