import { useState, useMemo, useEffect, useRef } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { useLineItems, useUpdateLineItem, useDeleteLineItem } from '@/hooks/useLineItems';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, FileText, Calendar, MapPin, Users, MessageSquare, 
  Plus, Eye, RefreshCw, Loader2, Printer, PartyPopper, Heart, ArrowLeft, Pencil, Utensils
} from 'lucide-react';
import { formatDate, formatTime, formatServiceType, getStatusColor } from '@/utils/formatters';
import { CustomerEditor } from './CustomerEditor';
import { MenuEditorInline } from './MenuEditorInline';
import { ChangeHistory } from './ChangeHistory';

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
  const [showCustomerEdit, setShowCustomerEdit] = useState(false);
  const [showMenuEdit, setShowMenuEdit] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Notes state with dirty tracking
  const initialNotes = invoice?.notes || '';
  const [customerNotes, setCustomerNotes] = useState(initialNotes);
  const hasAutoPopulatedNote = useRef(false);
  
  // Track if notes have changed
  const notesChanged = customerNotes !== initialNotes;

  // Auto-populate both proteins note ONCE when applicable
  useEffect(() => {
    if (quote?.both_proteins_available && !hasAutoPopulatedNote.current) {
      const bothProteinsNote = '⭐ Both proteins will be served to all guests.';
      if (!customerNotes.includes(bothProteinsNote)) {
        setCustomerNotes(prev => prev ? `${prev}\n\n${bothProteinsNote}` : bothProteinsNote);
      }
      hasAutoPopulatedNote.current = true;
    }
  }, [quote?.both_proteins_available, customerNotes]);

  // Helper to format menu items
  const formatMenuItems = (items: unknown): string => {
    if (!items || !Array.isArray(items) || items.length === 0) return '';
    return items.map((item: string) => 
      item.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ).join(', ');
  };

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

  // Event Details Panel Content - Consolidated sections with Separators
  const EventDetailsPanel = () => (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Event Details
        </h2>
        <Badge className={getStatusColor(quote?.workflow_status || 'pending')} variant="secondary">
          {quote?.workflow_status?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Customer Section */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Users className="h-4 w-4" /> Customer
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCustomerEdit(true)}>
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
        <p className="font-medium">{quote?.contact_name}</p>
        <p className="text-sm text-muted-foreground">{quote?.email}</p>
        <p className="text-sm text-muted-foreground">{quote?.phone}</p>
      </section>

      <Separator />

      {/* Event Section */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <PartyPopper className="h-4 w-4" /> Event
        </h3>
        <p className="font-medium">{quote?.event_name}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(quote?.event_date)} {quote?.start_time && `at ${formatTime(quote?.start_time)}`}</span>
        </div>
        {quote?.location && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mt-0.5" />
            <span>{quote?.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span>{quote?.guest_count} guests</span>
          <Badge variant="outline" className="text-xs">{formatServiceType(quote?.service_type)}</Badge>
        </div>
        {quote?.event_type && (
          <Badge variant="secondary" className="capitalize">{quote.event_type.replace('_', ' ')}</Badge>
        )}
      </section>

      <Separator />

      {/* Menu Selections Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Utensils className="h-4 w-4" /> Menu Selections
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowMenuEdit(true)}>
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Proteins */}
        {formatMenuItems(quote?.proteins) && (
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Proteins</span>
            <p className="font-medium">{formatMenuItems(quote?.proteins)}</p>
            {quote?.both_proteins_available && (
              <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs">
                ⭐ Both proteins served to all guests
              </Badge>
            )}
          </div>
        )}

        {/* Vegetarian - RIGHT AFTER proteins */}
        {(quote?.guest_count_with_restrictions || formatMenuItems(quote?.vegetarian_entrees)) && (
          <div className="border-l-2 border-green-500 pl-3 py-2 bg-green-50/50 dark:bg-green-950/20 rounded-r">
            <span className="text-green-700 dark:text-green-400 text-xs uppercase tracking-wide flex items-center gap-1">
              🌱 Vegetarian Options
            </span>
            {quote?.guest_count_with_restrictions && (
              <p className="font-medium text-green-700 dark:text-green-300">{quote.guest_count_with_restrictions} vegetarian portions</p>
            )}
            {formatMenuItems(quote?.vegetarian_entrees) && (
              <p className="font-medium text-green-700 dark:text-green-300">{formatMenuItems(quote?.vegetarian_entrees)}</p>
            )}
          </div>
        )}

        {/* Sides */}
        {formatMenuItems(quote?.sides) && (
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Sides</span>
            <p className="font-medium">{formatMenuItems(quote?.sides)}</p>
          </div>
        )}

        {/* Appetizers */}
        {formatMenuItems(quote?.appetizers) && (
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Appetizers</span>
            <p className="font-medium">{formatMenuItems(quote?.appetizers)}</p>
          </div>
        )}

        {/* Desserts */}
        {formatMenuItems(quote?.desserts) && (
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Desserts</span>
            <p className="font-medium">{formatMenuItems(quote?.desserts)}</p>
          </div>
        )}

        {/* Beverages */}
        {formatMenuItems(quote?.drinks) && (
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Beverages</span>
            <p className="font-medium">{formatMenuItems(quote?.drinks)}</p>
          </div>
        )}
      </section>

      {/* Wedding Fields */}
      {quote?.event_type === 'wedding' && (
        <>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-pink-700 dark:text-pink-400 flex items-center gap-2">
              <Heart className="h-4 w-4" /> Wedding Details
            </h3>
            <div className="flex flex-wrap gap-2">
              {quote?.ceremony_included && <Badge variant="outline">💒 Ceremony Included</Badge>}
              {quote?.cocktail_hour && <Badge variant="outline">🍸 Cocktail Hour</Badge>}
              {quote?.theme_colors && <Badge variant="outline">🎨 {quote.theme_colors}</Badge>}
            </div>
          </section>
        </>
      )}

      {/* Special Requests */}
      {quote?.special_requests && (
        <>
          <Separator />
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Special Requests
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowMenuEdit(true)}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm italic text-muted-foreground">{quote.special_requests}</p>
          </section>
        </>
      )}

      {/* Government Badge */}
      {isGovernment && (
        <>
          <Separator />
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-blue-700 dark:text-blue-400 font-medium text-sm">
              🏛️ Government Contract (Tax Exempt • Net 30)
            </p>
          </div>
        </>
      )}

      {/* Change History */}
      <Separator />
      <ChangeHistory quoteId={quote?.id} />
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
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!invoice?.id}
            onClick={async () => {
              if (!invoice?.id) {
                toast({ title: 'No estimate available', description: 'Generate an estimate first.', variant: 'destructive' });
                return;
              }
              try {
                toast({ title: 'Generating PDF...', description: 'Please wait' });
                const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
                  body: { invoice_id: invoice.id }
                });
                if (error) throw error;
                if (!data?.pdf_base64) throw new Error('No PDF generated');
                
                // Convert base64 to blob and download
                const binaryString = atob(data.pdf_base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                
                // Download
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename || `estimate-${invoice.invoice_number}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                toast({ title: 'PDF Downloaded' });
              } catch (err: any) {
                console.error('PDF generation error:', err);
                toast({ title: 'PDF Error', description: err.message, variant: 'destructive' });
              }
            }}
          >
            <Printer className="h-4 w-4 mr-1" /> Download PDF
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
        <Button variant="outline" size="sm" onClick={handleSaveCustomerNotes} disabled={updateInvoice.isPending || !notesChanged}>
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

  // Desktop-only full page view
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Events</span>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="hidden md:inline">{quote?.event_name || 'Event & Estimate'}</span>
            <span className="md:hidden">Event Details</span>
          </h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Resizable Panels - fills remaining height */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={40} minSize={30} className="overflow-hidden">
          <ScrollArea className="h-full">
            <EventDetailsPanel />
          </ScrollArea>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={60} minSize={40} className="overflow-hidden">
          <ScrollArea className="h-full">
            <EstimatePanel />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      {showAddItem && <AddLineItemModal invoiceId={invoice?.id} onClose={() => setShowAddItem(false)} />}

      {/* Customer Edit Dialog */}
      <Dialog open={showCustomerEdit} onOpenChange={setShowCustomerEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer & Event Details</DialogTitle>
          </DialogHeader>
          <CustomerEditor 
            quote={quote} 
            onSave={() => {
              setShowCustomerEdit(false);
              queryClient.invalidateQueries({ queryKey: ['quotes'] });
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Menu Edit Dialog */}
      <Dialog open={showMenuEdit} onOpenChange={setShowMenuEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Menu Selections</DialogTitle>
          </DialogHeader>
          <MenuEditorInline 
            quote={quote}
            invoiceId={invoice?.id}
            onSave={() => {
              setShowMenuEdit(false);
              queryClient.invalidateQueries({ queryKey: ['quotes'] });
              queryClient.invalidateQueries({ queryKey: ['line-items', invoice?.id] });
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
