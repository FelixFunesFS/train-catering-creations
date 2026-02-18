/**
 * SYNC: Customer Portal Emails
 * 
 * This edge function sends customer-facing emails using the shared getEmailContentBlocks() helper.
 * Settings preview and actual emails now use the SAME content generator.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  generateStandardEmail,
  EMAIL_CONFIGS,
  getEmailContentBlocks,
  generateTrackingPixel,
  type EmailType
} from '../_shared/emailTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalEmailRequest {
  quote_request_id: string;
  type: 'welcome' | 'estimate_ready' | 'payment_reminder' | 'payment_confirmation' | 'approval_confirmation';
  preview_only?: boolean;
  override_email?: string;
  metadata?: {
    amount?: number;
    payment_type?: string;
    is_full_payment?: boolean;
    first_milestone_amount?: number;
    first_milestone_due?: string;
    milestones?: any[];
  };
}

// Map portal email types to EmailType
function mapTypeToEmailType(type: string): EmailType {
  const typeMap: Record<string, EmailType> = {
    'welcome': 'quote_confirmation',
    'estimate_ready': 'estimate_ready',
    'payment_reminder': 'payment_reminder',
    'payment_confirmation': 'payment_received',
    'approval_confirmation': 'approval_confirmation',
  };
  return typeMap[type] || 'quote_confirmation';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_request_id, type, preview_only = false, override_email, metadata }: PortalEmailRequest = await req.json();

    if (!quote_request_id || !type) {
      throw new Error('Missing required fields: quote_request_id, type');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch quote request details
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote_request_id)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote request not found: ${quote_request_id}`);
    }

    // Fetch invoice with line items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        customer_access_token,
        invoice_number,
        total_amount,
        subtotal,
        tax_amount,
        version,
        invoice_line_items (
          id,
          title,
          description,
          quantity,
          unit_price,
          total_price,
          category,
          sort_order,
          created_at
        )
      `)
      .eq('quote_request_id', quote_request_id)
      .single();
    
    // Sort line items
    if (invoice?.invoice_line_items) {
      invoice.invoice_line_items.sort((a: any, b: any) => {
        const sortOrderA = a.sort_order ?? 999999;
        const sortOrderB = b.sort_order ?? 999999;
        if (sortOrderA !== sortOrderB) return sortOrderA - sortOrderB;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    }

    if (invoiceError || !invoice?.customer_access_token) {
      throw new Error('Invoice or access token not found for this quote request');
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://www.soultrainseatery.com';
    const portalUrl = `${siteUrl}/estimate?token=${invoice.customer_access_token}`;
    const lineItems = invoice.invoice_line_items || [];
    
    console.log(`Generated portal URL: ${portalUrl}`);

    // Map type to EmailType
    const emailType = mapTypeToEmailType(type);
    const config = EMAIL_CONFIGS[emailType];
    const variantConfig = config?.customer;

    if (!variantConfig) {
      throw new Error(`No customer template defined for ${emailType}`);
    }

    // Fetch milestones when needed for customer-facing schedule previews
    let milestones: any[] = [];
    if (type === 'approval_confirmation' || type === 'estimate_ready' || type === 'payment_reminder' || type === 'payment_confirmation') {
      const { data: milestonesData } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('due_date', { ascending: true });
      milestones = milestonesData || [];
    }

    // Fetch actual payment totals for payment reminders
    let totalPaid = 0;
    if (type === 'payment_reminder' || type === 'payment_confirmation') {
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('invoice_id', invoice.id)
        .eq('status', 'completed');
      totalPaid = (payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
    }

    // Build context for content blocks
    const isUpdated = (invoice.version || 1) > 1;
    const { amount, is_full_payment } = metadata || {};

    // Use shared getEmailContentBlocks helper - SINGLE SOURCE OF TRUTH
    const { contentBlocks, ctaButton } = getEmailContentBlocks(emailType, 'customer', {
      quote,
      invoice,
      lineItems,
      milestones,
      portalUrl,
      isUpdated,
      paymentAmount: amount,
      isFullPayment: is_full_payment,
      totalPaid,
    } as any);

    // Generate email using standard generator
    let htmlContent = generateStandardEmail({
      preheaderText: variantConfig.preheaderText,
      heroSection: {
        ...variantConfig.heroSection,
        title: isUpdated && emailType === 'estimate_ready'
          ? 'Updated Estimate Ready'
          : variantConfig.heroSection.title,
        subtitle: emailType === 'estimate_ready'
          ? (isUpdated ? 'Please review your updated estimate' : 'Please review your estimate')
          : variantConfig.heroSection.subtitle
      },
      contentBlocks,
      ctaButton,
      quote,
      invoice,
      lineItems,
    });

    // Add tracking pixel for estimate emails
    if (emailType === 'estimate_ready') {
      htmlContent += generateTrackingPixel(invoice.id, 'estimate_ready');
    }

    // Build subject line
    const subjectMap: Record<string, string> = {
      'quote_confirmation': `Welcome to Soul Train's Eatery - Access Your Event Details`,
      'estimate_ready': `Your Catering Estimate is Ready - ${quote.event_name}`,
      'payment_reminder': `Payment Due - ${invoice.invoice_number || 'Invoice'} - ${quote.event_name}`,
      'payment_received': is_full_payment
        ? `[CONFIRMED] Payment Received - Your Event is Secured!`
        : metadata?.payment_type === 'deposit'
          ? `[PAYMENT] Deposit Received - ${quote.event_name}`
          : `[PAYMENT] Payment Received - ${quote.event_name}`,
      'approval_confirmation': `[APPROVED] Estimate Approved - Next Steps for ${quote.event_name}`,
    };
    const subject = subjectMap[emailType] || variantConfig.heroSection.title;

    if (preview_only) {
      console.log('Returning email preview HTML');
      return new Response(JSON.stringify({ 
        success: true,
        html: htmlContent,
        subject,
        email: quote.email
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const recipientEmail = override_email || quote.email;
    console.log(`Sending email to: ${recipientEmail}${override_email ? ' (override)' : ''}`);

    const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
      body: { to: recipientEmail, subject, html: htmlContent }
    });

    if (emailError) throw emailError;

    console.log(`Customer portal email sent successfully to ${recipientEmail}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `${type} email sent successfully`,
      email: quote.email,
      accessToken: invoice.customer_access_token
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-customer-portal-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
