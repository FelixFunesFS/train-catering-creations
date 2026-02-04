import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { formatDateToString, getTodayString, subtractDays } from '../_shared/dateHelpers.ts';

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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartIso = todayStart.toISOString();

    const results = {
      autoApproved: 0,
      markedOverdue: 0,
      autoConfirmed: 0,
      autoCompleted: 0,
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
    const yesterdayStr = subtractDays(getTodayString(), 1);
    
    const { data: completableQuotes, error: completeError } = await supabase
      .from('quote_requests')
      .select('id, event_date, workflow_status')
      .eq('workflow_status', 'confirmed')
      .lt('event_date', yesterdayStr);

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

    // NOTE: Payment reminders are now handled exclusively by unified-reminder-system
    // This function only handles workflow transitions (overdue marking, auto-confirm, auto-complete)

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
