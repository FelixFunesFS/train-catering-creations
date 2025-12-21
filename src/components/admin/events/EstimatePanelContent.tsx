import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, Plus, Loader2, Printer, X, Eye, RefreshCw, Save, Undo2
} from 'lucide-react';
import { LineItemEditor } from '../billing/LineItemEditor';
import { SortableLineItem } from '../billing/SortableLineItem';
import { EstimateSummary } from '../billing/EstimateSummary';
import { DiscountEditor } from '../billing/DiscountEditor';

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

interface EstimatePanelContentProps {
  invoice: any;
  quote: any;
  sortedLineItems: any[];
  editableLineItems: any[];
  dirtyItemIds: Set<string>;
  loadingItems: boolean;
  customerNotes: string;
  adminNotes: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed' | null;
  discountDescription: string | null;
  isGovernment: boolean;
  isAlreadySent: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  isUpdating: boolean;
  // Callbacks
  onGenerateEstimate: () => void;
  onCustomerNotesChange: (notes: string) => void;
  onAdminNotesChange: (notes: string) => void;
  onPriceChange: (id: string, price: number) => void;
  onQuantityChange: (id: string, qty: number) => void;
  onDescriptionChange: (id: string, desc: string) => void;
  onDeleteItem: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onApplyDiscount: (amount: number, type: 'percentage' | 'fixed', description: string) => void;
  onRemoveDiscount: () => void;
  onAddItemClick: () => void;
  onPreviewClick: () => void;
  onResendClick: () => void;
  onClose: () => void;
  onSaveAllChanges: () => void;
  onDiscardAllChanges: () => void;
  onDownloadPdf: () => void;
  toast: (options: any) => void;
}

export const EstimatePanelContent = memo(function EstimatePanelContent({
  invoice,
  quote,
  sortedLineItems,
  editableLineItems,
  dirtyItemIds,
  loadingItems,
  customerNotes,
  adminNotes,
  subtotal,
  taxAmount,
  total,
  discountAmount,
  discountType,
  discountDescription,
  isGovernment,
  isAlreadySent,
  hasUnsavedChanges,
  isSaving,
  isGenerating,
  isUpdating,
  onGenerateEstimate,
  onCustomerNotesChange,
  onAdminNotesChange,
  onPriceChange,
  onQuantityChange,
  onDescriptionChange,
  onDeleteItem,
  onDragEnd,
  onApplyDiscount,
  onRemoveDiscount,
  onAddItemClick,
  onPreviewClick,
  onResendClick,
  onClose,
  onSaveAllChanges,
  onDiscardAllChanges,
  onDownloadPdf,
  toast,
}: EstimatePanelContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // If no invoice exists, show generate estimate prompt
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center space-y-6">
        <div className="rounded-full bg-muted p-6">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Estimate Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Generate an estimate to create line items from this event's menu selections 
            and service options.
          </p>
        </div>
        <Button 
          onClick={onGenerateEstimate}
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5" />
              Generate Estimate
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
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
            onClick={onDownloadPdf}
          >
            <Printer className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Line Items</h3>
          <Button variant="outline" size="sm" onClick={onAddItemClick}>
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sortedLineItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedLineItems.map(item => {
                  const editableItem = editableLineItems.find(li => li.id === item.id) || item;
                  const isDirty = dirtyItemIds.has(item.id);
                  return (
                    <SortableLineItem key={item.id} id={item.id}>
                      <LineItemEditor
                        item={editableItem}
                        onPriceChange={price => onPriceChange(item.id, price)}
                        onQuantityChange={qty => onQuantityChange(item.id, qty)}
                        onDescriptionChange={desc => onDescriptionChange(item.id, desc)}
                        onDelete={() => onDeleteItem(item.id)}
                        isUpdating={isUpdating}
                        isDirty={isDirty}
                      />
                    </SortableLineItem>
                  );
                })}
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
          onChange={e => onCustomerNotesChange(e.target.value)}
          placeholder="These notes will appear on the customer's estimate..."
          rows={2}
          className="text-sm"
        />
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
          onApplyDiscount={onApplyDiscount}
          onRemoveDiscount={onRemoveDiscount}
          disabled={isUpdating}
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
          onChange={e => onAdminNotesChange(e.target.value)}
          placeholder="Internal notes..."
          rows={2}
          className="text-sm"
        />
      </div>

      {/* Unified Save Bar - appears when there are unsaved changes */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-0 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
          <Badge variant="outline" className="text-amber-700 dark:text-amber-300 border-amber-400 bg-amber-100 dark:bg-amber-900/30">
            ⚠️ Unsaved changes
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDiscardAllChanges} disabled={isSaving}>
              <Undo2 className="h-4 w-4 mr-1" /> Discard
            </Button>
            <Button size="sm" onClick={onSaveAllChanges} disabled={isSaving} className="bg-primary">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          <X className="h-4 w-4 mr-1" /> Close
        </Button>
        {isAlreadySent ? (
          <Button onClick={onResendClick} disabled={!sortedLineItems?.length || hasUnsavedChanges} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-1" /> Resend
          </Button>
        ) : (
          <Button onClick={onPreviewClick} disabled={!sortedLineItems?.length || hasUnsavedChanges} className="flex-1">
            <Eye className="h-4 w-4 mr-1" /> Preview & Send
          </Button>
        )}
      </div>
    </div>
  );
});
