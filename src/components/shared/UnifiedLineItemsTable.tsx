import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, TrendingUp, TrendingDown, Sparkles, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LineItem {
  id?: string;
  title?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
}

interface ChangeData {
  itemId: string;
  type: 'added' | 'removed' | 'modified';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

interface UnifiedLineItemsTableProps {
  items: LineItem[];
  mode?: 'view' | 'edit' | 'comparison';
  changeData?: ChangeData[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  onItemUpdate?: (itemId: string, updates: Partial<LineItem>) => void;
  onItemAdd?: () => void;
  onItemRemove?: (itemId: string) => void;
  isModified?: boolean;
  groupByCategory?: boolean;
}

export function UnifiedLineItemsTable({
  items,
  mode = 'view',
  changeData = [],
  subtotal,
  taxAmount,
  totalAmount,
  onItemUpdate,
  onItemAdd,
  onItemRemove,
  isModified = false,
  groupByCategory = true
}: UnifiedLineItemsTableProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getChangeForItem = (itemId?: string) => {
    if (!itemId) return null;
    return changeData.find(c => c.itemId === itemId);
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Sparkles className="h-4 w-4 text-emerald-600" />;
      case 'removed':
        return <X className="h-4 w-4 text-rose-600" />;
      case 'modified':
        return <TrendingUp className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800';
      case 'removed':
        return 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800';
      case 'modified':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800';
      default:
        return '';
    }
  };

  const renderFieldChange = (change: ChangeData['changes'][0]) => {
    if (!change) return null;
    
    const { field, oldValue, newValue } = change;
    
    if (field === 'quantity' || field === 'unit_price') {
      const isIncrease = newValue > oldValue;
      return (
        <Badge variant="outline" className="ml-2 text-xs">
          {oldValue} → {newValue}
          {isIncrease ? (
            <TrendingUp className="ml-1 h-3 w-3 text-emerald-600" />
          ) : (
            <TrendingDown className="ml-1 h-3 w-3 text-rose-600" />
          )}
        </Badge>
      );
    }
    
    return null;
  };

  const groupedItems = groupByCategory
    ? items.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as Record<string, LineItem[]>)
    : { 'All Items': items };

  const calculateCategoryTotal = (items: LineItem[]) => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  return (
    <div className="space-y-6">
      {/* Items by Category - One Card per Category */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => {
        const categoryTotal = calculateCategoryTotal(categoryItems);
        
        return (
          <div key={category} className="border rounded-lg bg-card overflow-hidden">
            {/* Category Header */}
            {groupByCategory && (
              <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-base capitalize">
                    {category}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
                <span className="font-semibold text-sm">
                  {formatCurrency(categoryTotal)}
                </span>
              </div>
            )}

            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground border-b">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              {mode === 'edit' && <div className="col-span-1"></div>}
            </div>

            {/* Item Rows */}
            <div className="divide-y">
              {categoryItems.map((item, index) => {
                const change = getChangeForItem(item.id);
                const isRemoved = change?.type === 'removed';
                
                return (
                  <div
                    key={item.id || index}
                    className={`
                      px-4 py-3 transition-all
                      ${index % 2 === 1 ? 'bg-muted/10' : 'bg-card'}
                      ${change ? getChangeColor(change.type) : ''}
                      ${isRemoved ? 'opacity-60' : ''}
                      hover:bg-muted/20
                    `}
                  >
                    {/* Change Indicator */}
                    {change && (
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium">
                        {getChangeIcon(change.type)}
                        <span className="capitalize">
                          {change.type === 'added' && '✨ New Item'}
                          {change.type === 'removed' && '❌ Removed'}
                          {change.type === 'modified' && '📝 Modified'}
                        </span>
                      </div>
                    )}

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        {mode === 'edit' && !isRemoved ? (
                          <div className="space-y-2">
                            <Input
                              value={item.title || ''}
                              onChange={(e) =>
                                onItemUpdate?.(item.id!, { title: e.target.value })
                              }
                              placeholder="Item title"
                              className="font-medium h-8 text-sm"
                            />
                            <Textarea
                              value={item.description}
                              onChange={(e) =>
                                onItemUpdate?.(item.id!, { description: e.target.value })
                              }
                              placeholder="Description"
                              className="text-xs resize-none"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div className={isRemoved ? 'line-through' : ''}>
                            <p className="font-medium text-sm">{item.title || item.description}</p>
                            {item.title && item.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        {mode === 'edit' && !isRemoved ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              onItemUpdate?.(item.id!, { quantity: parseInt(e.target.value) || 0 })
                            }
                            className="text-center h-8 text-sm"
                            min="0"
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <span className={isRemoved ? 'line-through' : ''}>{item.quantity}</span>
                            {change?.changes?.find(c => c.field === 'quantity') &&
                              renderFieldChange(change.changes.find(c => c.field === 'quantity')!)}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 text-right">
                        {mode === 'edit' && !isRemoved ? (
                          <Input
                            type="number"
                            value={item.unit_price / 100}
                            onChange={(e) =>
                              onItemUpdate?.(item.id!, {
                                unit_price: Math.round(parseFloat(e.target.value) * 100) || 0
                              })
                            }
                            className="text-right h-8 text-sm"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-sm">
                            <span className={isRemoved ? 'line-through' : ''}>
                              {formatCurrency(item.unit_price)}
                            </span>
                            {change?.changes?.find(c => c.field === 'unit_price') &&
                              renderFieldChange(change.changes.find(c => c.field === 'unit_price')!)}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 text-right font-semibold text-sm">
                        <span className={isRemoved ? 'line-through' : ''}>
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>

                      {mode === 'edit' && (
                        <div className="col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onItemRemove?.(item.id!)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      {mode === 'edit' && !isRemoved ? (
                        <>
                          <Input
                            value={item.title || ''}
                            onChange={(e) =>
                              onItemUpdate?.(item.id!, { title: e.target.value })
                            }
                            placeholder="Item title"
                            className="font-medium text-sm"
                          />
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              onItemUpdate?.(item.id!, { description: e.target.value })
                            }
                            placeholder="Description"
                            className="text-xs resize-none"
                            rows={2}
                          />
                        </>
                      ) : (
                        <div className={isRemoved ? 'line-through' : ''}>
                          <p className="font-medium text-sm">{item.title || item.description}</p>
                          {item.title && item.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Quantity</p>
                          {mode === 'edit' && !isRemoved ? (
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                onItemUpdate?.(item.id!, { quantity: parseInt(e.target.value) || 0 })
                              }
                              min="0"
                              className="h-8 text-sm"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className={isRemoved ? 'line-through' : ''}>{item.quantity}</span>
                              {change?.changes?.find(c => c.field === 'quantity') &&
                                renderFieldChange(change.changes.find(c => c.field === 'quantity')!)}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Unit Price</p>
                          {mode === 'edit' && !isRemoved ? (
                            <Input
                              type="number"
                              value={item.unit_price / 100}
                              onChange={(e) =>
                                onItemUpdate?.(item.id!, {
                                  unit_price: Math.round(parseFloat(e.target.value) * 100) || 0
                                })
                              }
                              min="0"
                              step="0.01"
                              className="h-8 text-sm"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className={isRemoved ? 'line-through' : ''}>
                                {formatCurrency(item.unit_price)}
                              </span>
                              {change?.changes?.find(c => c.field === 'unit_price') &&
                                renderFieldChange(change.changes.find(c => c.field === 'unit_price')!)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs font-medium">Total</span>
                        <span className={`font-bold text-sm ${isRemoved ? 'line-through' : ''}`}>
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>

                      {mode === 'edit' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onItemRemove?.(item.id!)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Item
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add Item Button (Edit Mode) */}
      {mode === 'edit' && onItemAdd && (
        <Button
          variant="outline"
          onClick={onItemAdd}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>
      )}

      {/* Totals */}
      {(subtotal !== undefined || totalAmount !== undefined) && (
        <div className="space-y-2 pt-4 border-t">
          {subtotal !== undefined && (
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
          )}
          
          {taxAmount !== undefined && taxAmount > 0 && (
            <div className="flex justify-between text-base text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          
          {totalAmount !== undefined && (
            <>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modification Indicator */}
      {isModified && mode === 'edit' && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            ⚠️ You have unsaved changes. Make sure to save before leaving.
          </p>
        </div>
      )}
    </div>
  );
}
