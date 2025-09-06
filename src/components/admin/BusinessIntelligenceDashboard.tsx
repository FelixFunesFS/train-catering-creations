import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Activity,
  Eye,
  CreditCard,
  FileText,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BusinessMetrics {
  totalQuotes: number;
  totalEstimates: number;
  totalRevenue: number;
  conversionRate: number;
  averageQuoteValue: number;
  pendingPayments: number;
  monthlyGrowth: number;
  estimateViews: number;
}

interface ChartData {
  name: string;
  value: number;
  amount?: number;
  count?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function BusinessIntelligenceDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartData, setChartData] = useState<{
    revenue: ChartData[];
    quotes: ChartData[];
    conversion: ChartData[];
    eventTypes: ChartData[];
  }>({
    revenue: [],
    quotes: [],
    conversion: [],
    eventTypes: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinessMetrics();
  }, [timeRange]);

  const fetchBusinessMetrics = async () => {
    try {
      setRefreshing(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Fetch quotes data
      const { data: quotes, error: quotesError } = await supabase
        .from('quote_requests')
        .select(`
          *,
          invoices(id, total_amount, status, paid_at)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (quotesError) throw quotesError;

      // Fetch invoices data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (invoicesError) throw invoicesError;

      // Calculate metrics
      const totalQuotes = quotes?.length || 0;
      const quotesWithInvoices = quotes?.filter(q => q.invoices?.length > 0).length || 0;
      const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
      const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.total_amount / 100), 0);
      const pendingPayments = invoices?.filter(i => i.status === 'sent' || i.status === 'approved').length || 0;
      const estimateViews = invoices?.reduce((sum, i) => sum + (i.estimate_viewed_count || 0), 0) || 0;

      const conversionRate = totalQuotes > 0 ? (quotesWithInvoices / totalQuotes) * 100 : 0;
      const averageQuoteValue = totalQuotes > 0 ? totalRevenue / totalQuotes : 0;

      // Get previous period for growth calculation
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
      
      const { data: prevQuotes } = await supabase
        .from('quote_requests')
        .select('*')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const monthlyGrowth = prevQuotes?.length ? 
        ((totalQuotes - prevQuotes.length) / prevQuotes.length) * 100 : 0;

      setMetrics({
        totalQuotes,
        totalEstimates: invoices?.length || 0,
        totalRevenue,
        conversionRate,
        averageQuoteValue,
        pendingPayments,
        monthlyGrowth,
        estimateViews
      });

      // Generate chart data
      generateChartData(quotes || [], invoices || []);

    } catch (error: any) {
      console.error('Error fetching business metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load business metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateChartData = (quotes: any[], invoices: any[]) => {
    // Revenue by month
    const revenueByMonth = invoices
      .filter(i => i.status === 'paid' && i.paid_at)
      .reduce((acc, invoice) => {
        const month = new Date(invoice.paid_at).toLocaleDateString('en-US', { month: 'short' });
        const existing = acc.find(item => item.name === month);
        if (existing) {
          existing.value += invoice.total_amount / 100;
        } else {
          acc.push({ name: month, value: invoice.total_amount / 100 });
        }
        return acc;
      }, [] as ChartData[]);

    // Quotes by status
    const quotesByStatus = quotes.reduce((acc, quote) => {
      const status = quote.status || 'pending';
      const existing = acc.find(item => item.name === status);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: status.charAt(0).toUpperCase() + status.slice(1), value: 1 });
      }
      return acc;
    }, [] as ChartData[]);

    // Event types distribution
    const eventTypes = quotes.reduce((acc, quote) => {
      const type = quote.event_type || 'other';
      const existing = acc.find(item => item.name === type);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: type.charAt(0).toUpperCase() + type.slice(1), value: 1 });
      }
      return acc;
    }, [] as ChartData[]);

    // Conversion funnel
    const totalQuotes = quotes.length;
    const quotedEstimates = invoices.filter(i => i.quote_request_id).length;
    const sentEstimates = invoices.filter(i => i.status === 'sent' || i.status === 'approved' || i.status === 'paid').length;
    const paidEstimates = invoices.filter(i => i.status === 'paid').length;

    const conversionData = [
      { name: 'Quotes Received', value: totalQuotes },
      { name: 'Estimates Created', value: quotedEstimates },
      { name: 'Estimates Sent', value: sentEstimates },
      { name: 'Payments Received', value: paidEstimates },
    ];

    setChartData({
      revenue: revenueByMonth,
      quotes: quotesByStatus,
      conversion: conversionData,
      eventTypes
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Intelligence</h2>
          <p className="text-muted-foreground">
            Analytics and insights for the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button
            onClick={fetchBusinessMetrics}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center">
              {metrics.monthlyGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${metrics.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{metrics.totalQuotes}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">
                {metrics.conversionRate.toFixed(1)}% conversion
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Quote Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageQuoteValue)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">
                {metrics.estimateViews} estimate views
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{metrics.pendingPayments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline">
                {metrics.totalEstimates} total estimates
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="events">Event Types</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Quote Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.quotes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.quotes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.conversion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.eventTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.eventTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}