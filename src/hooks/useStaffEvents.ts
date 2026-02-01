import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO, startOfDay, addDays } from 'date-fns';

// Staff assignment type from database
export interface StaffAssignment {
  id: string;
  staff_name: string;
  role: string;
  arrival_time: string | null;
  confirmed: boolean;
  notes: string | null;
}

// Staff-safe event interface (excludes pricing/sensitive data)
export interface StaffEvent {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  serving_start_time: string | null;
  location: string;
  guest_count: number;
  event_type: string;
  service_type: string;
  workflow_status: string;
  
  // Menu
  proteins: string[];
  sides: string[];
  appetizers: string[];
  desserts: string[];
  drinks: string[];
  vegetarian_entrees: string[];
  dietary_restrictions: string[];
  special_requests: string | null;
  
  // Equipment
  chafers_requested: boolean;
  plates_requested: boolean;
  cups_requested: boolean;
  napkins_requested: boolean;
  serving_utensils_requested: boolean;
  ice_requested: boolean;
  
  // Service
  wait_staff_requested: boolean;
  bussing_tables_needed: boolean;
  cocktail_hour: boolean;
  
  // Computed
  days_until: number;
  is_today: boolean;
  is_this_week: boolean;
  
  // Joined
  staff_assignments: StaffAssignment[];
}

// Filter type
export type StaffEventFilter = 'today' | 'week' | 'all';

// Parse JSON array safely
function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

// Transform database row to StaffEvent
function transformToStaffEvent(row: Record<string, unknown>, assignments: StaffAssignment[]): StaffEvent {
  const today = startOfDay(new Date());
  const eventDate = parseISO(row.event_date as string);
  const daysUntil = differenceInDays(eventDate, today);
  
  return {
    id: row.id as string,
    event_name: row.event_name as string,
    event_date: row.event_date as string,
    start_time: row.start_time as string,
    serving_start_time: row.serving_start_time as string | null,
    location: row.location as string,
    guest_count: row.guest_count as number,
    event_type: row.event_type as string,
    service_type: row.service_type as string,
    workflow_status: row.workflow_status as string,
    
    // Menu
    proteins: parseJsonArray(row.proteins),
    sides: parseJsonArray(row.sides),
    appetizers: parseJsonArray(row.appetizers),
    desserts: parseJsonArray(row.desserts),
    drinks: parseJsonArray(row.drinks),
    vegetarian_entrees: parseJsonArray(row.vegetarian_entrees),
    dietary_restrictions: parseJsonArray(row.dietary_restrictions),
    special_requests: row.special_requests as string | null,
    
    // Equipment
    chafers_requested: Boolean(row.chafers_requested),
    plates_requested: Boolean(row.plates_requested),
    cups_requested: Boolean(row.cups_requested),
    napkins_requested: Boolean(row.napkins_requested),
    serving_utensils_requested: Boolean(row.serving_utensils_requested),
    ice_requested: Boolean(row.ice_requested),
    
    // Service
    wait_staff_requested: Boolean(row.wait_staff_requested),
    bussing_tables_needed: Boolean(row.bussing_tables_needed),
    cocktail_hour: Boolean(row.cocktail_hour),
    
    // Computed
    days_until: daysUntil,
    is_today: daysUntil === 0,
    is_this_week: daysUntil >= 0 && daysUntil <= 7,
    
    // Joined
    staff_assignments: assignments,
  };
}

// Fetch staff events with optional filter
async function fetchStaffEvents(filter?: StaffEventFilter): Promise<StaffEvent[]> {
  const today = startOfDay(new Date());
  const todayStr = today.toISOString().split('T')[0];
  const weekEndStr = addDays(today, 7).toISOString().split('T')[0];
  
  // Build query for operational fields only (excludes pricing, contact info)
  let query = supabase
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
    .in('workflow_status', ['confirmed', 'approved', 'quoted', 'estimated'])
    .gte('event_date', todayStr)
    .order('event_date', { ascending: true });

  // Apply date filters
  if (filter === 'today') {
    query = query.eq('event_date', todayStr);
  } else if (filter === 'week') {
    query = query.lte('event_date', weekEndStr);
  }

  const { data: events, error } = await query;
  
  if (error) throw error;
  if (!events || events.length === 0) return [];

  // Fetch staff assignments for all events
  const eventIds = events.map(e => e.id);
  const { data: assignments, error: assignError } = await supabase
    .from('staff_assignments')
    .select('id, quote_request_id, staff_name, role, arrival_time, confirmed, notes')
    .in('quote_request_id', eventIds);

  if (assignError) throw assignError;

  // Group assignments by event
  const assignmentsByEvent = (assignments || []).reduce((acc, a) => {
    const eventId = a.quote_request_id;
    if (!acc[eventId]) acc[eventId] = [];
    acc[eventId].push({
      id: a.id,
      staff_name: a.staff_name,
      role: a.role,
      arrival_time: a.arrival_time,
      confirmed: a.confirmed ?? false,
      notes: a.notes,
    });
    return acc;
  }, {} as Record<string, StaffAssignment[]>);

  // Transform and return
  return events.map(event => 
    transformToStaffEvent(event, assignmentsByEvent[event.id] || [])
  );
}

// Fetch single event by ID
async function fetchStaffEvent(eventId: string): Promise<StaffEvent | null> {
  const { data: event, error } = await supabase
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
    .eq('id', eventId)
    .single();

  if (error) throw error;
  if (!event) return null;

  // Fetch staff assignments
  const { data: assignments, error: assignError } = await supabase
    .from('staff_assignments')
    .select('id, staff_name, role, arrival_time, confirmed, notes')
    .eq('quote_request_id', eventId);

  if (assignError) throw assignError;

  const staffAssignments: StaffAssignment[] = (assignments || []).map(a => ({
    id: a.id,
    staff_name: a.staff_name,
    role: a.role,
    arrival_time: a.arrival_time,
    confirmed: a.confirmed ?? false,
    notes: a.notes,
  }));

  return transformToStaffEvent(event, staffAssignments);
}

// Hook for list of events
export function useStaffEvents(filter: StaffEventFilter = 'all') {
  return useQuery({
    queryKey: ['staff-events', filter],
    queryFn: () => fetchStaffEvents(filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for single event
export function useStaffEvent(eventId: string | null) {
  return useQuery({
    queryKey: ['staff-event', eventId],
    queryFn: () => eventId ? fetchStaffEvent(eventId) : null,
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  });
}
