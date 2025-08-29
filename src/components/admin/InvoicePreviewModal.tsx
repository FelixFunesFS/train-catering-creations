import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Edit3, Save, X, AlertTriangle, RefreshCw, Copy, Percent, DollarSign, FileText, History, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LineItem {
  id?: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_override?: boolean;
  original_price?: number;
  change_reason?: string;
}

interface InvoiceData {
  id?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  line_items: LineItem[];
  manual_overrides?: any;
  override_reason?: string;
  is_draft?: boolean;
  draft_data?: any;
  last_quote_sync?: string;
}

interface InvoiceTemplate {
  name: string;
  service_type: string;
  default_items: LineItem[];
  default_discount: number;
}

interface InvoicePreviewModalProps {
  quote: any;
  invoiceData?: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (overrides: any) => Promise<void>;
  onSend?: (invoiceId: string) => Promise<void>;
  mode?: 'preview' | 'edit' | 'template';
}

export function InvoicePreviewModal({
  quote,
  invoiceData,
  isOpen,
  onClose,
  onGenerate,
  onSend,
  mode = 'preview'
}: InvoicePreviewModalProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [originalItems, setOriginalItems] = useState<LineItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [customDiscount, setCustomDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [overrideReason, setOverrideReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [quoteHasChanged, setQuoteHasChanged] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (invoiceData?.line_items) {
      setLineItems(invoiceData.line_items);
      setOriginalItems([...invoiceData.line_items]);
      setOverrideReason(invoiceData.override_reason || '');
      
      // Check if quote has changed since last sync
      if (invoiceData.last_quote_sync) {
        const lastSync = new Date(invoiceData.last_quote_sync);
        const quoteUpdated = new Date(quote.updated_at);
        setQuoteHasChanged(quoteUpdated > lastSync);
      }
    } else if (isOpen) {
      // Generate initial line items from quote
      generateInitialLineItems();
    }
  }, [invoiceData, isOpen, quote]);

  const generateInitialLineItems = async () => {
    // This would fetch current pricing and generate items from quote
    const items: LineItem[] = [];
    
    // Add proteins
    if (quote.primary_protein) {
      items.push({
        id: `protein-primary`,
        description: `${quote.primary_protein} (Primary Protein) for ${quote.guest_count} guests`,
        category: 'protein',
        quantity: 1,
        unit_price: 1200 * quote.guest_count,
        total_price: 1200 * quote.guest_count,
      });
    }
    
    // Add menu items from quote selections
    const addQuoteItems = (quoteItems: any[], category: string, basePrice: number) => {
      if (Array.isArray(quoteItems)) {
        quoteItems.forEach(item => {
          items.push({
            id: `${category}-${item.replace(/\s+/g, '-').toLowerCase()}`,
            description: `${item} for ${quote.guest_count} guests`,
            category,
            quantity: 1,
            unit_price: basePrice * quote.guest_count,
            total_price: basePrice * quote.guest_count,
          });
        });
      }
    };
    
    addQuoteItems(quote.appetizers, 'appetizer', 400);
    addQuoteItems(quote.sides, 'side', 250);
    addQuoteItems(quote.desserts, 'dessert', 350);
    addQuoteItems(quote.drinks, 'drink', 175);
    
    setLineItems(items);
    setOriginalItems([...items]);
  };

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

  // Check if approval is required based on changes
  const checkApprovalRequired = useMemo(() => {
    const totalChange = Math.abs(calculateTotal() - (invoiceData?.total_amount || 0));
    const hasSignificantChanges = lineItems.some(item => item.is_override);
    const requiresApproval = totalChange > 50000 || hasSignificantChanges; // $500+ change
    setApprovalRequired(requiresApproval);
    return requiresApproval;
  }, [lineItems, customDiscount, invoiceData?.total_amount]);

  const refreshFromQuote = async () => {
    setLoading(true);
    try {
      await generateInitialLineItems();
      setQuoteHasChanged(false);
      toast({
        title: "Refreshed from Quote",
        description: "Invoice has been updated with current quote data."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh from quote.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (templateName: string) => {
    const templates: Record<string, InvoiceTemplate> = {
      'wedding-basic': {
        name: 'Wedding Basic Package',
        service_type: 'plated',
        default_items: [
          { description: 'Appetizer Service', category: 'appetizer', quantity: 1, unit_price: 500, total_price: 500 },
          { description: 'Main Course Service', category: 'protein', quantity: 1, unit_price: 1500, total_price: 1500 },
          { description: 'Wedding Cake Service', category: 'dessert', quantity: 1, unit_price: 750, total_price: 750 }
        ],
        default_discount: 0
      },
      'corporate-lunch': {
        name: 'Corporate Lunch Package',
        service_type: 'buffet',
        default_items: [
          { description: 'Buffet Setup', category: 'service', quantity: 1, unit_price: 300, total_price: 300 },
          { description: 'Main Proteins', category: 'protein', quantity: 1, unit_price: 800, total_price: 800 },
          { description: 'Sides Selection', category: 'side', quantity: 1, unit_price: 400, total_price: 400 }
        ],
        default_discount: 10
      }
    };

    const template = templates[templateName];
    if (template) {
      const scaledItems = template.default_items.map(item => ({
        ...item,
        id: `template-${Date.now()}-${Math.random()}`,
        unit_price: item.unit_price * quote.guest_count,
        total_price: item.total_price * quote.guest_count,
        is_override: true
      }));
      setLineItems(scaledItems);
      setCustomDiscount(template.default_discount);
      setOverrideReason(`Applied ${template.name} template`);
    }
  };

  const bulkUpdateSelected = (field: string, value: any) => {
    setLineItems(items => items.map(item => {
      if (selectedItems.has(item.id || '')) {
        const updatedItem = { ...item, [field]: value, is_override: true };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
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

    if (approvalRequired && !overrideReason.includes('APPROVED:')) {
      toast({
        title: "Approval Required",
        description: "This invoice requires approval due to significant changes. Add 'APPROVED: [reason]' to your override reason.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const overrides = {
        line_items: lineItems,
        discount: customDiscount > 0 ? { 
          type: discountType, 
          amount: discountType === 'percentage' ? customDiscount : customDiscount * 100,
          description: `${discountType === 'percentage' ? customDiscount + '%' : '$' + customDiscount} discount`
        } : null,
        override_reason: overrideReason,
        manual_totals: {
          subtotal: calculateSubtotal(),
          tax_amount: calculateTax(),
          total_amount: calculateTotal()
        },
        is_draft: mode === 'edit',
        quote_sync_timestamp: new Date().toISOString()
      };

      await onGenerate(overrides);
      toast({
        title: "Invoice Generated",
        description: "Invoice has been created with your customizations."
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
            {/* Quote Status & Controls */}
            {quoteHasChanged && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Quote has been updated since last sync. Refresh to get latest data.</span>
                  <Button size="sm" variant="outline" onClick={refreshFromQuote} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {approvalRequired && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This invoice requires approval due to significant changes (${(Math.abs(calculateTotal() - (invoiceData?.total_amount || 0)) / 100).toFixed(2)} change).
                </AlertDescription>
              </Alert>
            )}

            {/* Customer Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Customer Information</CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedTemplate} onValueChange={(value) => { setSelectedTemplate(value); applyTemplate(value); }}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Apply Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding-basic">Wedding Basic</SelectItem>
                      <SelectItem value="corporate-lunch">Corporate Lunch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => setShowVersionHistory(!showVersionHistory)}>
                    <History className="h-3 w-3 mr-1" />
                    History
                  </Button>
                </div>
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
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={bulkEditMode ? "default" : "outline"}
                    onClick={() => setBulkEditMode(!bulkEditMode)}
                  >
                    Bulk Edit
                  </Button>
                  <Button onClick={handleAddCustomItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bulkEditMode && selectedItems.size > 0 && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{selectedItems.size} items selected</span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => bulkUpdateSelected('unit_price', 0)}>
                          Set to $0
                        </Button>
                        <Button size="sm" onClick={() => bulkUpdateSelected('quantity', 1)}>
                          Qty = 1
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => {
                          setLineItems(items => items.filter(item => !selectedItems.has(item.id || '')));
                          setSelectedItems(new Set());
                        }}>
                          Remove Selected
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {lineItems.map((item, index) => {
                    const itemId = item.id || index.toString();
                    const isEditing = editingItem === itemId;
                    const isSelected = selectedItems.has(itemId);
                    
                    return (
                      <div key={itemId} className={`border rounded-lg p-4 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
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
                            {bulkEditMode && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedItems);
                                  if (e.target.checked) {
                                    newSelected.add(itemId);
                                  } else {
                                    newSelected.delete(itemId);
                                  }
                                  setSelectedItems(newSelected);
                                }}
                                className="mr-2"
                              />
                            )}
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
                                  onClick={() => {
                                    // Create a copy of the item
                                    const newItem = { ...item, id: `copy-${Date.now()}`, is_override: true };
                                    setLineItems([...lineItems, newItem]);
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Discount & Adjustments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={discountType === 'percentage' ? 'default' : 'outline'}
                      onClick={() => setDiscountType('percentage')}
                    >
                      <Percent className="h-3 w-3 mr-1" />
                      Percentage
                    </Button>
                    <Button
                      size="sm"
                      variant={discountType === 'fixed' ? 'default' : 'outline'}
                      onClick={() => setDiscountType('fixed')}
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
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
                      placeholder={discountType === 'percentage' ? '10' : '50.00'}
                    />
                  </div>
                  {customDiscount > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Discount: {discountType === 'percentage' 
                        ? `${customDiscount}% = ${formatCurrency(calculateDiscount())}`
                        : formatCurrency(customDiscount * 100)
                      }
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCustomDiscount(5)}>5%</Button>
                    <Button size="sm" variant="outline" onClick={() => setCustomDiscount(10)}>10%</Button>
                    <Button size="sm" variant="outline" onClick={() => setCustomDiscount(15)}>15%</Button>
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
              variant="outline"
              onClick={() => handleGenerateInvoice()}
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : mode === 'edit' ? 'Save Draft' : 'Create Draft'}
            </Button>
            <Button
              onClick={handleGenerateInvoice}
              disabled={loading || (approvalRequired && !overrideReason.includes('APPROVED:'))}
            >
              {loading ? 'Generating...' : 'Generate & Send'}
            </Button>
            {invoiceData?.id && onSend && (
              <Button
                variant="default"
                onClick={() => onSend(invoiceData.id!)}
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}