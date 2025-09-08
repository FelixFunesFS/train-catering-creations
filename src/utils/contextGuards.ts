/**
 * Context Guard Utilities
 * Ensures proper separation between admin and customer contexts
 */

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/quotes', 
  '/admin/contracts'
] as const;

export const CUSTOMER_ROUTES = [
  '/customer',
  '/estimate-preview',
  '/quote-request'
] as const;

/**
 * Checks if the current context is admin-only
 */
export function isAdminContext(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * Checks if the current context is customer-only
 */
export function isCustomerContext(pathname: string): boolean {
  return pathname.startsWith('/customer') || 
         (!pathname.startsWith('/admin') && pathname.includes('estimate-preview'));
}

/**
 * Guards admin-only features from being used in customer context
 */
export function requireAdminContext(pathname: string, featureName: string): boolean {
  if (!isAdminContext(pathname)) {
    console.warn(`${featureName} is only available in admin context. Current path: ${pathname}`);
    return false;
  }
  return true;
}

/**
 * Guards customer-only features from being used in admin context
 */
export function requireCustomerContext(pathname: string, featureName: string): boolean {
  if (!isCustomerContext(pathname)) {
    console.warn(`${featureName} is only available in customer context. Current path: ${pathname}`);
    return false;
  }
  return true;
}

/**
 * Sanitizes props to ensure admin-only props don't leak to customer components
 */
export function sanitizePropsForCustomer<T extends Record<string, any>>(
  props: T,
  adminOnlyProps: (keyof T)[]
): Omit<T, keyof T> {
  const sanitized = { ...props };
  
  adminOnlyProps.forEach(prop => {
    delete sanitized[prop];
  });
  
  return sanitized;
}

/**
 * Route validation helpers
 */
export function validateEstimatePreviewRoute(pathname: string, invoiceId?: string): {
  isValid: boolean;
  context: 'admin' | 'customer';
  error?: string;
} {
  if (!invoiceId) {
    return {
      isValid: false,
      context: isAdminContext(pathname) ? 'admin' : 'customer',
      error: 'Invoice ID is required'
    };
  }

  if (isAdminContext(pathname)) {
    const adminPattern = /^\/admin\/estimate-preview\/[^\/]+$/;
    return {
      isValid: adminPattern.test(pathname),
      context: 'admin',
      error: !adminPattern.test(pathname) ? 'Invalid admin estimate preview route' : undefined
    };
  }

  // Customer context validation
  const customerPattern = /^\/estimate-preview\/[^\/]+$/;
  return {
    isValid: customerPattern.test(pathname),
    context: 'customer',
    error: !customerPattern.test(pathname) ? 'Invalid customer estimate preview route' : undefined
  };
}

/**
 * Feature flag helpers for context-specific functionality
 */
export interface ContextFeatures {
  canEdit: boolean;
  canViewAnalytics: boolean;
  canManageCustomers: boolean;
  canAccessWorkflow: boolean;
  canApproveEstimates: boolean;
  canRequestChanges: boolean;
  canMakePayments: boolean;
  canDownloadPDF: boolean;
  canPrint: boolean;
}

export function getContextFeatures(pathname: string): ContextFeatures {
  const isAdmin = isAdminContext(pathname);
  
  return {
    canEdit: isAdmin,
    canViewAnalytics: isAdmin,
    canManageCustomers: isAdmin,
    canAccessWorkflow: isAdmin,
    canApproveEstimates: !isAdmin, // Customer-only feature
    canRequestChanges: !isAdmin,   // Customer-only feature
    canMakePayments: !isAdmin,     // Customer-only feature
    canDownloadPDF: true,          // Available to both
    canPrint: true                 // Available to both
  };
}