export interface ContractRequirement {
  requiresSeparateContract: boolean;
  reason: string;
  eventType: 'standard' | 'wedding' | 'government';
}

interface QuoteForContract {
  event_type: string;
  compliance_level?: string;
}

/**
 * Determines if an event requires a separate contract based on event type and value
 */
export function requiresSeparateContract(
  quote: QuoteForContract,
  totalAmount?: number
): ContractRequirement {
  // Wedding and black tie events require contracts
  if (['wedding', 'second_wedding'].includes(quote.event_type)) {
    return {
      requiresSeparateContract: true,
      reason: 'Wedding events require a detailed service agreement',
      eventType: 'wedding'
    };
  }

  // Government contracts require separate contract
  if (quote.compliance_level === 'government') {
    return {
      requiresSeparateContract: true,
      reason: 'Government contracts require compliance documentation',
      eventType: 'government'
    };
  }

  // High-value events (>$5000) require contract
  if (totalAmount && totalAmount > 500000) { // $5000 in cents
    return {
      requiresSeparateContract: true,
      reason: 'High-value events require a formal service agreement',
      eventType: 'standard'
    };
  }

  // All other events can use T&C in estimate
  return {
    requiresSeparateContract: false,
    reason: 'Standard event - Terms & Conditions included in estimate',
    eventType: 'standard'
  };
}

/**
 * Get the event type for T&C display
 */
export function getEventTermsType(quote: QuoteForContract): 'standard' | 'wedding' | 'government' {
  if (['wedding', 'second_wedding'].includes(quote.event_type)) {
    return 'wedding';
  }
  if (quote.compliance_level === 'government') {
    return 'government';
  }
  return 'standard';
}