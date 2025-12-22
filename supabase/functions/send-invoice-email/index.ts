import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  generateStandardEmail,
  EMAIL_CONFIGS,
  type StandardEmailConfig,
  type ContentBlock,
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
    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
    const portalUrl = `${siteUrl}/estimate?token=${invoice.customer_access_token}`;
    
    // Get hero config from EMAIL_CONFIGS
    const heroConfig = isEstimate 
      ? EMAIL_CONFIGS.estimate_ready.customer?.heroSection
      : { badge: '📄 INVOICE READY', title: 'Invoice Ready for Payment', subtitle: 'Your invoice is ready', variant: 'gold' as const };
    
    // Build content blocks
    const contentBlocks: ContentBlock[] = [
      { 
        type: 'text', 
        data: { 
          html: `
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              Dear ${safeCustomerName},
            </p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#333;">
              ${isEstimate 
                ? `Great news! Your personalized catering estimate for <strong>${safeEventName}</strong> is ready for review.`
                : `Your invoice for <strong>${safeEventName}</strong> is ready for payment.`
              }
            </p>
          `
        }
      },
      { type: 'event_details' },
      { type: 'menu_with_pricing' },
    ];

    // Build email using generateStandardEmail
    const emailConfig: StandardEmailConfig = {
      preheaderText: isEstimate 
        ? `Your catering estimate for ${safeEventName} is ready` 
        : `Invoice ready for ${safeEventName}`,
      heroSection: heroConfig!,
      contentBlocks,
      ctaButton: isEstimate 
        ? { text: '✅ Review & Approve Estimate', href: `${portalUrl}&action=approve`, variant: 'primary' }
        : { text: '💳 View Invoice & Pay', href: portalUrl, variant: 'primary' },
      quote: invoice.quote_requests,
      invoice: invoice,
      lineItems: lineItems,
    };

    const emailHtml = generateStandardEmail(emailConfig);
    
    // Send email via SMTP
    const emailBody = {
      to: invoice.customers?.email,
      subject: `Your ${documentType} from Soul Train's Eatery - ${safeEventName}`,
      html: emailHtml
    };

    console.log('Sending email to:', invoice.customers?.email);

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: emailBody
    });

    if (emailError) {
      console.error('Email sending failed:', emailError);
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
          workflow_status: 'estimated',
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