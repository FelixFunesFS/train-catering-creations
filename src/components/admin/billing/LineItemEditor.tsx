import { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

type LineItem = Database['public']['Tables']['invoice_line_items']['Row'];

interface LineItemEditorProps {
  item: LineItem;
  onPriceChange: (price: number) => void;
  isUpdating?: boolean;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function LineItemEditor({ item, onPriceChange, isUpdating }: LineItemEditorProps) {
  const [priceInput, setPriceInput] = useState(formatCents(item.unit_price));

  // Sync with external changes
  useEffect(() => {
    setPriceInput(formatCents(item.unit_price));
  }, [item.unit_price]);

  const handleBlur = () => {
    const parsed = parseFloat(priceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      const cents = Math.round(parsed * 100);
      if (cents !== item.unit_price) {
        onPriceChange(cents);
      }
    } else {
      // Reset to current value if invalid
      setPriceInput(formatCents(item.unit_price));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const totalCents = item.quantity * (parseFloat(priceInput) * 100 || 0);

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
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
      <div className="text-center shrink-0">
        <p className="text-xs text-muted-foreground">Qty</p>
        <p className="font-medium text-sm">{item.quantity}</p>
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
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
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
    </div>
  );
}
