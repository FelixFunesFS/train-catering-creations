import { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, Trash2 } from 'lucide-react';

type LineItem = Database['public']['Tables']['invoice_line_items']['Row'];

interface LineItemEditorProps {
  item: LineItem;
  onPriceChange: (price: number) => void;
  onQuantityChange?: (quantity: number) => void;
  onDelete?: () => void;
  isUpdating?: boolean;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function LineItemEditor({ 
  item, 
  onPriceChange, 
  onQuantityChange,
  onDelete,
  isUpdating 
}: LineItemEditorProps) {
  const [priceInput, setPriceInput] = useState(formatCents(item.unit_price));
  const [quantityInput, setQuantityInput] = useState(item.quantity.toString());

  // Sync with external changes
  useEffect(() => {
    setPriceInput(formatCents(item.unit_price));
  }, [item.unit_price]);

  useEffect(() => {
    setQuantityInput(item.quantity.toString());
  }, [item.quantity]);

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

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  const totalCents = item.quantity * (parseFloat(priceInput) * 100 || 0);

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border group">
      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.title || item.category}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Quantity */}
      <div className="w-16 shrink-0">
        <p className="text-xs text-muted-foreground mb-1">Qty</p>
        {onQuantityChange ? (
          <Input
            type="number"
            min={1}
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            onBlur={handleQuantityBlur}
            onKeyDown={(e) => handleKeyDown(e, handleQuantityBlur)}
            className="h-8 text-sm text-center"
            disabled={isUpdating}
          />
        ) : (
          <p className="font-medium text-sm text-center">{item.quantity}</p>
        )}
      </div>

      {/* Unit Price Input */}
      <div className="w-24 shrink-0">
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
            className="pl-6 h-8 text-sm"
            disabled={isUpdating}
          />
        </div>
      </div>

      {/* Total */}
      <div className="text-right w-20 shrink-0">
        <p className="text-xs text-muted-foreground">Total</p>
        <p className="font-semibold text-sm">
          ${(totalCents / 100).toFixed(2)}
        </p>
      </div>

      {/* Delete Button */}
      {onDelete && (
        <div className="shrink-0 pt-4">
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
  );
}
