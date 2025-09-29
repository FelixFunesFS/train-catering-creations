import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteRequest {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  serving_start_time?: string;
  location: string;
  contact_name: string;
  email: string;
  phone: string;
  guest_count: number;
  calendar_event_id?: string;
  calendar_sync_status?: string;
  last_calendar_sync?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, quoteId } = await req.json();
    
    if (!action || !quoteId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: action and quoteId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the quote request
    const { data: quote, error: fetchError } = await supabaseClient
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (fetchError || !quote) {
      return new Response(
        JSON.stringify({ error: 'Quote request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'create_event':
        return await createCalendarEvent(supabaseClient, quote);
      case 'update_event':
        return await updateCalendarEvent(supabaseClient, quote);
      case 'delete_event':
        return await deleteCalendarEvent(supabaseClient, quote);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Calendar sync error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createCalendarEvent(supabaseClient: any, quote: QuoteRequest) {
  try {
    // This is a placeholder for Google Calendar API integration
    // You would implement the actual Google Calendar API calls here
    
    const eventData = {
      summary: `${quote.event_name} - Soul Train's Eatery Catering`,
      description: `
Catering Event Details:
- Contact: ${quote.contact_name} (${quote.email}, ${quote.phone})
- Guests: ${quote.guest_count}
- Location: ${quote.location}

Event managed by Soul Train's Eatery
      `,
      start: {
        dateTime: `${quote.event_date}T${quote.start_time || '12:00:00'}`,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: `${quote.event_date}T${addHours(quote.start_time || '12:00:00', 4)}`,
        timeZone: 'America/New_York',
      },
      location: quote.location,
    };

    // Simulate calendar event creation
    const mockEventId = `event_${quote.id}_${Date.now()}`;
    
    // Update the quote request with calendar sync info
    const { error: updateError } = await supabaseClient
      .from('quote_requests')
      .update({
        calendar_event_id: mockEventId,
        calendar_sync_status: 'synced',
        last_calendar_sync: new Date().toISOString(),
      })
      .eq('id', quote.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: mockEventId,
        message: 'Calendar event created successfully (mock implementation)' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create calendar event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updateCalendarEvent(supabaseClient: any, quote: QuoteRequest) {
  try {
    if (!quote.calendar_event_id) {
      return new Response(
        JSON.stringify({ error: 'No calendar event associated with this quote' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // This would update the existing Google Calendar event
    // Placeholder implementation
    
    const { error: updateError } = await supabaseClient
      .from('quote_requests')
      .update({
        last_calendar_sync: new Date().toISOString(),
      })
      .eq('id', quote.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Calendar event updated successfully (mock implementation)' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update calendar event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function deleteCalendarEvent(supabaseClient: any, quote: QuoteRequest) {
  try {
    if (!quote.calendar_event_id) {
      return new Response(
        JSON.stringify({ error: 'No calendar event associated with this quote' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // This would delete the Google Calendar event
    // Placeholder implementation
    
    const { error: updateError } = await supabaseClient
      .from('quote_requests')
      .update({
        calendar_event_id: null,
        calendar_sync_status: 'not_synced',
        last_calendar_sync: null,
      })
      .eq('id', quote.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Calendar event deleted successfully (mock implementation)' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete calendar event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

function addHours(timeString: string, hours: number): string {
  const [h, m, s] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(h + hours, m, s || 0);
  return date.toTimeString().split(' ')[0];
}