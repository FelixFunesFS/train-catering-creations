import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ArrowUpDown } from 'lucide-react';

interface LineItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
}

interface LineItemComparisonCardProps {
  beforeItems: LineItem[];
  afterItems: LineItem[];
}

export function LineItemComparisonCard({ beforeItems, afterItems }: LineItemComparisonCardProps) {
  // Create maps for comparison
  const beforeMap = new Map(beforeItems.map(item => [item.title, item]));
  const afterMap = new Map(afterItems.map(item => [item.title, item]));

  // Categorize changes
  const added: LineItem[] = [];
  const removed: LineItem[] = [];
  const modified: { before: LineItem; after: LineItem }[] = [];

  // Find added items
  for (const [title, item] of afterMap) {
    if (!beforeMap.has(title)) {
      added.push(item);
    }
  }

  // Find removed items
  for (const [title, item] of beforeMap) {
    if (!afterMap.has(title)) {
      removed.push(item);
    }
  }

  // Find modified items
  for (const [title, afterItem] of afterMap) {
    const beforeItem = beforeMap.get(title);
    if (beforeItem) {
      const priceChanged = beforeItem.total_price !== afterItem.total_price;
      const quantityChanged = beforeItem.quantity !== afterItem.quantity;
      
      if (priceChanged || quantityChanged) {
        modified.push({ before: beforeItem, after: afterItem });
      }
    }
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const totalChanges = added.length + removed.length + modified.length;

  if (totalChanges === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Line Item Changes</CardTitle>
          <CardDescription>No line item changes detected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Line Item Changes</CardTitle>
            <CardDescription>
              {totalChanges} {totalChanges === 1 ? 'change' : 'changes'} detected
            </CardDescription>
          </div>
          <Badge variant="secondary">{totalChanges}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Added Items */}
        {added.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-sm">Added ({added.length})</h4>
            </div>
            <div className="space-y-2 pl-6">
              {added.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm bg-green-50 p-2 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-green-900">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-green-700">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-900">{formatCurrency(item.total_price)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-green-700">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed Items */}
        {removed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-red-600" />
              <h4 className="font-medium text-sm">Removed ({removed.length})</h4>
            </div>
            <div className="space-y-2 pl-6">
              {removed.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm bg-red-50 p-2 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-red-900 line-through">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-red-700">{item.description}</p>
                    )}
                  </div>
                  <p className="font-medium text-red-900 line-through">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modified Items */}
        {modified.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-sm">Modified ({modified.length})</h4>
            </div>
            <div className="space-y-3 pl-6">
              {modified.map(({ before, after }) => (
                <div key={after.id} className="bg-blue-50 p-2 rounded space-y-1">
                  <p className="font-medium text-sm text-blue-900">{after.title}</p>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 line-through">
                        Qty: {before.quantity}
                      </span>
                      <span className="text-blue-900 font-medium">
                        → Qty: {after.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 line-through">
                        {formatCurrency(before.total_price)}
                      </span>
                      <span className="text-blue-900 font-medium">
                        → {formatCurrency(after.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Total Impact */}
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Total Impact:</span>
          <span>
            {(() => {
              const beforeTotal = beforeItems.reduce((sum, item) => sum + item.total_price, 0);
              const afterTotal = afterItems.reduce((sum, item) => sum + item.total_price, 0);
              const diff = afterTotal - beforeTotal;
              const diffColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground';
              return (
                <span className={diffColor}>
                  {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                </span>
              );
            })()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
