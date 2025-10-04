import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

interface RevenueChartProps {
  dateRange: 'month' | 'quarter' | 'year' | 'all';
}

export function RevenueChart({ dateRange }: RevenueChartProps) {
  const { timeSeries, loading } = useAnalytics(dateRange);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value / 100);
  };

  const chartData = timeSeries.map(item => ({
    ...item,
    revenueFormatted: item.revenue / 100
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue & Activity Trends
        </CardTitle>
        <CardDescription>Daily revenue and quote activity</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                yAxisId="left"
                className="text-xs"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'revenueFormatted') {
                    return [formatCurrency(value * 100), 'Revenue'];
                  }
                  return [value, name === 'quotes' ? 'Quotes' : 'Events'];
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenueFormatted" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Revenue"
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="quotes" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Quotes"
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="events" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                name="Events"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
