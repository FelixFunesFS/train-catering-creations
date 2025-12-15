import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch confirmed events
    const { data: confirmedEvents, error: fetchError } = await supabaseClient
      .from('quote_requests')
      .select(`
        id,
        event_name,
        event_date,
        start_time,
        contact_name,
        email,
        location,
        guest_count,
        primary_protein,
        secondary_protein
      `)
      .eq('status', 'confirmed')
      .gte('event_date', yesterday.toISOString().split('T')[0])
      .lte('event_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (fetchError) throw fetchError;

    const emailsSent = {
      sevenDay: [] as string[],
      twoDayDay: [] as string[],
      thankYou: [] as string[]
    };

    for (const event of confirmedEvents || []) {
      const eventDate = new Date(event.event_date);
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      let emailType = '';
      let subject = '';
      let body = '';

      // 7-day reminder
      if (daysUntil === 7) {
        emailType = '7-day';
        subject = `Your Event with Soul Train's Eatery is Coming Up!`;
        body = `
          <h2>Hello ${event.contact_name},</h2>
          <p>Your event <strong>"${event.event_name}"</strong> is coming up in one week on ${new Date(event.event_date).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}!</p>
          
          <h3>Event Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</li>
            <li><strong>Time:</strong> ${event.start_time || 'TBD'}</li>
            <li><strong>Location:</strong> ${event.location}</li>
            <li><strong>Guest Count:</strong> ${event.guest_count}</li>
            <li><strong>Menu:</strong> ${event.primary_protein || ''}${event.secondary_protein ? ', ' + event.secondary_protein : ''}</li>
          </ul>
          
          <p>If you need to make any changes, please contact us as soon as possible at (843) 970-0265 or soultrainseatery@gmail.com.</p>
          
          <p>We're looking forward to serving you!</p>
          <p><strong>Soul Train's Eatery Team</strong></p>
        `;
        emailsSent.sevenDay.push(event.email);
      }
      // 48-hour reminder
      else if (daysUntil === 2) {
        emailType = '48-hour';
        subject = `Final Confirmation: Your Event in 2 Days!`;
        body = `
          <h2>Hello ${event.contact_name},</h2>
          <p>Your event with Soul Train's Eatery is just 2 days away!</p>
          
          <h3>Final Event Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</li>
            <li><strong>Service Start:</strong> ${event.start_time || 'TBD'}</li>
            <li><strong>Location:</strong> ${event.location}</li>
            <li><strong>Guests:</strong> ${event.guest_count}</li>
          </ul>
          
          <h3>What to Expect:</h3>
          <p>Our team will arrive approximately 2 hours before service time to set up. We'll handle everything from setup to service to cleanup.</p>
          
          <h3>Day-Of Contact:</h3>
          <p>For any day-of questions or needs, call us at <strong>(843) 970-0265</strong></p>
          
          <p>We're excited to make your event exceptional!</p>
          <p><strong>Soul Train's Eatery Team</strong></p>
        `;
        emailsSent.twoDayDay.push(event.email);
      }
      // Thank you email (day after event)
      else if (daysUntil === -1) {
        emailType = 'thank-you';
        subject = `Thank You from Soul Train's Eatery!`;
        body = `
          <h2>Thank You, ${event.contact_name}!</h2>
          <p>We hope you and your guests enjoyed the food and service at your "${event.event_name}" event!</p>
          
          <p>It was our pleasure to serve you and be part of your special occasion.</p>
          
          <h3>We'd Love Your Feedback!</h3>
          <p>If you have a moment, we'd greatly appreciate a review:</p>
          <ul>
            <li><a href="https://www.google.com/search?q=soul+train%27s+eatery+charleston">Leave a Google Review</a></li>
            <li><a href="https://www.yelp.com/search?find_desc=soul+train%27s+eatery&find_loc=Charleston%2C+SC">Leave a Yelp Review</a></li>
          </ul>
          
          <p>We hope to serve you again soon!</p>
          <p><strong>Soul Train's Eatery Team</strong></p>
          <p>(843) 970-0265 | soultrainseatery@gmail.com</p>
        `;
        emailsSent.thankYou.push(event.email);
      }

      // Send email if type is set
      if (emailType) {
        const { error: emailError } = await supabaseClient.functions.invoke('send-gmail-email', {
          body: {
            to: event.email,
            subject,
            html: body
          }
        });

        if (emailError) {
          console.error(`Failed to send ${emailType} email to ${event.email}:`, emailError);
        } else {
          console.log(`Sent ${emailType} reminder to ${event.email}`);
          
          // Update last_customer_interaction
          await supabaseClient
            .from('quote_requests')
            .update({ last_customer_interaction: new Date().toISOString() })
            .eq('id', event.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        totalProcessed: confirmedEvents?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-event-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
