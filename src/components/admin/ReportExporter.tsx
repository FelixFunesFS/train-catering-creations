import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useMenuAnalytics } from '@/hooks/useMenuAnalytics';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ReportExporter() {
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
  const [exporting, setExporting] = useState(false);
  const { analytics, timeSeries } = useAnalytics(dateRange);
  const { menuItems } = useMenuAnalytics();
  const { toast } = useToast();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: 'No data available to export',
        variant: 'destructive'
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `${filename} has been downloaded`
    });
  };

  const exportAnalyticsReport = () => {
    if (!analytics) return;

    const reportData = [
      {
        metric: 'Total Revenue',
        value: (analytics.revenue.total / 100).toFixed(2),
        period: dateRange
      },
      {
        metric: 'Revenue Collected',
        value: (analytics.revenue.paid / 100).toFixed(2),
        period: dateRange
      },
      {
        metric: 'Pending Revenue',
        value: (analytics.revenue.pending / 100).toFixed(2),
        period: dateRange
      },
      {
        metric: 'Revenue Growth',
        value: analytics.revenue.growth.toFixed(2) + '%',
        period: dateRange
      },
      {
        metric: 'Total Quotes',
        value: analytics.quotes.total,
        period: dateRange
      },
      {
        metric: 'Conversion Rate',
        value: analytics.quotes.conversion_rate.toFixed(2) + '%',
        period: dateRange
      },
      {
        metric: 'Completed Events',
        value: analytics.events.completed,
        period: dateRange
      },
      {
        metric: 'Avg Guest Count',
        value: analytics.events.avg_guest_count.toFixed(0),
        period: dateRange
      },
      {
        metric: 'Avg Event Value',
        value: (analytics.events.avg_event_value / 100).toFixed(2),
        period: dateRange
      },
      {
        metric: 'Total Customers',
        value: analytics.customers.total,
        period: dateRange
      },
      {
        metric: 'Returning Customers',
        value: analytics.customers.returning,
        period: dateRange
      },
      {
        metric: 'Customer Satisfaction',
        value: analytics.customers.satisfaction_avg.toFixed(2),
        period: dateRange
      }
    ];

    exportToCSV(reportData, `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportRevenueTimeSeries = () => {
    const formattedData = timeSeries.map(item => ({
      date: item.date,
      revenue_dollars: (item.revenue / 100).toFixed(2),
      quotes: item.quotes,
      events: item.events
    }));

    exportToCSV(formattedData, `revenue-timeseries-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportMenuPerformance = () => {
    const formattedData = menuItems.map((item, index) => ({
      rank: index + 1,
      item_name: item.item_name,
      category: item.category,
      order_count: item.order_count,
      total_revenue_dollars: (item.total_revenue / 100).toFixed(2),
      avg_price_dollars: (item.avg_price / 100).toFixed(2)
    }));

    exportToCSV(formattedData, `menu-performance-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export Reports
        </CardTitle>
        <CardDescription>Download analytics data as CSV files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={exportAnalyticsReport}
            disabled={exporting || !analytics}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analytics Summary
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={exportRevenueTimeSeries}
            disabled={exporting || timeSeries.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Revenue Time Series
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={exportMenuPerformance}
            disabled={exporting || menuItems.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Menu Performance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
