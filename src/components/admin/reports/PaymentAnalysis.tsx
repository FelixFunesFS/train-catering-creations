import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#a3a3a3'];

interface Props {
  transactions: any[];
  invoices: any[];
  isLoading: boolean;
}

export function PaymentAnalysis({ transactions, invoices, isLoading }: Props) {
  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      const method = t.payment_method || t.payment_type || 'unknown';
      map[method] = (map[method] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [transactions]);

  const agingData = useMemo(() => {
    const buckets = { 'Current': 0, '1-30 days': 0, '31-60 days': 0, '61-90 days': 0, '90+ days': 0 };
    invoices.forEach(inv => {
      const balance = inv.balance_remaining || 0;
      if (balance <= 0) return;
      const overdue = inv.days_overdue || 0;
      if (overdue <= 0) buckets['Current'] += balance;
      else if (overdue <= 30) buckets['1-30 days'] += balance;
      else if (overdue <= 60) buckets['31-60 days'] += balance;
      else if (overdue <= 90) buckets['61-90 days'] += balance;
      else buckets['90+ days'] += balance;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value: value / 100 }));
  }, [invoices]);

  const collectionRate = useMemo(() => {
    const totalBilled = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
    const totalPaid = invoices.reduce((s, i) => s + (i.total_paid || 0), 0);
    return totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : '0';
  }, [invoices]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-72" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Collection Rate */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
          <p className="text-sm text-muted-foreground mb-2">Collection Rate</p>
          <p className="text-5xl font-bold text-primary">{collectionRate}%</p>
          <p className="text-xs text-muted-foreground mt-2">of total billed amount collected</p>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            {methodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }: any) => `${name} ${(Number(percent) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {methodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No payment data</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AR Aging */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Accounts Receivable Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toLocaleString()}`} className="text-muted-foreground" />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Outstanding']} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
