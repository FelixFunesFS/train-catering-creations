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
          customers!customer_id (name, email, phone),
          quote_requests!quote_request_id (event_name, event_date, location, guest_count, event_type, email, contact_name, phone)
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

    // Validate customer email exists - prioritize quote_requests.email
    const customerEmail = estimateDetails.quote_requests?.email || 
                         estimateDetails.customers?.email;
    
    if (!customerEmail) {
      console.error('No customer email found. Invoice data:', {
        has_quote_requests: !!estimateDetails.quote_requests,
        has_customers: !!estimateDetails.customers,
        quote_request_id: estimateDetails.quote_request_id
      });
      throw new Error('Customer email not found in quote request. Cannot send estimate.');
    }

    console.log(`Attempting to send email to: ${customerEmail}`);

    // Send email via Gmail (primary method)
    let emailData;
    let emailError;
    
    try {
      const gmailResponse = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: customerEmail,
          subject: custom_subject || `Your Estimate - Soul Train's Eatery`,
          html: emailHtml,
          from: 'soultrainseatery@gmail.com'
        }
      });
      
      emailData = gmailResponse.data;
      emailError = gmailResponse.error;
      
      if (!emailError) {
        console.log('Email sent successfully via Gmail:', emailData);
      } else {
        throw emailError;
      }
    } catch (gmailErr: any) {
      console.error('Gmail integration failed:', gmailErr);
      
      // Provide specific error messages based on the type of Gmail error
      let errorMessage = 'Failed to send email via Gmail. ';
      
      if (gmailErr?.message?.includes('No Gmail tokens found') || 
          gmailErr?.message?.includes('Gmail authentication has expired')) {
        errorMessage += 'Gmail authentication needs to be renewed. Please visit the Test Email page (/test-email) and click "Authorize Gmail Access" to re-authenticate.';
      } else if (gmailErr?.message?.includes('Token has been expired or revoked')) {
        errorMessage += 'Gmail tokens have expired or been revoked. Please re-authenticate by visiting /test-email and authorizing Gmail access again.';
      } else {
        errorMessage += 'Please check Gmail authentication or contact support.';
      }
      
      throw new Error(errorMessage);
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
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

  const formatServiceType = (serviceType: string) => {
    const types: Record<string, string> = {
      'full-service': 'Full Service Catering',
      'delivery-setup': 'Delivery with Setup',
      'drop-off': 'Drop Off Delivery'
    };
    return types[serviceType] || 'Catering Service';
  };

  const formatArray = (arr: string[] | undefined) => {
    if (!arr || !Array.isArray(arr)) return "None selected";
    return arr.length > 0 ? arr.map(item => item.replace(/-/g, ' ')).join(", ") : "None selected";
  };

  const customerName = estimate.customer_name || estimate.customers?.name || 'Valued Customer';
  const customerEmail = estimate.customer_email || estimate.customers?.email || '';
  const eventName = estimate.event_details?.name || estimate.quote_requests?.event_name || quote?.event_name || 'Your Event';
  const eventDate = estimate.event_details?.date || estimate.quote_requests?.event_date || quote?.event_date || '';
  const eventLocation = estimate.event_details?.location || estimate.quote_requests?.location || quote?.location || '';
  const guestCount = estimate.event_details?.guest_count || estimate.quote_requests?.guest_count || quote?.guest_count || 0;

  // Get comprehensive quote data for complete service details
  const serviceDetails = quote || estimate.quote_requests || {};
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${customSubject || `Your ${eventName} Estimate - Soul Train's Eatery`}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fafafa; }
    .container { max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 0; }
    .header { background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 5px 0 0 0; font-size: 16px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .message-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC143C; }
    .event-details { background: #fff; border: 2px solid #DC143C; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .event-details h3 { color: #DC143C; margin-top: 0; border-bottom: 2px solid #DC143C; padding-bottom: 8px; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .detail-label { font-weight: bold; color: #666; }
    .service-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
    .line-items { margin: 20px 0; }
    .line-items h3 { color: #DC143C; border-bottom: 2px solid #DC143C; padding-bottom: 8px; }
    .line-category { background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0; }
    .line-category h4 { color: #DC143C; margin: 0 0 8px 0; font-size: 16px; }
    .line-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #eee; }
    .line-item:last-child { border-bottom: none; }
    .item-details { flex: 1; }
    .item-title { font-weight: bold; margin-bottom: 4px; }
    .item-description { color: #666; font-size: 14px; margin-bottom: 4px; }
    .item-quantity { color: #888; font-size: 14px; }
    .item-price { font-weight: bold; color: #DC143C; min-width: 80px; text-align: right; }
    .totals { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .total-row.final { font-size: 18px; font-weight: bold; color: #DC143C; border-top: 2px solid #DC143C; padding-top: 12px; margin-top: 12px; }
    .footer { background: #fff; padding: 20px; text-align: center; border-top: 3px solid #DC143C; }
    .contact-info { margin: 10px 0; }
    .contact-info strong { color: #DC143C; }
    @media (max-width: 600px) {
      .detail-row, .total-row, .line-item { flex-direction: column; }
      .item-price { text-align: left; margin-top: 8px; }
      .service-grid { grid-template-columns: 1fr; }
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
      <h2 style="color: #DC143C; margin-bottom: 20px;">Estimate for ${eventName}</h2>

      <div class="message-section">
        <div style="white-space: pre-line; line-height: 1.6;">
${customMessage || `Dear ${customerName},

Thank you for considering Soul Train's Eatery for your upcoming ${eventName}. We're excited about the opportunity to cater your special event!

Our family-run business takes pride in bringing people together around exceptional Southern food. Please review the detailed estimate below, which includes all the services and menu items you've requested.

If you have any questions or would like to make adjustments, please don't hesitate to reach out. We're here to make your event memorable and delicious.

Best regards,
Soul Train's Eatery Team`}
        </div>
      </div>

      <div class="event-details">
        <h3>📅 Event Details</h3>
        ${eventDate ? `<div class="detail-row"><span class="detail-label">Date:</span> <span>${formatDate(eventDate)}</span></div>` : ''}
        ${serviceDetails.start_time ? `<div class="detail-row"><span class="detail-label">Start Time:</span> <span>${serviceDetails.start_time}</span></div>` : ''}
        ${eventLocation ? `<div class="detail-row"><span class="detail-label">Location:</span> <span>${eventLocation}</span></div>` : ''}
        ${guestCount ? `<div class="detail-row"><span class="detail-label">Expected Guests:</span> <span>${guestCount}</span></div>` : ''}
        ${serviceDetails.service_type ? `<div class="detail-row"><span class="detail-label">Service Type:</span> <span>${formatServiceType(serviceDetails.service_type)}</span></div>` : ''}
        <div class="detail-row"><span class="detail-label">Customer:</span> <span>${customerName}</span></div>
        ${customerEmail ? `<div class="detail-row"><span class="detail-label">Email:</span> <span>${customerEmail}</span></div>` : ''}
      </div>

      ${serviceDetails.primary_protein || serviceDetails.appetizers?.length > 0 || serviceDetails.sides?.length > 0 ? `
      <div class="event-details">
        <h3>🍽️ Menu Selections</h3>
        ${serviceDetails.primary_protein ? `<div class="detail-row"><span class="detail-label">Primary Protein:</span> <span>${serviceDetails.primary_protein.replace(/-/g, ' ')}</span></div>` : ''}
        ${serviceDetails.secondary_protein ? `<div class="detail-row"><span class="detail-label">Secondary Protein:</span> <span>${serviceDetails.secondary_protein.replace(/-/g, ' ')}</span></div>` : ''}
        ${serviceDetails.appetizers?.length > 0 ? `<div class="detail-row"><span class="detail-label">Appetizers:</span> <span>${formatArray(serviceDetails.appetizers)}</span></div>` : ''}
        ${serviceDetails.sides?.length > 0 ? `<div class="detail-row"><span class="detail-label">Sides:</span> <span>${formatArray(serviceDetails.sides)}</span></div>` : ''}
        ${serviceDetails.desserts?.length > 0 ? `<div class="detail-row"><span class="detail-label">Desserts:</span> <span>${formatArray(serviceDetails.desserts)}</span></div>` : ''}
        ${serviceDetails.drinks?.length > 0 ? `<div class="detail-row"><span class="detail-label">Beverages:</span> <span>${formatArray(serviceDetails.drinks)}</span></div>` : ''}
        ${serviceDetails.dietary_restrictions?.length > 0 ? `<div class="detail-row"><span class="detail-label">Dietary Restrictions:</span> <span>${formatArray(serviceDetails.dietary_restrictions)}</span></div>` : ''}
      </div>
      ` : ''}

      ${serviceDetails.service_type === 'full-service' || serviceDetails.wait_staff_requested || serviceDetails.tables_chairs_requested ? `
      <div class="event-details">
        <h3>⚙️ Service & Equipment Details</h3>
        ${serviceDetails.serving_start_time ? `<div class="detail-row"><span class="detail-label">Serving Time:</span> <span>${serviceDetails.serving_start_time}</span></div>` : ''}
        ${serviceDetails.wait_staff_requested ? `<div class="detail-row"><span class="detail-label">Professional Wait Staff:</span> <span>Yes</span></div>` : ''}
        ${serviceDetails.wait_staff_requirements ? `<div class="detail-row"><span class="detail-label">Staff Requirements:</span> <span>${serviceDetails.wait_staff_requirements}</span></div>` : ''}
        
        <div style="margin-top: 15px;"><strong>Equipment & Services Included:</strong></div>
        <div class="service-grid">
          <div>• Tables & Chairs: ${serviceDetails.tables_chairs_requested ? 'Yes' : 'No'}</div>
          <div>• Linens: ${serviceDetails.linens_requested ? 'Yes' : 'No'}</div>
          <div>• Plates & Utensils: ${serviceDetails.plates_requested ? 'Yes' : 'No'}</div>
          <div>• Cups: ${serviceDetails.cups_requested ? 'Yes' : 'No'}</div>
          <div>• Napkins: ${serviceDetails.napkins_requested ? 'Yes' : 'No'}</div>
          <div>• Serving Utensils: ${serviceDetails.serving_utensils_requested ? 'Yes' : 'No'}</div>
          <div>• Chafing Dishes: ${serviceDetails.chafers_requested ? 'Yes' : 'No'}</div>
          <div>• Ice: ${serviceDetails.ice_requested ? 'Yes' : 'No'}</div>
        </div>
        ${serviceDetails.bussing_tables_needed ? `<div style="margin-top: 10px;"><strong>Table Bussing Service:</strong> Included</div>` : ''}
      </div>
      ` : ''}

      <div class="line-items">
        <h3>💰 Detailed Pricing Breakdown</h3>
        ${(estimate.line_items || []).map((item: any) => {
          const category = item.category || 'other';
          const categoryLabels: Record<string, string> = {
            'meal_bundle': '🍽️ Entree Meals',
            'protein': '🥩 Proteins',
            'appetizer': '🥗 Appetizers',
            'side': '🥄 Side Dishes',
            'dessert': '🍰 Desserts',
            'drink': '🥤 Beverages',
            'service': '⚙️ Service Charges',
            'service_addon': '➕ Additional Services'
          };
          
          return `
          <div class="line-item">
            <div class="item-details">
              <div class="item-title">${categoryLabels[category] || '📋'} ${item.title}</div>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
              <div class="item-quantity">${item.quantity} × ${formatCurrency(item.unit_price)}</div>
            </div>
            <div class="item-price">${formatCurrency(item.total_price)}</div>
          </div>
          `;
        }).join('')}
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(estimate.subtotal || 0)}</span>
        </div>
        <div class="total-row">
          <span>Tax (8.5%):</span>
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

      ${serviceDetails.special_requests ? `
      <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #DC143C; margin-top: 0;">📝 Special Requests</h4>
        <p style="margin: 0;">${serviceDetails.special_requests}</p>
      </div>
      ` : ''}

      ${estimate.notes ? `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #DC143C; margin-top: 0;">Additional Notes</h4>
        <p style="margin: 0;">${estimate.notes}</p>
      </div>
      ` : ''}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <h3 style="color: #DC143C; margin-bottom: 20px;">Ready to Move Forward? 🎉</h3>
      
      <div style="margin: 25px 0;">
        <a href="https://qptprrqjlcvfkhfdnnoa.supabase.co/customer-portal?token=${estimate.customer_access_token}&action=approve" 
           style="display: inline-block; background: linear-gradient(135deg, #DC143C 0%, #B91C3C 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0; box-shadow: 0 4px 6px rgba(220, 20, 60, 0.3);">
          ✅ Approve This Estimate
        </a>
        
        <a href="https://qptprrqjlcvfkhfdnnoa.supabase.co/customer-portal?token=${estimate.customer_access_token}&action=changes" 
           style="display: inline-block; background: white; color: #DC143C; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0; border: 2px solid #DC143C; box-shadow: 0 4px 6px rgba(220, 20, 60, 0.2);">
          📝 Request Changes
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
        Click the buttons above to approve your estimate or request modifications
      </p>
    </div>

    <div class="footer">
      <div class="contact-info">
        <strong>Phone:</strong> (843) 970-0265
      </div>
      <div class="contact-info">
        <strong>Email:</strong> soultrainseatery@gmail.com
      </div>
      <p style="margin-top: 15px; color: #666; font-size: 14px;">
        Proudly serving Charleston's Lowcountry and surrounding areas with authentic Southern hospitality
      </p>
    </div>
  </div>
</body>
</html>
  `;
}