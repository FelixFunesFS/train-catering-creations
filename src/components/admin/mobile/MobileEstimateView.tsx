import { useState, useMemo, useCallback } from 'react';
import { TaxCalculationService } from '@/services/TaxCalculationService';
import { useInvoice, useUpdateInvoice, useInvoiceWithMilestones } from '@/hooks/useInvoices';
import { useLineItems, useDeleteLineItem } from '@/hooks/useLineItems';
import { useCustomLineItems } from '@/hooks/useCustomLineItems';
import { useEditableInvoice } from '@/hooks/useEditableInvoice';
import { usePaymentScheduleSync } from '@/hooks/usePaymentScheduleSync';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  User,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Save,
  Send,
  Trash2,
  Plus,
  AlertCircle,
  Check,
  Loader2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { AddLineItemModal } from '@/components/admin/billing/AddLineItemModal';
import { EmailPreview } from '@/components/admin/billing/EmailPreview';
import { LineItemsService } from '@/services/LineItemsService';

interface MobileEstimateViewProps {
  quote: any;
  invoice: any;
  onClose: () => void;
}

export function MobileEstimateView({ quote, invoice, onClose }: MobileEstimateViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Collapsible sections
  const [eventOpen, setEventOpen] = useState(true);
  const [estimateOpen, setEstimateOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  
  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Data queries
  const { data: lineItems, isLoading: loadingItems } = useLineItems(invoice?.id);
  const { data: currentInvoice } = useInvoice(invoice?.id);
  const { data: invoiceWithMilestones } = useInvoiceWithMilestones(invoice?.id);
  const milestones = invoiceWithMilestones?.milestones || [];
  const deleteLineItem = useDeleteLineItem();
  const updateInvoice = useUpdateInvoice();
  
  // Use the unified editable invoice hook
  const {
    localLineItems: editableLineItems,
    customerNotes,
    adminNotes,
    updateLineItem: updateLocalLineItem,
    setCustomerNotes,
    setAdminNotes,
    hasUnsavedChanges,
    saveAllChanges,
    discardAllChanges,
    isSaving,
  } = useEditableInvoice(invoice?.id, lineItems || [], currentInvoice?.notes);

  const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;

  usePaymentScheduleSync({
    invoiceId: invoice?.id,
    totalAmount: currentInvoice?.total_amount ?? 0,
    isGovernment,
    enabled: !!invoice?.id && !hasUnsavedChanges,
  });

  const sortedLineItems = useMemo(() => {
    if (!lineItems) return [];
    return [...lineItems].sort((a, b) => {
      const sortA = a.sort_order ?? 0;
      const sortB = b.sort_order ?? 0;
      if (sortA !== sortB) return sortA - sortB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [lineItems]);

  // Generate estimate
  const handleGenerateEstimate = useCallback(async () => {
    if (!quote?.id) return;
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quote.id }
      });
      if (error) throw error;

      toast({ title: 'Estimate Generated' });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-by-quote', quote.id] });
      queryClient.invalidateQueries({ queryKey: ['line-items'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [quote?.id, toast, queryClient]);

  // Line item handlers
  const handlePriceChange = useCallback((lineItemId: string, newPrice: number) => {
    updateLocalLineItem(lineItemId, { unit_price: newPrice });
  }, [updateLocalLineItem]);

  const handleQuantityChange = useCallback((lineItemId: string, newQuantity: number) => {
    updateLocalLineItem(lineItemId, { quantity: newQuantity });
  }, [updateLocalLineItem]);

  const handleDeleteItem = useCallback(async (lineItemId: string) => {
    await deleteLineItem.mutateAsync({ lineItemId, invoiceId: invoice?.id });
  }, [deleteLineItem, invoice?.id]);

  // Send handlers
  const handlePreviewClick = useCallback(() => {
    if (hasUnsavedChanges) {
      toast({ title: 'Unsaved Changes', description: 'Please save first.', variant: 'destructive' });
      return;
    }
    setIsResendMode(false);
    setShowPreview(true);
  }, [hasUnsavedChanges, toast]);

  const handleSendEstimate = useCallback(async (overrideEmail?: string) => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-customer-portal-email', {
        body: { type: 'estimate_ready', quote_request_id: quote?.id, override_email: overrideEmail },
      });
      if (error) throw error;

      if (!isResendMode) {
        await supabase.from('invoices').update({
          workflow_status: 'sent',
          sent_at: new Date().toISOString(),
          is_draft: false,
        }).eq('id', invoice?.id);
      }

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: isResendMode ? 'Estimate Resent' : 'Estimate Sent' });
      setShowPreview(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  }, [quote?.id, invoice?.id, isResendMode, queryClient, toast]);

  // PDF Download
  const handleDownloadPdf = useCallback(async () => {
    if (!invoice?.id) return;
    try {
      toast({ title: 'Generating PDF...' });
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoice.id }
      });
      if (error) throw error;
      if (!data?.pdf_base64) throw new Error('No PDF generated');
      
      const binaryString = atob(data.pdf_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || `estimate-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: 'PDF Downloaded' });
    } catch (err: any) {
      toast({ title: 'PDF Error', description: err.message, variant: 'destructive' });
    }
  }, [invoice?.id, invoice?.invoice_number, toast]);

  const discountAmount = (currentInvoice as any)?.discount_amount ?? 0;
  const discountType = (currentInvoice as any)?.discount_type as 'percentage' | 'fixed' | null;
  const discountDescription = (currentInvoice as any)?.discount_description as string | null;
  const isAlreadySent = currentInvoice?.workflow_status === 'sent' || currentInvoice?.workflow_status === 'viewed';

  // Totals
  const { subtotal, taxAmount, total } = useMemo(() => {
    if (!hasUnsavedChanges && currentInvoice) {
      return {
        subtotal: currentInvoice.subtotal ?? 0,
        taxAmount: currentInvoice.tax_amount ?? 0,
        total: currentInvoice.total_amount ?? 0,
      };
    }
    
    const calculatedSubtotal = editableLineItems.reduce(
      (sum, item) => sum + (item.total_price || 0), 
      0
    );
    
    const taxCalc = TaxCalculationService.calculateTaxWithDiscount(
      calculatedSubtotal,
      discountAmount,
      discountType,
      discountDescription,
      isGovernment
    );
    
    return {
      subtotal: calculatedSubtotal,
      taxAmount: taxCalc.taxAmount,
      total: taxCalc.totalAmount,
    };
  }, [hasUnsavedChanges, currentInvoice, editableLineItems, discountAmount, discountType, discountDescription, isGovernment]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (showPreview) {
    return (
      <EmailPreview
        invoice={{ ...invoice, quote_id: quote?.id, email: quote?.email, contact_name: quote?.contact_name }}
        onClose={() => setShowPreview(false)}
        onConfirmSend={handleSendEstimate}
        isSending={isSending}
        isResend={isResendMode}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-sm truncate max-w-[180px]">
              {quote?.event_name || 'Event Details'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {quote?.contact_name}
            </p>
          </div>
        </div>
        {invoice?.invoice_number && (
          <Badge variant="outline" className="text-xs">
            {invoice.invoice_number}
          </Badge>
        )}
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 pb-32">
          
          {/* Event Summary Section */}
          <Collapsible open={eventOpen} onOpenChange={setEventOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Event Details
                    </CardTitle>
                    {eventOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Date</p>
                        <p className="font-medium">
                          {quote?.event_date ? format(new Date(quote.event_date), 'MMM d, yyyy') : 'TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs">Guests</p>
                        <p className="font-medium">{quote?.guest_count || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Location</p>
                      <p className="font-medium">{quote?.location || 'TBD'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Contact</p>
                      <p className="font-medium">{quote?.contact_name}</p>
                      <p className="text-xs text-muted-foreground">{quote?.email}</p>
                      <p className="text-xs text-muted-foreground">{quote?.phone}</p>
                    </div>
                  </div>

                  {isGovernment && (
                    <Badge variant="secondary" className="text-xs">
                      Government Contract (Tax Exempt)
                    </Badge>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Estimate Section */}
          <Collapsible open={estimateOpen} onOpenChange={setEstimateOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Estimate
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{formatCurrency(total)}</span>
                      {estimateOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {!invoice ? (
                    <Button 
                      onClick={handleGenerateEstimate} 
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Generate Estimate
                    </Button>
                  ) : (
                    <>
                      {/* Line Items */}
                      <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                            <span className="text-sm font-medium">
                              Line Items ({sortedLineItems.length})
                            </span>
                            {itemsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {loadingItems ? (
                            <div className="text-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </div>
                          ) : (
                            <>
                              {editableLineItems.map((item) => (
                                <Card key={item.id} className="bg-muted/50">
                                  <CardContent className="p-3">
                                    {editingItemId === item.id ? (
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <p className="font-medium text-sm truncate flex-1">
                                            {item.title || item.description}
                                          </p>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setEditingItemId(null)}
                                          >
                                            <Check className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-xs text-muted-foreground">Qty</label>
                                            <Input
                                              type="number"
                                              value={item.quantity}
                                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                              className="h-9"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs text-muted-foreground">Price</label>
                                            <Input
                                              type="number"
                                              value={(item.unit_price / 100).toFixed(2)}
                                              onChange={(e) => handlePriceChange(item.id, Math.round(parseFloat(e.target.value || '0') * 100))}
                                              className="h-9"
                                            />
                                          </div>
                                        </div>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="w-full"
                                          onClick={() => handleDeleteItem(item.id)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Remove
                                        </Button>
                                      </div>
                                    ) : (
                                      <div 
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setEditingItemId(item.id)}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm truncate">
                                            {item.title || item.description}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {item.quantity} × {formatCurrency(item.unit_price)}
                                          </p>
                                        </div>
                                        <span className="font-medium text-sm ml-2">
                                          {formatCurrency(item.total_price)}
                                        </span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => setShowAddItem(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                              </Button>
                            </>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Notes */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes for Customer</label>
                        <Textarea
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="Notes visible to customer..."
                          className="min-h-[80px]"
                        />
                      </div>

                      {/* Totals */}
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-destructive">
                            <span>Discount</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}
                        {!isGovernment && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (9%)</span>
                            <span>{formatCurrency(taxAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total</span>
                          <span className="text-primary">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Payment Milestones */}
          {milestones.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Payment Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {milestones.map((milestone: any) => (
                  <div 
                    key={milestone.id}
                    className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{milestone.milestone_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {milestone.percentage}%
                        {milestone.due_date && ` • Due ${format(new Date(milestone.due_date), 'MMM d')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(milestone.amount_cents)}</p>
                      <Badge variant={milestone.status === 'paid' ? 'default' : 'outline'} className="text-xs">
                        {milestone.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-2 safe-area-inset-bottom">
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-400 flex-1">Unsaved changes</span>
            <Button variant="ghost" size="sm" onClick={discardAllChanges}>
              Discard
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {hasUnsavedChanges ? (
            <Button 
              onClick={saveAllChanges} 
              disabled={isSaving}
              className="col-span-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleDownloadPdf} disabled={!invoice}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handlePreviewClick} disabled={!invoice}>
                <Send className="h-4 w-4 mr-2" />
                {isAlreadySent ? 'Resend' : 'Send'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Add Line Item Modal */}
      {showAddItem && <AddLineItemModal invoiceId={invoice?.id} onClose={() => setShowAddItem(false)} />}
    </div>
  );
}
