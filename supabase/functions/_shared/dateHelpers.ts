/**
 * Date Helpers for Edge Functions - Locale-aware date utilities
 * 
 * These utilities prevent the off-by-one day bug caused by UTC conversion.
 * When using toISOString() on a Date object, the timezone offset causes
 * dates to shift (e.g., March 15 midnight EST becomes March 14 19:00 UTC).
 * 
 * IMPORTANT: Edge functions run in UTC, so we use these helpers to ensure
 * consistent YYYY-MM-DD formatting that matches the stored database values.
 */

/**
 * Format a Date object to YYYY-MM-DD string
 * Uses UTC components to match database DATE type storage
 * 
 * For dates that originated from a YYYY-MM-DD database column,
 * this ensures we get back the same string.
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object at midnight local time
 * Avoids timezone shifts that occur with new Date(dateString)
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return formatDateToString(new Date());
}

/**
 * Calculate days between two dates (ignores time component)
 * Positive if date2 is after date1
 */
export function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date and return as YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToString(date);
}

/**
 * Subtract days from a date and return as YYYY-MM-DD string
 */
export function subtractDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() - days);
  return formatDateToString(date);
}

/**
 * Subtract days from a Date object and return a new Date
 */
export function subtractDaysFromDate(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Format a Date object to YYYY-MM-DD for database storage
 * Alias for formatDateToString for semantic clarity
 */
export function formatForDatabase(date: Date): string {
  return formatDateToString(date);
}
