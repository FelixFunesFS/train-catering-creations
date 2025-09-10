import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailReminder {
  type: 'payment_due' | 'event_confirmation' | 'final_details' | 'thank_you';
  quote: any;
  invoice?: any;
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting automated reminder check...');

    // Get current date and calculate reminder dates
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Payment Due Reminders (for sent invoices not paid)
    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select(`
        *,
        quote_requests!quote_request_id(*)
      `)
      .eq('status', 'sent')
      .lt('due_date', now.toISOString());

    if (overdueInvoices) {
      for (const invoice of overdueInvoices) {
        await sendPaymentReminder(supabase, invoice);
      }
    }

    // 2. Event Confirmation (7 days before event)
    const { data: upcomingEvents } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('status', 'confirmed')
      .gte('event_date', now.toISOString().split('T')[0])
      .lte('event_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (upcomingEvents) {
      for (const quote of upcomingEvents) {
        await sendEventConfirmation(supabase, quote);
      }
    }

    // 3. Final Details Reminder (3 days before event)
    const { data: soonEvents } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('status', 'confirmed')
      .gte('event_date', now.toISOString().split('T')[0])
      .lte('event_date', threeDaysFromNow.toISOString().split('T')[0]);

    if (soonEvents) {
      for (const quote of soonEvents) {
        await sendFinalDetailsReminder(supabase, quote);
      }
    }

    // 4. Thank You Follow-up (1 day after event)
    const { data: recentEvents } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('status', 'confirmed')
      .gte('event_date', oneDayAgo.toISOString().split('T')[0])
      .lt('event_date', now.toISOString().split('T')[0]);

    if (recentEvents) {
      for (const quote of recentEvents) {
        await sendThankYouEmail(supabase, quote);
      }
    }

    console.log('Automated reminder check completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: {
          overdueInvoices: overdueInvoices?.length || 0,
          upcomingEvents: upcomingEvents?.length || 0,
          soonEvents: soonEvents?.length || 0,
          recentEvents: recentEvents?.length || 0
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in automated reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendPaymentReminder(supabase: any, invoice: any) {
  try {
    const quote = invoice.quote_requests;
    if (!quote) return;

    const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));

    const { error } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: quote.email,
        subject: `Payment Reminder - ${quote.event_name}`,
        html: generatePaymentReminderEmail(quote, invoice, daysOverdue)
      }
    });

    if (!error) {
      // Log the reminder
      await supabase
        .from('reminder_logs')
        .insert({
          invoice_id: invoice.id,
          reminder_type: 'payment_overdue',
          recipient_email: quote.email,
          urgency: daysOverdue > 7 ? 'high' : 'medium'
        });
    }
  } catch (error) {
    console.error('Error sending payment reminder:', error);
  }
}

async function sendEventConfirmation(supabase: any, quote: any) {
  try {
    const { error } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: quote.email,
        subject: `Event Confirmation - ${quote.event_name}`,
        html: generateEventConfirmationEmail(quote)
      }
    });

    if (!error) {
      await supabase
        .from('reminder_logs')
        .insert({
          reminder_type: 'event_confirmation',
          recipient_email: quote.email,
          urgency: 'medium'
        });
    }
  } catch (error) {
    console.error('Error sending event confirmation:', error);
  }
}

async function sendFinalDetailsReminder(supabase: any, quote: any) {
  try {
    const { error } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: quote.email,
        subject: `Final Details - ${quote.event_name} (3 Days Away!)`,
        html: generateFinalDetailsEmail(quote)
      }
    });

    if (!error) {
      await supabase
        .from('reminder_logs')
        .insert({
          reminder_type: 'final_details',
          recipient_email: quote.email,
          urgency: 'high'
        });
    }
  } catch (error) {
    console.error('Error sending final details reminder:', error);
  }
}

async function sendThankYouEmail(supabase: any, quote: any) {
  try {
    const { error } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: quote.email,
        subject: `Thank you for choosing Soul Train's Eatery!`,
        html: generateThankYouEmail(quote)
      }
    });

    if (!error) {
      await supabase
        .from('reminder_logs')
        .insert({
          reminder_type: 'thank_you',
          recipient_email: quote.email,
          urgency: 'low'
        });
    }
  } catch (error) {
    console.error('Error sending thank you email:', error);
  }
}

function generatePaymentReminderEmail(quote: any, invoice: any, daysOverdue: number): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">Payment Reminder</h2>
      <p>Dear ${quote.contact_name},</p>
      <p>This is a friendly reminder that payment for your ${quote.event_name} is ${daysOverdue} day(s) overdue.</p>
      
      <div style="background: #fef3c7; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #d97706;">
        <strong>Event Details:</strong><br>
        Event: ${quote.event_name}<br>
        Date: ${new Date(quote.event_date).toLocaleDateString()}<br>
        Amount Due: $${(invoice.total_amount / 100).toFixed(2)}
      </div>
      
      <p>Please contact us at (843) 970-0265 to arrange payment or if you have any questions.</p>
      <p>We appreciate your prompt attention to this matter.</p>
      
      <p>Best regards,<br>Soul Train's Eatery Team<br>
      Phone: (843) 970-0265<br>
      Email: soultrainseatery@gmail.com</p>
    </div>
  `;
}

function generateEventConfirmationEmail(quote: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Event Confirmation</h2>
      <p>Dear ${quote.contact_name},</p>
      <p>Your event is coming up in one week! We're excited to cater your ${quote.event_name}.</p>
      
      <div style="background: #d1fae5; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #059669;">
        <strong>Event Details:</strong><br>
        Event: ${quote.event_name}<br>
        Date: ${new Date(quote.event_date).toLocaleDateString()}<br>
        Location: ${quote.location}<br>
        Guests: ${quote.guest_count}
      </div>
      
      <p>We'll be in touch with final details closer to your event date. If you have any questions or need to make changes, please call us at (843) 970-0265.</p>
      
      <p>Looking forward to making your event special!</p>
      <p>Best regards,<br>Soul Train's Eatery Team</p>
    </div>
  `;
}

function generateFinalDetailsEmail(quote: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Final Details - Event in 3 Days!</h2>
      <p>Dear ${quote.contact_name},</p>
      <p>Your ${quote.event_name} is just 3 days away! We're putting the finishing touches on everything.</p>
      
      <div style="background: #fee2e2; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #dc2626;">
        <strong>Event Reminder:</strong><br>
        Event: ${quote.event_name}<br>
        Date: ${new Date(quote.event_date).toLocaleDateString()}<br>
        Location: ${quote.location}<br>
        Guests: ${quote.guest_count}
      </div>
      
      <p>Please confirm:</p>
      <ul>
        <li>Final guest count (if different from ${quote.guest_count})</li>
        <li>Any last-minute dietary restrictions</li>
        <li>Setup location and access details</li>
        <li>Event timeline and serving preferences</li>
      </ul>
      
      <p>Please call us at (843) 970-0265 with any final details or questions.</p>
      
      <p>We can't wait to serve you and your guests!</p>
      <p>Best regards,<br>Soul Train's Eatery Team</p>
    </div>
  `;
}

function generateThankYouEmail(quote: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">Thank You!</h2>
      <p>Dear ${quote.contact_name},</p>
      <p>Thank you for choosing Soul Train's Eatery for your ${quote.event_name}! It was our pleasure to be part of your special day.</p>
      
      <div style="background: #f3e8ff; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #7c3aed;">
        <p><strong>We'd love your feedback!</strong></p>
        <p>Your experience matters to us. If you have a moment, we'd appreciate a review to help us continue providing exceptional catering services.</p>
      </div>
      
      <p>We hope you and your guests enjoyed our authentic Southern cuisine and the warm hospitality that Soul Train's Eatery is known for throughout Charleston's Lowcountry.</p>
      
      <p>Thank you again for trusting us with your event. We look forward to serving you again in the future!</p>
      
      <p>Warm regards,<br>The Soul Train's Eatery Family<br>
      Charleston's trusted catering partner for memorable events from the heart<br><br>
      Phone: (843) 970-0265<br>
      Email: soultrainseatery@gmail.com</p>
    </div>
  `;
}

serve(handler);