import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  EMAIL_STYLES, 
  generateEmailHeader, 
  generateEventDetailsCard,
  generateLineItemsTable,
  generateFooter,
  BRAND_COLORS,
  LOGO_URLS
} from '../_shared/emailTemplates.ts';
import { escapeHtml, createErrorResponse } from '../_shared/security.ts';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SendInvoiceRequest {
  invoice_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id }: SendInvoiceRequest = await req.json();
    
    console.log('Sending invoice email for:', invoice_id);

    console.log('Proceeding with email send via SMTP');


    // Get invoice with line items and customer details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customers!customer_id(*),
        quote_requests!quote_request_id(*),
        invoice_line_items (
          title,
          description,
          quantity,
          unit_price,
          total_price,
          category
        )
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Sanitize user-provided data for HTML embedding
    const safeCustomerName = escapeHtml(invoice.customers?.name || invoice.quote_requests?.contact_name);
    const safeEventName = escapeHtml(invoice.quote_requests?.event_name);

    // Determine if this is an estimate or invoice based on document_type
    const isEstimate = invoice.workflow_status === 'draft' || invoice.document_type === 'estimate';
    const documentType = isEstimate ? 'estimate' : 'invoice';
    
    const lineItems = invoice.invoice_line_items || [];
    const portalUrl = `https://c4c8d2d1-63da-4772-a95b-bf211f87a132.lovableproject.com/estimate?token=${invoice.customer_access_token}`;
    
    // Send email via Gmail API
    const emailBody = {
      to: invoice.customers?.email,
      subject: `Your ${documentType} from Soul Train's Eatery - ${safeEventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}</title>
          <style>${EMAIL_STYLES}</style>
        </head>
        <body>
          <div class="email-container">
            ${isEstimate ? `
              <div style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                <div style="background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
                  <span style="color: ${BRAND_COLORS.darkGray}; font-weight: bold; font-size: 14px;">💰 ESTIMATE READY</span>
                </div>
                <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;">Your Custom Estimate is Ready!</h2>
                <p style="color: white; margin: 0; font-size: 16px; opacity: 0.95;">
                  Hi ${safeCustomerName},<br>
                  Your custom pricing is ready for review
                </p>
              </div>
            ` : `
              <div style="background: linear-gradient(135deg, ${BRAND_COLORS.gold}, ${BRAND_COLORS.goldLight}); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                <div style="background: rgba(220, 20, 60, 0.3); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
                  <span style="color: ${BRAND_COLORS.crimsonDark}; font-weight: bold; font-size: 14px;">📄 INVOICE - PAYMENT DUE</span>
                </div>
                <h2 style="color: ${BRAND_COLORS.crimsonDark}; margin: 0 0 10px 0; font-size: 24px;">Your Invoice is Ready!</h2>
                <p style="color: ${BRAND_COLORS.darkGray}; margin: 0; font-size: 16px;">
                  Hi ${safeCustomerName},<br>
                  Your invoice is ready for payment
                </p>
              </div>
            `}
            
            <div class="content">
              <h2 style="color: ${BRAND_COLORS.crimson};">Dear ${safeCustomerName},</h2>
              
              <p>Thank you for choosing Soul Train's Eatery for your upcoming event!</p>
              
              ${generateEventDetailsCard(invoice.quote_requests)}
              
              ${lineItems.length > 0 ? generateLineItemsTable(lineItems, invoice.subtotal, invoice.tax_amount || 0, invoice.total_amount) : ''}
              
              ${isEstimate ? `
                <div style="background: #fff3cd; border: 1px solid ${BRAND_COLORS.gold}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.crimson};">⏰ Action Required</h3>
                  <p style="margin: 0;">Please review and approve your estimate to secure your event date.</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${portalUrl}&action=approve" class="btn btn-primary">✅ Review & Approve ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}</a>
                </div>
              ` : `
                <div style="background: #d1fae5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #065f46;">💳 Payment Ready</h3>
                  <p style="margin: 0;">Your ${documentType} is ready for payment. Click below to view and pay online.</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${portalUrl}" class="btn btn-primary" style="background: #10b981;">View ${documentType.charAt(0).toUpperCase() + documentType.slice(1)} & Pay</a>
                </div>
              `}
          
          <p style="margin:16px 0;line-height:1.6;">We look forward to making your event memorable!</p>
          <p style="margin:16px 0;">Best regards,<br/>The Soul Train's Eatery Team</p>
        </div>
        ${generateFooter()}
      </div>
    </body>
    </html>
      `
    };

    // Send via Gmail API
    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: emailBody
    });

    if (emailError) {
      console.error('Email sending failed');
      throw new Error('Failed to send email');
    }

    // Update invoice status
    await supabase
      .from('invoices')
      .update({ 
        sent_at: new Date().toISOString(),
        workflow_status: 'sent',
        is_draft: false
      })
      .eq('id', invoice_id);

    // Update quote status
    if (invoice.quote_request_id) {
      await supabase
        .from('quote_requests')
        .update({ 
          workflow_status: 'awaiting_approval',
          invoice_status: 'sent'
        })
        .eq('id', invoice.quote_request_id);
    }

    console.log(`${documentType} email sent successfully for:`, invoice_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent successfully`,
        sent_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return createErrorResponse(error, 'send-invoice-email', corsHeaders);
  }
};

serve(handler);
