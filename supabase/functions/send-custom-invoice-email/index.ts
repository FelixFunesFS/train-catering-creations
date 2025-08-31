import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SendCustomInvoiceEmailRequest {
  invoice_id: string;
  custom_subject?: string;
  custom_message?: string;
  email_html?: string;
  preview_only?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      invoice_id, 
      custom_subject, 
      custom_message, 
      email_html,
      preview_only = false
    }: SendCustomInvoiceEmailRequest = await req.json();
    
    console.log('Sending custom invoice email for:', invoice_id);

    // If not preview_only, check Gmail tokens are configured
    if (!preview_only) {
      const { data: gmailTokens, error: tokenError } = await supabase
        .from('gmail_tokens')
        .select('email')
        .limit(1);

      if (tokenError || !gmailTokens || gmailTokens.length === 0) {
        console.error('Gmail tokens not configured:', tokenError);
        throw new Error('Gmail integration not configured. Please set up Gmail OAuth first.');
      }

      console.log('Gmail tokens found, proceeding with custom email send');
    }

    // Get invoice with customer details and line items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customers!customer_id(*),
        quote_requests!quote_request_id(*)
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Get invoice line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoice_id)
      .order('created_at');

    if (lineItemsError) {
      console.warn('Could not fetch line items:', lineItemsError);
    }

    // Determine if this is an estimate or invoice based on current status
    const isEstimate = invoice.status === 'draft' || invoice.status === 'estimate' || invoice.status === 'revised';
    const documentType = isEstimate ? 'estimate' : 'invoice';
    
    // Use custom content if provided, otherwise use default
    const emailSubject = custom_subject || `Your ${documentType} from Soul Train's Eatery - ${invoice.quote_requests?.event_name}`;
    const emailHTML = email_html || generateDefaultEmailHTML(invoice, documentType, custom_message, lineItems || []);
    
    // If preview_only, return the HTML without sending
    if (preview_only) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          html: emailHTML,
          message: 'Email HTML generated successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }
    
    // Send email via Gmail API
    const emailBody = {
      to: invoice.customers?.email,
      subject: emailSubject,
      html: emailHTML
    };

    // Send via Gmail API
    const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: emailBody
    });

    if (emailError) {
      console.error('Email sending failed:', emailError);
      throw new Error('Failed to send email: ' + emailError.message);
    }

    // Update invoice status and tracking
    const updateData: any = {
      sent_at: new Date().toISOString(),
      is_draft: false
    };

    // Set appropriate status based on current state
    if (invoice.status === 'draft') {
      updateData.status = 'sent';
      updateData.workflow_status = 'sent';
    } else if (invoice.status === 'revised') {
      updateData.status = 'sent';
      updateData.workflow_status = 'sent';
    } else {
      updateData.workflow_status = 'sent';
    }

    await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoice_id);

    // Update quote status if applicable
    if (invoice.quote_request_id) {
      await supabase
        .from('quote_requests')
        .update({ 
          workflow_status: 'awaiting_approval',
          invoice_status: 'sent'
        })
        .eq('id', invoice.quote_request_id);
    }

    // Log email activity
    await supabase
      .from('workflow_state_log')
      .insert({
        entity_type: 'invoice',
        entity_id: invoice_id,
        previous_status: invoice.status,
        new_status: updateData.status || invoice.status,
        changed_by: 'system',
        change_reason: `Custom ${documentType} email sent to ${invoice.customers?.email}`
      });

    console.log(`Custom ${documentType} email sent successfully for:`, invoice_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent to ${invoice.customers?.email}`,
        sent_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending custom invoice email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

function generateDefaultEmailHTML(invoice: any, documentType: string, customMessage?: string, lineItems: any[] = []): string {
  // Fix the URL to point to the Lovable app domain instead of Supabase
  const baseUrl = 'https://qptprrqjlcvfkhfdnnoa.lovable.app';
  const previewUrl = `${baseUrl}/estimate-preview/${invoice.id}`;
  const isEstimate = documentType === 'estimate';
  
  const defaultMessage = customMessage || `Dear ${invoice.customers?.name || invoice.quote_requests?.contact_name},

Thank you for choosing Soul Train's Eatery for your upcoming event!

Please find your ${documentType} attached. Here are the details for your ${invoice.quote_requests?.event_name}.

${isEstimate ? 
'Please review the estimate and let us know if you\'d like to proceed. You can approve this estimate by clicking the link below:' :
'Your invoice is ready for payment. You can view and pay online using the link below:'}

If you have any questions, please don't hesitate to contact us.

Best regards,
The Soul Train's Eatery Team`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Soul Train's Eatery</h2>
      <p>${defaultMessage.replace(/\n/g, '<br>')}</p>
      
      <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin: 0 0 8px 0;">Event Details</h3>
        <p><strong>Event:</strong> ${invoice.quote_requests?.event_name}</p>
        <p><strong>Date:</strong> ${invoice.quote_requests?.event_date}</p>
        ${invoice.quote_requests?.start_time ? `<p><strong>Start Time:</strong> ${formatTime(invoice.quote_requests.start_time)}</p>` : ''}
        ${invoice.quote_requests?.serving_start_time ? `<p><strong>Serving Time:</strong> ${formatTime(invoice.quote_requests.serving_start_time)}</p>` : ''}
        <p><strong>Location:</strong> ${invoice.quote_requests?.location}</p>
        <p><strong>Guest Count:</strong> ${invoice.quote_requests?.guest_count || 'TBD'}</p>
        <p><strong>Total Amount:</strong> $${(invoice.total_amount / 100).toFixed(2)}</p>
      </div>
      
      ${lineItems.length > 0 ? `
      <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin: 0 0 12px 0;">Catering Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 8px; font-weight: 600;">Item</th>
              <th style="text-align: center; padding: 8px; font-weight: 600;">Qty</th>
              <th style="text-align: right; padding: 8px; font-weight: 600;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px;">
                  <strong>${item.title}</strong>
                  ${item.description ? `<br><small style="color: #6b7280;">${item.description}</small>` : ''}
                </td>
                <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                <td style="text-align: right; padding: 8px;">$${(item.total_price / 100).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="border-top: 2px solid #e5e7eb;">
              <td colspan="2" style="padding: 8px; font-weight: 600;">Subtotal:</td>
              <td style="text-align: right; padding: 8px; font-weight: 600;">$${(invoice.subtotal / 100).toFixed(2)}</td>
            </tr>
            ${invoice.tax_amount > 0 ? `
            <tr>
              <td colspan="2" style="padding: 8px;">Tax:</td>
              <td style="text-align: right; padding: 8px;">$${(invoice.tax_amount / 100).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr style="background-color: #f9fafb;">
              <td colspan="2" style="padding: 12px; font-weight: 700; font-size: 16px;">Total:</td>
              <td style="text-align: right; padding: 12px; font-weight: 700; font-size: 16px;">$${(invoice.total_amount / 100).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <p><a href="${previewUrl}" style="background-color: ${isEstimate ? '#16a34a' : '#2563eb'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        ${isEstimate ? `Review & Approve ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}` : `View ${documentType.charAt(0).toUpperCase() + documentType.slice(1)} & Pay`}
      </a></p>
      
      <p>📞 (843) 970-0265<br>
      📧 soultrainseatery@gmail.com</p>
      
      <p>We look forward to making your event memorable!</p>
    </div>
  `;
}

function formatTime(timeString: string): string {
  try {
    // Handle time in HH:MM format
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return timeString; // Return original if parsing fails
  }
}

serve(handler);