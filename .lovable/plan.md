
# Remove Ceremony Option & Fix Email Logos

## Overview

This plan addresses two issues:
1. Remove the "Ceremony Included" checkbox from wedding quote forms while preserving backward compatibility for existing quotes
2. Fix email logo display in Outlook and other clients by switching from SVG to PNG format

---

## Part 1: Remove Ceremony Option from Wedding Forms

### Files to Modify

**1. src/components/quote/alternative-form/FinalStep.tsx**
- Remove the `ceremony_included` FormField block (lines 37-60)
- Keep only the `cocktail_hour` option in the wedding-specific grid

**2. src/components/quote/steps/SuppliesStep.tsx**
- Remove the `ceremony_included` FormField block (lines 42-63)
- Keep only the `cocktail_hour` option

**3. src/components/quote/SinglePageQuoteForm.tsx**
- Remove `ceremony_included: data.ceremony_included` from the submitPayload object (line 327)
- New submissions will no longer include this field

### What Stays Unchanged (Backward Compatibility)

The following will continue working for any existing quotes with `ceremony_included = true`:
- Database column remains intact
- Form schema keeps the optional field
- Invoice generation logic (creates line item only if true)
- Display components (show badge only if true)
- Email templates (show addon only if true)
- PDF generation (show only if true)

---

## Part 2: Fix Email Logo Display in Outlook

### Problem
Current email templates use SVG logos (`logo-red.svg`, `logo-white.svg`) which Outlook desktop fails to render properly.

### Solution
Switch to PNG format for universal email client compatibility.

### Files to Add

**1. public/images/logo-red.png**
- Copy from uploaded file (user-uploads://2.png - red BBQ fork/spatula logo)

**2. public/images/logo-white.png**
- Copy from uploaded file (user-uploads://3.png - white version for dark backgrounds)

### Files to Modify

**supabase/functions/_shared/emailTemplates.ts**

Update the LOGO_URLS constant (lines 23-26):

```typescript
// Before
export const LOGO_URLS = {
  red: `${SITE_URL}/images/logo-red.svg`,
  white: `${SITE_URL}/images/logo-white.svg`,
};

// After
export const LOGO_URLS = {
  red: `${SITE_URL}/images/logo-red.png`,
  white: `${SITE_URL}/images/logo-white.png`,
};
```

This single change propagates to all email templates since they use the shared `LOGO_URLS` constant.

---

## Summary of Changes

| Area | Action | Impact |
|------|--------|--------|
| FinalStep.tsx | Remove ceremony field | Wedding form loses option |
| SuppliesStep.tsx | Remove ceremony field | Backup form loses option |
| SinglePageQuoteForm.tsx | Remove from payload | New quotes won't set ceremony |
| emailTemplates.ts | Change .svg to .png | Logos work in all email clients |
| public/images/ | Add PNG logo files | New assets from uploaded files |

### Benefits

- Ceremony option removed from customer-facing forms
- Existing quotes with ceremony selections still display correctly
- Email logos now render properly in Outlook, Gmail, Yahoo, and all major clients
- PNG format is universally supported across all email platforms
