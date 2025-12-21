import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  BRAND_COLORS, 
  LOGO_URLS, 
  generateEmailHeader, 
  generateFooter,
  formatCurrency as formatCurrencyShared 
} from '../_shared/emailTemplates.ts';

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

/**
 * Generate branded email templates using Soul Train's brand colors
 * TABLE-BASED layouts for maximum email client compatibility
 */
function generateEmailTemplate(type: string, data: any): string {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
  
  let content = '';

  switch (type) {
    case 'overdue_payment':
      content = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fee2e2;border-radius:8px;border-left:4px solid ${BRAND_COLORS.crimson};margin:20px 0;border-collapse:collapse;">
<tr><td style="padding:20px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:18px;">⚠️ Payment Overdue</h3>
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#333;">Your payment for <strong>${data.eventName}</strong> was due on ${new Date(data.dueDate).toLocaleDateString()}.</p>
<p style="margin:0;font-size:16px;color:${BRAND_COLORS.crimson};font-weight:bold;">Amount Due: ${formatCurrency(data.totalAmount)}</p>
</td></tr>
</table>
<p style="margin:16px 0;font-size:15px;line-height:1.6;color:#333;">Please contact us immediately at <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};font-weight:bold;">(843) 970-0265</a> to arrange payment and ensure your event proceeds as planned.</p>
`;
      break;

    case 'payment_due_soon':
      content = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.lightGray};border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:20px 0;border-collapse:collapse;">
<tr><td style="padding:20px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:18px;">Payment Due Soon</h3>
<p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;">A ${data.milestoneType.replace('_', ' ')} payment is coming due for your event.</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;border-collapse:collapse;">
<tr><td style="padding:4px 0;font-size:14px;"><strong>Event:</strong> ${data.eventName}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;"><strong>Amount:</strong> ${formatCurrency(data.amount)}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</td></tr>
</table>
</td></tr>
</table>
<p style="margin:16px 0;font-size:15px;line-height:1.6;color:#333;">Please arrange payment before the due date to keep your event on track.</p>
`;
      break;

    case 'event_7_day':
      content = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_COLORS.lightGray};border-radius:8px;border-left:4px solid ${BRAND_COLORS.gold};margin:20px 0;border-collapse:collapse;">
<tr><td style="padding:20px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:18px;">📋 Final Details Confirmation</h3>
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#333;">Your event is just <strong>one week away</strong>! We need to confirm the final details:</p>
<ul style="margin:0;padding-left:20px;line-height:1.8;">
<li>Final guest count (currently ${data.guestCount})</li>
<li>Menu modifications or dietary restrictions</li>
<li>Setup timing and location access</li>
<li>Contact person for the day of event</li>
</ul>
<table cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:4px 0;font-size:14px;"><strong>Event:</strong> ${data.eventName}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;"><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;"><strong>Location:</strong> ${data.location}</td></tr>
</table>
</td></tr>
</table>
<p style="margin:16px 0;font-size:15px;line-height:1.6;color:#333;">Please call us at <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};font-weight:bold;">(843) 970-0265</a> or reply to this email with any updates.</p>
`;
      break;

    case 'event_2_day':
      content = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,${BRAND_COLORS.gold}20,${BRAND_COLORS.gold}40);border-radius:8px;border:2px solid ${BRAND_COLORS.gold};margin:20px 0;border-collapse:collapse;">
<tr><td style="padding:20px;">
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:20px;">🎉 Your Event is in 2 Days!</h3>
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#333;">We're excited to cater your event! Here's what you need to know:</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;border-collapse:collapse;">
<tr><td style="padding:4px 0;font-size:14px;"><strong>Event:</strong> ${data.eventName}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;"><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;"><strong>Location:</strong> ${data.location}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;"><strong>Start Time:</strong> ${data.startTime || 'As scheduled'}</td></tr>
</table>
</td></tr>
</table>
<p style="margin:16px 0;font-size:15px;line-height:1.6;color:#333;"><strong>Please ensure:</strong></p>
<ul style="margin:0;padding-left:20px;line-height:1.8;">
<li>Venue access is arranged for our team</li>
<li>A contact person is available at the venue</li>
<li>Setup area is cleared and ready</li>
</ul>
<p style="margin:16px 0;font-size:15px;color:#333;">Emergency contact: <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};font-weight:bold;">(843) 970-0265</a></p>
`;
      break;

    case 'post_event_thankyou':
      content = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#dcfce7;border-radius:8px;border-left:4px solid #22c55e;margin:20px 0;border-collapse:collapse;">
<tr><td style="padding:20px;">
<h3 style="margin:0 0 12px 0;color:#166534;font-size:18px;">🙏 Thank You!</h3>
<p style="margin:0;font-size:15px;line-height:1.6;color:#333;">We hope your event, <strong>${data.eventName}</strong>, was everything you dreamed it would be!</p>
</td></tr>
</table>
<p style="margin:16px 0;font-size:15px;line-height:1.6;color:#333;">It was our pleasure to serve you and your guests. We'd love to hear about your experience:</p>
<ul style="margin:0;padding-left:20px;line-height:1.8;">
<li>Leave us a review on Google or Facebook</li>
<li>Share photos from your event (we love seeing happy guests!)</li>
<li>Let us know if anything exceeded or fell short of expectations</li>
</ul>
<p style="margin:16px 0;font-size:15px;line-height:1.6;color:#333;">Thank you for trusting Soul Train's Eatery with your special day. We look forward to catering your future events!</p>
`;
      break;

    default:
      content = `<p style="margin:16px 0;font-size:15px;line-height:1.6;color:#333;">This is a reminder about your event with Soul Train's Eatery.</p>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Soul Train's Eatery</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:20px 0;border-collapse:collapse;">
<tr>
<td align="center">
<table width="100%" style="max-width:600px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);border-collapse:collapse;">
<tr>
<td style="background:linear-gradient(135deg,${BRAND_COLORS.crimson} 0%,${BRAND_COLORS.crimsonDark} 100%);padding:30px;text-align:center;">
<img src="${LOGO_URLS.white}" alt="Soul Train's Eatery" width="70" height="70" style="display:block;width:70px;height:70px;margin:0 auto 12px auto;" />
<h1 style="color:${BRAND_COLORS.gold};margin:0;font-size:26px;font-weight:bold;">Soul Train's Eatery</h1>
<p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:14px;font-style:italic;">Authentic Southern Cooking from the Heart</p>
</td>
</tr>
<tr>
<td style="padding:30px;">
<p style="margin:0 0 16px 0;font-size:16px;color:#333;">Dear ${data.contactName},</p>
${content}
<p style="margin:24px 0 0 0;font-size:15px;color:#333;">Questions? Call us at <a href="tel:+18439700265" style="color:${BRAND_COLORS.crimson};font-weight:bold;">(843) 970-0265</a> or reply to this email.</p>
<p style="margin:16px 0 0 0;font-size:15px;color:#333;">Best regards,<br><strong>The Soul Train's Eatery Team</strong></p>
</td>
</tr>
<tr>
<td style="background:${BRAND_COLORS.darkGray};padding:24px;text-align:center;">
<img src="${LOGO_URLS.white}" alt="" width="40" height="40" style="display:block;width:40px;height:40px;margin:0 auto 8px auto;opacity:0.8;" />
<p style="color:${BRAND_COLORS.gold};margin:0 0 4px 0;font-weight:bold;font-size:14px;">Soul Train's Eatery</p>
<p style="color:rgba(255,255,255,0.7);margin:0;font-size:12px;">Charleston's Trusted Catering Partner</p>
<p style="color:rgba(255,255,255,0.5);margin:10px 0 0 0;font-size:11px;">(843) 970-0265 | soultrainseatery@gmail.com</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

serve(handler);
