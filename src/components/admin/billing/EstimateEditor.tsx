import { useState, useMemo } from 'react';
import { InvoicePaymentSummary } from '@/services/PaymentDataService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useLineItems, useUpdateLineItem, useDeleteLineItem } from '@/hooks/useLineItems';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { LineItemEditor } from './LineItemEditor';
import { AddLineItemModal } from './AddLineItemModal';
import { EstimateSummary } from './EstimateSummary';
import { EmailPreview } from './EmailPreview';
import { SortableLineItem } from './SortableLineItem';
import { DiscountEditor } from './DiscountEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Eye, Plus, RefreshCw, MapPin, Leaf, MessageSquare } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { LineItemsService } from '@/services/LineItemsService';

interface EstimateEditorProps {
  invoice: InvoicePaymentSummary;
  onClose: () => void;
}

export function EstimateEditor({ invoice, onClose }: EstimateEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  const { data: lineItems, isLoading: loadingItems } = useLineItems(invoice.invoice_id);
  const { data: currentInvoice } = useInvoice(invoice.invoice_id);
  const updateLineItem = useUpdateLineItem();
  const deleteLineItem = useDeleteLineItem();
  const updateInvoice = useUpdateInvoice();

  // Stable sorting to prevent items from jumping during edits
  const sortedLineItems = useMemo(() => {
    if (!lineItems) return [];
    return [...lineItems].sort((a, b) => {
      // Primary sort by sort_order
      const sortA = a.sort_order ?? 0;
      const sortB = b.sort_order ?? 0;
      if (sortA !== sortB) {
        return sortA - sortB;
      }
      // Secondary sort by created_at for items with same sort_order
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [lineItems]);

  // DnD sensors with activation constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isGovernment = invoice.compliance_level === 'government' || invoice.requires_po_number;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedLineItems.findIndex(item => item.id === active.id);
    const newIndex = sortedLineItems.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate new sort_order based on neighbors
    let newSortOrder: number;
    if (newIndex === 0) {
      // Moving to first position
      newSortOrder = (sortedLineItems[0]?.sort_order ?? 10) - 10;
    } else if (newIndex >= sortedLineItems.length - 1) {
      // Moving to last position
      newSortOrder = (sortedLineItems[sortedLineItems.length - 1]?.sort_order ?? 0) + 10;
    } else {
      // Moving between two items - calculate midpoint
      const beforeItem = oldIndex < newIndex ? sortedLineItems[newIndex] : sortedLineItems[newIndex - 1];
      const afterItem = oldIndex < newIndex ? sortedLineItems[newIndex + 1] : sortedLineItems[newIndex];
      const beforeOrder = beforeItem?.sort_order ?? 0;
      const afterOrder = afterItem?.sort_order ?? beforeOrder + 20;
      newSortOrder = Math.floor((beforeOrder + afterOrder) / 2);
    }

    try {
      await LineItemsService.updateLineItem(active.id as string, { sort_order: newSortOrder });
      queryClient.invalidateQueries({ queryKey: ['line-items', invoice.invoice_id] });
    } catch (err) {
      toast({
        title: 'Reorder Failed',
        description: 'Could not update item position.',
        variant: 'destructive',
      });
    }
  };

  const handlePriceChange = async (lineItemId: string, newPrice: number) => {
    const item = lineItems?.find(li => li.id === lineItemId);
    if (!item) return;

    await updateLineItem.mutateAsync({
      lineItemId,
      invoiceId: invoice.invoice_id,
      updates: {
        unit_price: newPrice,
        total_price: newPrice * item.quantity,
      },
    });
  };

  const handleQuantityChange = async (lineItemId: string, newQuantity: number) => {
    const item = lineItems?.find(li => li.id === lineItemId);
    if (!item) return;

    await updateLineItem.mutateAsync({
      lineItemId,
      invoiceId: invoice.invoice_id,
      updates: {
        quantity: newQuantity,
        total_price: item.unit_price * newQuantity,
      },
    });
  };

  const handleDeleteItem = async (lineItemId: string) => {
    await deleteLineItem.mutateAsync({
      lineItemId,
      invoiceId: invoice.invoice_id,
    });
  };

  const handleDescriptionChange = async (lineItemId: string, newDescription: string) => {
    await updateLineItem.mutateAsync({
      lineItemId,
      invoiceId: invoice.invoice_id,
      updates: { description: newDescription },
    });
  };

  const handlePreviewClick = () => {
    // Check if all items have pricing
    const unpricedItems = lineItems?.filter(li => li.unit_price === 0) || [];
    if (unpricedItems.length > 0) {
      toast({
        title: 'Missing Prices',
        description: `${unpricedItems.length} item(s) still need pricing.`,
        variant: 'destructive',
      });
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
        body: { 
          type: 'estimate_ready',
          quote_request_id: invoice.quote_id,
          override_email: overrideEmail,
        }
      });

      if (error) throw error;

      // Update invoice status (only if first send)
      if (!isResendMode) {
        await supabase
          .from('invoices')
          .update({ 
            workflow_status: 'sent',
            sent_at: new Date().toISOString(),
            is_draft: false,
          })
          .eq('id', invoice.invoice_id);
      }

      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      toast({
        title: isResendMode ? 'Estimate Resent' : 'Estimate Sent',
        description: `Email sent to ${overrideEmail || invoice.email}`,
      });
      setShowPreview(false);
      if (!isResendMode) onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send estimate',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Use database values as single source of truth (calculated by DB trigger)
  const subtotal = currentInvoice?.subtotal ?? 0;
  const taxAmount = currentInvoice?.tax_amount ?? 0;
  const total = currentInvoice?.total_amount ?? 0;
  
  // Discount values from invoice
  const discountAmount = (currentInvoice as any)?.discount_amount ?? 0;
  const discountType = (currentInvoice as any)?.discount_type as 'percentage' | 'fixed' | null;
  const discountDescription = (currentInvoice as any)?.discount_description as string | null;

  const isAlreadySent = currentInvoice?.workflow_status === 'sent' || currentInvoice?.workflow_status === 'viewed';

  const handleApplyDiscount = async (amount: number, type: 'percentage' | 'fixed', description: string) => {
    await updateInvoice.mutateAsync({
      invoiceId: invoice.invoice_id,
      updates: {
        discount_amount: amount,
        discount_type: type,
        discount_description: description,
      } as any,
    });
  };

  const handleRemoveDiscount = async () => {
    await updateInvoice.mutateAsync({
      invoiceId: invoice.invoice_id,
      updates: {
        discount_amount: 0,
        discount_type: null,
        discount_description: null,
      } as any,
    });
  };

  if (showPreview) {
    return (
      <EmailPreview
        invoice={invoice}
        onClose={() => setShowPreview(false)}
        onConfirmSend={handleSendEstimate}
        isSending={isSending}
        isResend={isResendMode}
      />
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Estimate - {invoice.invoice_number || 'Draft'}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-4 space-y-1">
          <p><strong>{invoice.contact_name}</strong> • {invoice.event_name}</p>
          <p>{invoice.guest_count} guests • {invoice.email}</p>
          {invoice.location && (
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {invoice.location}
            </p>
          )}
          {invoice.guest_count_with_restrictions && (
            <p className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Leaf className="h-3 w-3" /> Vegetarian Portions: {invoice.guest_count_with_restrictions} guests
            </p>
          )}
          {invoice.special_requests && (
            <p className="flex items-start gap-1 italic">
              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" /> 
              <span>Special Requests: {invoice.special_requests}</span>
            </p>
          )}
          {isGovernment && (
            <p className="text-blue-600 font-medium">Government Contract (Tax Exempt)</p>
          )}
        </div>

        <Separator />

        {/* Line Items with Drag-and-Drop */}
        <div className="space-y-4 my-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Line Items</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddItem(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          {loadingItems ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !sortedLineItems?.length ? (
            <p className="text-center py-4 text-muted-foreground">
              No line items found. Generate from Events tab.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedLineItems.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedLineItems.map((item) => (
                    <SortableLineItem key={item.id} id={item.id}>
                      <LineItemEditor
                        item={item}
                        onPriceChange={(price) => handlePriceChange(item.id, price)}
                        onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
                        onDescriptionChange={(desc) => handleDescriptionChange(item.id, desc)}
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

        {/* Admin Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Admin Notes (Internal)</label>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="e.g., Customer called to add appetizers..."
            rows={2}
            className="text-sm"
          />
        </div>

        <Separator />

        {/* Discount Section */}
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
          isGovernment={isGovernment || false}
          discountAmount={discountAmount}
          discountType={discountType}
          discountDescription={discountDescription}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isAlreadySent ? (
            <Button onClick={handleResendClick} disabled={!lineItems?.length} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend Estimate
            </Button>
          ) : (
            <Button onClick={handlePreviewClick} disabled={!lineItems?.length}>
              <Eye className="h-4 w-4 mr-2" />
              Preview & Send
            </Button>
          )}
        </div>

        {/* Add Line Item Modal */}
        {showAddItem && (
          <AddLineItemModal
            invoiceId={invoice.invoice_id!}
            onClose={() => setShowAddItem(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
