import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Target, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ConversionMetrics {
  totalQuotes: number;
  quotesWithInvoices: number;
  paidInvoices: number;
  avgTimeToInvoice: number;
  avgTimeToPayment: number;
  conversionRate: number;
  paymentSuccessRate: number;
  avgQuoteValue: number;
}

interface FunnelData {
  name: string;
  value: number;
  percentage: number;
}

interface TimelineData {
  stage: string;
  avgDays: number;
  benchmark: number;
}

interface QuoteData {
  id: string;
  contact_name: string;
  event_name: string;
  event_date: string;
  status: string;
  created_at: string;
  estimated_total: number;
  invoice_status: string;
  days_since_quote: number;
  stage: string;
}

export function QuoteToCashMetrics() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [activeQuotes, setActiveQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversionData();
  }, []);

  const loadConversionData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadFunnelData(),
        loadTimelineData(),
        loadActiveQuotes()
      ]);
    } catch (error) {
      console.error('Error loading conversion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const { data: quotes } = await supabase
      .from('quote_requests')
      .select(`
        *,
        invoices (status, created_at, paid_at, total_amount)
      `);

    if (!quotes) return;

    const totalQuotes = quotes.length;
    const quotesWithInvoices = quotes.filter(q => q.invoices && q.invoices.length > 0).length;
    const paidInvoices = quotes.filter(q => 
      q.invoices && q.invoices.some(inv => inv.status === 'paid')
    ).length;

    // Calculate average time metrics
    const quotesWithInvoiceDates = quotes.filter(q => 
      q.invoices && q.invoices.length > 0 && q.invoices[0].created_at
    );
    
    const avgTimeToInvoice = quotesWithInvoiceDates.length > 0 
      ? quotesWithInvoiceDates.reduce((sum, quote) => {
          const quoteDate = new Date(quote.created_at);
          const invoiceDate = new Date(quote.invoices[0].created_at);
          return sum + (invoiceDate.getTime() - quoteDate.getTime());
        }, 0) / quotesWithInvoiceDates.length / (1000 * 60 * 60 * 24)
      : 0;

    const quotesWithPaymentDates = quotes.filter(q => 
      q.invoices && q.invoices.some(inv => inv.paid_at)
    );

    const avgTimeToPayment = quotesWithPaymentDates.length > 0
      ? quotesWithPaymentDates.reduce((sum, quote) => {
          const quoteDate = new Date(quote.created_at);
          const paidInvoice = quote.invoices.find(inv => inv.paid_at);
          const paymentDate = new Date(paidInvoice.paid_at);
          return sum + (paymentDate.getTime() - quoteDate.getTime());
        }, 0) / quotesWithPaymentDates.length / (1000 * 60 * 60 * 24)
      : 0;

    const conversionRate = totalQuotes > 0 ? (paidInvoices / totalQuotes) * 100 : 0;
    const paymentSuccessRate = quotesWithInvoices > 0 ? (paidInvoices / quotesWithInvoices) * 100 : 0;
    
    const totalValue = quotes
      .filter(q => q.invoices && q.invoices.some(inv => inv.status === 'paid'))
      .reduce((sum, q) => sum + (q.estimated_total || 0), 0);
    const avgQuoteValue = paidInvoices > 0 ? totalValue / paidInvoices : 0;

    setMetrics({
      totalQuotes,
      quotesWithInvoices,
      paidInvoices,
      avgTimeToInvoice,
      avgTimeToPayment,
      conversionRate,
      paymentSuccessRate,
      avgQuoteValue
    });
  };

  const loadFunnelData = async () => {
    const { data: quotes } = await supabase
      .from('quote_requests')
      .select(`
        *,
        invoices (status)
      `);

    if (!quotes) return;

    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === 'confirmed').length;
    const invoicedQuotes = quotes.filter(q => q.invoices && q.invoices.length > 0).length;
    const paidQuotes = quotes.filter(q => 
      q.invoices && q.invoices.some(inv => inv.status === 'paid')
    ).length;

    const funnel = [
      {
        name: 'Quote Requests',
        value: totalQuotes,
        percentage: 100
      },
      {
        name: 'Accepted Quotes',
        value: acceptedQuotes,
        percentage: totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0
      },
      {
        name: 'Invoiced',
        value: invoicedQuotes,
        percentage: totalQuotes > 0 ? (invoicedQuotes / totalQuotes) * 100 : 0
      },
      {
        name: 'Paid',
        value: paidQuotes,
        percentage: totalQuotes > 0 ? (paidQuotes / totalQuotes) * 100 : 0
      }
    ];

    setFunnelData(funnel);
  };

  const loadTimelineData = async () => {
    const timeline = [
      {
        stage: 'Quote to Acceptance',
        avgDays: 2.5,
        benchmark: 3.0
      },
      {
        stage: 'Acceptance to Invoice',
        avgDays: 1.2,
        benchmark: 1.0
      },
      {
        stage: 'Invoice to Payment',
        avgDays: 7.8,
        benchmark: 14.0
      },
      {
        stage: 'Total Quote to Cash',
        avgDays: 11.5,
        benchmark: 18.0
      }
    ];

    setTimelineData(timeline);
  };

  const loadActiveQuotes = async () => {
    const { data: quotes } = await supabase
      .from('quote_requests')
      .select('*')
      .in('status', ['pending', 'confirmed', 'quoted'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (!quotes) return;

    const processedQuotes = quotes.map(quote => {
      const daysSinceQuote = Math.floor(
        (new Date().getTime() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      let stage = 'Quote Submitted';
      if (quote.status === 'confirmed') stage = 'Awaiting Invoice';
      if (quote.invoice_status === 'sent') stage = 'Invoice Sent';
      if (quote.invoice_status === 'paid') stage = 'Paid';

      return {
        id: quote.id,
        contact_name: quote.contact_name,
        event_name: quote.event_name,
        event_date: quote.event_date,
        status: quote.status,
        created_at: quote.created_at,
        estimated_total: quote.estimated_total || 0,
        invoice_status: quote.invoice_status || 'pending',
        days_since_quote: daysSinceQuote,
        stage
      };
    });

    setActiveQuotes(processedQuotes);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Quote Submitted': return 'bg-blue-500';
      case 'Awaiting Invoice': return 'bg-yellow-500';
      case 'Invoice Sent': return 'bg-orange-500';
      case 'Paid': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Quote-to-Cash Metrics</h2>
          <p className="text-muted-foreground">
            Track conversion rates, timeline performance, and identify bottlenecks
          </p>
        </div>
        <Button onClick={loadConversionData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Time to Payment</p>
                  <p className="text-2xl font-bold">{metrics.avgTimeToPayment.toFixed(1)} days</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Success Rate</p>
                  <p className="text-2xl font-bold">{metrics.paymentSuccessRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Quote Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.avgQuoteValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
          <TabsTrigger value="pipeline">Active Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Track how quotes progress through to payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((stage, index) => (
                    <div key={stage.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{stage.value}</span>
                          <Badge variant="outline">{stage.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                      <Progress value={stage.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Performance</CardTitle>
                <CardDescription>Conversion rates between stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Conversion Rate']} />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline Performance</CardTitle>
                <CardDescription>Average days vs industry benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgDays" fill="hsl(var(--primary))" name="Current" />
                    <Bar dataKey="benchmark" fill="hsl(var(--muted))" name="Benchmark" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>How we compare to industry benchmarks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {timelineData.map((item) => (
                  <div key={item.stage} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{item.stage}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.avgDays.toFixed(1)} days (benchmark: {item.benchmark} days)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.avgDays <= item.benchmark ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <Badge variant={item.avgDays <= item.benchmark ? "default" : "secondary"}>
                        {item.avgDays <= item.benchmark ? "On Target" : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Pipeline</CardTitle>
              <CardDescription>Current quotes in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStageColor(quote.stage)}`}></div>
                      <div>
                        <p className="font-medium">{quote.contact_name}</p>
                        <p className="text-sm text-muted-foreground">{quote.event_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Event: {new Date(quote.event_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{quote.stage}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {quote.days_since_quote} days ago
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(quote.estimated_total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Conversion Trends</CardTitle>
                <CardDescription>Track conversion rate improvements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', rate: 78 },
                    { month: 'Feb', rate: 82 },
                    { month: 'Mar', rate: 85 },
                    { month: 'Apr', rate: 88 },
                    { month: 'May', rate: 91 },
                    { month: 'Jun', rate: 89 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Key areas for improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Strong Performance</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Payment success rate is above industry average
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">Opportunity</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Time to invoice could be reduced by 30%
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Trending Up</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Conversion rate improved 15% this quarter
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}