import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { 
  EMAIL_CONFIGS,
  generateStandardEmail,
  getEmailContentBlocks
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
    const todayStartIso = today.toISOString();

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
        id, total_amount, due_date, quote_request_id, workflow_status, last_status_change,
        quote_requests (email, contact_name, event_name, event_date)
      `)
      .eq('workflow_status', 'overdue');

    if (overdueForReminder) {
      for (const invoice of overdueForReminder as any) {
        if (!invoice.quote_requests?.email) continue;

        // 24-hour post-approval cooldown (safety valve; typically won't apply to overdue)
        if (invoice.workflow_status && ['approved', 'payment_pending'].includes(invoice.workflow_status) && invoice.last_status_change) {
          const hoursSinceStatusChange = (Date.now() - new Date(invoice.last_status_change).getTime()) / (1000 * 60 * 60);
          if (Number.isFinite(hoursSinceStatusChange) && hoursSinceStatusChange < 24) {
            logStep('Skipping overdue reminder due to 24h post-approval cooldown', {
              invoice_id: invoice.id,
              hours_since_status_change: Math.round(hoursSinceStatusChange * 10) / 10,
            });
            continue;
          }
        }

        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('invoice_id', invoice.id)
          .eq('reminder_type', 'overdue_payment')
          .gte('sent_at', todayStartIso)
          .maybeSingle();

        if (!recentReminder) {
          // Canonical customer-facing renderer + payment link
          const { error: emailError } = await supabase.functions.invoke('send-payment-reminder', {
            body: {
              invoiceId: invoice.id,
              customerEmail: invoice.quote_requests.email,
              customerName: invoice.quote_requests.contact_name,
              eventName: invoice.quote_requests.event_name,
              balanceRemaining: invoice.total_amount ?? 0,
              daysOverdue: invoice.due_date ? Math.max(0, Math.ceil((Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))) : 0,
              urgency: 'high'
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
        id, due_date, amount_cents, milestone_type, is_due_now, invoice_id,
        invoices (
          workflow_status,
          last_status_change,
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

        // 24-hour post-approval cooldown (prevents nagging immediately after approval)
        const invoiceStatus: string | undefined = milestone.invoices?.workflow_status;
        const lastStatusChange: string | undefined = milestone.invoices?.last_status_change;
        if (invoiceStatus && ['approved', 'payment_pending'].includes(invoiceStatus) && lastStatusChange) {
          const hoursSinceStatusChange = (Date.now() - new Date(lastStatusChange).getTime()) / (1000 * 60 * 60);
          if (Number.isFinite(hoursSinceStatusChange) && hoursSinceStatusChange < 24) {
            logStep('Skipping milestone reminder due to 24h post-approval cooldown', {
              invoice_id: milestone.invoice_id,
              invoice_status: invoiceStatus,
              hours_since_status_change: Math.round(hoursSinceStatusChange * 10) / 10,
              milestone_due_date: milestone.due_date,
            });
            continue;
          }
        }

        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('invoice_id', milestone.invoice_id)
          .eq('reminder_type', 'payment_due_soon')
          .gte('sent_at', todayStartIso)
          .maybeSingle();

        if (!recentReminder) {
          // Canonical customer-facing renderer + payment link with milestone context
          const { error: emailError } = await supabase.functions.invoke('send-payment-reminder', {
            body: {
              invoiceId: milestone.invoice_id,
              customerEmail: email,
              customerName: milestone.invoices?.quote_requests?.contact_name,
              eventName: milestone.invoices?.quote_requests?.event_name,
              balanceRemaining: milestone.amount_cents ?? 0,
              daysOverdue: 0,
              urgency: 'medium',
              milestoneType: milestone.milestone_type,
              isDueNow: milestone.is_due_now
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
      // Select full quote payload so canonical blocks (event_details + menu_summary) have required context
      .select('*')
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
          const emailHtml = generateStandardEmail({
            preheaderText: 'Your event is one week away—let’s confirm the final details.',
            heroSection: {
              badge: '📅 1 WEEK AWAY',
              title: 'Final Details Confirmation',
              subtitle: event.event_name,
              variant: 'gold'
            },
            quote: event,
            contentBlocks: [
              { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Dear ${event.contact_name || 'Valued Customer'},</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">Your event is just <strong>one week away</strong>! Please review and confirm any final updates.</p>` } },
              { type: 'event_details' },
              { type: 'menu_summary' },
              { type: 'text', data: { html: `<p style="font-size:15px;margin:16px 0 0 0;line-height:1.6;">If anything has changed (guest count, dietary needs, access/setup timing), reply to this email or call us at <a href="tel:+18439700265" style="color:#DC143C;">(843) 970-0265</a>.</p>` } },
            ],
          });

          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: { to: event.email, subject: `Final Details Confirmation - ${event.event_name} in 1 Week`, html: emailHtml }
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
      .select('*')
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
          const emailHtml = generateStandardEmail({
            preheaderText: 'Your catering event is in 2 days—here are the key logistics.',
            heroSection: {
              badge: '⏱️ 48 HOURS',
              title: 'We’ll See You Soon',
              subtitle: event.event_name,
              variant: 'crimson'
            },
            quote: event,
            contentBlocks: [
              { type: 'text', data: { html: `<p style="font-size:16px;margin:0 0 16px 0;">Dear ${event.contact_name || 'Valued Customer'},</p><p style="font-size:15px;margin:0 0 16px 0;line-height:1.6;">We’re excited to cater your event in <strong>2 days</strong>. Below are the details we have on file.</p>` } },
              { type: 'event_details' },
              { type: 'menu_summary' },
              { type: 'text', data: { html: `<p style="font-size:15px;margin:16px 0 0 0;line-height:1.6;">Day-of questions or venue access updates? Call <a href="tel:+18439700265" style="color:#DC143C;">(843) 970-0265</a>.</p>` } },
            ],
          });

          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: { to: event.email, subject: `Your Event is in 2 Days! - ${event.event_name}`, html: emailHtml }
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
      .select('*')
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
          // Use shared helper - Single Source of Truth for event_followup
          const { contentBlocks } = getEmailContentBlocks('event_followup', 'customer', {
            quote: event,
            invoice: {},
            lineItems: [],
            milestones: [],
            portalUrl: '',
          });

          const emailHtml = generateStandardEmail({
            preheaderText: EMAIL_CONFIGS.event_followup.customer!.preheaderText,
            heroSection: {
              ...EMAIL_CONFIGS.event_followup.customer!.heroSection,
              subtitle: event.event_name
            },
            contentBlocks,
            quote: event,
          });

          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: { to: event.email, subject: `Thank You for Choosing Soul Train's Eatery!`, html: emailHtml }
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

serve(handler);
