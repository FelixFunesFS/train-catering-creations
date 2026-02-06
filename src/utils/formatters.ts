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

import { parseDateFromLocalString } from './dateHelpers';

/**
 * Format date string to readable format (e.g., "December 25, 2024")
 * Uses local parsing to prevent off-by-one day bugs from UTC conversion
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'TBD';
  const date = parseDateFromLocalString(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date to short format (e.g., "Dec 25, 2024")
 * Uses local parsing to prevent off-by-one day bugs from UTC conversion
 */
export function formatDateShort(dateString: string): string {
  if (!dateString) return 'TBD';
  const date = parseDateFromLocalString(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    estimated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    awaiting_payment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    partially_paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    payment_pending: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
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

/**
 * Format referral source for display (e.g., "google_search" → "Google Search")
 */
export function formatReferralSource(source: string): string {
  if (!source) return '';
  const sourceMap: Record<string, string> = {
    'google': 'Google Search',
    'google_search': 'Google Search',
    'social_media': 'Social Media',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'friend_family': 'Friend/Family Referral',
    'friend_family_referral': 'Friend/Family Referral',
    'previous_customer': 'Previous Customer',
    'local_business': 'Local Business Referral',
    'local_business_referral': 'Local Business Referral',
    'website': 'Website',
    'word_of_mouth': 'Word of Mouth',
    'other': 'Other',
  };
  return sourceMap[source] || source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
