import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, startOfDay, addDays } from 'date-fns';
import { parseDateFromLocalString, formatDateToLocalString } from '@/utils/dateHelpers';

// Staff assignment type from database
export interface StaffAssignment {
  id: string;
  staff_name: string;
  role: string;
  arrival_time: string | null;
  confirmed: boolean;
  notes: string | null;
}

// Line item for staff (no pricing)
export interface StaffLineItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  quantity: number;
  sort_order: number;
}

// Admin note for staff
export interface StaffAdminNote {
  id: string;
  note_content: string;
  category: string | null;
  priority_level: string | null;
  created_at: string;
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
  
  // Contact (on-site, no email)
  contact_name: string | null;
  phone: string | null;
  
  // Menu
  proteins: string[];
  sides: string[];
  appetizers: string[];
  desserts: string[];
  drinks: string[];
  vegetarian_entrees: string[];
  dietary_restrictions: string[];
  special_requests: string | null;
  both_proteins_available: boolean;
  guest_count_with_restrictions: string | null;
  
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
  serving_setup_area: string | null;
  separate_serving_area: boolean;
  wait_staff_requirements: string | null;
  wait_staff_setup_areas: string | null;
  
  // Wedding/Event specific
  theme_colors: string | null;
  military_organization: string | null;
  ceremony_included: boolean;
  
  // Customer notes (original submission context)
  custom_menu_requests: string | null;
  utensils: string[];
  extras: string[];
  
  // Computed
  has_approved_line_items: boolean;
  days_until: number;
  is_today: boolean;
  is_this_week: boolean;
  
  // Joined
  staff_assignments: StaffAssignment[];
  line_items: StaffLineItem[];
  admin_notes: StaffAdminNote[];
}

// Filter type
export type StaffEventFilter = 'today' | 'week' | 'all';

// Fields to select from quote_requests
const QUOTE_FIELDS = `
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
  contact_name,
  phone,
  proteins,
  sides,
  appetizers,
  desserts,
  drinks,
  vegetarian_entrees,
  dietary_restrictions,
  special_requests,
  both_proteins_available,
  guest_count_with_restrictions,
  chafers_requested,
  plates_requested,
  cups_requested,
  napkins_requested,
  serving_utensils_requested,
  ice_requested,
  wait_staff_requested,
  bussing_tables_needed,
  cocktail_hour,
  serving_setup_area,
  separate_serving_area,
  wait_staff_requirements,
  wait_staff_setup_areas,
  theme_colors,
  military_organization,
  ceremony_included,
  custom_menu_requests,
  utensils,
  extras
`;

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
function transformToStaffEvent(
  row: Record<string, unknown>, 
  assignments: StaffAssignment[],
  lineItems: StaffLineItem[],
  adminNotes: StaffAdminNote[]
): StaffEvent {
  const today = startOfDay(new Date());
  const eventDate = parseDateFromLocalString(row.event_date as string);
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
    
    // Contact
    contact_name: row.contact_name as string | null,
    phone: row.phone as string | null,
    
    // Menu
    proteins: parseJsonArray(row.proteins),
    sides: parseJsonArray(row.sides),
    appetizers: parseJsonArray(row.appetizers),
    desserts: parseJsonArray(row.desserts),
    drinks: parseJsonArray(row.drinks),
    vegetarian_entrees: parseJsonArray(row.vegetarian_entrees),
    dietary_restrictions: parseJsonArray(row.dietary_restrictions),
    special_requests: row.special_requests as string | null,
    both_proteins_available: Boolean(row.both_proteins_available),
    guest_count_with_restrictions: row.guest_count_with_restrictions as string | null,
    
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
    serving_setup_area: row.serving_setup_area as string | null,
    separate_serving_area: Boolean(row.separate_serving_area),
    wait_staff_requirements: row.wait_staff_requirements as string | null,
    wait_staff_setup_areas: row.wait_staff_setup_areas as string | null,
    
    // Event specific
    theme_colors: row.theme_colors as string | null,
    military_organization: row.military_organization as string | null,
    ceremony_included: Boolean(row.ceremony_included),
    
    // Customer notes
    custom_menu_requests: row.custom_menu_requests as string | null,
    utensils: parseJsonArray(row.utensils),
    extras: parseJsonArray(row.extras),
    
    // Computed
    has_approved_line_items: lineItems.length > 0,
    days_until: daysUntil,
    is_today: daysUntil === 0,
    is_this_week: daysUntil >= 0 && daysUntil <= 7,
    
    // Joined
    staff_assignments: assignments,
    line_items: lineItems,
    admin_notes: adminNotes,
  };
}

// Fetch line items for events (no pricing columns)
async function fetchLineItemsForEvents(eventIds: string[]): Promise<Record<string, StaffLineItem[]>> {
  // First get invoice IDs for these events
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('id, quote_request_id')
    .in('quote_request_id', eventIds);

  if (invError || !invoices || invoices.length === 0) return {};

  const invoiceIdToEventId = invoices.reduce((acc, inv) => {
    if (inv.quote_request_id) acc[inv.id] = inv.quote_request_id;
    return acc;
  }, {} as Record<string, string>);

  const invoiceIds = invoices.map(i => i.id);
  
  const { data: items, error: itemError } = await supabase
    .from('invoice_line_items')
    .select('id, invoice_id, title, description, category, quantity, sort_order')
    .in('invoice_id', invoiceIds)
    .order('sort_order', { ascending: true });

  if (itemError || !items) return {};

  const result: Record<string, StaffLineItem[]> = {};
  for (const item of items) {
    const eventId = invoiceIdToEventId[item.invoice_id];
    if (!eventId) continue;
    if (!result[eventId]) result[eventId] = [];
    result[eventId].push({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      sort_order: item.sort_order ?? 0,
    });
  }
  return result;
}

// Fetch admin notes for events
async function fetchAdminNotesForEvents(eventIds: string[]): Promise<Record<string, StaffAdminNote[]>> {
  const { data: notes, error } = await supabase
    .from('admin_notes')
    .select('id, quote_request_id, note_content, category, priority_level, created_at')
    .in('quote_request_id', eventIds)
    .order('created_at', { ascending: false });

  if (error || !notes) return {};

  const result: Record<string, StaffAdminNote[]> = {};
  for (const note of notes) {
    const eventId = note.quote_request_id;
    if (!eventId) continue;
    if (!result[eventId]) result[eventId] = [];
    result[eventId].push({
      id: note.id,
      note_content: note.note_content,
      category: note.category,
      priority_level: note.priority_level,
      created_at: note.created_at,
    });
  }
  return result;
}

// Fetch staff events with optional filter
async function fetchStaffEvents(filter?: StaffEventFilter): Promise<StaffEvent[]> {
  const today = startOfDay(new Date());
  const todayStr = formatDateToLocalString(today);
  const weekEndStr = formatDateToLocalString(addDays(today, 7));
  
  let query = supabase
    .from('quote_requests')
    .select(QUOTE_FIELDS)
    .in('workflow_status', ['confirmed', 'approved', 'quoted', 'estimated', 'awaiting_payment', 'paid'])
    .gte('event_date', todayStr)
    .order('event_date', { ascending: true });

  if (filter === 'today') {
    query = query.eq('event_date', todayStr);
  } else if (filter === 'week') {
    query = query.lte('event_date', weekEndStr);
  }

  const { data: events, error } = await query;
  
  if (error) throw error;
  if (!events || events.length === 0) return [];

  const eventIds = events.map(e => e.id);

  // Fetch all related data in parallel
  const [assignmentsResult, lineItemsByEvent, notesByEvent] = await Promise.all([
    supabase
      .from('staff_assignments')
      .select('id, quote_request_id, staff_name, role, arrival_time, confirmed, notes')
      .in('quote_request_id', eventIds),
    fetchLineItemsForEvents(eventIds),
    fetchAdminNotesForEvents(eventIds),
  ]);

  if (assignmentsResult.error) throw assignmentsResult.error;

  const assignmentsByEvent = (assignmentsResult.data || []).reduce((acc, a) => {
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

  return events.map(event => 
    transformToStaffEvent(
      event, 
      assignmentsByEvent[event.id] || [],
      lineItemsByEvent[event.id] || [],
      notesByEvent[event.id] || []
    )
  );
}

// Fetch single event by ID
async function fetchStaffEvent(eventId: string): Promise<StaffEvent | null> {
  const { data: event, error } = await supabase
    .from('quote_requests')
    .select(QUOTE_FIELDS)
    .eq('id', eventId)
    .single();

  if (error) throw error;
  if (!event) return null;

  // Fetch all related data in parallel
  const [assignmentsResult, lineItemsByEvent, notesByEvent] = await Promise.all([
    supabase
      .from('staff_assignments')
      .select('id, staff_name, role, arrival_time, confirmed, notes')
      .eq('quote_request_id', eventId),
    fetchLineItemsForEvents([eventId]),
    fetchAdminNotesForEvents([eventId]),
  ]);

  if (assignmentsResult.error) throw assignmentsResult.error;

  const staffAssignments: StaffAssignment[] = (assignmentsResult.data || []).map(a => ({
    id: a.id,
    staff_name: a.staff_name,
    role: a.role,
    arrival_time: a.arrival_time,
    confirmed: a.confirmed ?? false,
    notes: a.notes,
  }));

  return transformToStaffEvent(
    event, 
    staffAssignments,
    lineItemsByEvent[eventId] || [],
    notesByEvent[eventId] || []
  );
}

// Hook for list of events
export function useStaffEvents(filter: StaffEventFilter = 'all') {
  return useQuery({
    queryKey: ['staff-events', filter],
    queryFn: () => fetchStaffEvents(filter),
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for single event
export function useStaffEvent(eventId: string | null) {
  return useQuery({
    queryKey: ['staff-event', eventId],
    queryFn: () => eventId ? fetchStaffEvent(eventId) : null,
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
  });
}