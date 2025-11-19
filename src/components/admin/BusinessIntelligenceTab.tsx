import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface RevenueData {
  month: string;
  revenue: number;
  quotes: number;
  events: number;
}

interface CustomerMetrics {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface EventTypeData {
  type: string;
  count: number;
  revenue: number;
  color: string;
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

export function BusinessIntelligenceTab() {
  const [timeRange, setTimeRange] = useState('6m');
  const [loading, setLoading] = useState(true);
  
  // Sample data - in real implementation, this would come from your analytics service
  const revenueData: RevenueData[] = [
    { month: 'Jul', revenue: 25400, quotes: 34, events: 28 },
    { month: 'Aug', revenue: 31200, quotes: 42, events: 35 },
    { month: 'Sep', revenue: 28900, quotes: 38, events: 31 },
    { month: 'Oct', revenue: 34500, quotes: 46, events: 39 },
    { month: 'Nov', revenue: 41200, quotes: 52, events: 44 },
    { month: 'Dec', revenue: 48700, quotes: 61, events: 53 },
  ];

  const customerMetrics: CustomerMetrics[] = [
    { name: 'Total Revenue', value: 209900, change: 23.5, trend: 'up' },
    { name: 'Active Customers', value: 156, change: 12.3, trend: 'up' },
    { name: 'Avg Order Value', value: 1345, change: -2.1, trend: 'down' },
    { name: 'Customer Retention', value: 87.5, change: 4.2, trend: 'up' },
  ];

  const eventTypeData: EventTypeData[] = [
    { type: 'Weddings', count: 45, revenue: 180000, color: '#8B5CF6' },
    { type: 'Corporate', count: 38, revenue: 95000, color: '#06B6D4' },
    { type: 'Military', count: 22, revenue: 66000, color: '#10B981' },
    { type: 'Private Parties', count: 31, revenue: 62000, color: '#F59E0B' },
    { type: 'Graduations', count: 19, revenue: 38000, color: '#EF4444' },
  ];

  const predictiveInsights: PredictiveInsight[] = [
    {
      id: '1',
      title: 'Wedding Season Peak Opportunity',
      description: 'Based on historical data, wedding bookings typically increase 40% in the next 3 months.',
      confidence: 92,
      impact: 'high',
      action: 'Increase marketing spend and prepare additional staff capacity'
    },
    {
      id: '2',
      title: 'Corporate Event Trend',
      description: 'Corporate events show 15% growth potential with end-of-year functions approaching.',
      confidence: 78,
      impact: 'medium',
      action: 'Develop corporate package promotions'
    },
    {
      id: '3',
      title: 'Customer Retention Risk',
      description: '12 customers show decreased engagement and may need re-engagement campaigns.',
      confidence: 85,
      impact: 'medium',
      action: 'Launch targeted retention campaign with special offers'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const exportReport = () => {
    toast.success('Analytics report exported successfully');
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Business Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Advanced analytics and predictive insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {customerMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">
                    {metric.name.includes('Revenue') || metric.name.includes('Value') 
                      ? formatCurrency(metric.value)
                      : metric.name.includes('Retention')
                      ? `${metric.value}%`
                      : metric.value.toLocaleString()
                    }
                  </p>
                  <div className="flex items-center space-x-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : null}
                    <span className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  {metric.name.includes('Revenue') && <DollarSign className="h-6 w-6 text-primary" />}
                  {metric.name.includes('Customers') && <Users className="h-6 w-6 text-primary" />}
                  {metric.name.includes('Value') && <Target className="h-6 w-6 text-primary" />}
                  {metric.name.includes('Retention') && <Zap className="h-6 w-6 text-primary" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="events">Event Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Quotes vs Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quotes" fill="hsl(var(--primary))" name="Quotes" />
                    <Bar dataKey="events" fill="hsl(var(--secondary))" name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Event Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeData as any}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventTypeData.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <div>
                          <p className="font-medium">{event.type}</p>
                          <p className="text-sm text-muted-foreground">{event.count} events</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(event.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(event.revenue / event.count)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                AI-Powered Predictions
              </CardTitle>
              <CardDescription>
                Machine learning insights based on historical data and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          Recommended Action: {insight.action}
                        </p>
                      </div>
                      <div className="ml-4 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {insight.confidence}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quote Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">73.2%</div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+5.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2.3h</div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">-12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.8/5</div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+0.2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}