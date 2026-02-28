import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, FileText, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';

interface Props {
  invoices: any[];
  isLoading: boolean;
}

export function RevenueOverview({ invoices, isLoading }: Props) {
  const stats = useMemo(() => {
    if (!invoices.length) return { totalRevenue: 0, outstanding: 0, avgInvoice: 0, totalEvents: 0 };
    const totalRevenue = invoices.reduce((s, i) => s + (i.total_paid || 0), 0);
    const outstanding = invoices.reduce((s, i) => s + (i.balance_remaining || 0), 0);
    const withAmounts = invoices.filter(i => (i.total_amount || 0) > 0);
    const avgInvoice = withAmounts.length ? withAmounts.reduce((s, i) => s + (i.total_amount || 0), 0) / withAmounts.length : 0;
    return { totalRevenue, outstanding, avgInvoice, totalEvents: invoices.length };
  }, [invoices]);

  const chartData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    invoices.forEach(inv => {
      if (!inv.event_date) return;
      const key = format(parseISO(inv.event_date), 'yyyy-MM');
      byMonth[key] = (byMonth[key] || 0) + (inv.total_paid || 0);
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month: format(parseISO(month + '-01'), 'MMM yyyy'),
        revenue: revenue / 100,
      }));
  }, [invoices]);

  const fmtCurrency = (v: number) => `$${(v / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const kpis = [
    { label: 'Total Revenue', value: fmtCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Outstanding', value: fmtCurrency(stats.outstanding), icon: TrendingUp, color: 'text-amber-600' },
    { label: 'Avg Invoice', value: fmtCurrency(stats.avgInvoice), icon: FileText, color: 'text-blue-600' },
    { label: 'Total Events', value: stats.totalEvents.toString(), icon: Calendar, color: 'text-purple-600' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toLocaleString()}`} className="text-muted-foreground" />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
