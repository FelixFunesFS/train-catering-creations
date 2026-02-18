// Payment Scheduling Engine for Soul Train's Eatery
// Implements tiered payment schedule based on days until event
//
// 4-Tier Payment Schedule:
// - Rush (≤14 days): 100% NOW
// - Short Notice (15-30 days): 60% NOW + 40% @ 7 days before
// - Mid-Range (31-44 days): 60% NOW + 40% @ 14 days before
// - Standard (45+ days): 10% NOW + 40% @ 30 days + 50% @ 14 days (cumulative: 50% paid by 30 days)

export interface PaymentScheduleRule {
  type: 'DEPOSIT' | 'MILESTONE' | 'BALANCE' | 'FULL' | 'COMBINED' | 'FINAL';
  percentage: number;
  due_date: Date | 'NOW' | 'NET_30_AFTER_EVENT';
  description: string;
}

export interface PaymentSchedule {
  rules: PaymentScheduleRule[];
  total_amount: number;
  currency: string;
  customer_type: 'PERSON' | 'ORG' | 'GOV';
  approval_date: Date;
  event_date: Date;
  schedule_tier: 'RUSH' | 'SHORT_NOTICE' | 'MID_RANGE' | 'STANDARD' | 'GOVERNMENT';
}

// Detect government customer from email domain
export const detectCustomerType = (email: string): 'PERSON' | 'ORG' | 'GOV' => {
  const govDomains = ['.gov', '.mil', '.state.', '.edu'];
  const normalizedEmail = email.toLowerCase();
  
  if (govDomains.some(domain => normalizedEmail.includes(domain))) {
    return 'GOV';
  }
  
  // Additional org patterns could be added here
  return 'PERSON';
};

// Determine customer type with manual override support
export const determineCustomerType = (
  email: string, 
  isGovernmentOverride?: boolean
): 'PERSON' | 'ORG' | 'GOV' => {
  // Manual override takes precedence
  if (isGovernmentOverride === true) {
    return 'GOV';
  }
  
  // If explicitly set to false, use email detection
  if (isGovernmentOverride === false) {
    return detectCustomerType(email);
  }
  
  // Default to email detection when override is undefined
  return detectCustomerType(email);
};

// Calculate days between two dates
const daysBetween = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Subtract days from a date
const dateMinus = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Determine schedule tier based on days until event
export const getScheduleTier = (daysOut: number, customerType: 'PERSON' | 'ORG' | 'GOV'): PaymentSchedule['schedule_tier'] => {
  if (customerType === 'GOV') return 'GOVERNMENT';
  if (daysOut <= 14) return 'RUSH';
  if (daysOut <= 30) return 'SHORT_NOTICE';
  if (daysOut <= 44) return 'MID_RANGE';
  return 'STANDARD';
};

// Main payment schedule builder
export const buildPaymentSchedule = (
  eventDate: Date,
  customerType: 'PERSON' | 'ORG' | 'GOV',
  approvedAt: Date,
  totalAmount: number
): PaymentSchedule => {
  const rules: PaymentScheduleRule[] = [];
  const daysOut = daysBetween(approvedAt, eventDate);
  const scheduleTier = getScheduleTier(daysOut, customerType);
  
  // Government customers - Net 30 flow (tax-exempt, no upfront deposit)
  if (customerType === 'GOV') {
    rules.push({
      type: 'FINAL',
      percentage: 100,
      due_date: 'NET_30_AFTER_EVENT',
      description: 'Full payment (Net 30 after event completion)'
    });
    
    return {
      rules,
      total_amount: totalAmount,
      currency: 'usd',
      customer_type: customerType,
      approval_date: approvedAt,
      event_date: eventDate,
      schedule_tier: 'GOVERNMENT'
    };
  }
  
  // Non-government customers - tiered payment system
  if (daysOut <= 14) {
    // RUSH: Event within 14 days - 100% due now
    rules.push({
      type: 'FULL',
      percentage: 100,
      due_date: 'NOW',
      description: 'Full payment due (event within 14 days)'
    });
  } else if (daysOut <= 30) {
    // SHORT NOTICE: Event within 15-30 days - 60% NOW + 40% @ 7 days before
    rules.push({
      type: 'COMBINED',
      percentage: 60,
      due_date: 'NOW',
      description: 'Combined booking deposit + milestone (60%)'
    });
    rules.push({
      type: 'BALANCE',
      percentage: 40,
      due_date: dateMinus(eventDate, 7),
      description: 'Final balance due 7 days before event'
    });
  } else if (daysOut <= 44) {
    // MID-RANGE: Event within 31-44 days - 60% NOW + 40% @ 14 days before
    rules.push({
      type: 'COMBINED',
      percentage: 60,
      due_date: 'NOW',
      description: 'Combined booking deposit + milestone (60%)'
    });
    rules.push({
      type: 'BALANCE',
      percentage: 40,
      due_date: dateMinus(eventDate, 14),
      description: 'Final balance due 2 weeks before event'
    });
  } else {
    // STANDARD: 45+ days out - 10% NOW + 40% @ 30 days + 50% @ 14 days
    // Cumulative: deposit (10%) + milestone (40%) = 50% paid by 30 days out
    rules.push({
      type: 'DEPOSIT',
      percentage: 10,
      due_date: 'NOW',
      description: 'Booking deposit (10%) - secures your event date'
    });
    rules.push({
      type: 'MILESTONE',
      percentage: 40,
      due_date: dateMinus(eventDate, 30),
      description: 'Milestone payment (40%) due 30 days before event — brings total paid to 50%'
    });
    rules.push({
      type: 'BALANCE',
      percentage: 50,
      due_date: dateMinus(eventDate, 14),
      description: 'Final balance (50%) due 2 weeks before event'
    });
  }
  
  return {
    rules,
    total_amount: totalAmount,
    currency: 'usd',
    customer_type: customerType,
    approval_date: approvedAt,
    event_date: eventDate,
    schedule_tier: scheduleTier
  };
};

// Calculate individual payment amounts
export const calculatePaymentAmounts = (schedule: PaymentSchedule): Array<{
  rule: PaymentScheduleRule;
  amount_cents: number;
  due_date: Date | string;
}> => {
  return schedule.rules.map(rule => ({
    rule,
    amount_cents: Math.round((schedule.total_amount * rule.percentage) / 100),
    due_date: rule.due_date
  }));
};

// Helper to format date to YYYY-MM-DD using local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate invoice creation data for each payment rule
export const generateInvoiceSchedule = (
  schedule: PaymentSchedule,
  invoiceBaseData: any
) => {
  const paymentAmounts = calculatePaymentAmounts(schedule);
  
  return paymentAmounts.map((payment, index) => {
    const isFirstPayment = index === 0;
    const isDueNow = payment.due_date === 'NOW';
    
    return {
      ...invoiceBaseData,
      type: payment.rule.type.toLowerCase(),
      total_amount: payment.amount_cents,
      due_date: isDueNow ? formatDateLocal(new Date()) : 
                payment.due_date === 'NET_30_AFTER_EVENT' ? null :
                formatDateLocal(payment.due_date as Date),
      status: isDueNow ? 'sent' : 'draft',
      workflow_status: isDueNow ? 'sent' : 'draft',
      is_draft: !isDueNow,
      notes: `${payment.rule.description} - ${payment.rule.percentage}% of total`,
      invoice_number: `${invoiceBaseData.invoice_number}-${payment.rule.type}`
    };
  });
};

// Get human-readable schedule description
export const getScheduleDescription = (tier: PaymentSchedule['schedule_tier']): string => {
  switch (tier) {
    case 'RUSH':
      return '100% payment required immediately (event within 14 days)';
    case 'SHORT_NOTICE':
      return '60% due now, 40% due 7 days before event';
    case 'MID_RANGE':
      return '60% due now, 40% due 2 weeks before event';
    case 'STANDARD':
      return '10% booking deposit, 40% at 30 days (50% cumulative), final 50% at 2 weeks';
    case 'GOVERNMENT':
      return '100% due Net 30 after event completion';
    default:
      return 'Custom payment schedule';
  }
};

// ============================================================================
// ESTIMATE VALIDITY - Context-aware validity based on event proximity
// ============================================================================

export interface EstimateValidity {
  daysValid: number;
  displayText: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'standard';
  expirationDate: Date;
}

/**
 * Get estimate validity period based on event proximity
 * Aligns with payment schedule tiers to create appropriate urgency
 * 
 * Tiers:
 * - RUSH (≤14 days): 24-48 hours validity
 * - SHORT_NOTICE (15-30 days): 3 days validity
 * - MID_RANGE (31-44 days): 5 days validity
 * - STANDARD (45+ days): 7 days validity
 * - GOVERNMENT (any): 7 days validity (standard terms)
 */
export const getEstimateValidity = (
  eventDate: Date,
  estimateSentDate: Date = new Date(),
  customerType: 'PERSON' | 'ORG' | 'GOV' = 'PERSON'
): EstimateValidity => {
  const daysUntilEvent = daysBetween(estimateSentDate, eventDate);
  
  // Government contracts always get standard validity
  if (customerType === 'GOV') {
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 7);
    return {
      daysValid: 7,
      displayText: '7 days',
      urgencyLevel: 'standard',
      expirationDate: expDate
    };
  }
  
  // Tiered validity based on event proximity
  if (daysUntilEvent <= 14) {
    // RUSH: Very short validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 2);
    return {
      daysValid: 2,
      displayText: '24-48 hours',
      urgencyLevel: 'critical',
      expirationDate: expDate
    };
  } else if (daysUntilEvent <= 30) {
    // SHORT_NOTICE: 3-day validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 3);
    return {
      daysValid: 3,
      displayText: '3 days',
      urgencyLevel: 'high',
      expirationDate: expDate
    };
  } else if (daysUntilEvent <= 44) {
    // MID_RANGE: 5-day validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 5);
    return {
      daysValid: 5,
      displayText: '5 days',
      urgencyLevel: 'medium',
      expirationDate: expDate
    };
  } else {
    // STANDARD: 7-day validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 7);
    return {
      daysValid: 7,
      displayText: '7 days',
      urgencyLevel: 'standard',
      expirationDate: expDate
    };
  }
};

/**
 * Get urgency-appropriate messaging for estimate validity
 */
export const getValidityUrgencyMessage = (urgencyLevel: EstimateValidity['urgencyLevel']): string => {
  switch (urgencyLevel) {
    case 'critical':
      return 'Your event is coming up quickly! Please approve immediately to secure your date.';
    case 'high':
      return 'Your event is approaching soon. We recommend approving quickly to ensure availability.';
    case 'medium':
      return 'Dates fill up fast! We recommend approving soon to lock in your date.';
    case 'standard':
      return 'We recommend approving your estimate as soon as you\'re ready.';
  }
};
