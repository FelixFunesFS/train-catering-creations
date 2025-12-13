import React from 'react';
import { Separator } from '@/components/ui/separator';
import { TaxCalculationService, type DetailedTaxCalculation } from '@/services/TaxCalculationService';
import { Badge } from '@/components/ui/badge';

interface PricingTotalsProps {
  subtotal: number; // in cents
  isGovernmentContract?: boolean;
  showTaxBreakdown?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Unified Pricing Totals Component
 * Single source of truth for displaying subtotal, tax, and total
 * Always uses TaxCalculationService for calculations
 */
export function PricingTotals({
  subtotal,
  isGovernmentContract = false,
  showTaxBreakdown = false,
  className = '',
  size = 'md'
}: PricingTotalsProps) {
  // Always get detailed calculation to have access to breakdown if needed
  const taxCalculation = TaxCalculationService.calculateDetailedTax(subtotal, isGovernmentContract);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const totalSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  }[size];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Subtotal */}
      <div className={`flex justify-between ${textSize}`}>
        <span className="text-muted-foreground">Subtotal:</span>
        <span>{formatCurrency(taxCalculation.subtotal)}</span>
      </div>

      {/* Tax - Show breakdown if requested */}
      {taxCalculation.isExempt ? (
        <div className={`flex justify-between ${textSize}`}>
          <span className="text-muted-foreground flex items-center gap-2">
            Tax:
            <Badge variant="outline" className="text-xs">Exempt</Badge>
          </span>
          <span>$0.00</span>
        </div>
      ) : showTaxBreakdown ? (
        <>
          <div className={`flex justify-between ${textSize}`}>
            <span className="text-muted-foreground">
              Hospitality Tax ({TaxCalculationService.formatTaxRate(taxCalculation.hospitalityTaxRate)}):
            </span>
            <span>{formatCurrency(taxCalculation.hospitalityTax)}</span>
          </div>
          <div className={`flex justify-between ${textSize}`}>
            <span className="text-muted-foreground">
              Service Tax ({TaxCalculationService.formatTaxRate(taxCalculation.serviceTaxRate)}):
            </span>
            <span>{formatCurrency(taxCalculation.serviceTax)}</span>
          </div>
        </>
      ) : (
        <div className={`flex justify-between ${textSize}`}>
          <span className="text-muted-foreground">
            Tax ({TaxCalculationService.formatTaxRate()}):
          </span>
          <span>{formatCurrency(taxCalculation.taxAmount)}</span>
        </div>
      )}

      <Separator />

      {/* Total */}
      <div className={`flex justify-between font-semibold ${totalSize}`}>
        <span>Total:</span>
        <span>{formatCurrency(taxCalculation.totalAmount)}</span>
      </div>
    </div>
  );
}

/**
 * Hook to get calculated totals using TaxCalculationService
 * Use this when you need the values programmatically
 */
export function useCalculatedTotals(subtotal: number, isGovernmentContract: boolean = false) {
  return TaxCalculationService.calculateTax(subtotal, isGovernmentContract);
}

/**
 * Hook to get detailed tax breakdown
 */
export function useDetailedTaxCalculation(subtotal: number, isGovernmentContract: boolean = false) {
  return TaxCalculationService.calculateDetailedTax(subtotal, isGovernmentContract);
}
