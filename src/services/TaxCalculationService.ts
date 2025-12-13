/**
 * Centralized Tax Calculation Service
 * Single source of truth for all tax-related calculations
 * 
 * Tax Breakdown:
 * - Hospitality Tax: 2%
 * - Service Tax: 7%
 * - Total: 9%
 */

const HOSPITALITY_TAX_RATE = 0.02; // 2% hospitality tax
const SERVICE_TAX_RATE = 0.07; // 7% service tax
const DEFAULT_TAX_RATE = 0.09; // Combined 9% total tax

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  isExempt: boolean;
}

export interface DetailedTaxCalculation extends TaxCalculation {
  hospitalityTax: number;
  hospitalityTaxRate: number;
  serviceTax: number;
  serviceTaxRate: number;
}

export interface DiscountedTaxCalculation extends TaxCalculation {
  discountAmount: number;
  discountType: 'percentage' | 'fixed' | null;
  discountDescription: string | null;
  subtotalAfterDiscount: number;
}

export class TaxCalculationService {
  /**
   * Calculate tax for an invoice (simple version)
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
   * Calculate tax with discount applied
   * Discount is applied before tax calculation
   * @param subtotal - Subtotal in cents
   * @param discountAmount - Discount value (cents for fixed, percentage for percentage type)
   * @param discountType - 'percentage' or 'fixed'
   * @param discountDescription - Description of the discount
   * @param isGovernmentContract - Whether this is tax-exempt
   */
  static calculateTaxWithDiscount(
    subtotal: number,
    discountAmount: number = 0,
    discountType: 'percentage' | 'fixed' | null = null,
    discountDescription: string | null = null,
    isGovernmentContract: boolean = false
  ): DiscountedTaxCalculation {
    const isExempt = isGovernmentContract;
    
    // Calculate actual discount in cents
    let discountInCents = 0;
    if (discountType === 'percentage' && discountAmount > 0) {
      discountInCents = Math.round(subtotal * (discountAmount / 100));
    } else if (discountType === 'fixed' && discountAmount > 0) {
      discountInCents = discountAmount;
    }
    
    // Subtotal after discount (minimum 0)
    const subtotalAfterDiscount = Math.max(0, subtotal - discountInCents);
    
    // Apply tax on discounted subtotal
    const taxRate = isExempt ? 0 : DEFAULT_TAX_RATE;
    const taxAmount = isExempt ? 0 : Math.round(subtotalAfterDiscount * taxRate);
    const totalAmount = subtotalAfterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount: discountInCents,
      discountType,
      discountDescription,
      subtotalAfterDiscount,
      taxAmount,
      totalAmount,
      taxRate,
      isExempt
    };
  }

  /**
   * Calculate tax with detailed breakdown (hospitality + service)
   * @param subtotal - Subtotal in cents
   * @param isGovernmentContract - Whether this is a tax-exempt government contract
   * @param customHospitalityRate - Optional custom hospitality rate (default 2%)
   * @param customServiceRate - Optional custom service rate (default 7%)
   * @returns Detailed tax calculation with breakdown
   */
  static calculateDetailedTax(
    subtotal: number, 
    isGovernmentContract: boolean = false,
    customHospitalityRate?: number,
    customServiceRate?: number
  ): DetailedTaxCalculation {
    const isExempt = isGovernmentContract;
    
    const hospitalityTaxRate = isExempt ? 0 : (customHospitalityRate ?? HOSPITALITY_TAX_RATE);
    const serviceTaxRate = isExempt ? 0 : (customServiceRate ?? SERVICE_TAX_RATE);
    const taxRate = hospitalityTaxRate + serviceTaxRate;
    
    const hospitalityTax = isExempt ? 0 : Math.round(subtotal * hospitalityTaxRate);
    const serviceTax = isExempt ? 0 : Math.round(subtotal * serviceTaxRate);
    const taxAmount = hospitalityTax + serviceTax;
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      taxRate,
      isExempt,
      hospitalityTax,
      hospitalityTaxRate,
      serviceTax,
      serviceTaxRate
    };
  }

  /**
   * Get the default tax rate (for display purposes)
   */
  static getDefaultTaxRate(): number {
    return DEFAULT_TAX_RATE;
  }

  /**
   * Get the hospitality tax rate
   */
  static getHospitalityTaxRate(): number {
    return HOSPITALITY_TAX_RATE;
  }

  /**
   * Get the service tax rate
   */
  static getServiceTaxRate(): number {
    return SERVICE_TAX_RATE;
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
