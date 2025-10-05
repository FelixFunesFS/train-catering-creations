/**
 * Centralized Tax Calculation Service
 * Single source of truth for all tax-related calculations
 */

const DEFAULT_TAX_RATE = 0.08; // 8% South Carolina sales tax

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  isExempt: boolean;
}

export class TaxCalculationService {
  /**
   * Calculate tax for an invoice
   * @param subtotal - Subtotal in cents
   * @param isGovernmentContract - Whether this is a tax-exempt government contract
   * @returns Tax calculation details
   */
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

  /**
   * Get the default tax rate (for display purposes)
   */
  static getDefaultTaxRate(): number {
    return DEFAULT_TAX_RATE;
  }

  /**
   * Format tax rate as percentage for display
   */
  static formatTaxRate(rate: number = DEFAULT_TAX_RATE): string {
    return `${(rate * 100).toFixed(1)}%`;
  }

  /**
   * Check if a quote is government contract (tax-exempt)
   */
  static async isGovernmentContract(quoteId: string): Promise<boolean> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('quote_requests')
      .select('compliance_level, requires_po_number')
      .eq('id', quoteId)
      .single();

    if (error || !data) return false;

    return data.compliance_level === 'government' || data.requires_po_number === true;
  }
}
