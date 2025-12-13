import { useState } from 'react';
import { InvoicePaymentSummary } from '@/services/PaymentDataService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useLineItems, useUpdateLineItem, useDeleteLineItem } from '@/hooks/useLineItems';
import { useInvoice } from '@/hooks/useInvoices';
import { LineItemEditor } from './LineItemEditor';
import { AddLineItemModal } from './AddLineItemModal';
import { EstimateSummary } from './EstimateSummary';
import { EmailPreview } from './EmailPreview';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Eye, Plus } from 'lucide-react';

interface EstimateEditorProps {
  invoice: InvoicePaymentSummary;
  onClose: () => void;
}

export function EstimateEditor({ invoice, onClose }: EstimateEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  const { data: lineItems, isLoading: loadingItems } = useLineItems(invoice.invoice_id);
  const { data: currentInvoice } = useInvoice(invoice.invoice_id);
  const updateLineItem = useUpdateLineItem();
  const deleteLineItem = useDeleteLineItem();

  const isGovernment = invoice.compliance_level === 'government' || invoice.requires_po_number;

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
    setShowPreview(true);
  };

  const handleSendEstimate = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-customer-portal-email', {
        body: { 
          type: 'estimate_ready',
          quote_request_id: invoice.quote_id,
        }
      });

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('invoices')
        .update({ 
          workflow_status: 'sent',
          sent_at: new Date().toISOString(),
          is_draft: false,
        })
        .eq('id', invoice.invoice_id);

      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      toast({
        title: 'Estimate Sent',
        description: 'Customer has been emailed the estimate.',
      });
      setShowPreview(false);
      onClose();
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

  if (showPreview) {
    return (
      <EmailPreview
        invoice={invoice}
        onClose={() => setShowPreview(false)}
        onConfirmSend={handleSendEstimate}
        isSending={isSending}
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

        <div className="text-sm text-muted-foreground mb-4">
          <p><strong>{invoice.contact_name}</strong> • {invoice.event_name}</p>
          <p>{invoice.guest_count} guests • {invoice.email}</p>
          {isGovernment && (
            <p className="text-blue-600 font-medium mt-1">Government Contract (Tax Exempt)</p>
          )}
        </div>

        <Separator />

        {/* Line Items */}
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
          ) : !lineItems?.length ? (
            <p className="text-center py-4 text-muted-foreground">
              No line items found. Generate from Events tab.
            </p>
          ) : (
            <div className="space-y-2">
              {lineItems.map((item) => (
                <LineItemEditor
                  key={item.id}
                  item={item}
                  onPriceChange={(price) => handlePriceChange(item.id, price)}
                  onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
                  onDelete={() => handleDeleteItem(item.id)}
                  isUpdating={updateLineItem.isPending || deleteLineItem.isPending}
                />
              ))}
            </div>
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

        {/* Totals */}
        <EstimateSummary 
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          isGovernment={isGovernment || false} 
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePreviewClick} disabled={!lineItems?.length}>
            <Eye className="h-4 w-4 mr-2" />
            Preview & Send
          </Button>
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
