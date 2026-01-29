import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateStandardEmail, EMAIL_CONFIGS, getEmailContentBlocks } from '../_shared/emailTemplates.ts';
import { getTodayString, subtractDays } from '../_shared/dateHelpers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for test mode (manual trigger for specific quote)
    let testQuoteId: string | null = null;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        testQuoteId = body.test_quote_id || null;
      } catch {
        // No body or invalid JSON - continue with normal cron behavior
      }
    }

    let quotes: any[] = [];
    
    if (testQuoteId) {
      // TEST MODE: Fetch specific quote regardless of date
      console.log(`Test mode: Fetching quote ${testQuoteId}`);
      const { data, error } = await supabaseClient
        .from('quote_requests')
        .select(`
          id,
          event_name,
          contact_name,
          email,
          event_date,
          invoices(id, customer_access_token, workflow_status)
        `)
        .eq('id', testQuoteId)
        .single();
      
      if (error) throw error;
      quotes = data ? [data] : [];
    } else {
      // NORMAL MODE: Find events from yesterday
      const yesterdayStr = subtractDays(getTodayString(), 1);

      const { data, error: quotesError } = await supabaseClient
        .from('quote_requests')
        .select(`
          id,
          event_name,
          contact_name,
          email,
          event_date,
          invoices(id, customer_access_token, workflow_status)
        `)
        .gte('event_date', yesterdayStr)
        .lte('event_date', yesterdayStr)
        .eq('workflow_status', 'completed');

      if (quotesError) throw quotesError;
      quotes = data || [];
    }

    let emailsSent = 0;
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://www.soultrainseatery.com';

    for (const quote of quotes || []) {
      const invoice = quote.invoices?.[0];
      if (!invoice) continue;

      // Use shared helper - Single Source of Truth
      const { contentBlocks } = getEmailContentBlocks('event_followup', 'customer', {
        quote,
        invoice: {},
        lineItems: [],
        milestones: [],
        portalUrl: '',
      });

      const emailHtml = generateStandardEmail({
        preheaderText: EMAIL_CONFIGS.event_followup.customer!.preheaderText,
        heroSection: {
          ...EMAIL_CONFIGS.event_followup.customer!.heroSection,
          subtitle: quote.event_name
        },
        contentBlocks,
        quote,
      });

      const { error: emailError } = await supabaseClient.functions.invoke('send-smtp-email', {
        body: {
          to: quote.email,
          subject: `Thank you for choosing Soul Train's Eatery - ${quote.event_name}`,
          html: emailHtml
        }
      });

      if (!emailError) {
        emailsSent++;
        
        // Log the follow-up
        await supabaseClient.from('analytics_events').insert({
          event_type: 'follow_up_sent',
          entity_type: 'quote_request',
          entity_id: quote.id,
          metadata: { type: 'feedback_request', email: quote.email }
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: emailsSent,
        events_processed: quotes?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error sending follow-ups:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
