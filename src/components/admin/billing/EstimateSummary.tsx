import { Tag } from 'lucide-react';

interface EstimateSummaryProps {
  subtotal: number; // in cents
  taxAmount: number; // in cents
  total: number; // in cents
  isGovernment: boolean;
  discountAmount?: number; // in cents (for fixed) or percentage points (for percentage)
  discountType?: 'percentage' | 'fixed' | null;
  discountDescription?: string | null;
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function EstimateSummary({ 
  subtotal, 
  taxAmount, 
  total, 
  isGovernment,
  discountAmount = 0,
  discountType,
  discountDescription
}: EstimateSummaryProps) {
  // Calculate discount in cents
  const discountInCents = discountType === 'percentage' && discountAmount > 0
    ? Math.round(subtotal * (discountAmount / 100))
    : discountType === 'fixed' && discountAmount > 0
      ? discountAmount
      : 0;

  // Subtotal after discount for tax calculation reference
  const subtotalAfterDiscount = subtotal - discountInCents;

  // Calculate breakdown from total tax (9% = 2% hospitality + 7% service)
  const hospitalityTax = isGovernment ? 0 : Math.round(taxAmount * (2 / 9));
  const serviceTax = isGovernment ? 0 : taxAmount - hospitalityTax;

  const hasDiscount = discountInCents > 0;

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCents(subtotal)}</span>
      </div>

      {/* Discount Line */}
      {hasDiscount && (
        <div className="flex justify-between text-sm text-emerald-600">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {discountDescription || 'Discount'}
            {discountType === 'percentage' && ` (${discountAmount}%)`}
          </span>
          <span className="font-medium">-{formatCents(discountInCents)}</span>
        </div>
      )}

      {/* Subtotal after discount (only show if there's a discount) */}
      {hasDiscount && (
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-muted-foreground">After Discount</span>
          <span className="font-medium">{formatCents(subtotalAfterDiscount)}</span>
        </div>
      )}
      
      {isGovernment ? (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (Exempt)</span>
          <span className="font-medium text-blue-600">$0.00</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hospitality Tax (2%)</span>
            <span className="font-medium">{formatCents(hospitalityTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SC Service Tax (7%)</span>
            <span className="font-medium">{formatCents(serviceTax)}</span>
          </div>
        </>
      )}
      
      <div className="border-t-2 border-gold/30 pt-3 mt-2 flex justify-between items-center">
        <span className="font-semibold text-lg">Total</span>
        <span className="font-bold text-xl text-gold-dark dark:text-gold">{formatCents(total)}</span>
      </div>
    </div>
  );
}
