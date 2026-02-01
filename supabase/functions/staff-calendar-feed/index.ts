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
  appetizers: string[] | null;
  desserts: string[] | null;
  drinks: string[] | null;
  vegetarian_entrees: string[] | null;
  dietary_restrictions: string[] | null;
  special_requests: string | null;
  chafers_requested: boolean | null;
  plates_requested: boolean | null;
  cups_requested: boolean | null;
  napkins_requested: boolean | null;
  serving_utensils_requested: boolean | null;
  ice_requested: boolean | null;
  wait_staff_requested: boolean | null;
  bussing_tables_needed: boolean | null;
  cocktail_hour: boolean | null;
}

interface StaffAssignment {
  staff_name: string;
  role: string;
  arrival_time: string | null;
}

// Format date as local floating time (no timezone suffix)
function formatICSDateLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatMenuId(id: string): string {
  const specialCases: Record<string, string> = {
    'mac-cheese': 'Mac & Cheese',
    'green-beans-potatoes': 'Green Beans & Potatoes',
    'collard-greens': 'Collard Greens',
    'fried-chicken': 'Fried Chicken',
    'turkey-wings': 'Turkey Wings',
    'pulled-pork': 'Pulled Pork',
    'smoked-brisket': 'Smoked Brisket',
    'fried-fish': 'Fried Fish',
    'candied-yams': 'Candied Yams',
    'potato-salad': 'Potato Salad',
    'coleslaw': 'Coleslaw',
    'baked-beans': 'Baked Beans',
    'corn-on-cob': 'Corn on the Cob',
    'sweet-tea': 'Sweet Tea',
    'fresh-lemonade': 'Fresh Lemonade',
    'peach-cobbler': 'Peach Cobbler',
    'banana-pudding': 'Banana Pudding',
    'gluten-free': 'Gluten-Free',
    'dairy-free': 'Dairy-Free',
    'nut-free': 'Nut-Free',
    'vegan': 'Vegan',
    'vegetarian': 'Vegetarian',
  };
  return specialCases[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

function generateVEvent(event: QuoteRequest, staffAssignments: StaffAssignment[], dtstamp: string, siteUrl: string): string {
  // Parse event date and time using local components
  const [year, month, day] = event.event_date.split('-').map(Number);
  const timeStr = event.start_time || '12:00:00';
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const startDateTime = new Date(year, month - 1, day, hours, minutes, 0);
  
  // Default 4 hour duration for catering events
  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(endDateTime.getHours() + 4);

  // Build maps URL
  const mapsUrl = event.location ? `https://maps.google.com/?q=${encodeURIComponent(event.location)}` : '';

  // Build equipment list
  const equipmentList: string[] = [];
  if (event.chafers_requested) equipmentList.push('Chafers');
  if (event.plates_requested) equipmentList.push('Plates');
  if (event.cups_requested) equipmentList.push('Cups');
  if (event.napkins_requested) equipmentList.push('Napkins');
  if (event.serving_utensils_requested) equipmentList.push('Serving Utensils');
  if (event.ice_requested) equipmentList.push('Ice');

  // Build services list
  const servicesList: string[] = [];
  if (event.wait_staff_requested) servicesList.push('Wait Staff');
  if (event.bussing_tables_needed) servicesList.push('Bussing Tables');
  if (event.cocktail_hour) servicesList.push('Cocktail Hour');

  // Build description with all details
  const descParts: string[] = [
    // Maps and Staff View links
    mapsUrl ? `Maps: ${mapsUrl}` : '',
    `Staff View: ${siteUrl}/staff`,
    '',
    // Staff Assigned
    staffAssignments.length > 0 
      ? `Staff Assigned: ${staffAssignments.map(s => `${s.staff_name} (${s.role})`).join(', ')}`
      : '',
    '',
    // Event details
    event.start_time ? `Event starts: ${formatTimeDisplay(event.start_time)}` : '',
    `Guests: ${event.guest_count}`,
    `Service: ${formatServiceType(event.service_type)}`,
    `Type: ${formatEventType(event.event_type)}`,
    '',
    // Equipment section
    equipmentList.length > 0 ? `Equipment: ${equipmentList.join(', ')}` : '',
    // Services section
    servicesList.length > 0 ? `Services: ${servicesList.join(', ')}` : '',
    '',
    // Full menu by category
    event.proteins && event.proteins.length > 0 ? `Proteins: ${event.proteins.map(formatMenuId).join(', ')}` : '',
    event.sides && event.sides.length > 0 ? `Sides: ${event.sides.map(formatMenuId).join(', ')}` : '',
    event.appetizers && event.appetizers.length > 0 ? `Appetizers: ${event.appetizers.map(formatMenuId).join(', ')}` : '',
    event.desserts && event.desserts.length > 0 ? `Desserts: ${event.desserts.map(formatMenuId).join(', ')}` : '',
    event.drinks && event.drinks.length > 0 ? `Drinks: ${event.drinks.map(formatMenuId).join(', ')}` : '',
    event.vegetarian_entrees && event.vegetarian_entrees.length > 0 ? `Vegetarian: ${event.vegetarian_entrees.map(formatMenuId).join(', ')}` : '',
    '',
    // Dietary restrictions (important callout)
    event.dietary_restrictions && event.dietary_restrictions.length > 0 
      ? `DIETARY: ${event.dietary_restrictions.map(formatMenuId).join(', ')}`
      : '',
    '',
    // Special requests
    event.special_requests ? `Special Requests: ${event.special_requests}` : '',
    '',
    `Contact: Soul Train's Eatery`,
    `(843) 970-0265 | soultrainseatery@gmail.com`
  ].filter(Boolean);
  
  const description = escapeICSText(descParts.join('\\n'));
  const location = escapeICSText(event.location);
  const summary = escapeICSText(event.event_name);
  
  // Determine status based on workflow
  const isCancelled = event.workflow_status === 'cancelled';
  const status = isCancelled ? 'CANCELLED' : 'CONFIRMED';

  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.id}@soultrainseatery.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatICSDateLocal(startDateTime)}`,
    `DTEND:${formatICSDateLocal(endDateTime)}`,
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
    const siteUrl = Deno.env.get('SITE_URL') || 'https://www.soultrainseatery.com';
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
        appetizers,
        desserts,
        drinks,
        vegetarian_entrees,
        dietary_restrictions,
        special_requests,
        chafers_requested,
        plates_requested,
        cups_requested,
        napkins_requested,
        serving_utensils_requested,
        ice_requested,
        wait_staff_requested,
        bussing_tables_needed,
        cocktail_hour
      `)
      .gte('event_date', today)
      .in('workflow_status', ['confirmed', 'approved', 'quoted', 'estimated', 'cancelled'])
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Fetch staff assignments for all events
    const eventIds = (events || []).map(e => e.id);
    let staffAssignmentsMap: Record<string, StaffAssignment[]> = {};
    
    if (eventIds.length > 0) {
      const { data: assignments, error: assignError } = await supabase
        .from('staff_assignments')
        .select('quote_request_id, staff_name, role, arrival_time')
        .in('quote_request_id', eventIds);
      
      if (!assignError && assignments) {
        staffAssignmentsMap = assignments.reduce((acc, a) => {
          if (!acc[a.quote_request_id]) acc[a.quote_request_id] = [];
          acc[a.quote_request_id].push({
            staff_name: a.staff_name,
            role: a.role,
            arrival_time: a.arrival_time
          });
          return acc;
        }, {} as Record<string, StaffAssignment[]>);
      }
    }

    console.log(`Generating calendar feed with ${events?.length || 0} events`);

    // Generate ICS content
    const dtstamp = formatICSDateLocal(new Date());
    
    const vevents = (events || [])
      .map(event => generateVEvent(
        event as QuoteRequest, 
        staffAssignmentsMap[event.id] || [], 
        dtstamp,
        siteUrl
      ))
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
