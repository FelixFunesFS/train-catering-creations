import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar, 
  Users,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';

interface ReportData {
  totalRevenue: number;
  previousRevenue: number;
  totalEvents: number;
  previousEvents: number;
  averageEventSize: number;
  conversionRate: number;
  arAging: {
    current: number;
    days7: number;
    days30: number;
    days30Plus: number;
  };
  statusBreakdown: Record<string, number>;
}

const DATE_RANGES = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'this-year', label: 'This Year' },
];

export function ReportingDashboard() {
  const [dateRange, setDateRange] = useState('this-month');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end: Date;
    let prevStart: Date;
    let prevEnd: Date;

    switch (dateRange) {
      case 'last-month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        prevStart = startOfMonth(subMonths(now, 2));
        prevEnd = endOfMonth(subMonths(now, 2));
        break;
      case 'last-3-months':
        start = startOfMonth(subMonths(now, 3));
        end = endOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 6));
        prevEnd = endOfMonth(subMonths(now, 3));
        break;
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        prevStart = new Date(now.getFullYear() - 1, 0, 1);
        prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default: // this-month
        start = startOfMonth(now);
        end = endOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfMonth(subMonths(now, 1));
    }

    return { start, end, prevStart, prevEnd };
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      const { start, end, prevStart, prevEnd } = getDateRange();
      const today = new Date();

      // Current period quotes
      const { data: currentQuotes } = await supabase
        .from('quote_requests')
        .select('id, workflow_status, guest_count, event_date')
        .gte('event_date', start.toISOString().split('T')[0])
        .lte('event_date', end.toISOString().split('T')[0]);

      // Previous period quotes
      const { data: prevQuotes } = await supabase
        .from('quote_requests')
        .select('id, workflow_status')
        .gte('event_date', prevStart.toISOString().split('T')[0])
        .lte('event_date', prevEnd.toISOString().split('T')[0]);

      // Current period paid invoices
      const { data: currentInvoices } = await supabase
        .from('invoices')
        .select('id, total_amount, workflow_status, created_at')
        .eq('workflow_status', 'paid')
        .gte('paid_at', start.toISOString())
        .lte('paid_at', end.toISOString());

      // Previous period paid invoices
      const { data: prevInvoices } = await supabase
        .from('invoices')
        .select('id, total_amount')
        .eq('workflow_status', 'paid')
        .gte('paid_at', prevStart.toISOString())
        .lte('paid_at', prevEnd.toISOString());

      // Outstanding invoices for AR aging
      const { data: outstandingInvoices } = await supabase
        .from('invoices')
        .select('id, total_amount, due_date, created_at, workflow_status')
        .in('workflow_status', ['sent', 'viewed', 'approved', 'payment_pending', 'partially_paid', 'overdue']);

      // Calculate metrics
      const totalRevenue = currentInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const previousRevenue = prevInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      
      const confirmedStatuses = ['confirmed', 'paid', 'completed'];
      const totalEvents = currentQuotes?.filter(q => confirmedStatuses.includes(q.workflow_status)).length || 0;
      const previousEvents = prevQuotes?.filter(q => confirmedStatuses.includes(q.workflow_status)).length || 0;

      const avgGuestCount = currentQuotes && currentQuotes.length > 0
        ? Math.round(currentQuotes.reduce((sum, q) => sum + (q.guest_count || 0), 0) / currentQuotes.length)
        : 0;

      const totalLeads = currentQuotes?.length || 0;
      const convertedLeads = currentQuotes?.filter(q => confirmedStatuses.includes(q.workflow_status)).length || 0;
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

      // AR Aging calculation
      const arAging = { current: 0, days7: 0, days30: 0, days30Plus: 0 };
      outstandingInvoices?.forEach(inv => {
        const dueDate = inv.due_date ? new Date(inv.due_date) : new Date(inv.created_at);
        const daysOverdue = differenceInDays(today, dueDate);
        const amount = inv.total_amount || 0;

        if (daysOverdue <= 0) {
          arAging.current += amount;
        } else if (daysOverdue <= 7) {
          arAging.days7 += amount;
        } else if (daysOverdue <= 30) {
          arAging.days30 += amount;
        } else {
          arAging.days30Plus += amount;
        }
      });

      // Status breakdown
      const statusBreakdown: Record<string, number> = {};
      currentQuotes?.forEach(q => {
        statusBreakdown[q.workflow_status] = (statusBreakdown[q.workflow_status] || 0) + 1;
      });

      setData({
        totalRevenue,
        previousRevenue,
        totalEvents,
        previousEvents,
        averageEventSize: avgGuestCount,
        conversionRate,
        arAging,
        statusBreakdown,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const exportCSV = () => {
    if (!data) return;

    const csvContent = [
      ['Soul Trains Eatery - Financial Report'],
      [`Period: ${DATE_RANGES.find(r => r.value === dateRange)?.label}`],
      [`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`],
      [],
      ['KPI', 'Value'],
      ['Total Revenue', formatCurrency(data.totalRevenue)],
      ['Total Events', data.totalEvents],
      ['Average Event Size', `${data.averageEventSize} guests`],
      ['Conversion Rate', `${data.conversionRate}%`],
      [],
      ['AR Aging', 'Amount'],
      ['Current', formatCurrency(data.arAging.current)],
      ['1-7 Days', formatCurrency(data.arAging.days7)],
      ['8-30 Days', formatCurrency(data.arAging.days30)],
      ['30+ Days', formatCurrency(data.arAging.days30Plus)],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `soul-trains-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-6 h-32" /></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const revenueChange = getChangePercent(data.totalRevenue, data.previousRevenue);
  const eventsChange = getChangePercent(data.totalEvents, data.previousEvents);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Business performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <div className="flex items-center gap-1 text-xs">
              {revenueChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(revenueChange)}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booked Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEvents}</div>
            <div className="flex items-center gap-1 text-xs">
              {eventsChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={eventsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(eventsChange)}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Event Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageEventSize}</div>
            <p className="text-xs text-muted-foreground">guests per event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">leads to booked events</p>
          </CardContent>
        </Card>
      </div>

      {/* AR Aging */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts Receivable Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-medium text-green-700">Current</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(data.arAging.current)}</p>
              <p className="text-xs text-green-600">Not yet due</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm font-medium text-amber-700">1-7 Days</p>
              <p className="text-2xl font-bold text-amber-700">{formatCurrency(data.arAging.days7)}</p>
              <p className="text-xs text-amber-600">Recently overdue</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm font-medium text-orange-700">8-30 Days</p>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(data.arAging.days30)}</p>
              <p className="text-xs text-orange-600">Needs follow-up</p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm font-medium text-red-700">30+ Days</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(data.arAging.days30Plus)}</p>
              <p className="text-xs text-red-600">Severely overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.statusBreakdown).map(([status, count]) => (
              <Badge key={status} variant="secondary" className="text-sm px-3 py-1">
                {status.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
