/**
 * Shared Tax Calculation Service for Edge Functions
 * Must be kept in sync with src/services/TaxCalculationService.ts
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

  static getDefaultTaxRate(): number {
    return DEFAULT_TAX_RATE;
  }

  static getHospitalityTaxRate(): number {
    return HOSPITALITY_TAX_RATE;
  }

  static getServiceTaxRate(): number {
    return SERVICE_TAX_RATE;
  }

  static formatTaxRate(rate: number = DEFAULT_TAX_RATE): string {
    return `${(rate * 100).toFixed(1)}%`;
  }
}
