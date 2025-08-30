import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    growth: number;
  };
  quotes: {
    total: number;
    pending: number;
    reviewed: number;
    confirmed: number;
    conversionRate: number;
  };
  events: {
    upcoming: number;
    thisMonth: number;
    avgGuestCount: number;
  };
  performance: {
    avgResponseTime: number;
    customerSatisfaction: number;
    repeatCustomers: number;
  };
}

export function BusinessIntelligenceDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
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

      // Fetch data in parallel
      const [invoicesResult, quotesResult, eventsResult] = await Promise.all([
        supabase
          .from('invoices')
          .select('total_amount, status, created_at, paid_at')
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('quote_requests')
          .select('id, status, created_at, guest_count, estimated_total')
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('quote_requests')
          .select('event_date, guest_count, status')
          .gte('event_date', now.toISOString())
          .lte('event_date', new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (invoicesResult.error) throw invoicesResult.error;
      if (quotesResult.error) throw quotesResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const invoices = invoicesResult.data || [];
      const quotes = quotesResult.data || [];
      const upcomingEvents = eventsResult.data || [];

      // Calculate analytics
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const monthlyRevenue = paidInvoices
        .filter(inv => new Date(inv.paid_at || inv.created_at) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      const weeklyRevenue = paidInvoices
        .filter(inv => new Date(inv.paid_at || inv.created_at) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      // Calculate growth (comparing to previous period)
      const prevMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const prevMonthEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const prevMonthRevenue = paidInvoices
        .filter(inv => {
          const date = new Date(inv.paid_at || inv.created_at);
          return date >= prevMonthStart && date <= prevMonthEnd;
        })
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      const growth = prevMonthRevenue > 0 ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

      // Quote analytics
      const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
      const reviewedQuotes = quotes.filter(q => q.status === 'reviewed').length;
      const confirmedQuotes = quotes.filter(q => q.status === 'confirmed').length;
      const conversionRate = quotes.length > 0 ? (confirmedQuotes / quotes.length) * 100 : 0;

      // Event analytics
      const thisMonthEvents = upcomingEvents.filter(e => 
        new Date(e.event_date) <= new Date(now.getFullYear(), now.getMonth() + 1, 0)
      ).length;
      
      const avgGuestCount = upcomingEvents.length > 0 
        ? upcomingEvents.reduce((sum, e) => sum + (e.guest_count || 0), 0) / upcomingEvents.length 
        : 0;

      // Performance metrics (mock data for now)
      const avgResponseTime = 4.2; // hours
      const customerSatisfaction = 4.8; // out of 5
      const repeatCustomers = 35; // percentage

      setAnalyticsData({
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          weekly: weeklyRevenue,
          growth
        },
        quotes: {
          total: quotes.length,
          pending: pendingQuotes,
          reviewed: reviewedQuotes,
          confirmed: confirmedQuotes,
          conversionRate
        },
        events: {
          upcoming: upcomingEvents.length,
          thisMonth: thisMonthEvents,
          avgGuestCount
        },
        performance: {
          avgResponseTime,
          customerSatisfaction,
          repeatCustomers
        }
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return TrendingUp;
    if (growth < 0) return TrendingDown;
    return TrendingUp;
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

  if (!analyticsData) return null;

  const GrowthIcon = getGrowthIcon(analyticsData.revenue.growth);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Business Intelligence</h3>
          <p className="text-muted-foreground">Performance metrics and analytics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '1y' ? '1 Year' : range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.revenue.total)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${getGrowthColor(analyticsData.revenue.growth)}`}>
              <GrowthIcon className="h-3 w-3" />
              <span>{formatPercentage(analyticsData.revenue.growth)} vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Quotes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Active Quotes</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.quotes.total}</div>
            <div className="text-sm text-muted-foreground">
              {formatPercentage(analyticsData.quotes.conversionRate)} conversion rate
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Upcoming Events</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.events.upcoming}</div>
            <div className="text-sm text-muted-foreground">
              {analyticsData.events.thisMonth} this month
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Customer Score</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.performance.customerSatisfaction}/5.0</div>
            <div className="text-sm text-muted-foreground">
              {formatPercentage(analyticsData.performance.repeatCustomers)} repeat customers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quote Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Review</span>
                <div className="flex items-center gap-2">
                  <Progress value={(analyticsData.quotes.pending / analyticsData.quotes.total) * 100} className="w-20" />
                  <span className="text-sm font-medium">{analyticsData.quotes.pending}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Under Review</span>
                <div className="flex items-center gap-2">
                  <Progress value={(analyticsData.quotes.reviewed / analyticsData.quotes.total) * 100} className="w-20" />
                  <span className="text-sm font-medium">{analyticsData.quotes.reviewed}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmed</span>
                <div className="flex items-center gap-2">
                  <Progress value={(analyticsData.quotes.confirmed / analyticsData.quotes.total) * 100} className="w-20" />
                  <span className="text-sm font-medium">{analyticsData.quotes.confirmed}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <Badge variant={analyticsData.quotes.conversionRate > 50 ? 'default' : 'secondary'}>
                  {formatPercentage(analyticsData.quotes.conversionRate)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Avg Response Time</p>
                  <p className="text-xs text-muted-foreground">To initial quote</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{analyticsData.performance.avgResponseTime}h</p>
                  <Badge variant={analyticsData.performance.avgResponseTime < 8 ? 'default' : 'secondary'}>
                    {analyticsData.performance.avgResponseTime < 8 ? 'Excellent' : 'Good'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Customer Satisfaction</p>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{analyticsData.performance.customerSatisfaction}/5.0</p>
                  <Badge variant={analyticsData.performance.customerSatisfaction > 4.5 ? 'default' : 'secondary'}>
                    {analyticsData.performance.customerSatisfaction > 4.5 ? 'Excellent' : 'Good'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Repeat Customers</p>
                  <p className="text-xs text-muted-foreground">Return rate</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatPercentage(analyticsData.performance.repeatCustomers)}</p>
                  <Badge variant={analyticsData.performance.repeatCustomers > 30 ? 'default' : 'secondary'}>
                    {analyticsData.performance.repeatCustomers > 30 ? 'Excellent' : 'Good'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Revenue Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.weekly)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.monthly)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Average Event Size</p>
              <p className="text-2xl font-bold">{Math.round(analyticsData.events.avgGuestCount)} guests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.quotes.pending > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">
                    {analyticsData.quotes.pending} quote{analyticsData.quotes.pending !== 1 ? 's' : ''} pending review
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  Review Now
                </Button>
              </div>
            )}
            
            {analyticsData.revenue.growth < 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">
                    Revenue declined by {formatPercentage(Math.abs(analyticsData.revenue.growth))} this month
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  Analyze
                </Button>
              </div>
            )}
            
            {analyticsData.performance.avgResponseTime > 8 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">
                    Response time is above target (8+ hours)
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  Optimize
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}