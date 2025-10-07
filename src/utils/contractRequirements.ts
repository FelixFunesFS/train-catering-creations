/**
 * Simplified contract requirements - all events use T&C acceptance workflow
 * Government contracts tracked separately via government_contracts table for compliance
 */

export interface ContractRequirement {
  includeTermsAndConditions: boolean;
  reason: string;
  eventType: 'standard' | 'wedding' | 'government';
}

interface QuoteForContract {
  event_type: string;
  compliance_level?: string;
}

/**
 * Determines Terms & Conditions requirements for an event
 * All events include T&C in estimate - no separate contract generation
 */
export function requiresTermsAndConditions(
  quote: QuoteForContract
): ContractRequirement {
  // Government contracts - T&C plus compliance tracking
  if (quote.compliance_level === 'government') {
    return {
      includeTermsAndConditions: true,
      reason: 'Government contract with compliance tracking',
      eventType: 'government'
    };
  }

  // Wedding events - specialized T&C
  if (['wedding', 'second_wedding'].includes(quote.event_type)) {
    return {
      includeTermsAndConditions: true,
      reason: 'Wedding-specific terms and conditions',
      eventType: 'wedding'
    };
  }

  // All other events - standard T&C
  return {
    includeTermsAndConditions: true,
    reason: 'Standard terms and conditions',
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