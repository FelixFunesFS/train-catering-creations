import { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Trash2 } from 'lucide-react';

type LineItem = Database['public']['Tables']['invoice_line_items']['Row'];

interface LineItemEditorProps {
  item: LineItem;
  onPriceChange: (price: number) => void;
  onQuantityChange?: (quantity: number) => void;
  onDescriptionChange?: (description: string) => void;
  onDelete?: () => void;
  isUpdating?: boolean;
  readOnly?: boolean;
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
  readOnly = false
}: LineItemEditorProps) {
  const [priceInput, setPriceInput] = useState(formatCents(item.unit_price));
  const [quantityInput, setQuantityInput] = useState(item.quantity.toString());
  const [descriptionInput, setDescriptionInput] = useState(item.description || '');

  // Sync with external changes
  useEffect(() => {
    setPriceInput(formatCents(item.unit_price));
  }, [item.unit_price]);

  useEffect(() => {
    setQuantityInput(item.quantity.toString());
  }, [item.quantity]);

  useEffect(() => {
    setDescriptionInput(item.description || '');
  }, [item.description]);

  const handlePriceBlur = () => {
    const parsed = parseFloat(priceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      const cents = Math.round(parsed * 100);
      if (cents !== item.unit_price) {
        onPriceChange(cents);
      }
    } else {
      setPriceInput(formatCents(item.unit_price));
    }
  };

  const handleQuantityBlur = () => {
    const parsed = parseInt(quantityInput);
    if (!isNaN(parsed) && parsed > 0 && onQuantityChange) {
      if (parsed !== item.quantity) {
        onQuantityChange(parsed);
      }
    } else {
      setQuantityInput(item.quantity.toString());
    }
  };

  const handleDescriptionBlur = () => {
    if (onDescriptionChange && descriptionInput !== item.description) {
      onDescriptionChange(descriptionInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  const totalCents = item.quantity * (parseFloat(priceInput) * 100 || 0);

  const totalCentsCalculated = item.quantity * item.unit_price;

  // Read-only display mode
  if (readOnly) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-muted/30 rounded-lg border">
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
            <p className="font-semibold">${formatCents(totalCentsCalculated)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-muted/30 rounded-lg border group">
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
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {onDescriptionChange ? (
          <Textarea
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            onBlur={handleDescriptionBlur}
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
          <p className="text-xs text-muted-foreground mb-1">Qty</p>
          {onQuantityChange ? (
            <Input
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
          <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
          <div className="relative">
            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
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
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
