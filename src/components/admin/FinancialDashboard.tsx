import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, FileText, AlertCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  outstandingInvoices: number;
  totalInvoices: number;
  paidInvoices: number;
  conversionRate: number;
  averagePaymentTime: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  invoices: number;
}

interface CustomerData {
  name: string;
  email: string;
  totalSpent: number;
  invoiceCount: number;
  lastEvent: string;
}

interface PaymentMethodData {
  method: string;
  count: number;
  percentage: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function FinancialDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    loadFinancialData();
  }, [timeRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadRevenueData(),
        loadTopCustomers(),
        loadPaymentMethods()
      ]);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        *,
        customers (name, email),
        quote_requests (event_date)
      `);

    if (!invoices) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    const monthlyRevenue = invoices
      .filter(inv => {
        const invoiceDate = new Date(inv.created_at);
        return inv.status === 'paid' && 
               invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const totalInvoices = invoices.length;
    const outstandingInvoices = invoices.filter(inv => ['draft', 'sent'].includes(inv.status)).length;

    const averageOrderValue = paidInvoices > 0 ? totalRevenue / paidInvoices : 0;
    const conversionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    // Calculate average payment time
    const paidInvoicesWithDates = invoices.filter(inv => inv.status === 'paid' && inv.sent_at && inv.paid_at);
    const averagePaymentTime = paidInvoicesWithDates.length > 0 
      ? paidInvoicesWithDates.reduce((sum, inv) => {
          const sentDate = new Date(inv.sent_at);
          const paidDate = new Date(inv.paid_at);
          return sum + (paidDate.getTime() - sentDate.getTime());
        }, 0) / paidInvoicesWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    setMetrics({
      totalRevenue,
      monthlyRevenue,
      averageOrderValue,
      outstandingInvoices,
      totalInvoices,
      paidInvoices,
      conversionRate,
      averagePaymentTime
    });
  };

  const loadRevenueData = async () => {
    const months = getMonthsRange();
    const revenueByMonth: RevenueData[] = [];

    for (const month of months) {
      const { data: monthlyInvoices } = await supabase
        .from('invoices')
        .select('total_amount, status')
        .gte('created_at', `${month.year}-${month.month.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${month.nextYear}-${month.nextMonth.toString().padStart(2, '0')}-01`)
        .eq('status', 'paid');

      const revenue = monthlyInvoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const invoices = monthlyInvoices?.length || 0;

      revenueByMonth.push({
        month: `${month.year}-${month.month.toString().padStart(2, '0')}`,
        revenue: revenue / 100, // Convert from cents
        invoices
      });
    }

    setRevenueData(revenueByMonth);
  };

  const loadTopCustomers = async () => {
    const { data: customerData } = await supabase
      .from('customers')
      .select(`
        *,
        invoices (total_amount, status, created_at),
        quote_requests (event_date, event_name)
      `);

    if (!customerData) return;

    const processedCustomers = customerData
      .map(customer => {
        const paidInvoices = customer.invoices.filter(inv => inv.status === 'paid');
        const totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
        const invoiceCount = paidInvoices.length;
        const lastEvent = Array.isArray(customer.quote_requests) && customer.quote_requests.length > 0
          ? customer.quote_requests
              .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())[0]?.event_name || 'N/A'
          : 'N/A';

        return {
          name: customer.name,
          email: customer.email,
          totalSpent: totalSpent / 100, // Convert from cents
          invoiceCount,
          lastEvent
        };
      })
      .filter(customer => customer.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    setTopCustomers(processedCustomers);
  };

  const loadPaymentMethods = async () => {
    const { data: payments } = await supabase
      .from('payment_history')
      .select('payment_method')
      .eq('status', 'succeeded');

    if (!payments) return;

    const methodCounts = payments.reduce((acc, payment) => {
      const method = payment.payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(methodCounts).reduce((sum, count) => sum + count, 0);
    const methodData = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      count,
      percentage: (count / total) * 100
    }));

    setPaymentMethods(methodData);
  };

  const getMonthsRange = () => {
    const months = [];
    const monthsBack = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        nextMonth: nextDate.getMonth() + 1,
        nextYear: nextDate.getFullYear()
      });
    }
    
    return months;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
          <h2 className="text-3xl font-bold">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Track revenue, analyze customer behavior, and monitor payment performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadFinancialData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue / 100)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue / 100)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue / 100)}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Metrics</TabsTrigger>
          <TabsTrigger value="payments">Payment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
                <CardDescription>Monthly revenue trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Volume</CardTitle>
                <CardDescription>Number of invoices processed monthly</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="invoices" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest value customers by total spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={customer.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <p className="text-xs text-muted-foreground">Last event: {customer.lastEvent}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(customer.totalSpent)}</p>
                        <p className="text-sm text-muted-foreground">{customer.invoiceCount} events</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percentage }) => `${method} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Invoices</span>
                    <Badge variant="outline">{metrics.totalInvoices}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paid Invoices</span>
                    <Badge variant="default">{metrics.paidInvoices}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Outstanding</span>
                    <Badge variant="destructive">{metrics.outstandingInvoices}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      {metrics.conversionRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quotes converted to paid invoices
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Payment Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      {metrics.averagePaymentTime.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Days from invoice sent to payment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Overview</CardTitle>
                <CardDescription>Current status of all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Average Payment Time:</span>
                      <Badge variant="outline">{metrics.averagePaymentTime.toFixed(1)} days</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Outstanding Invoices:</span>
                      <Badge variant="destructive">{formatCurrency(metrics.outstandingInvoices * (metrics.averageOrderValue / 100))}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common financial management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Monthly Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Send Payment Reminders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Export Customer Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}