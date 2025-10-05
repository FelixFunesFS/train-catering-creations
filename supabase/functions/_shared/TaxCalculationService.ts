/**
 * Shared Tax Calculation Service for Edge Functions
 * Must be kept in sync with src/services/TaxCalculationService.ts
 */

const DEFAULT_TAX_RATE = 0.08;

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  isExempt: boolean;
}

export class TaxCalculationService {
  static calculateTax(subtotal: number, isGovernmentContract: boolean = false): TaxCalculation {
    const isExempt = isGovernmentContract;
    const taxRate = isExempt ? 0 : DEFAULT_TAX_RATE;
    const taxAmount = isExempt ? 0 : Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      taxRate,
      isExempt
    };
  }

  static getDefaultTaxRate(): number {
    return DEFAULT_TAX_RATE;
  }

  static formatTaxRate(rate: number = DEFAULT_TAX_RATE): string {
    return `${(rate * 100).toFixed(1)}%`;
  }
}
