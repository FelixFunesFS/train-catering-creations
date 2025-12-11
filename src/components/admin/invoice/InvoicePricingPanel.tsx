import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, DollarSign, Percent, Save, Plus, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaxCalculationService } from '@/services/TaxCalculationService';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_override?: boolean;
}

interface InvoicePricingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lineItems: LineItem[];
  onUpdateLineItems: (items: LineItem[]) => void;
  onSave: (overrides: any) => Promise<void>;
  loading?: boolean;
  isGovernmentContract?: boolean;
}

export function InvoicePricingPanel({
  isOpen,
  onClose,
  lineItems: initialItems,
  onUpdateLineItems,
  onSave,
  loading = false,
  isGovernmentContract = false
}: InvoicePricingPanelProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [customDiscount, setCustomDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [hospitalityTaxRate, setHospitalityTaxRate] = useState(2.0); // 2%
  const [serviceTaxRate, setServiceTaxRate] = useState(7.0); // 7%
  const [overrideReason, setOverrideReason] = useState('');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    setLineItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    onUpdateLineItems(lineItems);
    
    // Check if approval is required
    const hasOverrides = lineItems.some(item => item.is_override);
    const totalAmount = calculateTotal();
    setApprovalRequired(hasOverrides || totalAmount > 500000); // $5000+
  }, [lineItems, customDiscount, onUpdateLineItems]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return discountType === 'percentage' 
      ? Math.round(subtotal * (customDiscount / 100))
      : customDiscount * 100;
  };

  const calculateTaxBreakdown = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const taxableAmount = subtotal - discount;
    
    if (isGovernmentContract) {
      return { hospitalityTax: 0, serviceTax: 0, totalTax: 0 };
    }
    
    const hospitalityTax = Math.round(taxableAmount * (hospitalityTaxRate / 100));
    const serviceTax = Math.round(taxableAmount * (serviceTaxRate / 100));
    return { hospitalityTax, serviceTax, totalTax: hospitalityTax + serviceTax };
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const { totalTax } = calculateTaxBreakdown();
    return subtotal - discount + totalTax;
  };

  const handleEditItem = (itemId: string, field: string, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id === itemId || lineItems.indexOf(item).toString() === itemId) {
        const updatedItem = { ...item, [field]: value, is_override: true };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAddCustomItem = () => {
    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      title: 'Custom Item',
      description: 'Custom item description',
      category: 'custom',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      is_override: true
    };
    setLineItems([...lineItems, newItem]);
    setEditingItem(newItem.id!);
  };

  const handleRemoveItem = (itemId: string) => {
    setLineItems(items => items.filter((item, index) => 
      item.id !== itemId && index.toString() !== itemId
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const handleSave = async () => {
    if (lineItems.some(item => item.is_override) && !overrideReason.trim()) {
      toast({
        title: "Override Reason Required",
        description: "Please provide a reason for manual overrides.",
        variant: "destructive"
      });
      return;
    }

    if (approvalRequired && !overrideReason.includes('APPROVED:')) {
      toast({
        title: "Approval Required",
        description: "This invoice requires approval. Add 'APPROVED: [reason]' to your override reason.",
        variant: "destructive"
      });
      return;
    }

    const { hospitalityTax, serviceTax, totalTax } = calculateTaxBreakdown();

    const overrides = {
      line_items: lineItems,
      discount: customDiscount > 0 ? { 
        type: discountType, 
        amount: discountType === 'percentage' ? customDiscount : customDiscount * 100
      } : null,
      override_reason: overrideReason,
      totals: {
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        hospitality_tax: hospitalityTax,
        service_tax: serviceTax,
        tax: totalTax,
        total: calculateTotal()
      },
      tax_rates: {
        hospitality: hospitalityTaxRate,
        service: serviceTaxRate,
        total: hospitalityTaxRate + serviceTaxRate
      }
    };

    await onSave(overrides);
  };

  const { hospitalityTax, serviceTax, totalTax } = calculateTaxBreakdown();
  const totalTaxRate = hospitalityTaxRate + serviceTaxRate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Invoice Pricing & Line Items
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Line Items Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button onClick={handleAddCustomItem} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Add Custom Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id || index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.is_override ? "destructive" : "secondary"}>
                          {item.category}
                        </Badge>
                        {item.is_override && <Badge variant="outline">Modified</Badge>}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.id || index.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {editingItem === (item.id || index.toString()) ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => handleEditItem(item.id || index.toString(), 'title', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleEditItem(item.id || index.toString(), 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Unit Price ($)</Label>
                          <Input
                            type="text"
                            value={editingValues[`${item.id || index}-unit_price`] !== undefined 
                              ? editingValues[`${item.id || index}-unit_price`] 
                              : (item.unit_price / 100).toFixed(2)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              setEditingValues(prev => ({ ...prev, [`${item.id || index}-unit_price`]: value }));
                            }}
                            onFocus={() => {
                              setEditingValues(prev => ({ ...prev, [`${item.id || index}-unit_price`]: (item.unit_price / 100).toFixed(2) }));
                            }}
                            onBlur={() => {
                              const value = editingValues[`${item.id || index}-unit_price`];
                              if (value !== undefined) {
                                const numValue = parseFloat(value || '0');
                                if (!isNaN(numValue)) {
                                  handleEditItem(item.id || index.toString(), 'unit_price', Math.round(numValue * 100));
                                }
                                setEditingValues(prev => {
                                  const newState = { ...prev };
                                  delete newState[`${item.id || index}-unit_price`];
                                  return newState;
                                });
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            size="sm"
                            onClick={() => setEditingItem(null)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="md:col-span-4">
                          <Label>Description</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) => handleEditItem(item.id || index.toString(), 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-2">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-sm">Qty: {item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm">{formatCurrency(item.unit_price)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{formatCurrency(item.total_price)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingItem(item.id || index.toString())}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Discount & Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Discount Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Discount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Discount Type</Label>
                    <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount {discountType === 'percentage' ? '(%)' : '($)'}</Label>
                    <Input
                      type="number"
                      step={discountType === 'percentage' ? '1' : '0.01'}
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Invoice Totals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                {customDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(calculateDiscount())}</span>
                  </div>
                )}
                
                {/* Tax Breakdown */}
                {!isGovernmentContract ? (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Hospitality Tax:</span>
                        <Input
                          type="number"
                          value={hospitalityTaxRate}
                          onChange={(e) => setHospitalityTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-16 h-6 text-xs"
                          step="0.1"
                          min="0"
                          max="10"
                        />
                        <span className="text-xs">%</span>
                      </div>
                      <span>{formatCurrency(hospitalityTax)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Service Tax:</span>
                        <Input
                          type="number"
                          value={serviceTaxRate}
                          onChange={(e) => setServiceTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-16 h-6 text-xs"
                          step="0.1"
                          min="0"
                          max="15"
                        />
                        <span className="text-xs">%</span>
                      </div>
                      <span>{formatCurrency(serviceTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total Tax ({totalTaxRate.toFixed(1)}%):</span>
                      <span>{formatCurrency(totalTax)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax (Exempt - Government):</span>
                    <span>$0.00</span>
                  </div>
                )}
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Override Reason */}
          <Card>
            <CardHeader>
              <CardTitle>Override Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Explain any pricing changes or customizations made to this invoice..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={3}
              />
              {approvalRequired && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This invoice requires approval due to significant changes. 
                    Add "APPROVED: [reason]" to your override reason to proceed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Pricing'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
