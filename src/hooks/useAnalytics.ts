import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';

export interface AnalyticsData {
  revenue: {
    total: number;
    paid: number;
    pending: number;
    growth: number;
  };
  quotes: {
    total: number;
    pending: number;
    converted: number;
    conversion_rate: number;
  };
  events: {
    completed: number;
    upcoming: number;
    avg_guest_count: number;
    avg_event_value: number;
  };
  customers: {
    total: number;
    returning: number;
    satisfaction_avg: number;
  };
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  quotes: number;
  events: number;
}

export function useAnalytics(dateRange: 'month' | 'quarter' | 'year' | 'all' = 'month') {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const getDateRangeBounds = () => {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (dateRange) {
      case 'month':
        startDate = startOfMonth(now);
        previousStartDate = startOfMonth(subMonths(now, 1));
        previousEndDate = endOfMonth(subMonths(now, 1));
        break;
      case 'quarter':
        startDate = subMonths(now, 3);
        previousStartDate = subMonths(now, 6);
        previousEndDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = startOfYear(now);
        previousStartDate = startOfYear(subYears(now, 1));
        previousEndDate = endOfYear(subYears(now, 1));
        break;
      default:
        startDate = new Date('2000-01-01');
        previousStartDate = new Date('2000-01-01');
        previousEndDate = new Date('2000-01-01');
    }

    return { startDate, previousStartDate, previousEndDate };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, previousStartDate, previousEndDate } = getDateRangeBounds();

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, status, created_at, quote_request_id, customer_feedback')
        .gte('created_at', startDate.toISOString());

      const { data: previousInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString());

      // Fetch quotes
      const { data: quotes } = await supabase
        .from('quote_requests')
        .select('id, status, created_at, guest_count, email')
        .gte('created_at', startDate.toISOString());

      // Calculate revenue metrics
      const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const paidRevenue = invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const pendingRevenue = totalRevenue - paidRevenue;
      const previousRevenue = previousInvoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Calculate quote metrics
      const totalQuotes = quotes?.length || 0;
      const pendingQuotes = quotes?.filter(q => q.status === 'pending').length || 0;
      const convertedQuotes = quotes?.filter(q => ['confirmed', 'completed'].includes(q.status)).length || 0;
      const conversionRate = totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0;

      // Calculate event metrics
      const completedEvents = quotes?.filter(q => q.status === 'completed').length || 0;
      const upcomingEvents = quotes?.filter(q => q.status === 'confirmed').length || 0;
      const avgGuestCount = quotes && quotes.length > 0
        ? quotes.reduce((sum, q) => sum + (q.guest_count || 0), 0) / quotes.length
        : 0;
      const avgEventValue = invoices && invoices.length > 0
        ? totalRevenue / invoices.length
        : 0;

      // Calculate customer metrics
      const uniqueEmails = new Set(quotes?.map(q => q.email) || []);
      const totalCustomers = uniqueEmails.size;
      const allQuotes = quotes || [];
      const returningCustomers = Array.from(uniqueEmails).filter(email => 
        allQuotes.filter(q => q.email === email).length > 1
      ).length;

      // Calculate satisfaction
      const feedbackScores = invoices
        ?.map(inv => inv.customer_feedback as any)
        .filter(fb => fb?.rating)
        .map(fb => fb.rating) || [];
      const satisfactionAvg = feedbackScores.length > 0
        ? feedbackScores.reduce((sum, rating) => sum + rating, 0) / feedbackScores.length
        : 0;

      setAnalytics({
        revenue: {
          total: totalRevenue,
          paid: paidRevenue,
          pending: pendingRevenue,
          growth: revenueGrowth
        },
        quotes: {
          total: totalQuotes,
          pending: pendingQuotes,
          converted: convertedQuotes,
          conversion_rate: conversionRate
        },
        events: {
          completed: completedEvents,
          upcoming: upcomingEvents,
          avg_guest_count: avgGuestCount,
          avg_event_value: avgEventValue
        },
        customers: {
          total: totalCustomers,
          returning: returningCustomers,
          satisfaction_avg: satisfactionAvg
        }
      });

      // Generate time series data
      generateTimeSeries(invoices || [], quotes || []);

    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeries = (invoices: any[], quotes: any[]) => {
    const grouped: Record<string, { revenue: number; quotes: number; events: number }> = {};

    quotes.forEach(quote => {
      const date = new Date(quote.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { revenue: 0, quotes: 0, events: 0 };
      }
      grouped[date].quotes += 1;
      if (quote.status === 'completed') {
        grouped[date].events += 1;
      }
    });

    invoices.forEach(invoice => {
      const date = new Date(invoice.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { revenue: 0, quotes: 0, events: 0 };
      }
      grouped[date].revenue += invoice.total_amount;
    });

    const series = Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setTimeSeries(series);
  };

  return { analytics, timeSeries, loading, refetch: fetchAnalytics };
}
