import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface MetricsData {
  weekRevenue: number;
  monthEvents: number;
  pendingQuotes: number;
}

export function SimpleDashboardMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    weekRevenue: 0,
    monthEvents: 0,
    pendingQuotes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get this week's revenue from paid transactions
      const { data: revenueData } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'succeeded')
        .gte('created_at', weekAgo.toISOString());

      const weekRevenue = revenueData?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get this month's event count
      const { count: monthEvents } = await supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', monthStart.toISOString().split('T')[0])
        .neq('workflow_status', 'cancelled');

      // Get pending quotes needing action
      const { count: pendingQuotes } = await supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .eq('workflow_status', 'pending');

      setMetrics({
        weekRevenue: weekRevenue / 100, // Convert cents to dollars
        monthEvents: monthEvents || 0,
        pendingQuotes: pendingQuotes || 0,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-16 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">This Week's Revenue</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(metrics.weekRevenue)}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Events This Month</p>
            <p className="text-3xl font-bold mt-1">{metrics.monthEvents}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pending Quotes</p>
            <p className="text-3xl font-bold mt-1">{metrics.pendingQuotes}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
