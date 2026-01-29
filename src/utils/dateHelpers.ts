/**
 * Date Helpers - Locale-aware date utilities
 * 
 * These utilities prevent the off-by-one day bug caused by UTC conversion.
 * When using toISOString() on a local Date object, the timezone offset causes
 * dates to shift (e.g., March 15 midnight EST becomes March 14 19:00 UTC).
 * 
 * Use these helpers when:
 * - Converting Date picker values to YYYY-MM-DD strings for storage
 * - Parsing YYYY-MM-DD strings for date comparisons
 * - Any date handling where timezone precision matters
 */

/**
 * Format a Date object to YYYY-MM-DD string using LOCAL timezone
 * Prevents the off-by-one day bug caused by UTC conversion
 * 
 * @example
 * // User selects March 15, 2026 in date picker
 * formatDateToLocalString(new Date(2026, 2, 15)) // Returns "2026-03-15"
 */
export function formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object in LOCAL timezone
 * Use this instead of new Date(dateString) to avoid timezone shifts
 * 
 * @example
 * parseDateFromLocalString("2026-03-15") // Returns Date at midnight local time
 */
export function parseDateFromLocalString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date as a YYYY-MM-DD string in local timezone
 */
export function getTodayLocalString(): string {
  return formatDateToLocalString(new Date());
}

/**
 * Calculate days between two dates (ignores time component)
 * Positive if date2 is after date1
 */
export function daysBetweenDates(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date and return as YYYY-MM-DD string
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const date = parseDateFromLocalString(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToLocalString(date);
}

/**
 * Subtract days from a date and return a new Date
 */
export function subtractDaysFromDate(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - days);
  return result;
}
