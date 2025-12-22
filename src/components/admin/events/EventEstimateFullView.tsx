import { useState, useMemo, useCallback } from 'react';
import { TaxCalculationService } from '@/services/TaxCalculationService';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInvoice, useUpdateInvoice, useInvoiceWithMilestones } from '@/hooks/useInvoices';
import { useLineItems, useDeleteLineItem } from '@/hooks/useLineItems';
import { useCustomLineItems } from '@/hooks/useCustomLineItems';
import { useEditableInvoice } from '@/hooks/useEditableInvoice';
import { usePaymentScheduleSync } from '@/hooks/usePaymentScheduleSync';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, FileText, ArrowLeft } from 'lucide-react';
import { CustomerEditor } from './CustomerEditor';
import { MenuEditorInline } from './MenuEditorInline';
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

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCustomerEdit, setShowCustomerEdit] = useState(false);
  const [showMenuEdit, setShowMenuEdit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Data queries
  const { data: lineItems, isLoading: loadingItems } = useLineItems(invoice?.id);
  const { customItems, hasCustomItems } = useCustomLineItems(invoice?.id);
  const { data: currentInvoice } = useInvoice(invoice?.id);
  const { data: invoiceWithMilestones, refetch: refetchMilestones } = useInvoiceWithMilestones(invoice?.id);
  const milestones = invoiceWithMilestones?.milestones || [];
  const deleteLineItem = useDeleteLineItem();
  const updateInvoice = useUpdateInvoice();
  
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

  // Handle generating estimate when none exists
  const handleGenerateEstimate = useCallback(async () => {
    if (!quote?.id) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-from-quote', {
        body: { quote_request_id: quote.id }
      });
      if (error) throw error;

      toast({ title: 'Estimate Generated', description: 'Line items created successfully.' });
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-by-quote', quote.id] });
      queryClient.invalidateQueries({ queryKey: ['line-items'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [quote?.id, toast, queryClient]);

  const handleRegenerateMilestones = useCallback(async () => {
    if (!invoice?.id) return;
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-payment-milestones', {
        body: { invoice_id: invoice.id, force_regenerate: true }
      });
      if (error) throw error;
      await refetchMilestones();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Payment schedule regenerated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsRegenerating(false);
    }
  }, [invoice?.id, refetchMilestones, queryClient, toast]);

  // Handle government contract toggle
  const handleToggleGovernment = useCallback(async (checked: boolean) => {
    if (!quote?.id) return;
    
    try {
      // 1. Update quote's compliance level
      const { error } = await supabase
        .from('quote_requests')
        .update({ 
          compliance_level: checked ? 'government' : 'standard',
          requires_po_number: checked,
        })
        .eq('id', quote.id);
        
      if (error) throw error;
      
      // 2. Force recalculate invoice totals (single source of truth)
      if (invoice?.id) {
        const { error: rpcError } = await supabase.rpc('force_recalculate_invoice_totals', {
          p_invoice_id: invoice.id
        });
        if (rpcError) {
          console.error('RPC error:', rpcError);
        }
      }
      
      // 3. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['quote', quote.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice?.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      toast({ 
        title: checked ? 'Government Contract Enabled' : 'Government Contract Disabled',
        description: checked ? 'Tax exemption and Net 30 terms applied.' : 'Standard payment terms applied.',
      });
      
      // 4. Regenerate milestones with new government status
      handleRegenerateMilestones();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [quote?.id, invoice?.id, queryClient, toast, handleRegenerateMilestones]);

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
      toast({ title: isResendMode ? 'Estimate Resent' : 'Estimate Sent', description: `Email sent to ${overrideEmail || quote?.email}` });
      setShowPreview(false);
      if (!isResendMode) handleClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  }, [quote?.id, quote?.email, invoice?.id, isResendMode, queryClient, toast, handleClose]);

  const discountAmount = (currentInvoice as any)?.discount_amount ?? 0;
  const discountType = (currentInvoice as any)?.discount_type as 'percentage' | 'fixed' | null;
  const discountDescription = (currentInvoice as any)?.discount_description as string | null;
  const isAlreadySent = currentInvoice?.workflow_status === 'sent' || currentInvoice?.workflow_status === 'viewed';

  // Live-calculated totals from editable line items
  const { subtotal, taxAmount, total } = useMemo(() => {
    // Calculate subtotal from local editable line items
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
  }, [editableLineItems, discountAmount, discountType, discountDescription, isGovernment]);

  const handleApplyDiscount = useCallback(async (amount: number, type: 'percentage' | 'fixed', description: string) => {
    await updateInvoice.mutateAsync({
      invoiceId: invoice?.id,
      updates: { discount_amount: amount, discount_type: type, discount_description: description } as any,
    });
  }, [updateInvoice, invoice?.id]);

  const handleRemoveDiscount = useCallback(async () => {
    await updateInvoice.mutateAsync({
      invoiceId: invoice?.id,
      updates: { discount_amount: 0, discount_type: null, discount_description: null } as any,
    });
  }, [updateInvoice, invoice?.id]);

  const handleDownloadPdf = useCallback(async () => {
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: 'PDF Downloaded' });
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast({ title: 'PDF Error', description: err.message, variant: 'destructive' });
    }
  }, [invoice?.id, invoice?.invoice_number, toast]);

  const handleAddItemClick = useCallback(() => setShowAddItem(true), []);
  const handleEditCustomer = useCallback(() => setShowCustomerEdit(true), []);
  const handleEditMenu = useCallback(() => setShowMenuEdit(true), []);

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

      {/* Menu Edit Dialog */}
      <Dialog open={showMenuEdit} onOpenChange={setShowMenuEdit}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
