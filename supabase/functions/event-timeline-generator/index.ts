import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { formatDateToString, parseDateString, getTodayString } from '../_shared/dateHelpers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TIMELINE-GEN] ${step}${detailsStr}`);
};

interface TimelineTask {
  task_name: string;
  task_type: string;
  days_before_event: number;
  notes?: string;
}

const DEFAULT_TASKS: TimelineTask[] = [
  {
    task_name: 'Initial Quote Sent',
    task_type: 'communication',
    days_before_event: 60,
    notes: 'Quote sent to customer for review'
  },
  {
    task_name: 'Follow-up on Quote',
    task_type: 'communication',
    days_before_event: 45,
    notes: 'Check if customer has any questions about the quote'
  },
  {
    task_name: 'Final Menu Confirmation',
    task_type: 'menu_planning',
    days_before_event: 30,
    notes: 'Confirm final menu selections and dietary restrictions'
  },
  {
    task_name: 'Deposit Payment Due',
    task_type: 'payment',
    days_before_event: 30,
    notes: 'Initial deposit payment should be received'
  },
  {
    task_name: 'Ingredient Ordering',
    task_type: 'preparation',
    days_before_event: 21,
    notes: 'Order special ingredients and supplies'
  },
  {
    task_name: 'Confirm Guest Count',
    task_type: 'logistics',
    days_before_event: 14,
    notes: 'Get final guest count for accurate preparation'
  },
  {
    task_name: 'Equipment Check',
    task_type: 'preparation',
    days_before_event: 10,
    notes: 'Verify all equipment (chafers, serving utensils, etc.) is ready'
  },
  {
    task_name: 'Finalize Setup Details',
    task_type: 'logistics',
    days_before_event: 7,
    notes: 'Confirm location access, setup area, and timing'
  },
  {
    task_name: 'Staff Assignment',
    task_type: 'preparation',
    days_before_event: 7,
    notes: 'Assign kitchen and service staff for the event'
  },
  {
    task_name: 'Final Payment Due',
    task_type: 'payment',
    days_before_event: 7,
    notes: 'Final balance payment should be received'
  },
  {
    task_name: 'Final Prep Meeting',
    task_type: 'preparation',
    days_before_event: 3,
    notes: 'Team meeting to review all event details'
  },
  {
    task_name: 'Ingredient Prep Starts',
    task_type: 'preparation',
    days_before_event: 2,
    notes: 'Begin preparing ingredients that can be done in advance'
  },
  {
    task_name: 'Pre-Event Checklist',
    task_type: 'logistics',
    days_before_event: 2,
    notes: 'Final walkthrough of all event requirements'
  },
  {
    task_name: 'Load & Transport',
    task_type: 'logistics',
    days_before_event: 0,
    notes: 'Load equipment and food, transport to venue'
  },
  {
    task_name: 'Setup & Service',
    task_type: 'event_day',
    days_before_event: 0,
    notes: 'Complete setup and serve the event'
  }
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep("Starting event timeline generation");

    const results = {
      quotesProcessed: 0,
      tasksGenerated: 0,
      errors: [] as string[]
    };

    // Find confirmed quotes without timeline tasks
    const { data: quotes, error: quotesError } = await supabase
      .from('quote_requests')
      .select(`
        id,
        event_date,
        event_name,
        guest_count,
        service_type
      `)
      .in('workflow_status', ['confirmed', 'estimated'])
      .gte('event_date', getTodayString());

    if (quotesError) {
      throw new Error(`Failed to fetch quotes: ${quotesError.message}`);
    }

    if (!quotes || quotes.length === 0) {
      logStep("No quotes found requiring timeline generation");
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No quotes requiring timeline generation',
          results
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    for (const quote of quotes) {
      try {
        // Check if tasks already exist for this quote
        const { data: existingTasks } = await supabase
          .from('event_timeline_tasks')
          .select('id')
          .eq('quote_request_id', quote.id)
          .limit(1);

        if (existingTasks && existingTasks.length > 0) {
          logStep(`Timeline tasks already exist for quote ${quote.id}`);
          continue;
        }

        const eventDate = parseDateString(quote.event_date);
        const tasksToInsert = [];
        const todayDate = parseDateString(getTodayString());

        // Generate tasks based on event date
        for (const taskTemplate of DEFAULT_TASKS) {
          const dueDate = new Date(eventDate);
          dueDate.setDate(dueDate.getDate() - taskTemplate.days_before_event);

          // Only create tasks with due dates in the future or today
          if (dueDate >= todayDate) {
            tasksToInsert.push({
              quote_request_id: quote.id,
              task_name: taskTemplate.task_name,
              task_type: taskTemplate.task_type,
              days_before_event: taskTemplate.days_before_event,
              due_date: formatDateToString(dueDate),
              is_date_dependent: true,
              completed: false,
              notes: taskTemplate.notes
            });
          }
        }

        // Add custom tasks based on service type
        if (quote.service_type === 'full-service') {
          const setupDate = new Date(eventDate);
          setupDate.setDate(setupDate.getDate() - 1);
          
          if (setupDate >= todayDate) {
            tasksToInsert.push({
              quote_request_id: quote.id,
              task_name: 'Staff Briefing',
              task_type: 'preparation',
              days_before_event: 1,
              due_date: formatDateToString(setupDate),
              is_date_dependent: true,
              completed: false,
              notes: 'Brief service staff on event details and customer preferences'
            });
          }
        }

        // Add guest count-specific task for large events
        if (quote.guest_count > 100) {
          const largeEventDate = new Date(eventDate);
          largeEventDate.setDate(largeEventDate.getDate() - 14);
          
          if (largeEventDate >= todayDate) {
            tasksToInsert.push({
              quote_request_id: quote.id,
              task_name: 'Large Event Coordination',
              task_type: 'logistics',
              days_before_event: 14,
              due_date: formatDateToString(largeEventDate),
              is_date_dependent: true,
              completed: false,
              notes: `Coordinate additional resources for ${quote.guest_count} guests`
            });
          }
        }

        // Insert all tasks
        if (tasksToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('event_timeline_tasks')
            .insert(tasksToInsert);

          if (insertError) {
            results.errors.push(`Failed to create tasks for quote ${quote.id}: ${insertError.message}`);
          } else {
            results.tasksGenerated += tasksToInsert.length;
            results.quotesProcessed++;
            logStep(`Created ${tasksToInsert.length} tasks for quote ${quote.id} (${quote.event_name})`);
          }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Error processing quote ${quote.id}: ${errorMessage}`);
      }
    }

    logStep("Event timeline generation completed", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event timeline generation completed',
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in event-timeline-generator:', error);
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
