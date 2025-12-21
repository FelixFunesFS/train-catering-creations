import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TOKEN-RENEWAL] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep("Starting token renewal check");

    const results = {
      expiringSoon: 0,
      expired: 0,
      renewed: 0,
      warningsSent: 0,
      errors: [] as string[]
    };

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Find tokens expiring within 7 days
    logStep("Checking for expiring tokens");
    const { data: expiringInvoices, error: expiringError } = await supabase
      .from('invoices')
      .select(`
        id,
        customer_access_token,
        token_expires_at,
        quote_request_id,
        quote_requests (
          email,
          contact_name,
          event_name
        )
      `)
      .not('token_expires_at', 'is', null)
      .lte('token_expires_at', sevenDaysFromNow.toISOString())
      .gte('token_expires_at', now.toISOString());

    if (expiringError) {
      throw new Error(`Failed to fetch expiring invoices: ${expiringError.message}`);
    }

    // 2. Send warnings based on time until expiry
    if (expiringInvoices) {
      for (const invoice of expiringInvoices as any) {
        const expiryDate = new Date(invoice.token_expires_at);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        let shouldSendWarning = false;
        let urgency = 'medium';

        if (expiryDate <= oneDayFromNow) {
          shouldSendWarning = true;
          urgency = 'high';
        } else if (expiryDate <= threeDaysFromNow) {
          shouldSendWarning = true;
          urgency = 'medium';
        } else if (expiryDate <= sevenDaysFromNow) {
          shouldSendWarning = true;
          urgency = 'low';
        }

        if (shouldSendWarning) {
          // Check if warning already sent today
          const { data: existingWarning } = await supabase
            .from('reminder_logs')
            .select('id')
            .eq('invoice_id', invoice.id)
            .eq('reminder_type', 'token_expiring')
            .gte('sent_at', new Date().toISOString().split('T')[0]);

          if (!existingWarning || existingWarning.length === 0) {
            const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';
            const estimateLink = `${siteUrl}/estimate?token=${invoice.customer_access_token}`;

            const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
              body: {
                to: invoice.quote_requests.email,
                subject: `Action Required: Your Quote Link is Expiring Soon - ${invoice.quote_requests.event_name}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: ${urgency === 'high' ? '#dc2626' : '#ea580c'};">Access Link Expiring Soon</h2>
                    <p>Dear ${invoice.quote_requests.contact_name},</p>
                    <p>Your quote access link for <strong>${invoice.quote_requests.event_name}</strong> will expire in <strong>${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}</strong>.</p>
                    <p>Please review and approve your quote before it expires:</p>
                    <p style="text-align: center; margin: 30px 0;">
                      <a href="${estimateLink}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Your Quote
                      </a>
                    </p>
                    <p>If you need more time or have any questions, please contact us at:</p>
                    <p>📞 (843) 970-0265<br>📧 soultrainseatery@gmail.com</p>
                    <p>Best regards,<br>Soul Train's Eatery</p>
                  </div>
                `
              }
            });

            if (!emailError) {
              results.warningsSent++;
              
              await supabase.from('reminder_logs').insert({
                invoice_id: invoice.id,
                reminder_type: 'token_expiring',
                recipient_email: invoice.quote_requests.email,
                urgency: urgency
              });
            } else {
              results.errors.push(`Failed to send warning for invoice ${invoice.id}: ${emailError.message}`);
            }
          }
        }

        results.expiringSoon++;
      }
    }

    // 3. Find expired tokens (with 7-day grace period)
    logStep("Checking for expired tokens");
    const gracePeriodEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const { data: expiredInvoices, error: expiredError } = await supabase
      .from('invoices')
      .select('id, customer_access_token, token_expires_at')
      .not('token_expires_at', 'is', null)
      .lt('token_expires_at', gracePeriodEnd.toISOString())
      .not('workflow_status', 'in', '(paid,cancelled)');

    if (!expiredError && expiredInvoices) {
      results.expired = expiredInvoices.length;
      logStep(`Found ${results.expired} tokens beyond grace period`);
    }

    // 4. Auto-renew tokens when customer accesses within expiry window
    // This will be handled in a separate endpoint that customers hit
    logStep("Token renewal check completed", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token renewal check completed',
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in token-renewal-manager:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
