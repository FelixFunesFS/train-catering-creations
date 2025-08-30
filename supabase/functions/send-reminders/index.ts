import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-REMINDERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Reminder system started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { reminder_type = 'auto' } = await req.json();
    
    logStep("Processing reminders", { reminder_type });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Find invoices that need reminders
    const { data: invoicesNeedingReminders, error: fetchError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        ),
        quote_requests (
          id,
          event_name,
          event_date,
          location,
          guest_count
        )
      `)
      .in('status', ['sent', 'viewed', 'contract_sent', 'deposit_paid', 'confirmed'])
      .not('customers.email', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch invoices: ${fetchError.message}`);
    }

    logStep("Found invoices to process", { count: invoicesNeedingReminders?.length || 0 });

    const remindersToSend = [];
    const today_time = today.getTime();

    for (const invoice of invoicesNeedingReminders || []) {
      const eventDate = new Date(invoice.quote_requests.event_date);
      const daysUntilEvent = Math.ceil((eventDate.getTime() - today_time) / (1000 * 60 * 60 * 24));
      
      // Determine what reminders to send
      const reminderTypes = [];

      // Payment reminders
      if (invoice.status === 'contract_sent' && daysUntilEvent <= 35 && daysUntilEvent > 30) {
        reminderTypes.push({
          type: 'second_payment_due',
          subject: `Second Payment Due Soon - ${invoice.quote_requests.event_name}`,
          urgency: 'medium'
        });
      }

      if (invoice.status === 'deposit_paid' && daysUntilEvent <= 15 && daysUntilEvent > 10) {
        reminderTypes.push({
          type: 'final_payment_due',
          subject: `Final Payment Due Soon - ${invoice.quote_requests.event_name}`,
          urgency: 'high'
        });
      }

      // Event confirmation reminders
      if (daysUntilEvent === 7) {
        reminderTypes.push({
          type: 'final_details_confirmation',
          subject: `Final Details Confirmation - ${invoice.quote_requests.event_name} in 1 Week`,
          urgency: 'high'
        });
      }

      if (daysUntilEvent === 3) {
        reminderTypes.push({
          type: 'event_approaching',
          subject: `Your Event is in 3 Days - ${invoice.quote_requests.event_name}`,
          urgency: 'urgent'
        });
      }

      if (daysUntilEvent === 1) {
        reminderTypes.push({
          type: 'event_tomorrow',
          subject: `Your Event is Tomorrow! - ${invoice.quote_requests.event_name}`,
          urgency: 'urgent'
        });
      }

      // Follow-up reminders
      if (daysUntilEvent === -1) {
        reminderTypes.push({
          type: 'post_event_followup',
          subject: `Thank You for Choosing Soul Train's Eatery!`,
          urgency: 'low'
        });
      }

      // Add to reminders to send
      for (const reminderType of reminderTypes) {
        remindersToSend.push({
          invoice,
          ...reminderType,
          daysUntilEvent
        });
      }
    }

    logStep("Reminders to send", { count: remindersToSend.length });

    const sentReminders = [];

    // Send each reminder
    for (const reminder of remindersToSend) {
      try {
        const emailContent = generateReminderEmail(reminder);
        
        const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-gmail-email', {
          body: {
            to: reminder.invoice.customers.email,
            subject: reminder.subject,
            html: emailContent
          }
        });

        if (emailError) {
          logStep("Failed to send reminder", { 
            invoiceId: reminder.invoice.id,
            reminderType: reminder.type,
            error: emailError.message 
          });
        } else {
          logStep("Reminder sent successfully", { 
            invoiceId: reminder.invoice.id,
            reminderType: reminder.type,
            recipient: reminder.invoice.customers.email
          });

          // Log the reminder in database
          await supabaseClient
            .from('reminder_logs')
            .insert({
              invoice_id: reminder.invoice.id,
              reminder_type: reminder.type,
              sent_at: new Date().toISOString(),
              recipient_email: reminder.invoice.customers.email,
              urgency: reminder.urgency
            });

          sentReminders.push({
            invoice_id: reminder.invoice.id,
            type: reminder.type,
            recipient: reminder.invoice.customers.email
          });
        }
      } catch (reminderError) {
        logStep("Error sending individual reminder", { 
          invoiceId: reminder.invoice.id,
          error: reminderError instanceof Error ? reminderError.message : String(reminderError)
        });
      }
    }

    logStep("Reminder system completed", { sentCount: sentReminders.length });

    return new Response(JSON.stringify({
      success: true,
      reminders_processed: remindersToSend.length,
      reminders_sent: sentReminders.length,
      sent_reminders: sentReminders
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateReminderEmail(reminder: any): string {
  const { invoice, type, daysUntilEvent } = reminder;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const baseStyle = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background-color: #2563eb; color: white; margin-bottom: 30px; }
    .content { padding: 20px; }
    .highlight { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .urgent { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  `;

  let content = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>${baseStyle}</style>
  </head>
  <body>
    <div class="header">
      <h1>Soul Train's Eatery</h1>
      <p>Reminder: ${invoice.quote_requests.event_name}</p>
    </div>
    <div class="content">
      <p>Dear ${invoice.customers.name},</p>
  `;

  switch (type) {
    case 'second_payment_due':
      content += `
        <div class="highlight">
          <h3>Second Payment Due Soon</h3>
          <p>Your second payment of <strong>${formatCurrency(Math.round(invoice.total_amount * 0.5))}</strong> is due in ${Math.abs(daysUntilEvent - 30)} days (30 days before your event).</p>
          <p><strong>Event:</strong> ${invoice.quote_requests.event_name}<br>
          <strong>Date:</strong> ${new Date(invoice.quote_requests.event_date).toLocaleDateString()}<br>
          <strong>Location:</strong> ${invoice.quote_requests.location}</p>
        </div>
        <p>Please contact us at (843) 970-0265 to arrange payment or if you need a payment link sent to you.</p>
      `;
      break;

    case 'final_payment_due':
      content += `
        <div class="urgent">
          <h3>⚠️ Final Payment Due Soon</h3>
          <p>Your final payment is due in ${Math.abs(daysUntilEvent - 10)} days (10 days before your event).</p>
          <p><strong>Amount Due:</strong> ${formatCurrency(Math.round(invoice.total_amount * 0.25))}<br>
          <strong>Due Date:</strong> ${new Date(new Date(invoice.quote_requests.event_date).getTime() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
        <p>Please arrange payment as soon as possible to ensure your event proceeds smoothly.</p>
      `;
      break;

    case 'final_details_confirmation':
      content += `
        <div class="highlight">
          <h3>📋 Final Details Confirmation</h3>
          <p>Your event is just one week away! We need to confirm the final details:</p>
          <ul>
            <li><strong>Final guest count</strong> (currently ${invoice.quote_requests.guest_count})</li>
            <li><strong>Menu modifications</strong> or dietary restrictions</li>
            <li><strong>Setup timing</strong> and location access</li>
            <li><strong>Contact person</strong> for the day of the event</li>
          </ul>
        </div>
        <p>Please call us at (843) 970-0265 or reply to this email with any updates.</p>
      `;
      break;

    case 'event_approaching':
      content += `
        <div class="urgent">
          <h3>🎉 Your Event is in 3 Days!</h3>
          <p>We're excited to cater your event! Here's what you need to know:</p>
          <ul>
            <li><strong>Setup time:</strong> ${invoice.quote_requests.start_time || 'We will contact you'}</li>
            <li><strong>Service begins:</strong> ${invoice.quote_requests.serving_start_time || 'As scheduled'}</li>
            <li><strong>Our contact:</strong> (843) 970-0265</li>
            <li><strong>Final preparations:</strong> Ensure venue access and space is ready</li>
          </ul>
        </div>
      `;
      break;

    case 'event_tomorrow':
      content += `
        <div class="urgent">
          <h3>🚨 Your Event is Tomorrow!</h3>
          <p>We're all set for your event tomorrow! Last-minute reminders:</p>
          <ul>
            <li><strong>Venue access:</strong> Ensure our team can access the location</li>
            <li><strong>Contact person:</strong> Please have someone available at the venue</li>
            <li><strong>Emergency contact:</strong> (843) 970-0265</li>
            <li><strong>Weather:</strong> We'll proceed unless severe weather occurs</li>
          </ul>
        </div>
        <p>Looking forward to making your event delicious and memorable!</p>
      `;
      break;

    case 'post_event_followup':
      content += `
        <div class="highlight">
          <h3>🙏 Thank You for Choosing Soul Train's Eatery!</h3>
          <p>We hope your event was everything you dreamed it would be! It was our pleasure to serve you and your guests.</p>
          <p>We'd love to hear about your experience:</p>
          <ul>
            <li>Leave us a review on Google or Facebook</li>
            <li>Share photos from your event (we love seeing happy guests!)</li>
            <li>Let us know if anything exceeded or fell short of expectations</li>
          </ul>
        </div>
        <p>Thank you for trusting us with your special day. We look forward to catering your future events!</p>
      `;
      break;

    default:
      content += `<p>This is a reminder about your upcoming event with Soul Train's Eatery.</p>`;
  }

  content += `
      <p>Questions? Call us at (843) 970-0265 or reply to this email.</p>
      <p>Best regards,<br>The Soul Train's Eatery Team</p>
    </div>
    <div class="footer">
      <p><strong>Soul Train's Eatery</strong><br>
      Phone: (843) 970-0265 | Email: soultrainseatery@gmail.com<br>
      Proudly serving Charleston's Lowcountry and surrounding areas</p>
    </div>
  </body>
  </html>
  `;

  return content;
}