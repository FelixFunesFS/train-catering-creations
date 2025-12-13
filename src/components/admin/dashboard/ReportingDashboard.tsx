import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useRevenue } from '@/hooks/useInvoices';
import { useARDashboard } from '@/hooks/useARDashboard';
import { useEvents } from '@/hooks/useEvents';

const DATE_RANGES = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'this-year', label: 'This Year' },
];

export function ReportingDashboard() {
  const [dateRange, setDateRange] = useState('this-month');

  // Calculate date ranges based on selection
  const { currentDates, previousDates } = useMemo(() => {
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

    return { 
      currentDates: { start, end }, 
      previousDates: { start: prevStart, end: prevEnd } 
    };
  }, [dateRange]);

  // Use hooks for data fetching
  const { data: currentRevenue, isLoading: revenueLoading } = useRevenue(currentDates.start, currentDates.end);
  const { data: previousRevenue } = useRevenue(previousDates.start, previousDates.end);
  const { agingBuckets, isLoading: arLoading } = useARDashboard();
  const { data: currentEvents, isLoading: eventsLoading } = useEvents({
    dateRange: currentDates
  });
  const { data: previousEvents } = useEvents({
    dateRange: previousDates
  });

  const loading = revenueLoading || arLoading || eventsLoading;

  // Calculate metrics from data
  const metrics = useMemo(() => {
    const confirmedStatuses = ['confirmed', 'paid', 'completed'];
    
    const currentConfirmed = (currentEvents || []).filter(e => confirmedStatuses.includes(e.quote_status));
    const previousConfirmed = (previousEvents || []).filter(e => confirmedStatuses.includes(e.quote_status));
    
    const totalEvents = currentConfirmed.length;
    const prevEvents = previousConfirmed.length;
    
    const avgGuestCount = currentEvents && currentEvents.length > 0
      ? Math.round(currentEvents.reduce((sum, e) => sum + (e.guest_count || 0), 0) / currentEvents.length)
      : 0;

    const totalLeads = currentEvents?.length || 0;
    const conversionRate = totalLeads > 0 ? Math.round((totalEvents / totalLeads) * 100) : 0;

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    currentEvents?.forEach(e => {
      statusBreakdown[e.quote_status] = (statusBreakdown[e.quote_status] || 0) + 1;
    });

    // Map aging buckets
    const arAging = {
      current: agingBuckets.find(b => b.label === 'Current')?.amount || 0,
      days7: agingBuckets.find(b => b.label === '1-30 Days')?.amount || 0,
      days30: agingBuckets.find(b => b.label === '31-60 Days')?.amount || 0,
      days30Plus: (agingBuckets.find(b => b.label === '61-90 Days')?.amount || 0) + 
                  (agingBuckets.find(b => b.label === '90+ Days')?.amount || 0),
    };

    return {
      totalRevenue: currentRevenue?.totalRevenue || 0,
      previousRevenue: previousRevenue?.totalRevenue || 0,
      totalEvents,
      previousEvents: prevEvents,
      averageEventSize: avgGuestCount,
      conversionRate,
      arAging,
      statusBreakdown,
    };
  }, [currentEvents, previousEvents, currentRevenue, previousRevenue, agingBuckets]);

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
    const csvContent = [
      ['Soul Trains Eatery - Financial Report'],
      [`Period: ${DATE_RANGES.find(r => r.value === dateRange)?.label}`],
      [`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`],
      [],
      ['KPI', 'Value'],
      ['Total Revenue', formatCurrency(metrics.totalRevenue)],
      ['Total Events', metrics.totalEvents],
      ['Average Event Size', `${metrics.averageEventSize} guests`],
      ['Conversion Rate', `${metrics.conversionRate}%`],
      [],
      ['AR Aging', 'Amount'],
      ['Current', formatCurrency(metrics.arAging.current)],
      ['1-7 Days', formatCurrency(metrics.arAging.days7)],
      ['8-30 Days', formatCurrency(metrics.arAging.days30)],
      ['30+ Days', formatCurrency(metrics.arAging.days30Plus)],
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

  const revenueChange = getChangePercent(metrics.totalRevenue, metrics.previousRevenue);
  const eventsChange = getChangePercent(metrics.totalEvents, metrics.previousEvents);

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
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
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
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
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
            <div className="text-2xl font-bold">{metrics.averageEventSize}</div>
            <p className="text-xs text-muted-foreground">guests per event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
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
              <p className="text-2xl font-bold text-green-700">{formatCurrency(metrics.arAging.current)}</p>
              <p className="text-xs text-green-600">Not yet due</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm font-medium text-amber-700">1-7 Days</p>
              <p className="text-2xl font-bold text-amber-700">{formatCurrency(metrics.arAging.days7)}</p>
              <p className="text-xs text-amber-600">Recently overdue</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm font-medium text-orange-700">8-30 Days</p>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(metrics.arAging.days30)}</p>
              <p className="text-xs text-orange-600">Needs follow-up</p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm font-medium text-red-700">30+ Days</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(metrics.arAging.days30Plus)}</p>
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
            {Object.entries(metrics.statusBreakdown).map(([status, count]) => (
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
