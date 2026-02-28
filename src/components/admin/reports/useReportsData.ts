import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, subDays, startOfQuarter, startOfYear, format } from 'date-fns';

export type DatePreset = 'this_month' | 'last_30' | 'this_quarter' | 'ytd' | 'custom';

export interface ReportsFilters {
  datePreset: DatePreset;
  startDate: Date;
  endDate: Date;
  eventTypes: string[];
  serviceType: string;
}

export function getDefaultFilters(): ReportsFilters {
  const now = new Date();
  return {
    datePreset: 'ytd',
    startDate: startOfYear(now),
    endDate: now,
    eventTypes: [],
    serviceType: 'all',
  };
}

export function applyPreset(preset: DatePreset): { startDate: Date; endDate: Date } {
  const now = new Date();
  switch (preset) {
    case 'this_month': return { startDate: startOfMonth(now), endDate: now };
    case 'last_30': return { startDate: subDays(now, 30), endDate: now };
    case 'this_quarter': return { startDate: startOfQuarter(now), endDate: now };
    case 'ytd': return { startDate: startOfYear(now), endDate: now };
    default: return { startDate: startOfYear(now), endDate: now };
  }
}

function fmt(d: Date) { return format(d, 'yyyy-MM-dd'); }

export function useInvoiceSummaryData(filters: ReportsFilters) {
  return useQuery({
    queryKey: ['reports-invoices', fmt(filters.startDate), fmt(filters.endDate), filters.eventTypes, filters.serviceType],
    queryFn: async () => {
      let q = supabase.from('invoice_payment_summary').select('*');
      q = q.gte('event_date', fmt(filters.startDate)).lte('event_date', fmt(filters.endDate));
      if (filters.eventTypes.length > 0) q = q.in('event_type', filters.eventTypes as any);
      if (filters.serviceType !== 'all') q = q.eq('service_type', filters.serviceType as any);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useQuoteRequestsData(filters: ReportsFilters) {
  return useQuery({
    queryKey: ['reports-quotes', fmt(filters.startDate), fmt(filters.endDate), filters.eventTypes, filters.serviceType],
    queryFn: async () => {
      let q = supabase.from('quote_requests').select('id, event_type, service_type, guest_count, event_date, workflow_status, created_at');
      q = q.gte('event_date', fmt(filters.startDate)).lte('event_date', fmt(filters.endDate));
      if (filters.eventTypes.length > 0) q = q.in('event_type', filters.eventTypes as any);
      if (filters.serviceType !== 'all') q = q.eq('service_type', filters.serviceType as any);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLineItemsData(filters: ReportsFilters) {
  return useQuery({
    queryKey: ['reports-line-items', fmt(filters.startDate), fmt(filters.endDate)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .select('title, category, quantity, unit_price, total_price, invoice_id');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePaymentTransactionsData(filters: ReportsFilters) {
  return useQuery({
    queryKey: ['reports-transactions', fmt(filters.startDate), fmt(filters.endDate)],
    queryFn: async () => {
      let q = supabase.from('payment_transactions').select('*');
      q = q.gte('created_at', filters.startDate.toISOString()).lte('created_at', filters.endDate.toISOString());
      q = q.eq('status', 'completed');
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
