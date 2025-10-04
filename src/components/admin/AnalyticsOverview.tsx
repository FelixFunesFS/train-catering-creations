import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrendingUp, TrendingDown, DollarSign, FileText, Calendar, Users, Star, Loader2 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: React.ElementType;
  format?: 'currency' | 'number' | 'percentage';
}

function MetricCard({ title, value, subtitle, trend, icon: Icon, format = 'number' }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val) / 100);
    }
    if (format === 'percentage') {
      return `${Number(val).toFixed(1)}%`;
    }
    return val;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend).toFixed(1)}% vs previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsOverviewProps {
  dateRange: 'month' | 'quarter' | 'year' | 'all';
}

export function AnalyticsOverview({ dateRange }: AnalyticsOverviewProps) {
  const { analytics, loading } = useAnalytics(dateRange);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No analytics data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Revenue"
            value={analytics.revenue.total}
            trend={analytics.revenue.growth}
            icon={DollarSign}
            format="currency"
          />
          <MetricCard
            title="Revenue Collected"
            value={analytics.revenue.paid}
            subtitle={`${((analytics.revenue.paid / analytics.revenue.total) * 100).toFixed(0)}% of total`}
            icon={DollarSign}
            format="currency"
          />
          <MetricCard
            title="Pending Revenue"
            value={analytics.revenue.pending}
            subtitle="Outstanding payments"
            icon={DollarSign}
            format="currency"
          />
        </div>
      </div>

      {/* Quote & Event Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quotes & Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Quotes"
            value={analytics.quotes.total}
            icon={FileText}
          />
          <MetricCard
            title="Conversion Rate"
            value={analytics.quotes.conversion_rate}
            subtitle={`${analytics.quotes.converted} converted`}
            icon={TrendingUp}
            format="percentage"
          />
          <MetricCard
            title="Completed Events"
            value={analytics.events.completed}
            icon={Calendar}
          />
          <MetricCard
            title="Upcoming Events"
            value={analytics.events.upcoming}
            icon={Calendar}
          />
        </div>
      </div>

      {/* Customer & Event Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Customer Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Customers"
            value={analytics.customers.total}
            icon={Users}
          />
          <MetricCard
            title="Returning Customers"
            value={analytics.customers.returning}
            subtitle={`${((analytics.customers.returning / analytics.customers.total) * 100).toFixed(0)}% return rate`}
            icon={Users}
          />
          <MetricCard
            title="Avg. Guest Count"
            value={Math.round(analytics.events.avg_guest_count)}
            subtitle="Per event"
            icon={Users}
          />
          <MetricCard
            title="Customer Satisfaction"
            value={analytics.customers.satisfaction_avg > 0 ? analytics.customers.satisfaction_avg.toFixed(1) : 'N/A'}
            subtitle="Out of 5 stars"
            icon={Star}
          />
        </div>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Important metrics and trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm">Average Event Value</span>
            <Badge variant="outline" className="text-base">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(analytics.events.avg_event_value / 100)}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm">Pending Quotes</span>
            <Badge variant={analytics.quotes.pending > 5 ? 'destructive' : 'secondary'}>
              {analytics.quotes.pending} requiring attention
            </Badge>
          </div>
          {analytics.revenue.growth > 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950">
              <span className="text-sm font-medium">Revenue Growth</span>
              <Badge variant="default" className="bg-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {analytics.revenue.growth.toFixed(1)}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
