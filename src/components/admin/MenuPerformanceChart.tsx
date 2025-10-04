import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMenuAnalytics } from '@/hooks/useMenuAnalytics';
import { TrendingUp, DollarSign, Package, Loader2 } from 'lucide-react';

export function MenuPerformanceChart() {
  const { menuItems, loading } = useMenuAnalytics();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const topItems = menuItems.slice(0, 10);
  const maxRevenue = Math.max(...topItems.map(item => item.total_revenue));

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Menu Items
        </CardTitle>
        <CardDescription>Most popular items by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topItems.map((item, index) => {
            const widthPercentage = (item.total_revenue / maxRevenue) * 100;
            
            return (
              <div key={item.item_name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.item_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <Package className="h-3 w-3 inline mr-1" />
                          {item.order_count} orders
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">{formatCurrency(item.total_revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.avg_price)} avg
                    </p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No menu data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
