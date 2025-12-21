/**
 * Security utilities for edge functions
 * Provides HTML sanitization and error handling
 */

/**
 * Escapes HTML special characters to prevent XSS attacks in email templates
 * @param text - User-provided text to sanitize
 * @returns Sanitized text safe for HTML embedding
 */
export function escapeHtml(text: string | null | undefined): string {
  if (text === null || text === undefined) {
    return '';
  }
  
  const str = String(text);
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return str.replace(/[&<>"'`=/]/g, (char) => map[char] || char);
}

/**
 * Escapes HTML in an array of strings
 * @param items - Array of user-provided strings to sanitize
 * @returns Array of sanitized strings
 */
export function escapeHtmlArray(items: string[] | null | undefined): string[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  return items.map(escapeHtml);
}

/**
 * Sanitizes an object's string values for HTML output
 * @param obj - Object with potentially unsafe string values
 * @param keysToSanitize - Array of keys whose values should be sanitized
 * @returns Object with sanitized values
 */
export function sanitizeObjectForHtml<T extends Record<string, any>>(
  obj: T,
  keysToSanitize: (keyof T)[]
): T {
  const result = { ...obj };
  for (const key of keysToSanitize) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as any)[key] = escapeHtml(value);
    } else if (Array.isArray(value)) {
      (result as any)[key] = escapeHtmlArray(value);
    }
  }
  return result;
}

// Error codes for client-side handling
export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'CONFIGURATION_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR';

interface SanitizedError {
  message: string;
  code: ErrorCode;
}

/**
 * Maps internal errors to safe client-facing messages
 * Logs full error details server-side for debugging
 * @param error - The caught error
 * @param context - Description of where the error occurred
 * @returns Safe error object for client response
 */
export function sanitizeError(error: Error | unknown, context: string): SanitizedError {
  // Log full error details server-side
  console.error(`[${context}] Error:`, error);
  
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  // Map specific error patterns to safe messages and codes
  if (errorMessage.includes('not found')) {
    return {
      message: 'The requested resource was not found',
      code: 'NOT_FOUND'
    };
  }
  
  if (errorMessage.includes('missing required') || errorMessage.includes('invalid')) {
    return {
      message: 'Invalid request data provided',
      code: 'VALIDATION_ERROR'
    };
  }
  
  if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
    return {
      message: 'Access denied',
      code: 'UNAUTHORIZED'
    };
  }
  
  if (errorMessage.includes('not configured') || errorMessage.includes('environment')) {
    return {
      message: 'Service temporarily unavailable',
      code: 'CONFIGURATION_ERROR'
    };
  }
  
  if (errorMessage.includes('stripe') || errorMessage.includes('gmail') || errorMessage.includes('api')) {
    return {
      message: 'External service error occurred',
      code: 'EXTERNAL_SERVICE_ERROR'
    };
  }
  
  // Default fallback - never expose internal details
  return {
    message: 'An error occurred processing your request',
    code: 'INTERNAL_ERROR'
  };
}

/**
 * Creates a standardized error response
 * @param error - The caught error
 * @param context - Description of where the error occurred
 * @param corsHeaders - CORS headers to include
 * @param status - HTTP status code (default: 500)
 */
export function createErrorResponse(
  error: Error | unknown,
  context: string,
  corsHeaders: Record<string, string>,
  status: number = 500
): Response {
  const sanitized = sanitizeError(error, context);
  
  return new Response(
    JSON.stringify(sanitized),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}
