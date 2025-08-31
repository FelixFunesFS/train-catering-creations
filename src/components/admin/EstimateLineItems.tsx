import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  Save,
  Building2
} from 'lucide-react';
import { type LineItem } from '@/utils/invoiceFormatters';

interface EstimateLineItemsProps {
  estimate: any;
  isGovernmentContract: boolean;
  onEstimateChange: (updatedEstimate: any) => void;
  onGovernmentToggle: (checked: boolean) => void;
  invoiceId?: string;
}

export function EstimateLineItems({ 
  estimate, 
  isGovernmentContract, 
  onEstimateChange, 
  onGovernmentToggle,
  invoiceId 
}: EstimateLineItemsProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(8.0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calculate totals when line items or tax rate changes
  useEffect(() => {
    if (!estimate) return;
    
    const subtotal = estimate.line_items.reduce((sum: number, item: LineItem) => sum + item.total_price, 0);
    const tax_amount = Math.round(subtotal * (taxRate / 100));
    const total_amount = subtotal + tax_amount;
    const deposit_required = isGovernmentContract ? 0 : Math.round(total_amount * 0.25);

    const updatedEstimate = {
      ...estimate,
      subtotal,
      tax_amount,
      total_amount,
      deposit_required,
      is_government_contract: isGovernmentContract
    };

    onEstimateChange(updatedEstimate);
  }, [estimate?.line_items, taxRate, isGovernmentContract]);

  const updateLineItem = (itemId: string, updates: Partial<LineItem>) => {
    if (!estimate) return;

    const updatedItems = estimate.line_items.map((item: LineItem) => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if (updates.quantity !== undefined || updates.unit_price !== undefined) {
          updated.total_price = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    });

    onEstimateChange({
      ...estimate,
      line_items: updatedItems
    });
  };

  const addLineItem = () => {
    if (!estimate) return;

    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      title: 'Custom Item',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'other'
    };

    const updatedItems = [...estimate.line_items, newItem];
    onEstimateChange({
      ...estimate,
      line_items: updatedItems
    });
    setEditingItem(newItem.id);
  };

  const removeLineItem = (itemId: string) => {
    if (!estimate) return;

    const updatedItems = estimate.line_items.filter((item: LineItem) => item.id !== itemId);
    onEstimateChange({
      ...estimate,
      line_items: updatedItems
    });
  };

  const quickCalculatePerPerson = () => {
    if (!estimate?.event_details?.guest_count) {
      toast({
        title: "Guest Count Required",
        description: "Please ensure guest count is set in the event details",
        variant: "destructive"
      });
      return;
    }

    const perPersonAmount = 3500; // $35.00 default
    const servicePercentage = 0.15; // 15% service fee
    
    const foodTotal = estimate.event_details.guest_count * perPersonAmount;
    const serviceTotal = Math.round(foodTotal * servicePercentage);
    
    const newItems = [
      {
        id: `item_${Date.now()}_1`,
        title: 'Per-Person Catering',
        description: 'Complete catering service per guest',
        quantity: estimate.event_details.guest_count,
        unit_price: perPersonAmount,
        total_price: foodTotal,
        category: 'food' as const
      },
      {
        id: `item_${Date.now()}_2`,
        title: 'Service Fee',
        description: 'Professional service and coordination',
        quantity: 1,
        unit_price: serviceTotal,
        total_price: serviceTotal,
        category: 'service' as const
      }
    ];

    onEstimateChange({
      ...estimate,
      line_items: newItems
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'service': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'equipment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryBadge = (category: string) => {
    const colorClass = getCategoryColor(category);
    return (
      <Badge className={colorClass} variant="outline">
        {category}
      </Badge>
    );
  };

  // Quick templates for common line items
  const getCommonLineItems = () => [
    { title: 'Service Fee', category: 'service' as const, description: 'Professional service and setup', unitPrice: 5000 },
    { title: 'Equipment Rental', category: 'equipment' as const, description: 'Tables, chairs, linens, etc.', unitPrice: 10000 },
    { title: 'Wait Staff', category: 'service' as const, description: 'Professional wait staff service', unitPrice: 15000 },
    { title: 'Delivery Fee', category: 'service' as const, description: 'Delivery and setup', unitPrice: 7500 },
    { title: 'Cleanup Service', category: 'service' as const, description: 'Post-event cleanup', unitPrice: 5000 }
  ];

  const addTemplateItem = (template: { title: string; category: 'food' | 'service' | 'equipment' | 'other'; description: string; unitPrice: number }) => {
    if (!estimate) return;

    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      title: template.title,
      description: template.description,
      quantity: 1,
      unit_price: template.unitPrice,
      total_price: template.unitPrice,
      category: template.category
    };

    const updatedItems = [...estimate.line_items, newItem];
    onEstimateChange({
      ...estimate,
      line_items: updatedItems
    });
  };

  if (!estimate) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Invoice Line Items & Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Government Contract Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <Label htmlFor="government-contract" className="font-medium">
              Government Contract
            </Label>
          </div>
          <Switch
            id="government-contract"
            checked={isGovernmentContract}
            onCheckedChange={onGovernmentToggle}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Actions</Label>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={quickCalculatePerPerson}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Quick Per-Person ({estimate.event_details?.guest_count || 0} guests)
            </Button>
            
            {getCommonLineItems().map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addTemplateItem(template)}
              >
                + {template.title}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Line Items</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={addLineItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Custom Item
            </Button>
          </div>

          {estimate.line_items.map((item: LineItem) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 p-4 border rounded-lg">
              <div className="col-span-4 space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateLineItem(item.id, { title: e.target.value })}
                  placeholder="Item title"
                  onFocus={() => setEditingItem(item.id)}
                  onBlur={() => setEditingItem(null)}
                />
                {getCategoryBadge(item.category)}
              </div>
              
              <div className="col-span-3 space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                  className="min-h-[38px] resize-none"
                  rows={1}
                />
              </div>
              
              <div className="col-span-1 space-y-2">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label className="text-xs">Unit Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={(item.unit_price / 100).toFixed(2)}
                    onChange={(e) => updateLineItem(item.id, { unit_price: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="pl-7"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="col-span-1 space-y-2">
                <Label className="text-xs">Total</Label>
                <div className="pt-2 text-sm font-medium">
                  ${(item.total_price / 100).toFixed(2)}
                </div>
              </div>
              
              <div className="col-span-1 flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Tax and Totals */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Subtotal:</span>
            <span className="font-medium">${(estimate.subtotal / 100).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Tax Rate:</span>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-20 h-7 text-sm"
                step="0.1"
                min="0"
                max="20"
              />
              <span className="text-sm">%</span>
            </div>
            <span className="font-medium">${(estimate.tax_amount / 100).toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-green-600">${(estimate.total_amount / 100).toFixed(2)}</span>
          </div>

          {!isGovernmentContract && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Deposit Required (25%):</span>
              <span>${(estimate.deposit_required / 100).toFixed(2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}