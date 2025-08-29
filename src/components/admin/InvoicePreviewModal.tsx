import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LineItem {
  id?: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_override?: boolean;
}

interface InvoiceData {
  id?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  line_items: LineItem[];
  manual_overrides?: any;
  override_reason?: string;
}

interface InvoicePreviewModalProps {
  quote: any;
  invoiceData?: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (overrides: any) => Promise<void>;
  onSend?: (invoiceId: string) => Promise<void>;
}

export function InvoicePreviewModal({
  quote,
  invoiceData,
  isOpen,
  onClose,
  onGenerate,
  onSend
}: InvoicePreviewModalProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [customDiscount, setCustomDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [overrideReason, setOverrideReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (invoiceData?.line_items) {
      setLineItems(invoiceData.line_items);
      setOverrideReason(invoiceData.override_reason || '');
    }
  }, [invoiceData]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return discountType === 'percentage' 
      ? Math.round(subtotal * (customDiscount / 100))
      : customDiscount * 100; // Convert to cents
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.round((subtotal - discount) * 0.08); // 8% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
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
      description: 'Custom Item',
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

  const handleGenerateInvoice = async () => {
    if (lineItems.some(item => item.is_override) && !overrideReason.trim()) {
      toast({
        title: "Override Reason Required",
        description: "Please provide a reason for manual overrides.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const overrides = {
        line_items: lineItems.filter(item => item.is_override),
        discount: customDiscount > 0 ? { type: discountType, amount: customDiscount } : null,
        override_reason: overrideReason,
        manual_totals: {
          subtotal: calculateSubtotal(),
          tax_amount: calculateTax(),
          total_amount: calculateTotal()
        }
      };

      await onGenerate(overrides);
      toast({
        title: "Invoice Generated",
        description: "Invoice has been created with your overrides."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice with overrides.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Invoice Preview & Edit</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Review and modify invoice details before generating
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {quote.contact_name}</div>
                  <div><strong>Email:</strong> {quote.email}</div>
                  <div><strong>Phone:</strong> {quote.phone}</div>
                  <div><strong>Event:</strong> {quote.event_name}</div>
                  <div><strong>Date:</strong> {new Date(quote.event_date).toLocaleDateString()}</div>
                  <div><strong>Guests:</strong> {quote.guest_count}</div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Invoice Line Items</CardTitle>
                <Button onClick={handleAddCustomItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lineItems.map((item, index) => {
                    const itemId = item.id || index.toString();
                    const isEditing = editingItem === itemId;
                    
                    return (
                      <div key={itemId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            {isEditing ? (
                              <div className="grid grid-cols-4 gap-3">
                                <div>
                                  <Label>Description</Label>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => handleEditItem(itemId, 'description', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Quantity</Label>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleEditItem(itemId, 'quantity', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label>Unit Price</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.unit_price / 100}
                                    onChange={(e) => handleEditItem(itemId, 'unit_price', Math.round(parseFloat(e.target.value) * 100) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label>Total</Label>
                                  <div className="pt-2 font-medium">
                                    {formatCurrency(item.total_price)}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-3 items-center">
                                <div>
                                  <div className="font-medium">{item.description}</div>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.category}
                                  </Badge>
                                  {item.is_override && (
                                    <Badge variant="outline" className="text-xs ml-1">
                                      Modified
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-center">{item.quantity}</div>
                                <div className="text-center">{formatCurrency(item.unit_price)}</div>
                                <div className="text-center font-medium">{formatCurrency(item.total_price)}</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingItem(null)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingItem(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingItem(itemId)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveItem(itemId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Discount & Totals */}
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Discount</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={discountType === 'percentage' ? 'default' : 'outline'}
                      onClick={() => setDiscountType('percentage')}
                    >
                      Percentage
                    </Button>
                    <Button
                      size="sm"
                      variant={discountType === 'fixed' ? 'default' : 'outline'}
                      onClick={() => setDiscountType('fixed')}
                    >
                      Fixed Amount
                    </Button>
                  </div>
                  <div>
                    <Label>
                      {discountType === 'percentage' ? 'Discount (%)' : 'Discount ($)'}
                    </Label>
                    <Input
                      type="number"
                      step={discountType === 'percentage' ? '1' : '0.01'}
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Totals</CardTitle>
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
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>{formatCurrency(calculateTax())}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Override Reason */}
            {lineItems.some(item => item.is_override) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Override Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Please explain why manual overrides were made..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateInvoice}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Invoice'}
            </Button>
            {invoiceData?.id && onSend && (
              <Button
                variant="default"
                onClick={() => onSend(invoiceData.id!)}
                disabled={loading}
              >
                Send Invoice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}