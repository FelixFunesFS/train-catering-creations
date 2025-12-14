import { useState, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { useLineItems, useUpdateLineItem, useDeleteLineItem } from '@/hooks/useLineItems';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, FileText, Calendar, MapPin, Users, Leaf, MessageSquare, Clock, 
  Plus, Eye, RefreshCw, Loader2, Printer, PartyPopper, Heart
} from 'lucide-react';
import { formatDate, formatTime, formatServiceType, getStatusColor } from '@/utils/formatters';

import { LineItemEditor } from '../billing/LineItemEditor';
import { AddLineItemModal } from '../billing/AddLineItemModal';
import { EstimateSummary } from '../billing/EstimateSummary';
import { EmailPreview } from '../billing/EmailPreview';
import { SortableLineItem } from '../billing/SortableLineItem';
import { DiscountEditor } from '../billing/DiscountEditor';
import { LineItemsService } from '@/services/LineItemsService';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface EventEstimateFullViewProps {
  quote: any;
  invoice: any;
  onClose: () => void;
}

export function EventEstimateFullView({ quote, invoice, onClose }: EventEstimateFullViewProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [customerNotes, setCustomerNotes] = useState(invoice?.notes || '');

  const { data: lineItems, isLoading: loadingItems } = useLineItems(invoice?.id);
  const { data: currentInvoice } = useInvoice(invoice?.id);
  const updateLineItem = useUpdateLineItem();
  const deleteLineItem = useDeleteLineItem();
  const updateInvoice = useUpdateInvoice();

  const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;

  // Stable sorting
  const sortedLineItems = useMemo(() => {
    if (!lineItems) return [];
    return [...lineItems].sort((a, b) => {
      const sortA = a.sort_order ?? 0;
      const sortB = b.sort_order ?? 0;
      if (sortA !== sortB) return sortA - sortB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [lineItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedLineItems.findIndex(item => item.id === active.id);
    const newIndex = sortedLineItems.findIndex(item => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    let newSortOrder: number;
    if (newIndex === 0) {
      newSortOrder = (sortedLineItems[0]?.sort_order ?? 10) - 10;
    } else if (newIndex >= sortedLineItems.length - 1) {
      newSortOrder = (sortedLineItems[sortedLineItems.length - 1]?.sort_order ?? 0) + 10;
    } else {
      const beforeItem = oldIndex < newIndex ? sortedLineItems[newIndex] : sortedLineItems[newIndex - 1];
      const afterItem = oldIndex < newIndex ? sortedLineItems[newIndex + 1] : sortedLineItems[newIndex];
      const beforeOrder = beforeItem?.sort_order ?? 0;
      const afterOrder = afterItem?.sort_order ?? beforeOrder + 20;
      newSortOrder = Math.floor((beforeOrder + afterOrder) / 2);
    }

    try {
      await LineItemsService.updateLineItem(active.id as string, { sort_order: newSortOrder });
      queryClient.invalidateQueries({ queryKey: ['line-items', invoice?.id] });
    } catch {
      toast({ title: 'Reorder Failed', variant: 'destructive' });
    }
  };

  const handlePriceChange = async (lineItemId: string, newPrice: number) => {
    const item = lineItems?.find(li => li.id === lineItemId);
    if (!item) return;
    await updateLineItem.mutateAsync({
      lineItemId,
      invoiceId: invoice?.id,
      updates: { unit_price: newPrice, total_price: newPrice * item.quantity },
    });
  };

  const handleQuantityChange = async (lineItemId: string, newQuantity: number) => {
    const item = lineItems?.find(li => li.id === lineItemId);
    if (!item) return;
    await updateLineItem.mutateAsync({
      lineItemId,
      invoiceId: invoice?.id,
      updates: { quantity: newQuantity, total_price: item.unit_price * newQuantity },
    });
  };

  const handleDeleteItem = async (lineItemId: string) => {
    await deleteLineItem.mutateAsync({ lineItemId, invoiceId: invoice?.id });
  };

  const handleDescriptionChange = async (lineItemId: string, desc: string) => {
    await updateLineItem.mutateAsync({
      lineItemId,
      invoiceId: invoice?.id,
      updates: { description: desc },
    });
  };

  const handleSaveCustomerNotes = async () => {
    await updateInvoice.mutateAsync({
      invoiceId: invoice?.id,
      updates: { notes: customerNotes },
    });
    toast({ title: 'Notes saved' });
  };

  const handlePreviewClick = () => {
    const unpricedItems = lineItems?.filter(li => li.unit_price === 0) || [];
    if (unpricedItems.length > 0) {
      toast({ title: 'Missing Prices', description: `${unpricedItems.length} item(s) need pricing.`, variant: 'destructive' });
      return;
    }
    setIsResendMode(false);
    setShowPreview(true);
  };

  const handleResendClick = () => {
    setIsResendMode(true);
    setShowPreview(true);
  };

  const handleSendEstimate = async (overrideEmail?: string) => {
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
      toast({ title: isResendMode ? 'Estimate Resent' : 'Estimate Sent', description: `Email sent to ${overrideEmail || quote?.email}` });
      setShowPreview(false);
      if (!isResendMode) onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const subtotal = currentInvoice?.subtotal ?? 0;
  const taxAmount = currentInvoice?.tax_amount ?? 0;
  const total = currentInvoice?.total_amount ?? 0;
  const discountAmount = (currentInvoice as any)?.discount_amount ?? 0;
  const discountType = (currentInvoice as any)?.discount_type as 'percentage' | 'fixed' | null;
  const discountDescription = (currentInvoice as any)?.discount_description as string | null;
  const isAlreadySent = currentInvoice?.workflow_status === 'sent' || currentInvoice?.workflow_status === 'viewed';

  const handleApplyDiscount = async (amount: number, type: 'percentage' | 'fixed', description: string) => {
    await updateInvoice.mutateAsync({
      invoiceId: invoice?.id,
      updates: { discount_amount: amount, discount_type: type, discount_description: description } as any,
    });
  };

  const handleRemoveDiscount = async () => {
    await updateInvoice.mutateAsync({
      invoiceId: invoice?.id,
      updates: { discount_amount: 0, discount_type: null, discount_description: null } as any,
    });
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

  // Event Details Panel Content
  const EventDetailsPanel = () => (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Event Details
        </h2>
        <Badge className={getStatusColor(quote?.workflow_status || 'pending')} variant="secondary">
          {quote?.workflow_status?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">{quote?.contact_name}</p>
          <p className="text-muted-foreground">{quote?.email}</p>
          <p className="text-muted-foreground">{quote?.phone}</p>
        </CardContent>
      </Card>

      {/* Event Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PartyPopper className="h-4 w-4" /> Event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{quote?.event_name}</p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(quote?.event_date)} {quote?.start_time && `at ${formatTime(quote?.start_time)}`}</span>
          </div>
          {quote?.location && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3 mt-0.5" />
              <span>{quote?.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{quote?.guest_count} guests</span>
            <Badge variant="outline" className="text-xs">{formatServiceType(quote?.service_type)}</Badge>
          </div>
          {quote?.event_type && (
            <Badge variant="secondary" className="capitalize">{quote.event_type.replace('_', ' ')}</Badge>
          )}
        </CardContent>
      </Card>

      {/* Dietary & Vegetarian */}
      {(quote?.guest_count_with_restrictions || quote?.vegetarian_entrees?.length > 0) && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
              <Leaf className="h-4 w-4" /> Vegetarian Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {quote?.guest_count_with_restrictions && (
              <p className="text-green-700 dark:text-green-400">
                🥗 {quote.guest_count_with_restrictions} vegetarian portions
              </p>
            )}
            {quote?.vegetarian_entrees?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {quote.vegetarian_entrees.map((entree: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 text-xs">
                    {entree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Wedding Fields */}
      {quote?.event_type === 'wedding' && (
        <Card className="border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-pink-700 dark:text-pink-400">
              <Heart className="h-4 w-4" /> Wedding Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {quote?.ceremony_included && <Badge variant="outline">💒 Ceremony Included</Badge>}
            {quote?.cocktail_hour && <Badge variant="outline">🍸 Cocktail Hour</Badge>}
            {quote?.theme_colors && <Badge variant="outline">🎨 {quote.theme_colors}</Badge>}
          </CardContent>
        </Card>
      )}

      {/* Special Requests */}
      {quote?.special_requests && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Special Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm italic text-muted-foreground">{quote.special_requests}</p>
          </CardContent>
        </Card>
      )}

      {/* Government Badge */}
      {isGovernment && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-700 dark:text-blue-400 font-medium text-sm">
            🏛️ Government Contract (Tax Exempt • Net 30)
          </p>
        </div>
      )}
    </div>
  );

  // Estimate/Invoice Panel Content  
  const EstimatePanel = () => (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Estimate {invoice?.invoice_number && `#${invoice.invoice_number}`}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/estimate/print/${invoice?.id}`, '_blank')}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Line Items</h3>
          <Button variant="outline" size="sm" onClick={() => setShowAddItem(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {loadingItems ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !sortedLineItems?.length ? (
          <p className="text-center py-4 text-muted-foreground text-sm">No line items</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedLineItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedLineItems.map(item => (
                  <SortableLineItem key={item.id} id={item.id}>
                    <LineItemEditor
                      item={item}
                      onPriceChange={price => handlePriceChange(item.id, price)}
                      onQuantityChange={qty => handleQuantityChange(item.id, qty)}
                      onDescriptionChange={desc => handleDescriptionChange(item.id, desc)}
                      onDelete={() => handleDeleteItem(item.id)}
                      isUpdating={updateLineItem.isPending || deleteLineItem.isPending}
                    />
                  </SortableLineItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Separator />

      {/* Customer Notes (visible on estimate) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes for Customer</label>
        <Textarea
          value={customerNotes}
          onChange={e => setCustomerNotes(e.target.value)}
          placeholder="These notes will appear on the customer's estimate..."
          rows={2}
          className="text-sm"
        />
        <Button variant="outline" size="sm" onClick={handleSaveCustomerNotes} disabled={updateInvoice.isPending}>
          Save Notes
        </Button>
      </div>

      <Separator />

      {/* Discount */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Discount</span>
        <DiscountEditor
          discountAmount={discountAmount}
          discountType={discountType}
          discountDescription={discountDescription}
          subtotal={subtotal}
          onApplyDiscount={handleApplyDiscount}
          onRemoveDiscount={handleRemoveDiscount}
          disabled={updateInvoice.isPending}
        />
      </div>

      <Separator />

      {/* Totals */}
      <EstimateSummary
        subtotal={subtotal}
        taxAmount={taxAmount}
        total={total}
        isGovernment={isGovernment}
        discountAmount={discountAmount}
        discountType={discountType}
        discountDescription={discountDescription}
      />

      <Separator />

      {/* Admin Notes (internal only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Admin Notes (Internal)</label>
        <Textarea
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          placeholder="Internal notes..."
          rows={2}
          className="text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          <X className="h-4 w-4 mr-1" /> Close
        </Button>
        {isAlreadySent ? (
          <Button onClick={handleResendClick} disabled={!lineItems?.length} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-1" /> Resend
          </Button>
        ) : (
          <Button onClick={handlePreviewClick} disabled={!lineItems?.length} className="flex-1">
            <Eye className="h-4 w-4 mr-1" /> Preview & Send
          </Button>
        )}
      </div>
    </div>
  );

  // Desktop: Resizable side-by-side panels
  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {/* Top Bar */}
        <div className="h-14 border-b bg-card flex items-center justify-between px-4">
          <h1 className="font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Event & Estimate
          </h1>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Resizable Panels */}
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-3.5rem)]">
          <ResizablePanel defaultSize={40} minSize={30}>
            <ScrollArea className="h-full">
              <EventDetailsPanel />
            </ScrollArea>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={60} minSize={40}>
            <ScrollArea className="h-full">
              <EstimatePanel />
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>

        {showAddItem && <AddLineItemModal invoiceId={invoice?.id} onClose={() => setShowAddItem(false)} />}
      </div>
    );
  }

  // Mobile/Tablet: Sheet slide-in
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Event & Estimate
          </SheetTitle>
        </SheetHeader>
        
        <div className="divide-y">
          <EventDetailsPanel />
          <EstimatePanel />
        </div>

        {showAddItem && <AddLineItemModal invoiceId={invoice?.id} onClose={() => setShowAddItem(false)} />}
      </SheetContent>
    </Sheet>
  );
}
