import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { generateBusinessInsights, PricingCalculation } from '@/utils/businessLogic';
import { supabase } from '@/integrations/supabase/client';

interface InsightData {
  totalQuotes: number;
  conversionRate: number;
  averageOrderValue: number;
  popularServices: string[];
  monthlyRevenue: number;
  pendingQuotes: number;
  upcomingEvents: number;
}

export function BusinessInsightsDashboard() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const businessInsights = await generateBusinessInsights();
      
      // Fetch additional metrics
      const { data: pendingQuotes } = await supabase
        .from('quote_requests')
        .select('id')
        .eq('status', 'pending');

      const { data: upcomingEvents } = await supabase
        .from('quote_requests')
        .select('id')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .eq('status', 'confirmed');

      const { data: thisMonthInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const monthlyRevenue = thisMonthInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      setInsights({
        ...businessInsights,
        monthlyRevenue: monthlyRevenue / 100, // Convert from cents
        pendingQuotes: pendingQuotes?.length || 0,
        upcomingEvents: upcomingEvents?.length || 0
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Business Insights</h2>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Business Insights</h2>
          <Button onClick={fetchInsights} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load business insights</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Insights</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <Button onClick={fetchInsights} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              {insights.pendingQuotes} pending review
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConversionRateColor(insights.conversionRate)}`}>
              {insights.conversionRate.toFixed(1)}%
            </div>
            <Progress value={insights.conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(insights.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per confirmed event
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(insights.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.popularServices.slice(0, 3).map((service, index) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{insights.upcomingEvents}</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Confirmed events
                </p>
                <p className="text-xs text-muted-foreground">
                  Next 30 days
                </p>
              </div>
            </div>
            
            {insights.upcomingEvents > 0 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Schedule looks healthy
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.pendingQuotes > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">
                    {insights.pendingQuotes} quote{insights.pendingQuotes !== 1 ? 's' : ''} awaiting review
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Review and respond to pending quote requests
                  </p>
                </div>
              </div>
            )}
            
            {insights.conversionRate < 50 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">
                    Low conversion rate detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Consider reviewing pricing strategy and follow-up processes
                  </p>
                </div>
              </div>
            )}
            
            {insights.pendingQuotes === 0 && insights.conversionRate >= 50 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">
                    All systems looking good!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No immediate action items
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}