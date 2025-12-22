import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateStandardEmail, EMAIL_CONFIGS, BRAND_COLORS } from '../_shared/emailTemplates.ts';

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

    // Get current date
    const today = new Date();
    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(today);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Find events from yesterday
    const { data: quotes, error: quotesError } = await supabaseClient
      .from('quote_requests')
      .select(`
        id,
        event_name,
        contact_name,
        email,
        event_date,
        invoices(id, customer_access_token, status)
      `)
      .gte('event_date', yesterdayStart.toISOString().split('T')[0])
      .lte('event_date', yesterdayEnd.toISOString().split('T')[0])
      .eq('workflow_status', 'completed');

    if (quotesError) throw quotesError;

    let emailsSent = 0;
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://soultrainseatery.lovable.app';

    for (const quote of quotes || []) {
      const invoice = quote.invoices?.[0];
      if (!invoice) continue;

      // Create feedback link
      const feedbackLink = `${FRONTEND_URL}/feedback?token=${invoice.customer_access_token}`;

      // Generate email using standard template
      const feedbackBoxHtml = `
        <div style="background:${BRAND_COLORS.lightGray};border:2px solid ${BRAND_COLORS.gold};padding:25px;border-radius:12px;margin:20px 0;text-align:center;">
          <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};">We'd Love Your Feedback</h3>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;">Your feedback helps us continue serving Charleston families with the best Southern catering experience.</p>
          <a href="${feedbackLink}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;">Share Your Feedback</a>
        </div>
      `;

      const reviewLinksHtml = `
        <div style="margin:25px 0;">
          <p style="font-size:15px;margin:0 0 12px 0;"><strong>Loved our service?</strong> We'd be honored if you could leave us a review:</p>
          <div style="text-align:center;">
            <a href="https://www.google.com/search?q=soul+train%27s+eatery+charleston" style="display:inline-block;background:${BRAND_COLORS.gold};color:${BRAND_COLORS.darkGray};text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;margin:4px;">⭐ Google Review</a>
            <a href="https://www.facebook.com/soultrainseatery/reviews" style="display:inline-block;background:#1877f2;color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;margin:4px;">📘 Facebook Review</a>
          </div>
        </div>
      `;

      const emailHtml = generateStandardEmail({
        preheaderText: EMAIL_CONFIGS.event_followup.customer!.preheaderText,
        heroSection: {
          ...EMAIL_CONFIGS.event_followup.customer!.heroSection,
          subtitle: quote.event_name
        },
        contentBlocks: [
          { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Thank You, ${quote.contact_name}!</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We hope <strong>${quote.event_name}</strong> was a wonderful success and that you and your guests enjoyed the authentic Southern flavors we prepared with love.</p><p style="font-size:15px;margin:0;line-height:1.6;">It was an honor to be part of your special day, and we're grateful you chose Soul Train's Eatery to serve your guests.</p>` }},
          { type: 'custom_html', data: { html: feedbackBoxHtml }},
          { type: 'custom_html', data: { html: reviewLinksHtml }},
          { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">We look forward to serving you again soon!</p><p style="margin-top:20px;"><strong>Warm regards,</strong><br/>Soul Train's Eatery<br/>Charleston's Lowcountry Catering<br/>(843) 970-0265 | soultrainseatery@gmail.com</p>` }}
        ]
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
