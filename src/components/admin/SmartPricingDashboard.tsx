import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Edit3, Save, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { generateProfessionalLineItems } from '@/utils/invoiceFormatters';
import { useToast } from '@/hooks/use-toast';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  is_auto_generated?: boolean;
  override_reason?: string;
}

interface SmartPricingDashboardProps {
  quoteRequest: any;
  onPricingComplete: (lineItems: LineItem[], totals: any) => void;
  onBack: () => void;
}

export function SmartPricingDashboard({ 
  quoteRequest, 
  onPricingComplete, 
  onBack 
}: SmartPricingDashboardProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [originalLineItems, setOriginalLineItems] = useState<LineItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [hasOverrides, setHasOverrides] = useState(false);
  const [isGovernmentContract, setIsGovernmentContract] = useState(false);
  const [taxRate, setTaxRate] = useState(8.5); // Default Charleston SC tax rate
  const { toast } = useToast();

  useEffect(() => {
    generateInitialLineItems();
  }, [quoteRequest]);

  const generateInitialLineItems = () => {
    try {
      const generated = generateProfessionalLineItems(quoteRequest);
      const processedItems = generated.map((item, index) => ({
        ...item,
        id: item.id || `item-${index}`,
        is_auto_generated: true,
        unit_price: item.unit_price || 0,
        total_price: (item.quantity || 1) * (item.unit_price || 0),
        category: item.category || 'other'
      }));
      
      setLineItems(processedItems);
      setOriginalLineItems([...processedItems]);
    } catch (error) {
      console.error('Error generating line items:', error);
      toast({
        title: "Error",
        description: "Failed to generate line items automatically",
        variant: "destructive"
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = isGovernmentContract ? 0 : (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    const perPerson = quoteRequest.guest_count > 0 ? total / quoteRequest.guest_count : 0;

    return {
      subtotal,
      taxAmount,
      total,
      perPerson
    };
  };

  const handleEditItem = (itemId: string) => {
    const item = lineItems.find(i => i.id === itemId);
    if (item) {
      setEditingItem(itemId);
      setEditValues({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price / 100, // Convert to dollars for display
        override_reason: item.override_reason || ''
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const updatedItems = lineItems.map(item => {
      if (item.id === editingItem) {
        const unitPriceCents = Math.round(parseFloat(editValues.unit_price || '0') * 100);
        const totalPrice = item.quantity * unitPriceCents;
        
        return {
          ...item,
          title: editValues.title,
          description: editValues.description,
          quantity: parseInt(editValues.quantity || '1'),
          unit_price: unitPriceCents,
          total_price: totalPrice,
          is_auto_generated: false,
          override_reason: editValues.override_reason || undefined
        };
      }
      return item;
    });

    setLineItems(updatedItems);
    setEditingItem(null);
    setEditValues({});
    setHasOverrides(true);

    toast({
      title: "Item Updated",
      description: "Line item has been successfully updated",
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const resetToOriginal = () => {
    setLineItems([...originalLineItems]);
    setHasOverrides(false);
    setEditingItem(null);
    setEditValues({});
    
    toast({
      title: "Reset Complete",
      description: "Pricing has been reset to auto-generated values",
    });
  };

  const applyBulkDiscount = (percentage: number) => {
    const updatedItems = lineItems.map(item => ({
      ...item,
      unit_price: Math.round(item.unit_price * (1 - percentage / 100)),
      total_price: Math.round(item.total_price * (1 - percentage / 100)),
      is_auto_generated: false,
      override_reason: `${percentage}% bulk discount applied`
    }));

    setLineItems(updatedItems);
    setHasOverrides(true);

    toast({
      title: "Bulk Discount Applied",
      description: `${percentage}% discount applied to all items`,
    });
  };

  const handleComplete = () => {
    const totals = calculateTotals();
    onPricingComplete(lineItems, totals);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'entree': 'bg-blue-100 text-blue-800',
      'appetizer': 'bg-green-100 text-green-800',
      'dessert': 'bg-purple-100 text-purple-800',
      'service': 'bg-orange-100 text-orange-800',
      'rental': 'bg-gray-100 text-gray-800',
      'other': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors['other'];
  };

  const totals = calculateTotals();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Pricing Dashboard</h1>
          <p className="text-muted-foreground">Auto-grouped line items with manual override capability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to Requests
          </Button>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
            Complete Pricing
          </Button>
        </div>
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {quoteRequest.event_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Guest Count:</span>
              <p className="font-medium">{quoteRequest.guest_count}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Event Date:</span>
              <p className="font-medium">{new Date(quoteRequest.event_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Service Type:</span>
              <p className="font-medium">{quoteRequest.service_type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Contact:</span>
              <p className="font-medium">{quoteRequest.contact_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Auto-Generated Line Items</CardTitle>
                <div className="flex items-center gap-2">
                  {hasOverrides && (
                    <Badge variant="outline" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Manual Overrides
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={resetToOriginal}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  {editingItem === item.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={editValues.title || ''}
                            onChange={(e) => setEditValues({...editValues, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={editValues.quantity || ''}
                            onChange={(e) => setEditValues({...editValues, quantity: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={editValues.description || ''}
                          onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unit_price">Unit Price ($)</Label>
                          <Input
                            id="unit_price"
                            type="number"
                            step="0.01"
                            value={editValues.unit_price || ''}
                            onChange={(e) => setEditValues({...editValues, unit_price: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="override_reason">Override Reason</Label>
                          <Input
                            id="override_reason"
                            value={editValues.override_reason || ''}
                            onChange={(e) => setEditValues({...editValues, override_reason: e.target.value})}
                            placeholder="Why was this changed?"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge variant="secondary" className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                            {!item.is_auto_generated && (
                              <Badge variant="outline">Modified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          {item.override_reason && (
                            <p className="text-xs text-amber-600 mt-1">
                              Override: {item.override_reason}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleEditItem(item.id)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Qty: {item.quantity} × {formatCurrency(item.unit_price / 100)}</span>
                        <span className="font-medium">{formatCurrency(item.total_price / 100)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Summary & Controls */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyBulkDiscount(5)}
                >
                  5% Discount
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyBulkDiscount(10)}
                >
                  10% Discount
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyBulkDiscount(15)}
                >
                  15% Discount
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyBulkDiscount(20)}
                >
                  20% Discount
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="gov-contract">Government Contract</Label>
                <Switch
                  id="gov-contract"
                  checked={isGovernmentContract}
                  onCheckedChange={setIsGovernmentContract}
                />
              </div>
              
              {!isGovernmentContract && (
                <div>
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal / 100)}</span>
              </div>
              
              {!isGovernmentContract && (
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>{formatCurrency(totals.taxAmount / 100)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span>{formatCurrency(totals.total / 100)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Per Person:</span>
                <span>{formatCurrency(totals.perPerson / 100)}</span>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}