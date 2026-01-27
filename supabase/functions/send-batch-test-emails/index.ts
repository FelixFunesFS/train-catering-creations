import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  generateStandardEmail, 
  EMAIL_CONFIGS, 
  EmailType, 
  getEmailContentBlocks,
  formatCurrency
} from '../_shared/emailTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchTestEmailRequest {
  invoiceId: string;
  targetEmail: string;
  delayMs?: number;
  typesToSend?: EmailType[];
}

interface EmailResult {
  type: EmailType;
  variant: 'customer' | 'admin';
  status: 'sent' | 'skipped' | 'error';
  subject?: string;
  error?: string;
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: BatchTestEmailRequest = await req.json();
    const { invoiceId, targetEmail, delayMs = 2000, typesToSend } = body;

    if (!invoiceId || !targetEmail) {
      throw new Error('Missing required fields: invoiceId and targetEmail');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`[BATCH-TEST] Starting batch email test for invoice: ${invoiceId}`);
    console.log(`[BATCH-TEST] Target email: ${targetEmail}`);
    console.log(`[BATCH-TEST] Delay between emails: ${delayMs}ms`);

    // 1. Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    console.log(`[BATCH-TEST] Found invoice: ${invoice.invoice_number}`);

    // 2. Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', invoice.quote_request_id)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found for invoice: ${invoiceId}`);
    }

    console.log(`[BATCH-TEST] Found quote: ${quote.event_name} (${quote.contact_name})`);

    // 3. Fetch line items
    const { data: lineItems } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true });

    console.log(`[BATCH-TEST] Found ${lineItems?.length || 0} line items`);

    // 4. Fetch milestones
    const { data: milestones } = await supabase
      .from('payment_milestones')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('due_date', { ascending: true });

    console.log(`[BATCH-TEST] Found ${milestones?.length || 0} payment milestones`);

    // Build portal URL
    const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';
    const portalUrl = `${siteUrl}/estimate?token=${invoice.customer_access_token}`;

    // Email context
    const emailContext = {
      quote,
      invoice,
      lineItems: lineItems || [],
      milestones: milestones || [],
      portalUrl,
      isUpdated: false,
      paymentAmount: milestones?.[0]?.amount_cents || Math.round(invoice.total_amount * 0.5),
      isFullPayment: false,
    };

    // All email types to send
    const allTypes: EmailType[] = typesToSend || [
      'quote_received',
      'quote_confirmation', 
      'estimate_ready',
      'estimate_reminder',
      'approval_confirmation',
      'payment_received',
      'payment_reminder',
      'event_reminder',
      'change_request_submitted',
      'change_request_response',
      'admin_notification',
      'event_followup'
    ];

    const results: EmailResult[] = [];
    let emailNumber = 0;

    // Count total emails to send
    let totalEmails = 0;
    for (const emailType of allTypes) {
      const config = EMAIL_CONFIGS[emailType];
      if (config?.customer) totalEmails++;
      if (config?.admin) totalEmails++;
    }

    console.log(`[BATCH-TEST] Will send ${totalEmails} emails`);

    // Send each email type
    for (const emailType of allTypes) {
      const config = EMAIL_CONFIGS[emailType];
      
      if (!config) {
        console.warn(`[BATCH-TEST] No config for email type: ${emailType}`);
        continue;
      }

      // Send customer variant if exists
      if (config.customer) {
        emailNumber++;
        const subject = `[TEST ${emailNumber}/${totalEmails}] ${config.customer.heroSection.title} - ${quote.event_name}`;
        
        try {
          const { contentBlocks, ctaButton } = getEmailContentBlocks(emailType, 'customer', emailContext);
          
          const emailHtml = generateStandardEmail({
            preheaderText: config.customer.preheaderText,
            heroSection: config.customer.heroSection,
            contentBlocks,
            ctaButton: ctaButton || undefined,
            quote,
            invoice,
            lineItems: lineItems || [],
          });

          // Send via SMTP
          const { error: sendError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: targetEmail,
              subject,
              html: emailHtml,
              from: 'soultrainseatery@gmail.com',
              emailType: `test_${emailType}_customer`,
              invoiceId: invoice.id,
            }
          });

          if (sendError) throw sendError;

          console.log(`[BATCH-TEST] ✅ Sent ${emailNumber}/${totalEmails}: ${emailType} (customer)`);
          results.push({ type: emailType, variant: 'customer', status: 'sent', subject });
          
          await delay(delayMs);
        } catch (err: any) {
          console.error(`[BATCH-TEST] ❌ Failed ${emailType} (customer):`, err.message);
          results.push({ type: emailType, variant: 'customer', status: 'error', error: err.message });
        }
      }

      // Send admin variant if exists
      if (config.admin) {
        emailNumber++;
        const subject = `[TEST ${emailNumber}/${totalEmails}] ADMIN: ${config.admin.heroSection.title} - ${quote.event_name}`;
        
        try {
          const { contentBlocks, ctaButton } = getEmailContentBlocks(emailType, 'admin', emailContext);
          
          const emailHtml = generateStandardEmail({
            preheaderText: config.admin.preheaderText,
            heroSection: config.admin.heroSection,
            contentBlocks,
            ctaButton: ctaButton || undefined,
            quote,
            invoice,
            lineItems: lineItems || [],
          });

          // Send via SMTP
          const { error: sendError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: targetEmail,
              subject,
              html: emailHtml,
              from: 'soultrainseatery@gmail.com',
              emailType: `test_${emailType}_admin`,
              invoiceId: invoice.id,
            }
          });

          if (sendError) throw sendError;

          console.log(`[BATCH-TEST] ✅ Sent ${emailNumber}/${totalEmails}: ${emailType} (admin)`);
          results.push({ type: emailType, variant: 'admin', status: 'sent', subject });
          
          await delay(delayMs);
        } catch (err: any) {
          console.error(`[BATCH-TEST] ❌ Failed ${emailType} (admin):`, err.message);
          results.push({ type: emailType, variant: 'admin', status: 'error', error: err.message });
        }
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`[BATCH-TEST] Complete! Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      invoice_number: invoice.invoice_number,
      event_name: quote.event_name,
      contact_name: quote.contact_name,
      total_amount: formatCurrency(invoice.total_amount),
      target_email: targetEmail,
      emails_sent: sentCount,
      emails_failed: errorCount,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('[BATCH-TEST] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
