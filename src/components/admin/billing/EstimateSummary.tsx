import { TaxCalculationService } from '@/services/TaxCalculationService';

interface EstimateSummaryProps {
  subtotal: number; // in cents
  isGovernment: boolean;
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function EstimateSummary({ subtotal, isGovernment }: EstimateSummaryProps) {
  const tax = TaxCalculationService.calculateDetailedTax(subtotal, isGovernment);

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCents(subtotal)}</span>
      </div>
      
      {isGovernment ? (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (Exempt)</span>
          <span className="font-medium text-blue-600">$0.00</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hospitality Tax (2%)</span>
            <span className="font-medium">{formatCents(tax.hospitalityTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SC Service Tax (7%)</span>
            <span className="font-medium">{formatCents(tax.serviceTax)}</span>
          </div>
        </>
      )}
      
      <div className="border-t pt-2 mt-2 flex justify-between">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-lg">{formatCents(tax.totalAmount)}</span>
      </div>
    </div>
  );
}
