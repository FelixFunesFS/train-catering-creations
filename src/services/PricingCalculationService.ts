/**
 * Master Pricing Calculation Service
 * 
 * SINGLE SOURCE OF TRUTH for all pricing calculations in the system.
 * This service ensures consistency across:
 * - Admin components
 * - Customer displays
 * - Email templates
 * - PDF generation
 * - Database triggers
 * 
 * All pricing calculations MUST use this service to prevent discrepancies.
 */

import { TaxCalculationService } from './TaxCalculationService';

export interface LineItem {
  id: string;
  title?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
}

export interface CompletePricing {
  subtotal: number;          // Sum of all line items (in cents)
  taxAmount: number;         // Calculated tax (in cents)
  totalAmount: number;       // Subtotal + Tax (in cents)
  depositRequired: number;   // 25% of total (in cents)
  balanceDue: number;        // Total - Deposit (in cents)
  taxRate: number;           // Tax rate (0.08 or 0 if exempt)
  isExempt: boolean;         // Tax exemption status
}

export class PricingCalculationService {
  /**
   * Standard deposit percentage (25%)
   */
  static readonly DEPOSIT_PERCENTAGE = 0.25;

  /**
   * Calculate complete pricing for an invoice/quote
   * This is the MASTER calculation function
   * 
   * @param params - Line items and government contract status
   * @returns Complete pricing breakdown
   */
  static calculatePricing(params: {
    lineItems: LineItem[];
    isGovernmentContract: boolean;
  }): CompletePricing {
    const { lineItems, isGovernmentContract } = params;

    // 1. Calculate subtotal from line items
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);

    // 2. Calculate tax using centralized TaxCalculationService
    const taxCalc = TaxCalculationService.calculateTax(subtotal, isGovernmentContract);

    // 3. Calculate deposit (25% of total)
    const depositRequired = this.calculateDeposit(taxCalc.totalAmount);

    // 4. Calculate balance due
    const balanceDue = taxCalc.totalAmount - depositRequired;

    return {
      subtotal: taxCalc.subtotal,
      taxAmount: taxCalc.taxAmount,
      totalAmount: taxCalc.totalAmount,
      depositRequired,
      balanceDue,
      taxRate: taxCalc.taxRate,
      isExempt: taxCalc.isExempt
    };
  }

  /**
   * Calculate deposit amount (25% of total)
   * 
   * @param totalAmount - Total amount in cents
   * @returns Deposit amount in cents
   */
  static calculateDeposit(totalAmount: number): number {
    return Math.round(totalAmount * this.DEPOSIT_PERCENTAGE);
  }

  /**
   * Calculate balance due after deposit
   * 
   * @param totalAmount - Total amount in cents
   * @param depositPaid - Deposit amount paid in cents
   * @returns Balance due in cents
   */
  static calculateBalanceDue(totalAmount: number, depositPaid: number = 0): number {
    const depositRequired = this.calculateDeposit(totalAmount);
    return totalAmount - (depositPaid || depositRequired);
  }

  /**
   * Format amount in cents to USD string
   * 
   * @param amountInCents - Amount in cents
   * @returns Formatted string (e.g., "$1,234.56")
   */
  static formatCurrency(amountInCents: number): string {
    const dollars = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(dollars);
  }

  /**
   * Get deposit percentage as display string
   */
  static getDepositPercentageDisplay(): string {
    return `${this.DEPOSIT_PERCENTAGE * 100}%`;
  }

  /**
   * Validate that calculated totals match database values
   * Used for integrity checks
   * 
   * @param params - Comparison parameters
   * @returns Validation result
   */
  static validatePricing(params: {
    lineItems: LineItem[];
    isGovernmentContract: boolean;
    dbSubtotal: number;
    dbTaxAmount: number;
    dbTotalAmount: number;
  }): {
    isValid: boolean;
    discrepancies: string[];
  } {
    const { lineItems, isGovernmentContract, dbSubtotal, dbTaxAmount, dbTotalAmount } = params;
    
    const calculated = this.calculatePricing({ lineItems, isGovernmentContract });
    const discrepancies: string[] = [];

    if (calculated.subtotal !== dbSubtotal) {
      discrepancies.push(
        `Subtotal mismatch: DB=${dbSubtotal}, Calculated=${calculated.subtotal}`
      );
    }

    if (calculated.taxAmount !== dbTaxAmount) {
      discrepancies.push(
        `Tax amount mismatch: DB=${dbTaxAmount}, Calculated=${calculated.taxAmount}`
      );
    }

    if (calculated.totalAmount !== dbTotalAmount) {
      discrepancies.push(
        `Total amount mismatch: DB=${dbTotalAmount}, Calculated=${calculated.totalAmount}`
      );
    }

    return {
      isValid: discrepancies.length === 0,
      discrepancies
    };
  }

  /**
   * Calculate per-person cost
   * 
   * @param totalAmount - Total amount in cents
   * @param guestCount - Number of guests
   * @returns Cost per person in cents
   */
  static calculatePerPersonCost(totalAmount: number, guestCount: number): number {
    if (guestCount <= 0) return 0;
    return Math.round(totalAmount / guestCount);
  }
}
