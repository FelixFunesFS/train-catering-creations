import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalInvoices: number;
  pendingInvoices: number;
  approvedInvoices: number;
  overduePauments: number;
  upcomingEvents: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface AdminAnalyticsDashboardProps {
  data: AnalyticsData;
  className?: string;
}

export function AdminAnalyticsDashboard({ data, className = '' }: AdminAnalyticsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      description: "All time revenue",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(data.monthlyRevenue),
      description: formatPercentage(data.revenueGrowth) + " from last month",
      icon: TrendingUp,
      color: data.revenueGrowth >= 0 ? "text-green-600" : "text-red-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Active Invoices",
      value: data.totalInvoices.toString(),
      description: `${data.pendingInvoices} pending approval`,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Upcoming Events",
      value: data.upcomingEvents.toString(),
      description: "Next 30 days",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    }
  ];

  const metrics = [
    {
      label: "Average Order Value",
      value: formatCurrency(data.averageOrderValue),
      icon: Target
    },
    {
      label: "Conversion Rate",
      value: formatPercentage(data.conversionRate),
      icon: TrendingUp
    },
    {
      label: "Approved Estimates",
      value: data.approvedInvoices.toString(),
      icon: CheckCircle
    },
    {
      label: "Overdue Payments",
      value: data.overduePauments.toString(),
      icon: AlertCircle,
      alert: data.overduePauments > 0
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="hover-scale transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Business Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${
                  metric.alert ? 'bg-red-50 dark:bg-red-950' : 'bg-muted'
                }`}>
                  <metric.icon className={`h-4 w-4 ${
                    metric.alert ? 'text-red-600' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className={`font-semibold ${
                    metric.alert ? 'text-red-600' : ''
                  }`}>
                    {metric.value}
                    {metric.alert && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Attention
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trend Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Revenue chart visualization</p>
              <p className="text-sm text-muted-foreground mt-1">
                Chart component would be integrated here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Estimate approved by John Smith</span>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Payment received for Wedding Reception</span>
              </div>
              <span className="text-xs text-muted-foreground">5 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Change request submitted for Corporate Event</span>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}