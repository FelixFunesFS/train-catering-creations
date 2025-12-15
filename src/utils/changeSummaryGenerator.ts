/**
 * ChangeSummaryGenerator - Generates customer-friendly summaries of changes
 * Used to auto-populate customer notes when changes are made
 */

export type ChangeSource = 'phone' | 'email' | 'portal_change_request' | 'in_person' | 'admin_adjustment';

export interface ChangeItem {
  field: string;
  oldValue: string | null;
  newValue: string | null;
  category?: 'event' | 'menu' | 'line_item';
}

export interface ChangeContext {
  initials: string;
  source: ChangeSource;
  contactEmail?: string;
  contactPhone?: string;
  internalNote?: string;
  customerSummary?: string;
  includeInCustomerNotes: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  contact_name: 'Contact name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  event_date: 'Event date',
  start_time: 'Start time',
  guest_count: 'Guest count',
  service_type: 'Service type',
  proteins: 'Proteins',
  sides: 'Sides',
  appetizers: 'Appetizers',
  desserts: 'Desserts',
  drinks: 'Beverages',
  vegetarian_entrees: 'Vegetarian entrées',
  guest_count_with_restrictions: 'Vegetarian portions',
  special_requests: 'Special requests',
  both_proteins_available: 'Both proteins option',
  unit_price: 'Price',
  quantity: 'Quantity',
  description: 'Description',
};

const SOURCE_LABELS: Record<ChangeSource, string> = {
  phone: 'per phone call',
  email: 'per email request',
  portal_change_request: 'per portal change request',
  in_person: 'per in-person discussion',
  admin_adjustment: 'admin adjustment',
};

/**
 * Format a date for display in summaries (Eastern Time)
 */
function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    timeZone: 'America/New_York',
  });
}

/**
 * Format array values for display
 */
function formatArrayValue(value: unknown): string {
  if (!value) return 'none';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'none';
    return value.map(v => 
      typeof v === 'string' 
        ? v.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : v
    ).join(', ');
  }
  return String(value);
}

/**
 * Get a human-readable label for a field
 */
function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field.replace(/_/g, ' ');
}

/**
 * Generate a customer-friendly summary of changes
 */
export function generateCustomerSummary(
  changes: ChangeItem[],
  context: Partial<ChangeContext>
): string {
  if (changes.length === 0) return '';

  const date = formatDate();
  const sourceLabel = context.source ? SOURCE_LABELS[context.source] : '';
  const initials = context.initials || 'Admin';

  // Group changes by type for cleaner summary
  const summaryParts: string[] = [];

  for (const change of changes) {
    const label = getFieldLabel(change.field);
    const oldVal = formatArrayValue(change.oldValue);
    const newVal = formatArrayValue(change.newValue);

    if (change.oldValue === null && change.newValue !== null) {
      summaryParts.push(`Added ${label}: ${newVal}`);
    } else if (change.oldValue !== null && change.newValue === null) {
      summaryParts.push(`Removed ${label}`);
    } else {
      summaryParts.push(`${label} changed from "${oldVal}" to "${newVal}"`);
    }
  }

  const changesText = summaryParts.join('; ');
  return `Updated ${date}: ${changesText} ${sourceLabel}. —${initials}`;
}

/**
 * Detect changes between two objects
 */
export function detectChanges(
  original: Record<string, unknown>,
  updated: Record<string, unknown>,
  fieldsToTrack: string[]
): ChangeItem[] {
  const changes: ChangeItem[] = [];

  for (const field of fieldsToTrack) {
    const oldVal = original[field];
    const newVal = updated[field];

    // Handle array comparison
    if (Array.isArray(oldVal) || Array.isArray(newVal)) {
      const oldArr = Array.isArray(oldVal) ? oldVal : [];
      const newArr = Array.isArray(newVal) ? newVal : [];
      
      if (JSON.stringify(oldArr.sort()) !== JSON.stringify(newArr.sort())) {
        changes.push({
          field,
          oldValue: oldArr.length > 0 ? JSON.stringify(oldArr) : null,
          newValue: newArr.length > 0 ? JSON.stringify(newArr) : null,
        });
      }
    } else if (oldVal !== newVal) {
      changes.push({
        field,
        oldValue: oldVal !== undefined && oldVal !== null ? String(oldVal) : null,
        newValue: newVal !== undefined && newVal !== null ? String(newVal) : null,
      });
    }
  }

  return changes;
}
