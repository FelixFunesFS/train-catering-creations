// Payment Scheduling Engine for Soul Train's Eatery
// Implements the buildSchedule logic from the comprehensive blueprint

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

// Main payment schedule builder
export const buildPaymentSchedule = (
  eventDate: Date,
  customerType: 'PERSON' | 'ORG' | 'GOV',
  approvedAt: Date,
  totalAmount: number
): PaymentSchedule => {
  const rules: PaymentScheduleRule[] = [];
  
  // Government customers - Net 30 flow
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
      event_date: eventDate
    };
  }
  
  // Non-government customers - tiered payment system
  const daysOut = daysBetween(approvedAt, eventDate);
  
  if (daysOut <= 10) {
    // Event within 10 days - 100% due now
    rules.push({
      type: 'FULL',
      percentage: 100,
      due_date: 'NOW',
      description: 'Full payment due (event within 10 days)'
    });
  } else if (daysOut <= 30) {
    // Event within 30 days - combine deposit + milestone
    rules.push({
      type: 'COMBINED',
      percentage: 75,
      due_date: 'NOW',
      description: 'Combined deposit and milestone payment'
    });
    rules.push({
      type: 'BALANCE',
      percentage: 25,
      due_date: dateMinus(eventDate, 10),
      description: 'Final balance due 10 days before event'
    });
  } else {
    // Standard 3-tier payment schedule
    rules.push({
      type: 'DEPOSIT',
      percentage: 25,
      due_date: 'NOW',
      description: 'Deposit due at approval (25%)'
    });
    rules.push({
      type: 'MILESTONE',
      percentage: 50,
      due_date: dateMinus(eventDate, 30),
      description: 'Milestone payment due 30 days before event'
    });
    rules.push({
      type: 'BALANCE',
      percentage: 25,
      due_date: dateMinus(eventDate, 10),
      description: 'Final balance due 10 days before event'
    });
  }
  
  return {
    rules,
    total_amount: totalAmount,
    currency: 'usd',
    customer_type: customerType,
    approval_date: approvedAt,
    event_date: eventDate
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
      due_date: isDueNow ? new Date().toISOString().split('T')[0] : 
                payment.due_date === 'NET_30_AFTER_EVENT' ? null :
                (payment.due_date as Date).toISOString().split('T')[0],
      status: isDueNow ? 'sent' : 'draft',
      workflow_status: isDueNow ? 'sent' : 'draft',
      is_draft: !isDueNow,
      notes: `${payment.rule.description} - ${payment.rule.percentage}% of total`,
      invoice_number: `${invoiceBaseData.invoice_number}-${payment.rule.type}`
    };
  });
};