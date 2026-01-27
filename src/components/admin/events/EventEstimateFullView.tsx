import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaxCalculationService } from '@/services/TaxCalculationService';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInvoice, useInvoiceWithMilestones } from '@/hooks/useInvoices';
import { useLineItems, useDeleteLineItem } from '@/hooks/useLineItems';
import { useCustomLineItems } from '@/hooks/useCustomLineItems';
import { useEditableInvoice } from '@/hooks/useEditableInvoice';
import { usePaymentScheduleSync } from '@/hooks/usePaymentScheduleSync';
import { useEstimateActions } from '@/hooks/useEstimateActions';
import { useRegenerateLineItems } from '@/hooks/useRegenerateLineItems';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, FileText, ArrowLeft } from 'lucide-react';
import { CustomerEditor } from './CustomerEditor';
import { AddLineItemModal } from '../billing/AddLineItemModal';
import { EmailPreview } from '../billing/EmailPreview';
import { LineItemsService } from '@/services/LineItemsService';
import { DragEndEvent } from '@dnd-kit/core';

import { EstimatePanelContent } from './EstimatePanelContent';
import { EventDetailsPanelContent } from './EventDetailsPanelContent';

interface EventEstimateFullViewProps {
  quote: any;
  invoice: any;
  onClose: () => void;
}

export function EventEstimateFullView({ quote, invoice, onClose }: EventEstimateFullViewProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCustomerEdit, setShowCustomerEdit] = useState(false);

  // Data queries
  const { data: lineItems, isLoading: loadingItems } = useLineItems(invoice?.id);
  const { customItems, hasCustomItems } = useCustomLineItems(invoice?.id);
  const { data: currentInvoice } = useInvoice(invoice?.id);
  const { data: invoiceWithMilestones } = useInvoiceWithMilestones(invoice?.id);
  const milestones = invoiceWithMilestones?.milestones || [];
  const deleteLineItem = useDeleteLineItem();
  const { mutate: regenerateLineItems, isPending: isRegeneratingItems } = useRegenerateLineItems();
  // Use the unified editable invoice hook for local state management
  const {
    localLineItems: editableLineItems,
    customerNotes,
    adminNotes,
    updateLineItem: updateLocalLineItem,
    setCustomerNotes,
    setAdminNotes,
    hasUnsavedChanges,
    dirtyItemIds,
    saveAllChanges,
    discardAllChanges,
    syncFromSource,
    isSaving,
  } = useEditableInvoice(invoice?.id, lineItems || [], currentInvoice?.notes);

  const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;

  // Use shared estimate actions hook
  const {
    handleGenerateEstimate,
    isGenerating,
    handleSendEstimate,
    isSending,
    handleDownloadPdf,
    handleApplyDiscount,
    handleRemoveDiscount,
    handleToggleGovernment,
    handleRegenerateMilestones,
    isRegenerating,
    handleMarkEventCompleted,
    isMarkingComplete,
  } = useEstimateActions({
    quoteId: quote?.id,
    invoiceId: invoice?.id,
    invoiceNumber: invoice?.invoice_number,
    onClose,
  });

  // Auto-sync payment milestones when total or government status changes (after initial save)
  usePaymentScheduleSync({
    invoiceId: invoice?.id,
    totalAmount: currentInvoice?.total_amount ?? 0,
    isGovernment,
    enabled: !!invoice?.id && !hasUnsavedChanges, // Only sync when no unsaved changes
  });

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

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
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
  }, [sortedLineItems, invoice?.id, queryClient, toast]);

  // Stable callbacks for line item changes
  const handlePriceChange = useCallback((lineItemId: string, newPrice: number) => {
    updateLocalLineItem(lineItemId, { unit_price: newPrice });
  }, [updateLocalLineItem]);

  const handleQuantityChange = useCallback((lineItemId: string, newQuantity: number) => {
    updateLocalLineItem(lineItemId, { quantity: newQuantity });
  }, [updateLocalLineItem]);

  const handleDeleteItem = useCallback(async (lineItemId: string) => {
    await deleteLineItem.mutateAsync({ lineItemId, invoiceId: invoice?.id });
  }, [deleteLineItem, invoice?.id]);

  const handleDescriptionChange = useCallback((lineItemId: string, desc: string) => {
    updateLocalLineItem(lineItemId, { description: desc });
  }, [updateLocalLineItem]);

  // Handle close - warn if unsaved changes
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmDiscard) return;
      discardAllChanges();
    }
    queryClient.invalidateQueries({ queryKey: ['invoice', invoice?.id] });
    queryClient.invalidateQueries({ queryKey: ['line-items', invoice?.id] });
    onClose();
  }, [hasUnsavedChanges, discardAllChanges, queryClient, invoice?.id, onClose]);

  const handlePreviewClick = useCallback(() => {
    if (hasUnsavedChanges) {
      toast({ title: 'Unsaved Changes', description: 'Please save your changes before previewing.', variant: 'destructive' });
      return;
    }
    const unpricedItems = lineItems?.filter(li => li.unit_price === 0) || [];
    if (unpricedItems.length > 0) {
      toast({ title: 'Missing Prices', description: `${unpricedItems.length} item(s) need pricing.`, variant: 'destructive' });
      return;
    }
    setIsResendMode(false);
    setShowPreview(true);
  }, [hasUnsavedChanges, lineItems, toast]);

  const handleResendClick = useCallback(() => {
    setIsResendMode(true);
    setShowPreview(true);
  }, []);

  const handleConfirmSend = useCallback(async (overrideEmail?: string) => {
    await handleSendEstimate(overrideEmail, isResendMode);
    setShowPreview(false);
    if (!isResendMode) handleClose();
  }, [handleSendEstimate, isResendMode, handleClose]);

  const discountAmount = (currentInvoice as any)?.discount_amount ?? 0;
  const discountType = (currentInvoice as any)?.discount_type as 'percentage' | 'fixed' | null;
  const discountDescription = (currentInvoice as any)?.discount_description as string | null;
  const isAlreadySent = currentInvoice?.workflow_status === 'sent' || currentInvoice?.workflow_status === 'viewed';

  // Totals: use database values when no unsaved changes, otherwise calculate live
  const { subtotal, taxAmount, total } = useMemo(() => {
    // When no unsaved changes, use database values (single source of truth)
    if (!hasUnsavedChanges && currentInvoice) {
      return {
        subtotal: currentInvoice.subtotal ?? 0,
        taxAmount: currentInvoice.tax_amount ?? 0,
        total: currentInvoice.total_amount ?? 0,
      };
    }
    
    // Otherwise, calculate live from editable line items for immediate preview
    const calculatedSubtotal = editableLineItems.reduce(
      (sum, item) => sum + (item.total_price || 0), 
      0
    );
    
    // Use TaxCalculationService for consistent tax calculation with discount
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

  const handleAddItemClick = useCallback(() => setShowAddItem(true), []);
  const handleEditCustomer = useCallback(() => setShowCustomerEdit(true), []);
  const handleEditMenu = useCallback(() => {
    if (!quote?.id) return;
    navigate(`/admin/event/${quote.id}/menu`);
  }, [navigate, quote?.id]);
  const handleRegenerateLineItems = useCallback(() => {
    if (invoice?.id && quote?.id) {
      regenerateLineItems({ invoiceId: invoice.id, quoteId: quote.id });
    }
  }, [invoice?.id, quote?.id, regenerateLineItems]);

  if (showPreview) {
    return (
      <EmailPreview
        invoice={{ ...invoice, quote_id: quote?.id, email: quote?.email, contact_name: quote?.contact_name }}
        onClose={() => setShowPreview(false)}
        onConfirmSend={handleConfirmSend}
        isSending={isSending}
        isResend={isResendMode}
      />
    );
  }

  // Desktop-only full page view
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose} className="gap-2">
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
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close panel">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Resizable Panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 h-[calc(100vh-3.5rem)]">
        <ResizablePanel defaultSize={30} minSize={20} className="flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 h-0">
            <EventDetailsPanelContent
              quote={quote}
              invoice={invoice}
              milestones={milestones}
              totalAmount={total}
              isGovernment={isGovernment}
              isRegenerating={isRegenerating}
              onRegenerateMilestones={handleRegenerateMilestones}
              onToggleGovernment={handleToggleGovernment}
              onEditCustomer={handleEditCustomer}
              onEditMenu={handleEditMenu}
              onMarkCompleted={handleMarkEventCompleted}
              isMarkingComplete={isMarkingComplete}
            />
          </ScrollArea>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={70} minSize={40} className="flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 h-0">
            <EstimatePanelContent
              invoice={invoice}
              quote={quote}
              sortedLineItems={sortedLineItems}
              editableLineItems={editableLineItems}
              dirtyItemIds={dirtyItemIds}
              loadingItems={loadingItems}
              customerNotes={customerNotes}
              adminNotes={adminNotes}
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
              discountAmount={discountAmount}
              discountType={discountType}
              discountDescription={discountDescription}
              isGovernment={isGovernment}
              isAlreadySent={isAlreadySent}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              isGenerating={isGenerating}
              isUpdating={deleteLineItem.isPending || isSaving}
              isRegeneratingItems={isRegeneratingItems}
              onGenerateEstimate={handleGenerateEstimate}
              onCustomerNotesChange={setCustomerNotes}
              onAdminNotesChange={setAdminNotes}
              onPriceChange={handlePriceChange}
              onQuantityChange={handleQuantityChange}
              onDescriptionChange={handleDescriptionChange}
              onDeleteItem={handleDeleteItem}
              onDragEnd={handleDragEnd}
              onApplyDiscount={handleApplyDiscount}
              onRemoveDiscount={handleRemoveDiscount}
              onAddItemClick={handleAddItemClick}
              onPreviewClick={handlePreviewClick}
              onResendClick={handleResendClick}
              onClose={handleClose}
              onSaveAllChanges={saveAllChanges}
              onDiscardAllChanges={discardAllChanges}
              onDownloadPdf={handleDownloadPdf}
              onRegenerateLineItems={handleRegenerateLineItems}
              toast={toast}
            />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      {showAddItem && <AddLineItemModal invoiceId={invoice?.id} onClose={() => setShowAddItem(false)} />}

      {/* Customer Edit Dialog */}
      <Dialog open={showCustomerEdit} onOpenChange={setShowCustomerEdit}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
    </div>
  );
}
