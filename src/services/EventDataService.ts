import { supabase } from '@/integrations/supabase/client';
import { formatDateToLocalString, parseDateFromLocalString } from '@/utils/dateHelpers';

export interface EventSummary {
  quote_id: string;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  start_time: string | null;
  location: string;
  guest_count: number;
  event_type: string;
  service_type: string;
  quote_status: string;
  quote_created_at: string;
  compliance_level: string | null;
  requires_po_number: boolean | null;
  po_number: string | null;
  invoice_id: string | null;
  invoice_number: string | null;
  invoice_status: string | null;
  total_amount: number | null;
  subtotal: number | null;
  tax_amount: number | null;
  due_date: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  document_type: string | null;
  days_until_event: number | null;
  total_paid: number;
  balance_due: number | null;
  risk_level: 'high' | 'medium' | 'low';
  payment_status: string;
}

export interface EventFilters {
  status?: string;
  riskLevel?: 'high' | 'medium' | 'low';
  dateRange?: { start: Date; end: Date };
  searchTerm?: string;
}

/**
 * Centralized service for all event/quote data queries
 * Uses the event_summary database view for consistent data access
 */
export class EventDataService {
  /**
   * Fetch all events with optional filters
   */
  static async getEvents(filters?: EventFilters): Promise<EventSummary[]> {
    // Query raw data since view isn't in types yet
    let query = supabase
      .from('quote_requests')
      .select(`
        id,
        contact_name,
        email,
        phone,
        event_name,
        event_date,
        start_time,
        location,
        guest_count,
        event_type,
        service_type,
        workflow_status,
        created_at,
        compliance_level,
        requires_po_number,
        po_number,
        invoices!left (
          id,
          invoice_number,
          workflow_status,
          total_amount,
          subtotal,
          tax_amount,
          due_date,
          sent_at,
          viewed_at,
          paid_at,
          document_type,
          is_draft
        )
      `)
      .order('event_date', { ascending: true });

    // Apply filters
    if (filters?.status) {
      query = query.eq('workflow_status', filters.status as any);
    }

    if (filters?.dateRange) {
      query = query
        .gte('event_date', formatDateToLocalString(filters.dateRange.start))
        .lte('event_date', formatDateToLocalString(filters.dateRange.end));
    }

    if (filters?.searchTerm) {
      query = query.or(`contact_name.ilike.%${filters.searchTerm}%,event_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    // Transform to EventSummary format
    return (data || []).map(qr => {
      const invoice = Array.isArray(qr.invoices) 
        ? qr.invoices.find((i: any) => !i.is_draft) 
        : null;
      
      const today = new Date();
      const eventDate = parseDateFromLocalString(qr.event_date);
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate risk level
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      if (invoice?.workflow_status === 'overdue' || 
          (invoice?.due_date && new Date(invoice.due_date) < today && !['paid', 'cancelled'].includes(invoice.workflow_status))) {
        riskLevel = 'high';
      } else if (daysUntil <= 7 && invoice?.workflow_status !== 'paid' && !['confirmed', 'completed'].includes(qr.workflow_status)) {
        riskLevel = 'high';
      } else if (daysUntil <= 14 && !['paid', 'partially_paid'].includes(invoice?.workflow_status || '') && !['confirmed', 'completed'].includes(qr.workflow_status)) {
        riskLevel = 'medium';
      }

      return {
        quote_id: qr.id,
        contact_name: qr.contact_name,
        email: qr.email,
        phone: qr.phone,
        event_name: qr.event_name,
        event_date: qr.event_date,
        start_time: qr.start_time,
        location: qr.location,
        guest_count: qr.guest_count,
        event_type: qr.event_type,
        service_type: qr.service_type,
        quote_status: qr.workflow_status,
        quote_created_at: qr.created_at,
        compliance_level: qr.compliance_level,
        requires_po_number: qr.requires_po_number,
        po_number: qr.po_number,
        invoice_id: invoice?.id || null,
        invoice_number: invoice?.invoice_number || null,
        invoice_status: invoice?.workflow_status || null,
        total_amount: invoice?.total_amount || null,
        subtotal: invoice?.subtotal || null,
        tax_amount: invoice?.tax_amount || null,
        due_date: invoice?.due_date || null,
        sent_at: invoice?.sent_at || null,
        viewed_at: invoice?.viewed_at || null,
        paid_at: invoice?.paid_at || null,
        document_type: invoice?.document_type || null,
        days_until_event: daysUntil,
        total_paid: 0, // Will be calculated separately if needed
        balance_due: invoice?.total_amount || null,
        risk_level: riskLevel,
        payment_status: invoice?.workflow_status || 'draft'
      } as EventSummary;
    }).filter(e => !filters?.riskLevel || e.risk_level === filters.riskLevel);
  }

  /**
   * Fetch at-risk events (high or medium risk)
   */
  static async getAtRiskEvents(): Promise<EventSummary[]> {
    const events = await this.getEvents();
    return events.filter(e => e.risk_level === 'high' || e.risk_level === 'medium');
  }

  /**
   * Fetch upcoming events within the next N days
   */
  static async getUpcomingEvents(days: number = 7): Promise<EventSummary[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.getEvents({
      dateRange: { start: today, end: futureDate }
    });
  }

  /**
   * Fetch events for a specific month (calendar view)
   */
  static async getEventsForMonth(year: number, month: number): Promise<EventSummary[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return this.getEvents({
      dateRange: { start: startDate, end: endDate }
    });
  }

  /**
   * Get event by quote ID
   */
  static async getEventById(quoteId: string): Promise<EventSummary | null> {
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        id,
        contact_name,
        email,
        phone,
        event_name,
        event_date,
        start_time,
        location,
        guest_count,
        event_type,
        service_type,
        workflow_status,
        created_at,
        compliance_level,
        requires_po_number,
        po_number,
        invoices!left (
          id,
          invoice_number,
          workflow_status,
          total_amount,
          subtotal,
          tax_amount,
          due_date,
          sent_at,
          viewed_at,
          paid_at,
          document_type,
          is_draft
        )
      `)
      .eq('id', quoteId)
      .single();

    if (error || !data) {
      console.error('Error fetching event:', error);
      return null;
    }

    const invoice = Array.isArray(data.invoices) 
      ? data.invoices.find((i: any) => !i.is_draft) 
      : null;

    const today = new Date();
    const eventDate = parseDateFromLocalString(data.event_date);
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      quote_id: data.id,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone,
      event_name: data.event_name,
      event_date: data.event_date,
      start_time: data.start_time,
      location: data.location,
      guest_count: data.guest_count,
      event_type: data.event_type,
      service_type: data.service_type,
      quote_status: data.workflow_status,
      quote_created_at: data.created_at,
      compliance_level: data.compliance_level,
      requires_po_number: data.requires_po_number,
      po_number: data.po_number,
      invoice_id: invoice?.id || null,
      invoice_number: invoice?.invoice_number || null,
      invoice_status: invoice?.workflow_status || null,
      total_amount: invoice?.total_amount || null,
      subtotal: invoice?.subtotal || null,
      tax_amount: invoice?.tax_amount || null,
      due_date: invoice?.due_date || null,
      sent_at: invoice?.sent_at || null,
      viewed_at: invoice?.viewed_at || null,
      paid_at: invoice?.paid_at || null,
      document_type: invoice?.document_type || null,
      days_until_event: daysUntil,
      total_paid: 0,
      balance_due: invoice?.total_amount || null,
      risk_level: 'low',
      payment_status: invoice?.workflow_status || 'draft'
    };
  }

  /**
   * Get dashboard KPIs
   */
  static async getDashboardKPIs(): Promise<{
    openLeads: number;
    eventsThisWeek: number;
    outstandingBalance: number;
    atRiskCount: number;
  }> {
    const events = await this.getEvents();
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);

    const openLeads = events.filter(e => 
      ['pending', 'under_review', 'estimated'].includes(e.quote_status)
    ).length;

    const eventsThisWeek = events.filter(e => {
      const eventDate = parseDateFromLocalString(e.event_date);
      return eventDate >= today && eventDate <= weekFromNow;
    }).length;

    const outstandingBalance = events.reduce((sum, e) => 
      sum + (e.balance_due || 0), 0
    );

    const atRiskCount = events.filter(e => 
      e.risk_level === 'high' || e.risk_level === 'medium'
    ).length;

    return {
      openLeads,
      eventsThisWeek,
      outstandingBalance,
      atRiskCount
    };
  }
}
