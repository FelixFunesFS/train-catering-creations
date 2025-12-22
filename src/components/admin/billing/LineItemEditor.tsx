import { useState } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DollarSign, Trash2 } from 'lucide-react';
import { getCategoryColors } from '@/utils/formatters';
import { cn } from '@/lib/utils';

type LineItem = Database['public']['Tables']['invoice_line_items']['Row'];

interface LineItemEditorProps {
  item: LineItem;
  onPriceChange: (price: number) => void;
  onQuantityChange?: (quantity: number) => void;
  onDescriptionChange?: (description: string) => void;
  onDelete?: () => void;
  isUpdating?: boolean;
  readOnly?: boolean;
  isDirty?: boolean;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function LineItemEditor({ 
  item, 
  onPriceChange, 
  onQuantityChange,
  onDescriptionChange,
  onDelete,
  isUpdating,
  readOnly = false,
  isDirty = false
}: LineItemEditorProps) {
  // Local input state for controlled inputs
  const [priceInput, setPriceInput] = useState(formatCents(item.unit_price));
  const [quantityInput, setQuantityInput] = useState(item.quantity.toString());

  // Handle price change - update local state immediately, call onChange on blur
  const handlePriceChange = (value: string) => {
    setPriceInput(value);
  };
  
  const handlePriceBlur = () => {
    const parsed = parseFloat(priceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      const cents = Math.round(parsed * 100);
      onPriceChange(cents);
    } else {
      // Reset to item value if invalid
      setPriceInput(formatCents(item.unit_price));
    }
  };

  // Handle quantity change - update local state immediately, call onChange on blur
  const handleQuantityInputChange = (value: string) => {
    setQuantityInput(value);
  };
  
  const handleQuantityBlur = () => {
    const parsed = parseInt(quantityInput);
    if (!isNaN(parsed) && parsed > 0 && onQuantityChange) {
      onQuantityChange(parsed);
    } else {
      // Reset to item value if invalid
      setQuantityInput(item.quantity.toString());
    }
  };

  // Handle description change - call onChange immediately for local state update
  const handleDescriptionChange = (desc: string) => {
    if (onDescriptionChange) {
      onDescriptionChange(desc);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, handler: () => void) => {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLInputElement).blur();
      handler();
    }
  };

  const totalCents = item.quantity * item.unit_price;
  const categoryColors = getCategoryColors(item.category || 'services');

  // Read-only display mode
  if (readOnly) {
    return (
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-muted/30 rounded-lg border-l-4",
        categoryColors.border
      )}>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-medium text-sm">{item.title || item.category}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex items-end gap-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Qty</p>
            <p className="font-medium">{item.quantity}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Unit</p>
            <p className="font-medium">${formatCents(item.unit_price)}</p>
          </div>
          <div className="text-right min-w-[70px]">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">${formatCents(totalCents)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-muted/30 rounded-lg group border-l-4",
      categoryColors.border,
      isDirty ? "border border-amber-400 dark:border-amber-600" : "border"
    )}>
      {/* Item Info - Title + Editable Description */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between sm:block">
          <p className="font-medium text-sm">{item.title || item.category}</p>
        {/* Mobile delete button */}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive sm:hidden"
              onClick={onDelete}
              disabled={isUpdating}
              aria-label="Delete line item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {onDescriptionChange ? (
          <Textarea
            value={item.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="text-xs min-h-[60px] resize-y"
            disabled={isUpdating}
            placeholder="Item description..."
          />
        ) : (
          item.description && (
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {item.description}
            </p>
          )
        )}
      </div>

      {/* Qty, Price, Total Row */}
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Quantity */}
        <div className="flex-1 sm:flex-none sm:w-16">
          <Label htmlFor={`qty-${item.id}`} className="text-xs text-muted-foreground mb-1 block">Qty</Label>
          {onQuantityChange ? (
            <Input
              id={`qty-${item.id}`}
              type="number"
              min={1}
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              onBlur={handleQuantityBlur}
              onKeyDown={(e) => handleKeyDown(e, handleQuantityBlur)}
              className="h-9 sm:h-8 text-sm text-center"
              disabled={isUpdating}
            />
          ) : (
            <p className="font-medium text-sm text-center">{item.quantity}</p>
          )}
        </div>

        {/* Unit Price Input */}
        <div className="flex-1 sm:flex-none sm:w-24">
          <Label htmlFor={`price-${item.id}`} className="text-xs text-muted-foreground mb-1 block">Unit Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              id={`price-${item.id}`}
              type="text"
              inputMode="decimal"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={(e) => handleKeyDown(e, handlePriceBlur)}
              className="pl-6 h-9 sm:h-8 text-sm"
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Total */}
        <div className="text-right flex-1 sm:flex-none sm:w-20">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold text-sm">
            ${(totalCents / 100).toFixed(2)}
          </p>
        </div>

        {/* Desktop Delete Button */}
        {onDelete && (
          <div className="hidden sm:block shrink-0 pt-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDelete}
              disabled={isUpdating}
              aria-label="Delete line item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
