
# Hide Mobile Action Bar on Customer Portal Pages

## Problem
The mobile action bar with "Request Quote" and "Text" buttons displays on customer portal pages, which is not appropriate since customers are viewing their specific estimate/invoice.

## Solution
Update the `MobileActionBar.tsx` component to detect customer portal routes and hide the action bar on those pages.

## File to Modify

| File | Change |
|------|--------|
| `src/components/mobile/MobileActionBar.tsx` | Add customer portal route detection to hide the action bar |

## Implementation Details

### MobileActionBar.tsx

Add a check for customer portal routes (around line 25-28):

**Current code:**
```typescript
const isAdmin = pathname.startsWith("/admin");
const isMobileQuoteWizard = /^\/request-quote\/(regular|wedding)$/.test(pathname);
const isHomePage = pathname === "/" || pathname === "";

// Hide on admin, quote wizard, or when hero is visible on home page
const hidden = isAdmin || isMobileQuoteWizard || (isHomePage && isHeroVisible);
```

**Updated code:**
```typescript
const isAdmin = pathname.startsWith("/admin");
const isMobileQuoteWizard = /^\/request-quote\/(regular|wedding)$/.test(pathname);
const isHomePage = pathname === "/" || pathname === "";

// Customer portal routes where action bar should be hidden
const isCustomerPortal = 
  pathname === "/estimate" ||
  pathname === "/customer-portal" ||
  pathname.startsWith("/customer/") ||
  pathname.startsWith("/estimate-preview/") ||
  pathname.startsWith("/invoice/public/");

// Hide on admin, quote wizard, customer portal, or when hero is visible on home page
const hidden = isAdmin || isMobileQuoteWizard || isCustomerPortal || (isHomePage && isHeroVisible);
```

## Customer Portal Routes Covered

| Route Pattern | Description |
|---------------|-------------|
| `/estimate` | Direct estimate view |
| `/customer-portal` | Customer portal entry |
| `/customer/estimate/:token` | Token-based estimate access |
| `/customer/estimate-preview/:invoiceId` | Invoice preview |
| `/estimate-preview/:token` | Estimate preview |
| `/invoice/public/:invoiceToken` | Public invoice view |

## Testing Checklist

1. Mobile: Visit `/estimate?token=...` - action bar should be hidden
2. Mobile: Visit `/customer-portal?token=...` - action bar should be hidden
3. Mobile: Visit home page - action bar should still show (when hero not visible)
4. Mobile: Visit other pages like `/menu`, `/about` - action bar should still show
5. Desktop: No change in behavior (action bar is mobile-only)
