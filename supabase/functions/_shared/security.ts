/**
 * Security utilities for edge functions
 * Provides HTML sanitization, error handling, and authentication
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

/**
 * Verifies that the request has a valid admin JWT token
 * @param req - The incoming request
 * @returns Object with isAdmin flag, userId, and error if any
 */
export async function verifyAdminAuth(req: Request): Promise<{
  isAdmin: boolean;
  userId: string | null;
  error: string | null;
}> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, userId: null, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return { isAdmin: false, userId: null, error: 'Service configuration error' };
    }

    // Create client with the user's token to verify authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { isAdmin: false, userId: null, error: 'Invalid or expired token' };
    }

    // Check if user has admin role using service role key
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      return { isAdmin: false, userId: user.id, error: 'Service configuration error' };
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return { isAdmin: false, userId: user.id, error: 'User is not an admin' };
    }

    return { isAdmin: true, userId: user.id, error: null };
  } catch (error) {
    console.error('[verifyAdminAuth] Error:', error);
    return { isAdmin: false, userId: null, error: 'Authentication verification failed' };
  }
}

/**
 * Verifies that the request is from an internal edge function (server-to-server)
 * Checks for presence of service role key or internal header
 * @param req - The incoming request
 * @returns True if request is from internal source
 */
export function isInternalRequest(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey) return false;

  // Check if using service role key (internal edge function calls)
  return authHeader === `Bearer ${serviceRoleKey}`;
}

/**
 * Verifies invoice access using customer access token
 * @param invoiceId - The invoice ID to verify
 * @param accessToken - Customer access token from URL/request
 * @returns True if access is valid
 */
export async function verifyInvoiceAccess(invoiceId: string, accessToken: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) return false;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('customer_access_token', accessToken)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

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

/**
 * Creates an unauthorized response
 */
export function createUnauthorizedResponse(
  message: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ message, code: 'UNAUTHORIZED' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}