import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

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

    // Check if Gmail tokens are configured
    const { data: gmailTokens, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('email')
      .limit(1);

    if (tokenError || !gmailTokens || gmailTokens.length === 0) {
      console.error('Gmail tokens not configured:', tokenError);
      throw new Error('Gmail integration not configured. Please set up Gmail OAuth first.');
    }

    console.log('Gmail tokens found, proceeding with email send');

    // Get invoice with customer details
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

    // Determine if this is an estimate or invoice based on current status
    const isEstimate = invoice.status === 'draft' || invoice.status === 'estimate';
    const documentType = isEstimate ? 'estimate' : 'invoice';
    
    // Send email via Gmail API
    const emailBody = {
      to: invoice.customers?.email,
      subject: `Your ${documentType} from Soul Train's Eatery - ${invoice.quote_requests?.event_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Soul Train's Eatery</h2>
          <p>Dear ${invoice.customers?.name || invoice.quote_requests?.contact_name},</p>
          
          <p>Thank you for choosing Soul Train's Eatery for your upcoming event!</p>
          
          <p>Please find your ${documentType} attached. Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">Event Details</h3>
            <p><strong>Event:</strong> ${invoice.quote_requests?.event_name}</p>
            <p><strong>Date:</strong> ${invoice.quote_requests?.event_date}</p>
            <p><strong>Location:</strong> ${invoice.quote_requests?.location}</p>
            <p><strong>Total Amount:</strong> $${(invoice.total_amount / 100).toFixed(2)}</p>
          </div>
          
          ${isEstimate ? `
            <p>Please review the ${documentType} and let us know if you'd like to proceed. You can approve this ${documentType} by clicking the link below:</p>
            <p><a href="https://qptprrqjlcvfkhfdnnoa.supabase.app/customer/estimate/${invoice.customer_access_token}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review & Approve ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}</a></p>
          ` : `
            <p>Your ${documentType} is ready for payment. You can view and pay online using the link below:</p>
            <p><a href="https://qptprrqjlcvfkhfdnnoa.supabase.app/customer/estimate/${invoice.customer_access_token}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View ${documentType.charAt(0).toUpperCase() + documentType.slice(1)} & Pay</a></p>
          `}
          
          <p>If you have any questions, please don't hesitate to contact us:</p>
          <p>📞 (843) 970-0265<br>
          📧 soultrainseatery@gmail.com</p>
          
          <p>We look forward to making your event memorable!</p>
          
          <p>Best regards,<br>
          The Soul Train's Eatery Team</p>
        </div>
      `
    };

    // Send via Gmail API
    const { error: emailError } = await supabase.functions.invoke('send-gmail-email', {
      body: emailBody
    });

    if (emailError) {
      console.error('Email sending failed:', emailError);
      throw new Error('Failed to send email: ' + emailError.message);
    }

    // Update invoice status
    await supabase
      .from('invoices')
      .update({ 
        sent_at: new Date().toISOString(),
        workflow_status: 'sent',
        status: isEstimate ? 'estimate' : 'sent',
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
        message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent to ${invoice.customers?.email}`,
        sent_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending invoice email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);