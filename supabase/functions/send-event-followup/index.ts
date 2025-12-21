import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';

    for (const quote of quotes || []) {
      const invoice = quote.invoices?.[0];
      if (!invoice) continue;

      // Create feedback link
      const feedbackLink = `${FRONTEND_URL}/feedback?token=${invoice.customer_access_token}`;

      // Send thank you + feedback request email
      const emailBody = {
        to: quote.email,
        subject: `Thank you for choosing Soul Train's Eatery - ${quote.event_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank You, ${quote.contact_name}!</h2>
            
            <p>We hope ${quote.event_name} was a wonderful success and that you and your guests enjoyed the authentic Southern flavors we prepared with love.</p>
            
            <p>It was an honor to be part of your special day, and we're grateful you chose Soul Train's Eatery to serve your guests.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">We'd Love Your Feedback</h3>
              <p>Your feedback helps us continue serving Charleston families with the best Southern catering experience.</p>
              <a href="${feedbackLink}" style="display: inline-block; background: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
                Share Your Feedback
              </a>
            </div>
            
            <p><strong>Loved our service?</strong> We'd be honored if you could leave us a review:</p>
            <ul>
              <li><a href="https://g.page/r/YOUR_GOOGLE_PLACE_ID/review">Google Reviews</a></li>
              <li><a href="https://www.facebook.com/YOUR_FB_PAGE/reviews">Facebook Reviews</a></li>
            </ul>
            
            <p>We look forward to serving you again soon!</p>
            
            <p style="margin-top: 30px;">
              Warm regards,<br>
              <strong>Soul Train's Eatery</strong><br>
              Charleston's Lowcountry Catering<br>
              (843) 970-0265 | soultrainseatery@gmail.com
            </p>
          </div>
        `
      };

      const { error: emailError } = await supabaseClient.functions.invoke('send-smtp-email', {
        body: emailBody
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
