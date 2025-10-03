import { Database } from "@/integrations/supabase/types";

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];
type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];

export interface PricingBreakdownItem {
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface PricingCalculation {
  lineItems: PricingBreakdownItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  profitMargin: number;
  confidenceScore: number;
  suggestions: string[];
}

export class PricingEngine {
  private pricingRules: PricingRule[];

  constructor(pricingRules: PricingRule[]) {
    this.pricingRules = pricingRules;
  }

  calculateQuote(quote: QuoteRequest): PricingCalculation {
    const lineItems: PricingBreakdownItem[] = [];
    const suggestions: string[] = [];

    // Base service charge
    const serviceRule = this.findRule('service', quote.service_type);
    if (serviceRule) {
      lineItems.push({
        category: 'Service',
        description: `${quote.service_type} catering service`,
        quantity: 1,
        unitPrice: serviceRule.base_price,
        total: serviceRule.base_price,
        confidence: 'high',
        notes: 'Base catering service fee'
      });
    }

    // Per-person charge
    const perPersonRule = this.findRule('per_person', quote.service_type);
    if (perPersonRule && quote.guest_count) {
      const perPersonCost = perPersonRule.price_per_person || 15;
      lineItems.push({
        category: 'Guests',
        description: `Catering for ${quote.guest_count} guests`,
        quantity: quote.guest_count,
        unitPrice: perPersonCost,
        total: quote.guest_count * perPersonCost,
        confidence: 'high',
        notes: `$${perPersonCost} per person`
      });
    }

    // Menu items
    this.addMenuItems(lineItems, quote, 'Proteins', quote.primary_protein);
    this.addMenuItems(lineItems, quote, 'Proteins', quote.secondary_protein);
    this.addJSONMenuItems(lineItems, quote, 'Sides', quote.sides);
    this.addJSONMenuItems(lineItems, quote, 'Appetizers', quote.appetizers);
    this.addJSONMenuItems(lineItems, quote, 'Desserts', quote.desserts);
    this.addJSONMenuItems(lineItems, quote, 'Drinks', quote.drinks);

    // Wait staff
    if (quote.wait_staff_requested) {
      const staffHours = 4; // Default 4 hours
      const staffRate = 35; // $35/hour per staff member
      const staffCount = Math.ceil(quote.guest_count / 25); // 1 staff per 25 guests
      
      lineItems.push({
        category: 'Wait Staff',
        description: `${staffCount} staff members for ${staffHours} hours`,
        quantity: staffCount * staffHours,
        unitPrice: staffRate,
        total: staffCount * staffHours * staffRate,
        confidence: 'medium',
        notes: `Based on ${quote.guest_count} guests (1 staff per 25 guests)`
      });
    }

    // Equipment & supplies
    if (quote.chafers_requested) {
      const sidesArray = Array.isArray(quote.sides) ? quote.sides : [];
      lineItems.push({
        category: 'Equipment',
        description: 'Chafer rental',
        quantity: Math.ceil((sidesArray.length || 2) / 2),
        unitPrice: 15,
        total: Math.ceil((sidesArray.length || 2) / 2) * 15,
        confidence: 'high'
      });
    }

    if (quote.tables_chairs_requested) {
      const tableCount = Math.ceil(quote.guest_count / 8);
      lineItems.push({
        category: 'Equipment',
        description: 'Tables and chairs rental',
        quantity: tableCount,
        unitPrice: 75,
        total: tableCount * 75,
        confidence: 'medium',
        notes: `${tableCount} tables for ${quote.guest_count} guests`
      });
    }

    if (quote.linens_requested) {
      const linenCount = Math.ceil(quote.guest_count / 8) + 2; // Tables + buffet
      lineItems.push({
        category: 'Equipment',
        description: 'Linen rental',
        quantity: linenCount,
        unitPrice: 20,
        total: linenCount * 20,
        confidence: 'high'
      });
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.09; // 9% tax
    const taxAmount = Math.round(subtotal * taxRate);
    const total = subtotal + taxAmount;

    // Calculate profit margin (assuming 40% cost)
    const estimatedCost = subtotal * 0.4;
    const profitMargin = ((subtotal - estimatedCost) / subtotal) * 100;

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(lineItems);

    // Generate suggestions
    if (quote.guest_count > 100 && !quote.wait_staff_requested) {
      suggestions.push('Consider adding wait staff for events over 100 guests');
    }
    if (!quote.chafers_requested && ['full-service', 'delivery-setup'].includes(quote.service_type)) {
      suggestions.push('Full-service catering typically requires chafers for food warming');
    }
    if (confidenceScore < 0.7) {
      suggestions.push('Request customer consultation for more accurate pricing');
    }

    return {
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      profitMargin,
      confidenceScore,
      suggestions
    };
  }

  private findRule(category: string, itemName?: string): PricingRule | undefined {
    return this.pricingRules.find(
      rule => rule.category === category && 
      (!itemName || rule.item_name === itemName || rule.service_type === itemName)
    );
  }

  private addMenuItems(
    items: PricingBreakdownItem[], 
    quote: QuoteRequest, 
    category: string, 
    itemName?: string | null
  ) {
    if (!itemName) return;

    const rule = this.findRule(category.toLowerCase(), itemName);
    const basePrice = rule?.base_price || this.estimatePrice(category, itemName);
    const perPersonPrice = rule?.price_per_person || 0;
    
    const total = basePrice + (perPersonPrice * (quote.guest_count || 0));
    
    items.push({
      category,
      description: itemName,
      quantity: quote.guest_count || 1,
      unitPrice: perPersonPrice || basePrice,
      total,
      confidence: rule ? 'high' : 'low',
      notes: rule ? undefined : 'Estimated pricing - no rule found'
    });
  }

  private addJSONMenuItems(
    items: PricingBreakdownItem[], 
    quote: QuoteRequest, 
    category: string, 
    jsonData: any
  ) {
    if (!jsonData || !Array.isArray(jsonData)) return;

    jsonData.forEach(item => {
      const itemName = typeof item === 'string' ? item : item.name;
      this.addMenuItems(items, quote, category, itemName);
    });
  }

  private estimatePrice(category: string, itemName: string): number {
    // Fallback pricing when no rule exists
    const estimates: Record<string, number> = {
      'Proteins': 200,
      'Sides': 50,
      'Appetizers': 75,
      'Desserts': 60,
      'Drinks': 40,
    };
    return estimates[category] || 50;
  }

  private calculateConfidenceScore(items: PricingBreakdownItem[]): number {
    const confidenceValues = { high: 1, medium: 0.7, low: 0.4 };
    const total = items.reduce((sum, item) => sum + confidenceValues[item.confidence], 0);
    return items.length > 0 ? total / items.length : 0;
  }
}
