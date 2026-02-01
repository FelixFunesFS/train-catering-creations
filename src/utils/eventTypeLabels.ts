/**
 * Shared label maps and formatting functions for event and service types.
 * Converts database values (snake_case, kebab-case) to human-readable Title Case.
 */

export const eventTypeLabels: Record<string, string> = {
  'private_party': 'Private Party',
  'birthday': 'Birthday',
  'military_function': 'Military Function',
  'wedding': 'Wedding',
  'corporate': 'Corporate',
  'graduation': 'Graduation',
  'anniversary': 'Anniversary',
  'baby_shower': 'Baby Shower',
  'retirement': 'Retirement',
  'holiday': 'Holiday',
  'other': 'Other',
};

export const serviceTypeLabels: Record<string, string> = {
  'full-service': 'Full Service',
  'delivery-only': 'Delivery Only',
  'drop-off': 'Drop-Off',
  'buffet': 'Buffet',
  'plated': 'Plated',
  'family-style': 'Family Style',
};

/**
 * Format unknown types by converting snake_case/kebab-case to Title Case.
 * Used as a fallback when the value isn't in the known label maps.
 */
function formatUnknownType(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format an event type value for display.
 * @param value - The raw database value (e.g., 'private_party', 'military_function')
 * @returns Human-readable label (e.g., 'Private Party', 'Military Function')
 */
export function formatEventType(value: string): string {
  return eventTypeLabels[value] || formatUnknownType(value);
}

/**
 * Format a service type value for display.
 * @param value - The raw database value (e.g., 'full-service', 'delivery-only')
 * @returns Human-readable label (e.g., 'Full Service', 'Delivery Only')
 */
export function formatServiceType(value: string): string {
  return serviceTypeLabels[value] || formatUnknownType(value);
}
