// Business Logic Validation and Automation
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PricingCalculation {
  base_price: number;
  per_person_price: number;
  service_charge: number;
  add_ons: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  breakdown: PricingBreakdown[];
}

export interface PricingBreakdown {
  category: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Comprehensive quote validation
export const validateQuote = (quote: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required field validation
  if (!quote.contact_name?.trim()) errors.push('Contact name is required');
  if (!quote.email?.trim()) errors.push('Email address is required');
  if (!quote.phone?.trim()) errors.push('Phone number is required');
  if (!quote.event_name?.trim()) errors.push('Event name is required');
  if (!quote.event_date) errors.push('Event date is required');
  if (!quote.location?.trim()) errors.push('Event location is required');
  if (!quote.guest_count || quote.guest_count < 1) errors.push('Valid guest count is required');

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (quote.email && !emailRegex.test(quote.email)) {
    errors.push('Valid email address is required');
  }

  // Phone validation (basic US format)
  const phoneRegex = /^[\+]?[1-9]?[\-\s\(\)]?[\d\s\-\(\)]{10,}$/;
  if (quote.phone && !phoneRegex.test(quote.phone.replace(/\D/g, ''))) {
    warnings.push('Phone number format may be invalid');
  }

  // Date validation
  if (quote.event_date) {
    const eventDate = new Date(quote.event_date);
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    if (eventDate < today) {
      errors.push('Event date cannot be in the past');
    }
    
    if (eventDate > oneYearFromNow) {
      warnings.push('Event date is more than 1 year in advance');
    }

    // Check for high-demand periods
    const month = eventDate.getMonth();
    if ([4, 5, 9, 10, 11].includes(month)) { // May, June, October, November, December
      warnings.push('Event is during peak season - early booking recommended');
    }
  }

  // Guest count validation
  if (quote.guest_count) {
    if (quote.guest_count < 10) {
      warnings.push('Small event - minimum fees may apply');
    }
    if (quote.guest_count > 500) {
      warnings.push('Large event - additional coordination required');
      suggestions.push('Consider multiple service stations for events over 500 guests');
    }
  }

  // Menu validation
  if (!quote.primary_protein?.trim()) {
    warnings.push('No primary protein selected');
  }
  
  if (quote.both_proteins_available && !quote.secondary_protein?.trim()) {
    warnings.push('Secondary protein option not specified');
  }

  // Service type validation
  const validServiceTypes = ['full-service', 'delivery-setup', 'drop-off'];
  if (!validServiceTypes.includes(quote.service_type)) {
    errors.push('Valid service type must be selected');
  }

  // Dietary restrictions validation
  if (quote.dietary_restrictions && quote.dietary_restrictions.length > 0) {
    if (!quote.guest_count_with_restrictions) {
      suggestions.push('Specify number of guests with dietary restrictions for accurate planning');
    }
  }

  // Lead time validation
  if (quote.event_date) {
    const eventDate = new Date(quote.event_date);
    const today = new Date();
    const daysDifference = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDifference < 7) {
      warnings.push('Less than 1 week notice - rush charges may apply');
    }
    if (daysDifference < 3) {
      errors.push('Minimum 3 days notice required for catering events');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};

// Automated pricing calculation
export const calculateAutomatedPricing = async (quote: any): Promise<PricingCalculation> => {
  const breakdown: PricingBreakdown[] = [];
  let subtotal = 0;

  try {
    // Fetch current pricing rules
    const { data: pricingRules } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true);

    if (!pricingRules) {
      throw new Error('Unable to fetch pricing rules');
    }

    // Base meal pricing
    const mealRule = pricingRules.find(rule => 
      rule.category === 'meal' && 
      (rule.service_type === quote.service_type || !rule.service_type)
    );

    if (mealRule) {
      const mealTotal = mealRule.price_per_person * quote.guest_count;
      breakdown.push({
        category: 'meal',
        description: `Entree meals (${quote.guest_count} guests)`,
        quantity: quote.guest_count,
        unit_price: mealRule.price_per_person,
        total_price: mealTotal
      });
      subtotal += mealTotal;
    }

    // Appetizers pricing
    if (quote.appetizers && quote.appetizers.length > 0) {
      const appetizerRule = pricingRules.find(rule => rule.category === 'appetizer');
      if (appetizerRule) {
        const appetizerTotal = appetizerRule.price_per_person * quote.guest_count;
        breakdown.push({
          category: 'appetizer',
          description: `Appetizers (${quote.appetizers.length} selections)`,
          quantity: quote.guest_count,
          unit_price: appetizerRule.price_per_person,
          total_price: appetizerTotal
        });
        subtotal += appetizerTotal;
      }
    }

    // Desserts pricing
    if (quote.desserts && quote.desserts.length > 0) {
      const dessertRule = pricingRules.find(rule => rule.category === 'dessert');
      if (dessertRule) {
        const dessertTotal = dessertRule.price_per_person * quote.guest_count;
        breakdown.push({
          category: 'dessert',
          description: `Desserts (${quote.desserts.length} selections)`,
          quantity: quote.guest_count,
          unit_price: dessertRule.price_per_person,
          total_price: dessertTotal
        });
        subtotal += dessertTotal;
      }
    }

    // Service charges
    const serviceRule = pricingRules.find(rule => 
      rule.category === 'service' && rule.service_type === quote.service_type
    );

    let service_charge = 0;
    if (serviceRule) {
      service_charge = serviceRule.base_price + (serviceRule.price_per_person * quote.guest_count);
      breakdown.push({
        category: 'service',
        description: `${quote.service_type} service`,
        quantity: 1,
        unit_price: service_charge,
        total_price: service_charge
      });
    }

    // Add-ons
    let add_ons = 0;
    
    // Bussing tables
    if (quote.bussing_tables_needed) {
      const bussingRule = pricingRules.find(rule => rule.category === 'bussing');
      if (bussingRule) {
        add_ons += bussingRule.base_price;
        breakdown.push({
          category: 'addon',
          description: 'Table bussing service',
          quantity: 1,
          unit_price: bussingRule.base_price,
          total_price: bussingRule.base_price
        });
      }
    }

    // Wait staff
    if (quote.wait_staff_requested) {
      const waitStaffRule = pricingRules.find(rule => rule.category === 'wait_staff');
      if (waitStaffRule) {
        const staffTotal = waitStaffRule.price_per_person * quote.guest_count;
        add_ons += staffTotal;
        breakdown.push({
          category: 'addon',
          description: 'Wait staff service',
          quantity: quote.guest_count,
          unit_price: waitStaffRule.price_per_person,
          total_price: staffTotal
        });
      }
    }

    const total_before_tax = subtotal + service_charge + add_ons;
    const tax_rate = 0.08; // 8% tax rate - should be configurable
    const tax_amount = Math.round(total_before_tax * tax_rate);
    const total_amount = total_before_tax + tax_amount;

    return {
      base_price: subtotal,
      per_person_price: Math.round(subtotal / quote.guest_count),
      service_charge,
      add_ons,
      subtotal: total_before_tax,
      tax_amount,
      total_amount,
      breakdown
    };

  } catch (error) {
    console.error('Error calculating pricing:', error);
    // Return default calculation if pricing rules fail
    const defaultPerPerson = 25; // $25 per person default
    const baseTotal = defaultPerPerson * quote.guest_count;
    const serviceCharge = Math.round(baseTotal * 0.15); // 15% service charge
    const subtotal = baseTotal + serviceCharge;
    const taxAmount = Math.round(subtotal * 0.08);
    
    return {
      base_price: baseTotal,
      per_person_price: defaultPerPerson,
      service_charge: serviceCharge,
      add_ons: 0,
      subtotal,
      tax_amount: taxAmount,
      total_amount: subtotal + taxAmount,
      breakdown: [
        {
          category: 'meal',
          description: `Catering package (${quote.guest_count} guests)`,
          quantity: quote.guest_count,
          unit_price: defaultPerPerson,
          total_price: baseTotal
        },
        {
          category: 'service',
          description: 'Service charge',
          quantity: 1,
          unit_price: serviceCharge,
          total_price: serviceCharge
        }
      ]
    };
  }
};

// Check availability for event date
export const checkEventAvailability = async (eventDate: string, eventTime?: string): Promise<{
  available: boolean;
  conflicts: any[];
  suggestions: string[];
}> => {
  try {
    const { data: existingEvents } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('event_date', eventDate)
      .in('workflow_status', ['confirmed', 'quoted']);

    const conflicts = existingEvents || [];
    const suggestions: string[] = [];

    if (conflicts.length > 0) {
      suggestions.push('Multiple events scheduled for this date - confirm capacity');
    }

    // Check calendar events
    const { data: calendarEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('event_date', eventDate);

    const calendarConflicts = calendarEvents || [];

    return {
      available: conflicts.length === 0,
      conflicts: [...conflicts, ...calendarConflicts],
      suggestions
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return {
      available: true,
      conflicts: [],
      suggestions: ['Unable to verify availability - manual check recommended']
    };
  }
};

// Generate business insights
export const generateBusinessInsights = async (): Promise<{
  totalQuotes: number;
  conversionRate: number;
  averageOrderValue: number;
  popularServices: string[];
  seasonalTrends: any[];
}> => {
  try {
    // Get quote statistics
    const { data: quotes } = await supabase
      .from('quote_requests')
      .select('*');

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, workflow_status, created_at');

    const totalQuotes = quotes?.length || 0;
    const confirmedQuotes = quotes?.filter(q => q.workflow_status === 'confirmed').length || 0;
    const conversionRate = totalQuotes > 0 ? (confirmedQuotes / totalQuotes) * 100 : 0;

    const paidInvoices = invoices?.filter(i => i.workflow_status === 'paid') || [];
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const averageOrderValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    // Popular services
    const serviceTypes = quotes?.map(q => q.service_type) || [];
    const serviceCounts = serviceTypes.reduce((acc, service) => {
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularServices = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([service]) => service);

    return {
      totalQuotes,
      conversionRate,
      averageOrderValue: averageOrderValue / 100, // Convert from cents
      popularServices,
      seasonalTrends: [] // Could be expanded with more complex analysis
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    return {
      totalQuotes: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      popularServices: [],
      seasonalTrends: []
    };
  }
};

// Automated follow-up scheduling
export const scheduleAutomatedFollowUp = async (quoteId: string, followUpType: 'reminder' | 'check_in' | 'feedback'): Promise<boolean> => {
  try {
    const followUpDays = {
      reminder: 3,
      check_in: 7,
      feedback: 14
    };

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + followUpDays[followUpType]);

    // This would integrate with a scheduling system
    console.log(`Scheduled ${followUpType} for quote ${quoteId} on ${followUpDate.toISOString()}`);
    
    return true;
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    return false;
  }
};