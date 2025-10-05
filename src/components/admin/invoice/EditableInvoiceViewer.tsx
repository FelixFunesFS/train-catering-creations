import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLineItemManagement } from '@/hooks/useLineItemManagement';
import { useKeyboardShortcuts, SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { FloatingActionControls } from '@/components/admin/FloatingActionControls';
import { LiveCalculationDisplay } from '@/components/admin/LiveCalculationDisplay';
import { PricingTemplateManager } from '@/components/admin/pricing/PricingTemplateManager';
import { BulkLineItemOperations } from '@/components/admin/pricing/BulkLineItemOperations';
import { PricingValidation } from '@/components/admin/pricing/PricingValidation';
import { 
  FileText, 
  Download, 
  Send, 
  ExternalLink, 
  User, 
  Calendar, 
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  Calculator,
  Package,
  Wrench
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

interface InvoiceData {
  id?: string;
  invoice_number?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  line_items: LineItem[];
  status?: string;
  due_date?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface QuoteData {
  contact_name: string;
  email: string;
  phone?: string;
  event_name: string;
  event_type?: string;
  event_date: string;
  start_time?: string;
  serving_start_time?: string;
  location: string;
  guest_count: number;
}

interface EditableInvoiceViewerProps {
  invoice: InvoiceData;
  customer?: Customer;
  quote?: QuoteData;
  onSend?: (invoiceId: string) => void;
  onDownload?: (invoiceId: string) => void;
  onViewInStripe?: (stripeInvoiceId: string) => void;
  showActions?: boolean;
  className?: string;
  documentType?: 'estimate' | 'invoice';
  isEditMode?: boolean;
  onSave?: (updatedInvoice: InvoiceData) => Promise<void>;
  onCancel?: () => void;
}

export function EditableInvoiceViewer({
  invoice,
  customer,
  quote,
  onSend,
  onDownload,
  onViewInStripe,
  showActions = false,
  className = "",
  documentType = 'invoice',
  isEditMode = false,
  onSave,
  onCancel
}: EditableInvoiceViewerProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [taxRate, setTaxRate] = useState(8.0);
  const [showPricingTools, setShowPricingTools] = useState(false);
  const [selectedLineItems, setSelectedLineItems] = useState<Set<string>>(new Set());
  const [highlightedItems, setHighlightedItems] = useState<Set<string>>(new Set());
  
  // Use the line item management hook with real-time features
  const {
    lineItems,
    isModified,
    isCalculating,
    lastCalculated,
    updateLineItem,
    addLineItem,
    removeLineItem,
    addTemplateItem,
    validateLineItems,
    resetLineItems,
    getCommonTemplates,
    triggerAutoSave,
    cancelAutoSave
  } = useLineItemManagement({
    initialLineItems: invoice.line_items,
    autoSave: isEditMode,
    invoiceId: invoice.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'sent':
        return 'bg-info/10 text-info border-info/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'catering':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'service':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'equipment':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    // Validate before saving
    const validationErrors = validateLineItems();
    if (validationErrors.length > 0) {
      return; // Validation errors are handled by the hook
    }
    
    setIsSaving(true);
    try {
      const updatedInvoice = {
        ...invoice,
        line_items: lineItems,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount
      };
      
      await onSave(updatedInvoice);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isModified) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmDiscard) return;
    }
    
    resetLineItems();
    setEditingItem(null);
    onCancel?.();
  };

  const handleAddTemplate = (templateType: string) => {
    const guestCount = quote?.guest_count || 50;
    addTemplateItem(templateType, guestCount);
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: {
      [SHORTCUTS.SAVE]: handleSave,
      [SHORTCUTS.CANCEL]: handleCancel,
      [SHORTCUTS.NEW]: () => addLineItem()
    },
    enabled: isEditMode
  });

  return (
    <>
      <Card className={`max-w-4xl mx-auto print:shadow-none print:border-none ${className}`}>
      {/* Invoice Header */}
      <CardHeader className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary">Soul Train's Eatery</h1>
            <p className="text-muted-foreground">Charleston's Trusted Catering Partner</p>
            <p className="text-sm text-muted-foreground mt-2">
              Phone: (843) 970-0265 • Email: soultrainseatery@gmail.com
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold">{documentType.toUpperCase()}</h2>
            {invoice.invoice_number && (
              <p className="text-muted-foreground">#{invoice.invoice_number}</p>
            )}
            {invoice.status && (
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
            )}
            {isEditMode && (
              <div className="flex flex-col gap-2 mt-2">
                <Badge variant="outline" className="text-primary">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit Mode
                </Badge>
                {isModified && (
                  <Badge variant="outline" className="text-warning">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Bill To:
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{customer?.name || quote?.contact_name}</p>
              <p>{customer?.email || quote?.email}</p>
              {(customer?.phone || quote?.phone) && (
                <p>{customer?.phone || quote?.phone}</p>
              )}
              {customer?.address && <p>{customer.address}</p>}
            </div>
          </div>

          {/* Event Details */}
          {quote && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Details:
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{quote.event_name}</p>
                {quote.event_type && (
                  <p className="text-muted-foreground capitalize">
                    {quote.event_type.replace(/_/g, ' ')}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(quote.event_date).toLocaleDateString()}
                </p>
                {quote.start_time && (
                  <p className="text-muted-foreground">
                    Start: {formatTime(quote.start_time)}
                  </p>
                )}
                {quote.serving_start_time && (
                  <p className="text-muted-foreground">
                    Serving: {formatTime(quote.serving_start_time)}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {quote.location}
                </p>
                <p>Guests: {quote.guest_count}</p>
              </div>
            </div>
          )}
        </div>

        {invoice.due_date && (
          <div className="flex justify-between text-sm">
            <span>Invoice Date: {new Date().toLocaleDateString()}</span>
            <span>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </CardHeader>

      {/* Enhanced Pricing Tools - Only visible in edit mode */}
      {isEditMode && (
        <div className="border-t bg-muted/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Pricing Tools
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingTools(!showPricingTools)}
              >
                {showPricingTools ? 'Hide Tools' : 'Show Tools'}
              </Button>
            </div>

            {showPricingTools && (
              <div className="space-y-6">
                {/* Pricing Validation */}
                <PricingValidation
                  lineItems={lineItems}
                  guestCount={quote?.guest_count}
                  onFixIssues={(fixes) => {
                    fixes.forEach(fix => {
                      updateLineItem(fix.itemId, fix.fixes);
                    });
                  }}
                  onHighlightItems={(itemIds) => {
                    setHighlightedItems(new Set(itemIds));
                    setTimeout(() => setHighlightedItems(new Set()), 3000);
                  }}
                />

                {/* Bulk Operations */}
                <BulkLineItemOperations
                  lineItems={lineItems}
                  selectedItems={selectedLineItems}
                  onSelectionChange={setSelectedLineItems}
                  onUpdateItems={(updatedItems) => {
                    updatedItems.forEach(item => {
                      if (item.id) {
                        updateLineItem(item.id, item);
                      }
                    });
                  }}
                  onDeleteItems={(itemIds) => {
                    itemIds.forEach(id => removeLineItem(id));
                    setSelectedLineItems(new Set());
                  }}
                />

                {/* Pricing Templates */}
                <PricingTemplateManager
                  guestCount={quote?.guest_count || 50}
                  currentItems={lineItems}
                  onAddItems={(items) => {
                    items.forEach(item => addLineItem(item));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <CardContent className="space-y-6">
        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Services & Items</h3>
            {isEditMode && (
              <div className="flex gap-2">
                <Button onClick={() => addLineItem()} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Select onValueChange={handleAddTemplate}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Quick Add" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCommonTemplates().map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              {isEditMode && <div className="col-span-1">Actions</div>}
            </div>
            
            {lineItems.map((item, index) => {
              const isHighlighted = highlightedItems.has(item.id || '');
              const isSelected = selectedLineItems.has(item.id || '');
              
              return (
              <div 
                key={item.id || index} 
                className={`px-4 py-3 border-t grid grid-cols-12 gap-4 text-sm items-center transition-colors ${
                  isHighlighted ? 'bg-yellow-100 border-yellow-300' : 
                  isSelected ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div className="col-span-5">
                  {isEditMode && editingItem === item.id ? (
                    <div className="space-y-2">
                      <Input
                        value={item.title}
                        onChange={(e) => updateLineItem(item.id!, { title: e.target.value })}
                        placeholder="Item title"
                        className="text-sm"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id!, { description: e.target.value })}
                        placeholder="Item description"
                        className="text-xs resize-none"
                        rows={2}
                      />
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateLineItem(item.id!, { category: value })}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="catering">Catering</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.title}</p>
                        <Badge className={getCategoryColor(item.category)} variant="outline">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">{item.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="col-span-2 text-center">
                  {isEditMode && editingItem === item.id ? (
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id!, { quantity: parseInt(e.target.value) || 0 })}
                      className="text-sm text-center"
                      min="0"
                    />
                  ) : (
                    item.quantity
                  )}
                </div>
                
                <div className="col-span-2 text-right">
                  {isEditMode && editingItem === item.id ? (
                    <Input
                      type="number"
                      value={item.unit_price / 100}
                      onChange={(e) => updateLineItem(item.id!, { unit_price: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      className="text-sm text-right"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    formatCurrency(item.unit_price)
                  )}
                </div>
                
                <div className="col-span-2 text-right font-medium">
                  {formatCurrency(item.total_price)}
                </div>
                
                {isEditMode && (
                  <div className="col-span-1 flex gap-1">
                    {editingItem === item.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingItem(null)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingItem(item.id!)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLineItem(item.id!)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({taxRate}%):</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Live Calculation Display */}
        {isEditMode && (
          <div className="mt-6">
            <LiveCalculationDisplay
              subtotal={invoice.subtotal}
              taxAmount={invoice.tax_amount}
              taxRate={taxRate}
              totalAmount={invoice.total_amount}
              isCalculating={isCalculating}
              lastUpdated={lastCalculated}
            />
          </div>
        )}

        {/* Payment Terms */}
        <div className="bg-muted/30 p-4 rounded-lg text-sm">
          <h4 className="font-medium mb-2">Payment Terms</h4>
          <p className="text-muted-foreground">
            Payment is due within 30 days of invoice date. Please contact us at (843) 970-0265 
            with any questions regarding this invoice.
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-3 pt-4 print:hidden">
            {isEditMode ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {invoice.status === 'draft' && onSend && invoice.id && (
                  <Button onClick={() => onSend(invoice.id!)} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send {documentType === 'estimate' ? 'Estimate' : 'Invoice'}
                  </Button>
                )}
                {invoice.pdf_url && onDownload && invoice.id && (
                  <Button variant="outline" onClick={() => onDownload(invoice.id!)}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                )}
                {invoice.stripe_invoice_id && onViewInStripe && (
                  <Button variant="outline" onClick={() => onViewInStripe(invoice.stripe_invoice_id!)}>
                    <ExternalLink className="h-4 w-4" />
                    View in Stripe
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.print()}>
                  <FileText className="h-4 w-4" />
                  Print
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Floating Action Controls */}
    <FloatingActionControls
      isVisible={isEditMode}
      isSaving={isSaving}
      hasUnsavedChanges={isModified}
      hasErrors={false}
      onSave={handleSave}
      onCancel={handleCancel}
    />
    </>
  );
}