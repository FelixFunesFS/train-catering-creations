import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

interface Props {
  lineItems: any[];
  isLoading: boolean;
}

interface ItemAgg {
  title: string;
  category: string;
  totalRevenue: number;
  totalQty: number;
  avgPrice: number;
}

export function ItemsAnalysis({ lineItems, isLoading }: Props) {
  const { topItems, bottomItems } = useMemo(() => {
    const map: Record<string, ItemAgg> = {};
    lineItems.forEach(item => {
      const key = (item.title || item.category || 'Unnamed').toLowerCase();
      if (!map[key]) {
        map[key] = { title: item.title || item.category || 'Unnamed', category: item.category || 'other', totalRevenue: 0, totalQty: 0, avgPrice: 0 };
      }
      map[key].totalRevenue += item.total_price || 0;
      map[key].totalQty += item.quantity || 0;
    });
    const sorted = Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
    sorted.forEach(i => { i.avgPrice = i.totalQty > 0 ? i.totalRevenue / i.totalQty : 0; });
    const maxRev = sorted[0]?.totalRevenue || 1;
    return {
      topItems: sorted.slice(0, 10).map(i => ({ ...i, pct: (i.totalRevenue / maxRev) * 100 })),
      bottomItems: sorted.slice(-5).reverse().map(i => ({ ...i, pct: (i.totalRevenue / maxRev) * 100 })),
    };
  }, [lineItems]);

  const fmtCurrency = (v: number) => `$${(v / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  if (isLoading) return <Skeleton className="h-96" />;

  const renderTable = (items: (ItemAgg & { pct: number })[], title: string) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="hidden sm:table-cell">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm capitalize">{item.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">{fmtCurrency(item.totalRevenue)}</TableCell>
                  <TableCell className="text-right text-sm">{item.totalQty}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${item.pct}%` }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No items data available</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {renderTable(topItems, 'Top Items by Revenue')}
      {bottomItems.length > 0 && renderTable(bottomItems, 'Bottom Performers')}
    </div>
  );
}
