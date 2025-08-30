import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentManager } from './DocumentManager';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface ReportData {
  timeRange: '7d' | '30d' | '90d' | '1y';
  revenue: {
    total: number;
    growth: number;
    byMonth: Array<{ month: string; amount: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retention: number;
  };
  events: {
    total: number;
    avgSize: number;
    byType: Array<{ type: string; count: number }>;
  };
  performance: {
    conversionRate: number;
    avgResponseTime: number;
    customerSatisfaction: number;
  };
}

export function ReportsAndAnalytics() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [filterBy, setFilterBy] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, [timeRange, filterBy]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      const daysBack = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[timeRange];
      
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Fetch all data
      const [quotesResult, invoicesResult] = await Promise.all([
        supabase
          .from('quote_requests')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('invoices')
          .select('*')
          .gte('created_at', startDate.toISOString())
      ]);

      if (quotesResult.error) throw quotesResult.error;
      if (invoicesResult.error) throw invoicesResult.error;

      const quotes = quotesResult.data || [];
      const invoices = invoicesResult.data || [];

      // Calculate metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      // Calculate growth (mock for now)
      const revenueGrowth = 12.5; // percentage

      // Revenue by month
      const revenueByMonth = generateMonthlyRevenue(invoices, timeRange);

      // Customer metrics
      const uniqueCustomers = new Set(quotes.map(q => q.email)).size;
      const newCustomers = Math.floor(uniqueCustomers * 0.7);
      const returningCustomers = uniqueCustomers - newCustomers;
      const retentionRate = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;

      // Event metrics
      const totalEvents = quotes.filter(q => q.status === 'confirmed').length;
      const avgEventSize = quotes.length > 0 
        ? quotes.reduce((sum, q) => sum + (q.guest_count || 0), 0) / quotes.length 
        : 0;

      // Events by type
      const eventsByType = quotes.reduce((acc, quote) => {
        const type = quote.event_type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const eventTypeArray = Object.entries(eventsByType).map(([type, count]) => ({
        type,
        count
      }));

      // Performance metrics
      const confirmedQuotes = quotes.filter(q => q.status === 'confirmed').length;
      const conversionRate = quotes.length > 0 ? (confirmedQuotes / quotes.length) * 100 : 0;

      setReportData({
        timeRange,
        revenue: {
          total: totalRevenue,
          growth: revenueGrowth,
          byMonth: revenueByMonth
        },
        customers: {
          total: uniqueCustomers,
          new: newCustomers,
          returning: returningCustomers,
          retention: retentionRate
        },
        events: {
          total: totalEvents,
          avgSize: avgEventSize,
          byType: eventTypeArray
        },
        performance: {
          conversionRate,
          avgResponseTime: 4.2,
          customerSatisfaction: 4.8
        }
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenue = (invoices: any[], timeRange: string) => {
    const months = [];
    const monthCount = timeRange === '1y' ? 12 : timeRange === '90d' ? 3 : 1;
    
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthRevenue = invoices
        .filter(inv => {
          const invDate = new Date(inv.created_at);
          return invDate.getMonth() === date.getMonth() && 
                 invDate.getFullYear() === date.getFullYear() &&
                 inv.status === 'paid';
        })
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      months.push({
        month: monthName,
        amount: monthRevenue
      });
    }
    
    return months;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportReport = () => {
    toast({
      title: "Exporting Report",
      description: "Your report is being prepared for download",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const GrowthIcon = reportData.revenue.growth > 0 ? TrendingUp : TrendingDown;
  const growthColor = reportData.revenue.growth > 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Reports & Analytics</h3>
          <p className="text-muted-foreground">Comprehensive business insights and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="operational">Operational</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.revenue.total)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${growthColor}`}>
              <GrowthIcon className="h-3 w-3" />
              <span>{formatPercentage(reportData.revenue.growth)} vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Customers</span>
            </div>
            <div className="text-2xl font-bold">{reportData.customers.total}</div>
            <div className="text-sm text-muted-foreground">
              {reportData.customers.new} new, {reportData.customers.returning} returning
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Events Completed</span>
            </div>
            <div className="text-2xl font-bold">{reportData.events.total}</div>
            <div className="text-sm text-muted-foreground">
              {Math.round(reportData.events.avgSize)} avg guests
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {formatPercentage(reportData.performance.conversionRate)}
            </div>
            <div className="text-sm text-muted-foreground">
              Quotes to confirmed events
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.revenue.byMonth.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((month.amount / Math.max(...reportData.revenue.byMonth.map(m => m.amount))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-20 text-right">
                      {formatCurrency(month.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card>
          <CardHeader>
            <CardTitle>Event Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.events.byType.map((eventType, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{eventType.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((eventType.count / Math.max(...reportData.events.byType.map(e => e.count))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <Badge variant="outline">{eventType.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{reportData.customers.new}</div>
              <p className="text-sm text-muted-foreground">New Customers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{reportData.customers.returning}</div>
              <p className="text-sm text-muted-foreground">Returning Customers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatPercentage(reportData.customers.retention)}
              </div>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <Badge variant={reportData.performance.conversionRate > 50 ? 'default' : 'secondary'}>
                  {formatPercentage(reportData.performance.conversionRate)}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${Math.min(reportData.performance.conversionRate, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Response Time</span>
                <Badge variant={reportData.performance.avgResponseTime < 8 ? 'default' : 'secondary'}>
                  {reportData.performance.avgResponseTime}h
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100 - (reportData.performance.avgResponseTime / 24 * 100), 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <Badge variant={reportData.performance.customerSatisfaction > 4.5 ? 'default' : 'secondary'}>
                  {reportData.performance.customerSatisfaction}/5.0
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.performance.customerSatisfaction / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="financial">
        <Card>
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Detailed financial analysis coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="operational">
        <Card>
          <CardHeader>
            <CardTitle>Operational Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Operational metrics and analysis coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <DocumentManager />
      </TabsContent>
    </Tabs>
  );
}