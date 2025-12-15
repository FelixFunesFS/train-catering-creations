import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ShoppingCart, Plus, Printer, RefreshCw, 
  CheckCircle2, Circle, Loader2 
} from 'lucide-react';
import { 
  generateShoppingList, 
  groupShoppingItemsByCategory,
  categoryLabels,
  categoryIcons,
  ShoppingItem,
  QuoteForShopping
} from '@/utils/shoppingListGenerator';

interface ShoppingListPanelProps {
  quote: QuoteForShopping;
  compact?: boolean;
}

export function ShoppingListPanel({ quote, compact = false }: ShoppingListPanelProps) {
  const [items, setItems] = useState<ShoppingItem[]>(() => generateShoppingList(quote));
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'other' as ShoppingItem['category'],
    quantity: '',
    unit: '',
  });

  const checkedCount = items.filter(i => i.checked).length;
  const progressPercent = items.length > 0 ? (checkedCount / items.length) * 100 : 0;
  
  const groupedItems = useMemo(() => groupShoppingItemsByCategory(items), [items]);

  const handleToggleItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleRegenerate = () => {
    const newItems = generateShoppingList(quote);
    // Keep manually added items and their checked state
    const manualItems = items.filter(i => i.source === 'manual');
    setItems([...newItems, ...manualItems]);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    
    const item: ShoppingItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: newItem.quantity || '1',
      unit: newItem.unit || 'each',
      source: 'manual',
      checked: false,
    };
    
    setItems([...items, item]);
    setNewItem({ name: '', category: 'other', quantity: '', unit: '' });
    setShowAddItem(false);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handlePrint = () => {
    const printContent = Object.entries(groupedItems)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => {
        const categoryLabel = categoryLabels[category as ShoppingItem['category']];
        const itemsList = items
          .map(i => `${i.checked ? '☑' : '☐'} ${i.quantity} ${i.unit} - ${i.name}`)
          .join('\\n');
        return `\n${categoryLabel}\n${'─'.repeat(30)}\n${itemsList}`;
      })
      .join('\n');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shopping List - ${quote.guest_count} Guests</title>
            <style>
              body { font-family: monospace; padding: 20px; white-space: pre-wrap; }
              h1 { font-size: 18px; }
            </style>
          </head>
          <body>
            <h1>Shopping List - ${quote.guest_count} Guests</h1>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Compact view
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{items.length} items</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {checkedCount}/{items.length} checked
          </span>
        </div>
        {items.length > 0 && (
          <Progress value={progressPercent} className="h-1.5" />
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Shopping List
          <Badge variant="secondary" className="text-xs">
            {quote.guest_count} guests
          </Badge>
        </h4>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRegenerate} title="Regenerate list">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrint} title="Print list">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{checkedCount} of {items.length} items</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {/* Grouped items */}
      <div className="space-y-4">
        {Object.entries(groupedItems)
          .filter(([_, categoryItems]) => categoryItems.length > 0)
          .map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              <h5 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <span>{categoryIcons[category as ShoppingItem['category']]}</span>
                {categoryLabels[category as ShoppingItem['category']]}
                <Badge variant="outline" className="text-[10px]">
                  {categoryItems.length}
                </Badge>
              </h5>
              
              <div className="space-y-1">
                {categoryItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      item.checked ? 'bg-muted/30 opacity-60' : 'bg-card hover:bg-muted/10'
                    }`}
                  >
                    <button onClick={() => handleToggleItem(item.id)} className="shrink-0">
                      {item.checked ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${item.checked ? 'line-through' : ''}`}>
                        <span className="font-medium">{item.quantity} {item.unit}</span>
                        {' — '}
                        {item.name}
                      </span>
                    </div>
                    
                    {item.source === 'manual' && (
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Add item form */}
      {showAddItem ? (
        <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="text-sm"
            />
            <Select
              value={newItem.category}
              onValueChange={(value) => setNewItem({ ...newItem, category: value as ShoppingItem['category'] })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {categoryIcons[key as ShoppingItem['category']]} {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="text-sm"
            />
            <Input
              placeholder="Unit (lbs, each, cups)"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddItem}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddItem(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setShowAddItem(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Item
        </Button>
      )}
    </div>
  );
}
