import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  Percent, 
  DollarSign, 
  Trash2, 
  Copy, 
  Edit3,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface BulkLineItemOperationsProps {
  lineItems: LineItem[];
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onUpdateItems: (items: LineItem[]) => void;
  onDeleteItems: (itemIds: string[]) => void;
}

export function BulkLineItemOperations({
  lineItems,
  selectedItems,
  onSelectionChange,
  onUpdateItems,
  onDeleteItems
}: BulkLineItemOperationsProps) {
  const [bulkOperation, setBulkOperation] = useState<'discount' | 'markup' | 'quantity' | 'category'>('discount');
  const [operationValue, setOperationValue] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const { toast } = useToast();

  const selectedItemsList = lineItems.filter(item => selectedItems.has(item.id || ''));
  const hasSelection = selectedItems.size > 0;
  const totalSelectedValue = selectedItemsList.reduce((sum, item) => sum + item.total_price, 0);

  const handleSelectAll = () => {
    if (selectedItems.size === lineItems.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(lineItems.map(item => item.id || '')));
    }
  };

  const handleItemSelectionToggle = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    onSelectionChange(newSelection);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const applyBulkOperation = () => {
    if (!hasSelection || !operationValue) {
      toast({
        title: "Invalid Operation",
        description: "Please select items and enter a value",
        variant: "destructive"
      });
      return;
    }

    const updatedItems = lineItems.map(item => {
      if (!selectedItems.has(item.id || '')) return item;

      let updatedItem = { ...item };
      const value = parseFloat(operationValue);

      switch (bulkOperation) {
        case 'discount':
          const discountMultiplier = Math.max(0, 1 - (value / 100));
          updatedItem.unit_price = Math.round(item.unit_price * discountMultiplier);
          updatedItem.total_price = updatedItem.unit_price * updatedItem.quantity;
          break;

        case 'markup':
          const markupMultiplier = 1 + (value / 100);
          updatedItem.unit_price = Math.round(item.unit_price * markupMultiplier);
          updatedItem.total_price = updatedItem.unit_price * updatedItem.quantity;
          break;

        case 'quantity':
          updatedItem.quantity = Math.max(1, value);
          updatedItem.total_price = updatedItem.unit_price * updatedItem.quantity;
          break;

        case 'category':
          updatedItem.category = newCategory || item.category;
          break;
      }

      return updatedItem;
    });

    onUpdateItems(updatedItems);
    onSelectionChange(new Set());
    setOperationValue('');
    setNewCategory('');

    toast({
      title: "Bulk Operation Applied",
      description: `Updated ${selectedItems.size} items`,
    });
  };

  const handleBulkDelete = () => {
    if (!hasSelection) return;

    const itemIds = Array.from(selectedItems);
    onDeleteItems(itemIds);
    onSelectionChange(new Set());

    toast({
      title: "Items Deleted",
      description: `Removed ${itemIds.length} items`,
    });
  };

  const duplicateSelectedItems = () => {
    if (!hasSelection) return;

    const itemsToDuplicate = selectedItemsList.map(item => ({
      ...item,
      id: undefined, // Remove ID to create new items
      title: `${item.title} (Copy)`,
    }));

    onUpdateItems([...lineItems, ...itemsToDuplicate]);
    onSelectionChange(new Set());

    toast({
      title: "Items Duplicated",
      description: `Created ${itemsToDuplicate.length} duplicate items`,
    });
  };

  const detectZeroPriceItems = () => {
    return lineItems.filter(item => item.unit_price === 0 || item.total_price === 0);
  };

  const fixZeroPriceItems = () => {
    const zeroPriceItems = detectZeroPriceItems();
    if (zeroPriceItems.length === 0) {
      toast({
        title: "No Issues Found",
        description: "All items have valid pricing",
      });
      return;
    }

    // Select zero-price items for review
    const zeroPriceIds = new Set(zeroPriceItems.map(item => item.id || ''));
    onSelectionChange(zeroPriceIds);

    toast({
      title: "Zero-Price Items Found",
      description: `Found ${zeroPriceItems.length} items with zero pricing. Please review and update.`,
      variant: "destructive"
    });
  };

  const categories = [...new Set(lineItems.map(item => item.category))];
  const zeroPriceCount = detectZeroPriceItems().length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bulk Operations
          </div>
          {zeroPriceCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={fixZeroPriceItems}
              className="text-orange-600 border-orange-300"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Fix {zeroPriceCount} Zero-Price Items
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="gap-2"
            >
              {selectedItems.size === lineItems.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedItems.size === lineItems.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedItems.size} of {lineItems.length} items selected
            </span>
          </div>
          {hasSelection && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Total: {formatCurrency(totalSelectedValue)}
              </Badge>
            </div>
          )}
        </div>

        {/* Item Selection List */}
        <div className="max-h-48 overflow-y-auto border rounded-lg">
          {lineItems.map((item, index) => (
            <div
              key={item.id || index}
              className={`flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                selectedItems.has(item.id || '') ? 'bg-primary/5' : ''
              }`}
              onClick={() => handleItemSelectionToggle(item.id || '')}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.has(item.id || '')}
                  onChange={() => {}} // Handled by parent onClick
                />
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} • Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatCurrency(item.total_price)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.unit_price)} each
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasSelection && (
          <>
            {/* Bulk Operation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div>
                <Label>Operation Type</Label>
                <Select value={bulkOperation} onValueChange={(value: any) => setBulkOperation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Apply Discount %
                      </div>
                    </SelectItem>
                    <SelectItem value="markup">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Apply Markup %
                      </div>
                    </SelectItem>
                    <SelectItem value="quantity">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Set Quantity
                      </div>
                    </SelectItem>
                    <SelectItem value="category">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        Change Category
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  {bulkOperation === 'category' ? 'New Category' : 'Value'}
                </Label>
                {bulkOperation === 'category' ? (
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    placeholder={bulkOperation === 'quantity' ? '1' : '10'}
                    value={operationValue}
                    onChange={(e) => setOperationValue(e.target.value)}
                  />
                )}
              </div>

              <div className="flex items-end">
                <Button onClick={applyBulkOperation} className="w-full">
                  Apply to {selectedItems.size} Items
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={duplicateSelectedItems} size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Selected
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete} 
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}