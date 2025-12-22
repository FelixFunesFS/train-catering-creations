/**
 * Shared formatting utilities for consistent display across the application
 * All timestamps are displayed in Eastern Time (ET) unless otherwise specified
 */

/**
 * Format cents to currency string (e.g., 12500 → "$125.00")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Format date string to readable format (e.g., "December 25, 2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
}

/**
 * Format date to short format (e.g., "Dec 25, 2024")
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
}

/**
 * Format time string to readable format (e.g., "14:30" → "2:30 PM")
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Format service type for display (e.g., "drop-off" → "Drop-Off")
 */
export function formatServiceType(serviceType: string): string {
  const serviceTypeMap: Record<string, string> = {
    'delivery-only': 'Delivery Only',
    'delivery-setup': 'Delivery + Setup',
    'full-service': 'Full-Service Catering',
  };
  return serviceTypeMap[serviceType] || serviceType;
}

/**
 * Format event type for display (e.g., "corporate" → "Corporate")
 */
export function formatEventType(eventType: string): string {
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  return statusColors[status] || 'bg-muted text-muted-foreground';
}

/**
 * Format timestamp to date and time in Eastern Time (e.g., "Dec 21, 2025 4:34 PM ET")
 */
export function formatDateTimeET(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  }) + ' ET';
}

/**
 * Format timestamp to short date/time in Eastern Time (e.g., "Dec 21 4:34p")
 * Useful for table columns where space is limited
 */
export function formatDateTimeShortET(timestamp: string): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  const formatted = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });
  // Shorten AM/PM to a/p for compactness
  return formatted.replace(' AM', 'a').replace(' PM', 'p');
}
