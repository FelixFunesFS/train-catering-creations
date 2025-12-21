import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-WORKFLOW] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep("Starting automated workflow transitions");

    const results = {
      autoApproved: 0,
      markedOverdue: 0,
      autoConfirmed: 0,
      autoCompleted: 0,
      remindersSent: 0,
      errors: [] as string[]
    };

    // 1. Auto-mark overdue invoices
    logStep("Checking for overdue invoices");
    const { data: overdueInvoices, error: overdueError } = await supabase
      .from('invoices')
      .select('id, due_date, workflow_status')
      .in('workflow_status', ['sent', 'approved'])
      .lt('due_date', new Date().toISOString());

    if (!overdueError && overdueInvoices) {
      for (const invoice of overdueInvoices) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            workflow_status: 'overdue',
            status_changed_by: 'system',
            last_status_change: new Date().toISOString()
          })
          .eq('id', invoice.id);

        if (!updateError) {
          results.markedOverdue++;
          
          await supabase.from('workflow_state_log').insert({
            entity_type: 'invoices',
            entity_id: invoice.id,
            previous_status: invoice.workflow_status,
            new_status: 'overdue',
            changed_by: 'auto_workflow_manager',
            change_reason: 'Payment past due date'
          });
        } else {
          results.errors.push(`Failed to mark invoice ${invoice.id} as overdue: ${updateError.message}`);
        }
      }
    }

    // 2. Auto-confirm events when fully paid (no contract required)
    logStep("Checking for events to auto-confirm");
    const { data: paidInvoices, error: paidError } = await supabase
      .from('invoices')
      .select('id, quote_request_id, workflow_status')
      .eq('workflow_status', 'paid');

    if (!paidError && paidInvoices) {
      for (const invoice of paidInvoices) {
        if (invoice.quote_request_id) {
          // Update quote to confirmed (skip if already confirmed, in_progress, or completed)
          const { error: quoteUpdateError } = await supabase
            .from('quote_requests')
            .update({
              workflow_status: 'confirmed',
              status_changed_by: 'system',
              last_status_change: new Date().toISOString()
            })
            .eq('id', invoice.quote_request_id)
            .not('workflow_status', 'in', '("confirmed","in_progress","completed")');

          if (!quoteUpdateError) {
            results.autoConfirmed++;
            
            await supabase.from('workflow_state_log').insert({
              entity_type: 'quote_requests',
              entity_id: invoice.quote_request_id,
              previous_status: 'paid',
              new_status: 'confirmed',
              changed_by: 'auto_workflow_manager',
              change_reason: 'Payment received - event auto-confirmed'
            });
          }
        }
      }
    }

    // 3. Auto-complete events (day after event date)
    logStep("Checking for events to auto-complete");
    const yesterday = new Date();
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
            status_changed_by: 'system',
            last_status_change: new Date().toISOString()
          })
          .eq('id', quote.id);

        if (!updateError) {
          results.autoCompleted++;
          
          await supabase.from('workflow_state_log').insert({
            entity_type: 'quote_requests',
            entity_id: quote.id,
            previous_status: 'confirmed',
            new_status: 'completed',
            changed_by: 'auto_workflow_manager',
            change_reason: 'Event date passed'
          });
        } else {
          results.errors.push(`Failed to complete quote ${quote.id}: ${updateError.message}`);
        }
      }
    }

    // 4. Send payment reminders for upcoming milestones
    logStep("Checking for payment reminders");
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: upcomingMilestones, error: milestoneError } = await supabase
      .from('payment_milestones')
      .select(`
        id,
        due_date,
        invoice_id,
        invoices (
          quote_requests (
            email,
            contact_name,
            event_name
          )
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0])
      .gte('due_date', new Date().toISOString().split('T')[0]);

    if (!milestoneError && upcomingMilestones) {
      for (const milestone of upcomingMilestones as any) {
        // Check if reminder already sent today
        const { data: existingReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('invoice_id', milestone.invoice_id)
          .eq('reminder_type', 'payment_due_soon')
          .gte('sent_at', new Date().toISOString().split('T')[0]);

        if (!existingReminder || existingReminder.length === 0) {
          // Send reminder email
          const { error: emailError } = await supabase.functions.invoke('send-smtp-email', {
            body: {
              to: milestone.invoices.quote_requests.email,
              subject: `Payment Reminder - ${milestone.invoices.quote_requests.event_name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Payment Reminder</h2>
                  <p>Dear ${milestone.invoices.quote_requests.contact_name},</p>
                  <p>This is a friendly reminder that a payment is due soon for your upcoming event: <strong>${milestone.invoices.quote_requests.event_name}</strong>.</p>
                  <p>Due date: ${new Date(milestone.due_date).toLocaleDateString()}</p>
                  <p>Please ensure payment is made on time to avoid any delays.</p>
                  <p>Best regards,<br>Soul Train's Eatery</p>
                </div>
              `
            }
          });

          if (!emailError) {
            results.remindersSent++;
            
            await supabase.from('reminder_logs').insert({
              invoice_id: milestone.invoice_id,
              reminder_type: 'payment_due_soon',
              recipient_email: milestone.invoices.quote_requests.email,
              urgency: 'medium'
            });
          } else {
            results.errors.push(`Failed to send reminder for milestone ${milestone.id}: ${emailError.message}`);
          }
        }
      }
    }

    logStep("Automated workflow transitions completed", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Automated workflow transitions completed',
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in auto-workflow-manager:', error);
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
