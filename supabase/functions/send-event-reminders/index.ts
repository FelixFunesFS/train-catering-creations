import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { generateStandardEmail, EMAIL_CONFIGS, formatDate, formatTime, formatServiceType, BRAND_COLORS } from '../_shared/emailTemplates.ts';

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
        service_type,
        special_requests,
        both_proteins_available,
        compliance_level
      `)
      .eq('workflow_status', 'confirmed')
      .gte('event_date', yesterday.toISOString().split('T')[0])
      .lte('event_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (fetchError) throw fetchError;

    const emailsSent = {
      sevenDay: [] as string[],
      twoDayDay: [] as string[],
      thankYou: [] as string[]
    };

    const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';

    for (const event of confirmedEvents || []) {
      const eventDate = new Date(event.event_date);
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      // Get portal URL
      const { data: invoice } = await supabaseClient
        .from('invoices')
        .select('customer_access_token')
        .eq('quote_request_id', event.id)
        .single();
      
      const portalUrl = invoice?.customer_access_token 
        ? `${siteUrl}/estimate?token=${invoice.customer_access_token}` 
        : siteUrl;

      let emailType = '';
      let subject = '';
      let emailHtml = '';

      // 7-day reminder
      if (daysUntil === 7) {
        emailType = '7-day';
        subject = `Your Event with Soul Train's Eatery is Coming Up!`;
        
        const eventDetailsHtml = `
          <div style="background:${BRAND_COLORS.lightGray};border-left:4px solid ${BRAND_COLORS.gold};padding:20px;border-radius:0 8px 8px 0;margin:20px 0;">
            <h3 style="margin:0 0 16px 0;color:${BRAND_COLORS.crimson};">📅 Event Details</h3>
            <p style="margin:6px 0;"><strong>Event:</strong> ${event.event_name}</p>
            <p style="margin:6px 0;"><strong>Date:</strong> ${formatDate(event.event_date)}</p>
            <p style="margin:6px 0;"><strong>Time:</strong> ${formatTime(event.start_time)}</p>
            <p style="margin:6px 0;"><strong>Location:</strong> ${event.location}</p>
            <p style="margin:6px 0;"><strong>Guest Count:</strong> ${event.guest_count}</p>
            <p style="margin:6px 0;"><strong>Service:</strong> ${formatServiceType(event.service_type)}</p>
          </div>
        `;

        emailHtml = generateStandardEmail({
          preheaderText: EMAIL_CONFIGS.event_reminder.customer!.preheaderText,
          heroSection: {
            badge: '📅 1 WEEK AWAY',
            title: 'Your Event is Coming Up!',
            subtitle: event.event_name,
            variant: 'blue'
          },
          contentBlocks: [
            { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Hello ${event.contact_name},</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Your event is coming up in one week! We're getting everything ready to make it delicious and memorable.</p>` }},
            { type: 'custom_html', data: { html: eventDetailsHtml }},
            { type: 'menu_summary' },
            { type: 'text', data: { html: `
              <p style="font-size:15px;margin:20px 0;line-height:1.6;">If you need to make any changes, please contact us as soon as possible at <strong>(843) 970-0265</strong> or <a href="mailto:soultrainseatery@gmail.com" style="color:${BRAND_COLORS.crimson};">soultrainseatery@gmail.com</a>.</p>
              <p style="font-size:15px;margin:0;">We're looking forward to serving you!</p>
            ` }}
          ],
          ctaButton: { text: 'View Event Details', href: portalUrl, variant: 'primary' },
          quote: event
        });
        
        emailsSent.sevenDay.push(event.email);
      }
      // 48-hour reminder
      else if (daysUntil === 2) {
        emailType = '48-hour';
        subject = `Final Confirmation: Your Event in 2 Days!`;

        const checklistHtml = `
          <div style="background:#fff3cd;border:1px solid ${BRAND_COLORS.gold};padding:20px;border-radius:8px;margin:20px 0;">
            <h4 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};">📋 Day-Of Checklist:</h4>
            <ul style="margin:0;padding-left:20px;line-height:1.8;">
              <li>Ensure clear access to delivery/setup area</li>
              <li>Have serving tables/surfaces ready and cleared</li>
              <li>Designate someone as our point of contact</li>
              <li>Confirm power outlets are available (if needed)</li>
            </ul>
          </div>
        `;

        const expectHtml = `
          <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">⏰ What to Expect:</h3>
          <ul style="line-height:1.8;margin:0;padding-left:20px;">
            <li>Our team will arrive approximately 2 hours before ${formatTime(event.start_time)} to set up</li>
            <li>We'll handle everything from setup to service to cleanup</li>
            <li>Day-of contact: <strong>(843) 970-0265</strong></li>
          </ul>
        `;
        
        emailHtml = generateStandardEmail({
          preheaderText: 'Your catering event is in 2 days! Final details inside.',
          heroSection: {
            badge: '⚡ 2 DAYS AWAY',
            title: 'Final Confirmation',
            subtitle: event.event_name,
            variant: 'orange'
          },
          contentBlocks: [
            { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Hello ${event.contact_name},</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Your event with Soul Train's Eatery is just <strong>2 days away</strong>! We're excited and ready to serve you.</p>` }},
            { type: 'event_details' },
            { type: 'menu_summary' },
            { type: 'custom_html', data: { html: expectHtml }},
            { type: 'custom_html', data: { html: checklistHtml }},
            { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">We're excited to make your event exceptional!</p>` }}
          ],
          ctaButton: { text: 'View Event Details', href: portalUrl, variant: 'primary' },
          quote: event
        });
        
        emailsSent.twoDayDay.push(event.email);
      }
      // Thank you email (day after event)
      else if (daysUntil === -1) {
        emailType = 'thank-you';
        subject = `Thank You from Soul Train's Eatery!`;

        const feedbackHtml = `
          <div style="background:${BRAND_COLORS.lightGray};border:2px solid ${BRAND_COLORS.gold};padding:20px;border-radius:10px;margin:20px 0;text-align:center;">
            <h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};">⭐ We'd Love Your Feedback!</h3>
            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;">Your feedback helps us continue serving Charleston families with the best Southern catering experience.</p>
            <div style="margin-top:16px;">
              <a href="https://www.google.com/search?q=soul+train%27s+eatery+charleston" style="display:inline-block;background:${BRAND_COLORS.crimson};color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin:4px;">Leave a Google Review</a>
            </div>
          </div>
        `;
        
        emailHtml = generateStandardEmail({
          preheaderText: EMAIL_CONFIGS.event_followup.customer!.preheaderText,
          heroSection: EMAIL_CONFIGS.event_followup.customer!.heroSection,
          contentBlocks: [
            { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Thank You, ${event.contact_name}!</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We hope you and your guests enjoyed the food and service at your "<strong>${event.event_name}</strong>" event!</p><p style="font-size:15px;margin:0;line-height:1.6;">It was our pleasure to serve you and be part of your special occasion.</p>` }},
            { type: 'custom_html', data: { html: feedbackHtml }},
            { type: 'text', data: { html: `<p style="font-size:15px;margin:20px 0 0 0;">We hope to serve you again soon!</p><p style="margin-top:20px;"><strong>Soul Train's Eatery Team</strong><br/>(843) 970-0265 | soultrainseatery@gmail.com</p>` }}
          ],
          quote: event
        });
        
        emailsSent.thankYou.push(event.email);
      }

      // Send email if type is set
      if (emailType && emailHtml) {
        const { error: emailError } = await supabaseClient.functions.invoke('send-smtp-email', {
          body: {
            to: event.email,
            subject,
            html: emailHtml
          }
        });

        if (emailError) {
          console.error(`Failed to send ${emailType} email to ${event.email}:`, emailError);
        } else {
          console.log(`Sent ${emailType} reminder to ${event.email}`);
          
          // Update last_customer_interaction
          await supabaseClient
            .from('quote_requests')
            .update({ last_status_change: new Date().toISOString() })
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

  } catch (error: any) {
    console.error('Error in send-event-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
