import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Percent, DollarSign, Tag, X } from 'lucide-react';

interface DiscountEditorProps {
  discountAmount: number;
  discountType: 'percentage' | 'fixed' | null;
  discountDescription: string | null;
  subtotal: number;
  onApplyDiscount: (amount: number, type: 'percentage' | 'fixed', description: string) => void;
  onRemoveDiscount: () => void;
  disabled?: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function DiscountEditor({
  discountAmount,
  discountType,
  discountDescription,
  subtotal,
  onApplyDiscount,
  onRemoveDiscount,
  disabled,
}: DiscountEditorProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'percentage' | 'fixed'>(discountType || 'percentage');
  const [amount, setAmount] = useState(discountAmount > 0 ? String(discountType === 'fixed' ? discountAmount / 100 : discountAmount) : '');
  const [description, setDescription] = useState(discountDescription || '');

  const hasDiscount = discountAmount > 0 && discountType;

  // Calculate the discount value in cents for display
  const discountInCents = hasDiscount
    ? discountType === 'percentage'
      ? Math.round(subtotal * (discountAmount / 100))
      : discountAmount
    : 0;

  const handleApply = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // For fixed, convert dollars to cents
    const finalAmount = type === 'fixed' ? Math.round(numAmount * 100) : numAmount;
    onApplyDiscount(finalAmount, type, description || (type === 'percentage' ? `${numAmount}% Discount` : 'Discount'));
    setOpen(false);
  };

  const handleRemove = () => {
    onRemoveDiscount();
    setAmount('');
    setDescription('');
    setType('percentage');
    setOpen(false);
  };

  if (hasDiscount) {
    return (
      <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-emerald-600" />
          <span className="font-medium text-emerald-800">
            {discountDescription || 'Discount'}
          </span>
          <span className="text-emerald-600">
            {discountType === 'percentage' ? `${discountAmount}%` : formatCurrency(discountAmount)}
          </span>
          <span className="text-emerald-700">
            (-{formatCurrency(discountInCents)})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={disabled}
          className="h-7 w-7 p-0 text-emerald-600 hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Tag className="h-4 w-4 mr-1" />
          Add Discount
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="font-medium text-sm">Apply Discount</div>

          <RadioGroup
            value={type}
            onValueChange={(v) => setType(v as 'percentage' | 'fixed')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="discount-percentage" />
              <Label htmlFor="discount-percentage" className="flex items-center gap-1 cursor-pointer">
                <Percent className="h-4 w-4" />
                Percentage
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="discount-fixed" />
              <Label htmlFor="discount-fixed" className="flex items-center gap-1 cursor-pointer">
                <DollarSign className="h-4 w-4" />
                Fixed Amount
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="discount-amount">
              {type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
            </Label>
            <div className="relative">
              <Input
                id="discount-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={type === 'percentage' ? '10' : '50.00'}
                min="0"
                step={type === 'percentage' ? '1' : '0.01'}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {type === 'percentage' ? '%' : '$'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount-description">Description (optional)</Label>
            <Input
              id="discount-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Military Discount, Repeat Customer"
            />
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              Preview: {type === 'percentage' 
                ? `-${amount}% = -${formatCurrency(Math.round(subtotal * (parseFloat(amount) / 100)))}`
                : `-${formatCurrency(Math.round(parseFloat(amount) * 100))}`
              }
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleApply}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Apply Discount
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
