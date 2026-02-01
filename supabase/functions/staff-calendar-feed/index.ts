import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple token for staff access (can be upgraded to per-user tokens later)
const STAFF_TOKEN = 'soul-trains-staff-2024';

interface QuoteRequest {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string | null;
  serving_start_time: string | null;
  location: string;
  guest_count: number;
  event_type: string;
  service_type: string;
  workflow_status: string;
  version: number;
  proteins: string[] | null;
  sides: string[] | null;
  special_requests: string | null;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    'private_party': 'Private Party',
    'birthday': 'Birthday',
    'military_function': 'Military Function',
    'wedding': 'Wedding',
    'corporate': 'Corporate',
    'graduation': 'Graduation',
  };
  return labels[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatServiceType(type: string): string {
  const labels: Record<string, string> = {
    'full-service': 'Full Service',
    'delivery-only': 'Delivery Only',
    'drop-off': 'Drop-Off',
    'buffet': 'Buffet',
    'plated': 'Plated',
    'family-style': 'Family Style',
  };
  return labels[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function generateVEvent(event: QuoteRequest, dtstamp: string): string {
  // Parse event date and time
  const eventDate = new Date(event.event_date + 'T00:00:00');
  const timeStr = event.start_time || '12:00:00';
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const startDateTime = new Date(eventDate);
  startDateTime.setHours(hours, minutes, 0, 0);
  
  // Default 4 hour duration for catering events
  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(endDateTime.getHours() + 4);

  // Build description with operational details
  const descParts = [
    `${event.guest_count} guests`,
    formatEventType(event.event_type),
    formatServiceType(event.service_type),
  ];
  
  if (event.proteins && event.proteins.length > 0) {
    descParts.push(`Menu: ${event.proteins.join(', ')}`);
  }
  
  if (event.special_requests) {
    descParts.push(`Notes: ${event.special_requests}`);
  }
  
  const description = escapeICSText(descParts.join(' | '));
  const location = escapeICSText(event.location);
  const summary = escapeICSText(event.event_name);
  
  // Determine status based on workflow
  const isCancelled = event.workflow_status === 'cancelled';
  const status = isCancelled ? 'CANCELLED' : 'CONFIRMED';

  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.id}@soultrainseatery.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatICSDate(startDateTime)}`,
    `DTEND:${formatICSDate(endDateTime)}`,
    `SEQUENCE:${event.version}`,
    `STATUS:${status}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    // Alarm 2 hours before
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Event starting in 2 hours: ${summary}`,
    'END:VALARM',
    // Alarm 1 day before
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Tomorrow: ${summary}`,
    'END:VALARM',
    'END:VEVENT',
  ];

  return lines.join('\r\n');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    // Simple token validation
    if (token !== STAFF_TOKEN) {
      console.log('Invalid or missing staff token');
      return new Response(
        JSON.stringify({ error: 'Invalid or missing token. Use ?token=<staff_token>' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query approved/confirmed events from today onwards
    // Also include cancelled ones to show them as struck-through
    const today = new Date().toISOString().split('T')[0];
    
    const { data: events, error } = await supabase
      .from('quote_requests')
      .select(`
        id,
        event_name,
        event_date,
        start_time,
        serving_start_time,
        location,
        guest_count,
        event_type,
        service_type,
        workflow_status,
        version,
        proteins,
        sides,
        special_requests
      `)
      .gte('event_date', today)
      .in('workflow_status', ['confirmed', 'approved', 'quoted', 'estimated', 'cancelled'])
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Generating calendar feed with ${events?.length || 0} events`);

    // Generate ICS content
    const dtstamp = formatICSDate(new Date());
    
    const vevents = (events || [])
      .map(event => generateVEvent(event as QuoteRequest, dtstamp))
      .join('\r\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Soul Train\'s Eatery//Staff Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Soul Train\'s Eatery - Staff Schedule',
      'X-WR-TIMEZONE:America/New_York',
      // Refresh hints for calendar apps (4 hours)
      'REFRESH-INTERVAL;VALUE=DURATION:PT4H',
      'X-PUBLISHED-TTL:PT4H',
      vevents,
      'END:VCALENDAR',
    ].join('\r\n');

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="soul_trains_schedule.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Calendar feed error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
