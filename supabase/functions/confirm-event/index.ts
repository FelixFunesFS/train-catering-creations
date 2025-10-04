import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ConfirmEventRequest {
  quote_request_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_request_id }: ConfirmEventRequest = await req.json();
    
    if (!quote_request_id) {
      throw new Error('Quote request ID is required');
    }

    console.log('Confirming event for quote:', quote_request_id);

    // Fetch quote data
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quote_request_id)
      .single();

    if (quoteError || !quote) {
      throw new Error('Quote request not found');
    }

    // Check if timeline tasks already exist
    const { data: existingTasks } = await supabase
      .from('event_timeline_tasks')
      .select('id')
      .eq('quote_request_id', quote_request_id);

    if (!existingTasks || existingTasks.length === 0) {
      // Generate timeline tasks
      const eventDate = new Date(quote.event_date);
      
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const addWeeks = (date: Date, weeks: number) => {
        return addDays(date, weeks * 7);
      };

      const defaultTasks = [
        {
          quote_request_id: quote_request_id,
          task_name: 'Final menu confirmation',
          task_type: 'pre_event',
          due_date: addWeeks(eventDate, -2).toISOString(),
          notes: 'Confirm final menu selections and guest count with customer'
        },
        {
          quote_request_id: quote_request_id,
          task_name: 'Equipment & supplies check',
          task_type: 'pre_event',
          due_date: addWeeks(eventDate, -1).toISOString(),
          notes: 'Verify all chafers, linens, and serving equipment are ready'
        },
        {
          quote_request_id: quote_request_id,
          task_name: 'Staff scheduling',
          task_type: 'pre_event',
          due_date: addDays(eventDate, -5).toISOString(),
          notes: 'Schedule wait staff and kitchen team for event'
        },
        {
          quote_request_id: quote_request_id,
          task_name: 'Grocery shopping & prep',
          task_type: 'pre_event',
          due_date: addDays(eventDate, -2).toISOString(),
          notes: 'Purchase ingredients and begin food prep'
        },
        {
          quote_request_id: quote_request_id,
          task_name: 'Final prep & packing',
          task_type: 'day_of',
          due_date: addDays(eventDate, -1).toISOString(),
          notes: 'Complete cooking, pack equipment and supplies'
        },
        {
          quote_request_id: quote_request_id,
          task_name: 'Event execution',
          task_type: 'day_of',
          due_date: eventDate.toISOString(),
          notes: 'Setup, service, and breakdown at event location'
        },
        {
          quote_request_id: quote_request_id,
          task_name: 'Send thank you email',
          task_type: 'post_event',
          due_date: addDays(eventDate, 1).toISOString(),
          notes: 'Send follow-up thank you and request feedback'
        }
      ];

      const { error: tasksError } = await supabase
        .from('event_timeline_tasks')
        .insert(defaultTasks);

      if (tasksError) {
        console.error('Error creating timeline tasks:', tasksError);
      } else {
        console.log(`Created ${defaultTasks.length} timeline tasks`);
      }
    } else {
      console.log('Timeline tasks already exist');
    }

    // Send confirmation email (optional - requires send-confirmation function)
    try {
      await supabase.functions.invoke('send-confirmation', {
        body: {
          customer_email: quote.email,
          customer_name: quote.contact_name,
          event_name: quote.event_name,
          event_date: quote.event_date,
          event_time: quote.start_time,
          location: quote.location,
          guest_count: quote.guest_count
        }
      });
      console.log('Confirmation email sent');
    } catch (emailError) {
      console.log('Confirmation email not sent (function may not exist):', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Event confirmed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error confirming event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
