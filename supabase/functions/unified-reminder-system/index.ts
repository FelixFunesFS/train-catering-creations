import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UNIFIED-REMINDERS] ${step}${detailsStr}`);
};

interface ReminderResult {
  type: string;
  count: number;
  sent: number;
}

interface WorkflowResult {
  markedOverdue: number;
  autoConfirmed: number;
  autoCompleted: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep("Starting unified reminder and workflow system");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const reminderResults: ReminderResult[] = [];
    const workflowResults: WorkflowResult = {
      markedOverdue: 0,
      autoConfirmed: 0,
      autoCompleted: 0
    };
    const errors: string[] = [];

    // ============================================
    // SECTION 1: WORKFLOW AUTOMATIONS
    // ============================================

    // 1a. Auto-mark overdue invoices
    logStep("Checking for overdue invoices");
    const { data: overdueInvoices, error: overdueError } = await supabase
      .from('invoices')
      .select('id, due_date, workflow_status')
      .in('workflow_status', ['sent', 'viewed', 'approved', 'payment_pending', 'partially_paid'])
      .lt('due_date', todayStr);

    if (!overdueError && overdueInvoices) {
      for (const invoice of overdueInvoices) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            workflow_status: 'overdue',
            status_changed_by: 'unified_reminder_system',
            last_status_change: new Date().toISOString()
          })
          .eq('id', invoice.id);

        if (!updateError) {
          workflowResults.markedOverdue++;
          await supabase.from('workflow_state_log').insert({
            entity_type: 'invoices',
            entity_id: invoice.id,
            previous_status: invoice.workflow_status,
            new_status: 'overdue',
            changed_by: 'unified_reminder_system',
            change_reason: 'Payment past due date'
          });
        } else {
          errors.push(`Failed to mark invoice ${invoice.id} as overdue`);
        }
      }
    }

    // 1b. Auto-confirm events when fully paid
    logStep("Checking for events to auto-confirm");
    const { data: paidInvoices, error: paidError } = await supabase
      .from('invoices')
      .select('id, quote_request_id, workflow_status')
      .eq('workflow_status', 'paid')
      .not('quote_request_id', 'is', null);

    if (!paidError && paidInvoices) {
      for (const invoice of paidInvoices) {
        const { data: existingQuote } = await supabase
          .from('quote_requests')
          .select('workflow_status')
          .eq('id', invoice.quote_request_id)
          .single();

        if (existingQuote && !['confirmed', 'in_progress', 'completed'].includes(existingQuote.workflow_status)) {
          const { error: quoteUpdateError } = await supabase
            .from('quote_requests')
            .update({
              workflow_status: 'confirmed',
              status_changed_by: 'unified_reminder_system',
              last_status_change: new Date().toISOString()
            })
            .eq('id', invoice.quote_request_id);

          if (!quoteUpdateError) {
            workflowResults.autoConfirmed++;
            await supabase.from('workflow_state_log').insert({
              entity_type: 'quote_requests',
              entity_id: invoice.quote_request_id,
              previous_status: existingQuote.workflow_status,
              new_status: 'confirmed',
              changed_by: 'unified_reminder_system',
              change_reason: 'Payment received - event auto-confirmed'
            });
          }
        }
      }
    }

    // 1c. Auto-complete events (day after event date)
    logStep("Checking for events to auto-complete");
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: completableQuotes, error: completeError } = await supabase
      .from('quote_requests')
      .select('id, event_date, workflow_status')
      .eq('workflow_status', 'confirmed')
      .lt('event_date', yesterday.toISOString().split('T')[0]);

    if (!completeError && completableQuotes) {
      for (const quote of completableQuotes) {
        const { error: updateError } = await supabase
          .from('quote_requests')
          .update({
            workflow_status: 'completed',
            status_changed_by: 'unified_reminder_system',
            last_status_change: new Date().toISOString()
          })
          .eq('id', quote.id);

        if (!updateError) {
          workflowResults.autoCompleted++;
          await supabase.from('workflow_state_log').insert({
            entity_type: 'quote_requests',
            entity_id: quote.id,
            previous_status: 'confirmed',
            new_status: 'completed',
            changed_by: 'unified_reminder_system',
            change_reason: 'Event date passed'
          });
        }
      }
    }

    logStep("Workflow automations completed", workflowResults);

    // ============================================
    // SECTION 2: PAYMENT REMINDERS
    // ============================================

    // 2a. Overdue payment reminders
    logStep("Processing overdue payment reminders");
    let overdueReminders = 0;
    const { data: overdueForReminder } = await supabase
      .from('invoices')
      .select(`
        id, total_amount, due_date, quote_request_id,
        quote_requests (email, contact_name, event_name, event_date)
      `)
      .eq('workflow_status', 'overdue');

    if (overdueForReminder) {
      for (const invoice of overdueForReminder as any) {
        if (!invoice.quote_requests?.email) continue;

        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('invoice_id', invoice.id)
          .eq('reminder_type', 'overdue_payment')
          .gte('sent_at', todayStr)
          .maybeSingle();

        if (!recentReminder) {
          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: invoice.quote_requests.email,
              subject: `⚠️ Payment Overdue - ${invoice.quote_requests.event_name}`,
              html: generateEmailTemplate('overdue_payment', {
                contactName: invoice.quote_requests.contact_name,
                eventName: invoice.quote_requests.event_name,
                totalAmount: invoice.total_amount,
                dueDate: invoice.due_date
              })
            }
          });

          if (!emailError) {
            await supabase.from('reminder_logs').insert({
              invoice_id: invoice.id,
              reminder_type: 'overdue_payment',
              recipient_email: invoice.quote_requests.email,
              urgency: 'high'
            });
            overdueReminders++;
          }
        }
      }
    }
    reminderResults.push({ type: 'overdue_payment', count: overdueForReminder?.length || 0, sent: overdueReminders });

    // 2b. Upcoming milestone payment reminders (3 days out)
    logStep("Processing milestone payment reminders");
    let milestoneReminders = 0;
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: upcomingMilestones } = await supabase
      .from('payment_milestones')
      .select(`
        id, due_date, amount_cents, milestone_type, invoice_id,
        invoices (
          quote_request_id,
          quote_requests (email, contact_name, event_name)
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0])
      .gte('due_date', todayStr);

    if (upcomingMilestones) {
      for (const milestone of upcomingMilestones as any) {
        const email = milestone.invoices?.quote_requests?.email;
        if (!email) continue;

        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('invoice_id', milestone.invoice_id)
          .eq('reminder_type', 'payment_due_soon')
          .gte('sent_at', todayStr)
          .maybeSingle();

        if (!recentReminder) {
          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: email,
              subject: `Payment Due Soon - ${milestone.invoices.quote_requests.event_name}`,
              html: generateEmailTemplate('payment_due_soon', {
                contactName: milestone.invoices.quote_requests.contact_name,
                eventName: milestone.invoices.quote_requests.event_name,
                milestoneType: milestone.milestone_type,
                amount: milestone.amount_cents,
                dueDate: milestone.due_date
              })
            }
          });

          if (!emailError) {
            await supabase.from('reminder_logs').insert({
              invoice_id: milestone.invoice_id,
              reminder_type: 'payment_due_soon',
              recipient_email: email,
              urgency: 'medium'
            });
            milestoneReminders++;
          }
        }
      }
    }
    reminderResults.push({ type: 'payment_due_soon', count: upcomingMilestones?.length || 0, sent: milestoneReminders });

    // ============================================
    // SECTION 3: EVENT REMINDERS
    // ============================================

    // 3a. 7-day event reminder (final details confirmation)
    logStep("Processing 7-day event reminders");
    let sevenDayReminders = 0;
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: sevenDayEvents } = await supabase
      .from('quote_requests')
      .select('id, email, contact_name, event_name, event_date, location, guest_count')
      .eq('workflow_status', 'confirmed')
      .eq('event_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (sevenDayEvents) {
      for (const event of sevenDayEvents) {
        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('reminder_type', 'event_7_day')
          .eq('recipient_email', event.email)
          .gte('sent_at', todayStr)
          .maybeSingle();

        if (!recentReminder) {
          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: event.email,
              subject: `Final Details Confirmation - ${event.event_name} in 1 Week`,
              html: generateEmailTemplate('event_7_day', {
                contactName: event.contact_name,
                eventName: event.event_name,
                eventDate: event.event_date,
                location: event.location,
                guestCount: event.guest_count
              })
            }
          });

          if (!emailError) {
            await supabase.from('reminder_logs').insert({
              reminder_type: 'event_7_day',
              recipient_email: event.email,
              urgency: 'high'
            });
            sevenDayReminders++;
          }
        }
      }
    }
    reminderResults.push({ type: 'event_7_day', count: sevenDayEvents?.length || 0, sent: sevenDayReminders });

    // 3b. 2-day event reminder
    logStep("Processing 2-day event reminders");
    let twoDayReminders = 0;
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const { data: twoDayEvents } = await supabase
      .from('quote_requests')
      .select('id, email, contact_name, event_name, event_date, location, start_time')
      .eq('workflow_status', 'confirmed')
      .eq('event_date', twoDaysFromNow.toISOString().split('T')[0]);

    if (twoDayEvents) {
      for (const event of twoDayEvents) {
        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('reminder_type', 'event_2_day')
          .eq('recipient_email', event.email)
          .gte('sent_at', todayStr)
          .maybeSingle();

        if (!recentReminder) {
          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: event.email,
              subject: `Your Event is in 2 Days! - ${event.event_name}`,
              html: generateEmailTemplate('event_2_day', {
                contactName: event.contact_name,
                eventName: event.event_name,
                eventDate: event.event_date,
                location: event.location,
                startTime: event.start_time
              })
            }
          });

          if (!emailError) {
            await supabase.from('reminder_logs').insert({
              reminder_type: 'event_2_day',
              recipient_email: event.email,
              urgency: 'urgent'
            });
            twoDayReminders++;
          }
        }
      }
    }
    reminderResults.push({ type: 'event_2_day', count: twoDayEvents?.length || 0, sent: twoDayReminders });

    // 3c. Post-event thank you (1 day after)
    logStep("Processing post-event thank you emails");
    let thankYouReminders = 0;

    const { data: pastEvents } = await supabase
      .from('quote_requests')
      .select('id, email, contact_name, event_name, event_date')
      .eq('workflow_status', 'completed')
      .eq('event_date', yesterday.toISOString().split('T')[0]);

    if (pastEvents) {
      for (const event of pastEvents) {
        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('reminder_type', 'post_event_thankyou')
          .eq('recipient_email', event.email)
          .maybeSingle();

        if (!recentReminder) {
          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: event.email,
              subject: `Thank You for Choosing Soul Train's Eatery!`,
              html: generateEmailTemplate('post_event_thankyou', {
                contactName: event.contact_name,
                eventName: event.event_name
              })
            }
          });

          if (!emailError) {
            await supabase.from('reminder_logs').insert({
              reminder_type: 'post_event_thankyou',
              recipient_email: event.email,
              urgency: 'low'
            });
            thankYouReminders++;
          }
        }
      }
    }
    reminderResults.push({ type: 'post_event_thankyou', count: pastEvents?.length || 0, sent: thankYouReminders });

    // ============================================
    // SUMMARY
    // ============================================
    const totalSent = reminderResults.reduce((sum, r) => sum + r.sent, 0);
    
    logStep("Unified reminder system completed", {
      workflow: workflowResults,
      reminders: reminderResults,
      totalEmailsSent: totalSent,
      errors: errors.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        workflow: workflowResults,
        reminders: reminderResults,
        totalEmailsSent: totalSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in unified-reminder-system:', error);
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

function generateEmailTemplate(type: string, data: any): string {
  const baseStyle = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #ffffff; }
    .highlight { background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .urgent { background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .success { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
    .footer { text-align: center; color: #666; padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
    .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
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
        <h1 style="margin: 0;">Soul Train's Eatery</h1>
      </div>
      <div class="content">
        <p>Dear ${data.contactName},</p>
  `;

  switch (type) {
    case 'overdue_payment':
      content += `
        <div class="urgent">
          <h3 style="margin-top: 0;">⚠️ Payment Overdue</h3>
          <p>Your payment for <strong>${data.eventName}</strong> was due on ${new Date(data.dueDate).toLocaleDateString()}.</p>
          <p><strong>Amount Due:</strong> ${formatCurrency(data.totalAmount)}</p>
        </div>
        <p>Please contact us immediately at (843) 970-0265 to arrange payment and ensure your event proceeds as planned.</p>
      `;
      break;

    case 'payment_due_soon':
      content += `
        <div class="highlight">
          <h3 style="margin-top: 0;">Payment Due Soon</h3>
          <p>A ${data.milestoneType.replace('_', ' ')} payment is coming due for your event.</p>
          <p><strong>Event:</strong> ${data.eventName}<br>
          <strong>Amount:</strong> ${formatCurrency(data.amount)}<br>
          <strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
        </div>
        <p>Please arrange payment before the due date to keep your event on track.</p>
      `;
      break;

    case 'event_7_day':
      content += `
        <div class="highlight">
          <h3 style="margin-top: 0;">📋 Final Details Confirmation</h3>
          <p>Your event is just <strong>one week away</strong>! We need to confirm the final details:</p>
          <ul>
            <li>Final guest count (currently ${data.guestCount})</li>
            <li>Menu modifications or dietary restrictions</li>
            <li>Setup timing and location access</li>
            <li>Contact person for the day of event</li>
          </ul>
          <p><strong>Event:</strong> ${data.eventName}<br>
          <strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}<br>
          <strong>Location:</strong> ${data.location}</p>
        </div>
        <p>Please call us at (843) 970-0265 or reply to this email with any updates.</p>
      `;
      break;

    case 'event_2_day':
      content += `
        <div class="urgent">
          <h3 style="margin-top: 0;">🎉 Your Event is in 2 Days!</h3>
          <p>We're excited to cater your event! Here's what you need to know:</p>
          <p><strong>Event:</strong> ${data.eventName}<br>
          <strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}<br>
          <strong>Location:</strong> ${data.location}<br>
          <strong>Start Time:</strong> ${data.startTime || 'As scheduled'}</p>
        </div>
        <p><strong>Please ensure:</strong></p>
        <ul>
          <li>Venue access is arranged for our team</li>
          <li>A contact person is available at the venue</li>
          <li>Setup area is cleared and ready</li>
        </ul>
        <p>Emergency contact: (843) 970-0265</p>
      `;
      break;

    case 'post_event_thankyou':
      content += `
        <div class="success">
          <h3 style="margin-top: 0;">🙏 Thank You!</h3>
          <p>We hope your event, <strong>${data.eventName}</strong>, was everything you dreamed it would be!</p>
        </div>
        <p>It was our pleasure to serve you and your guests. We'd love to hear about your experience:</p>
        <ul>
          <li>Leave us a review on Google or Facebook</li>
          <li>Share photos from your event (we love seeing happy guests!)</li>
          <li>Let us know if anything exceeded or fell short of expectations</li>
        </ul>
        <p>Thank you for trusting Soul Train's Eatery with your special day. We look forward to catering your future events!</p>
      `;
      break;

    default:
      content += `<p>This is a reminder about your event with Soul Train's Eatery.</p>`;
  }

  content += `
        <p>Questions? Call us at (843) 970-0265 or reply to this email.</p>
        <p>Best regards,<br><strong>The Soul Train's Eatery Team</strong></p>
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

serve(handler);
