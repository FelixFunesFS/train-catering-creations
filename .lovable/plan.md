
# Fix Customer Email Logos Not Displaying

## Problem Diagnosis

The email templates ARE correctly using the PNG logos (`logo-white.png` and `logo-red.png`) from `public/images/`. However, the logos may not be displaying due to:

1. **SITE_URL Secret Misconfiguration** - The secret may be set to an incorrect domain (e.g., `mkqdevtesting.com`) that doesn't serve the images
2. **Inconsistent Fallback URLs** - Different edge functions have different fallback URLs:
   - `emailTemplates.ts`: `train-catering-creations.lovable.app` 
   - `send-quote-notification`: `soultrainseatery.lovable.app`

## Current State

| File | Logo Source | Status |
|------|-------------|--------|
| `_shared/emailTemplates.ts` | `${SITE_URL}/images/logo-white.png` | Uses PNG |
| `_shared/emailTemplates.ts` | `${SITE_URL}/images/logo-red.png` | Uses PNG (footer) |
| `generate-invoice-pdf/index.ts` | Hardcoded lovable-uploads URL | Separate issue |

The PNG files exist at:
- `public/images/logo-white.png` (white logo on transparent)
- `public/images/logo-red.png` (red logo on transparent)

## Solution

### Step 1: Standardize Fallback URLs

Update all edge functions to use the correct published URL as fallback:

**File: `supabase/functions/_shared/emailTemplates.ts` (line 19)**
```typescript
// Before
const SITE_URL = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';

// After (no change needed - this is correct)
```

**File: `supabase/functions/send-quote-notification/index.ts` (line 97)**
```typescript
// Before
const siteUrl = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';

// After
const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';
```

### Step 2: Verify SITE_URL Secret

The SITE_URL secret should be set to the published URL:
```
https://train-catering-creations.lovable.app
```

If it's currently set to a different domain (like `mkqdevtesting.com`), the images won't load because that domain doesn't have the `/images/logo-*.png` files.

**Action Required:** Check and update the SITE_URL secret in Supabase Edge Functions settings if needed.

### Step 3: Redeploy Edge Functions

After updating the code, redeploy these edge functions:
- `send-quote-notification`
- `send-quote-confirmation` (uses shared emailTemplates.ts)
- `send-customer-portal-email` (uses shared emailTemplates.ts)

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/send-quote-notification/index.ts` | Fix fallback URL from `soultrainseatery.lovable.app` to `train-catering-creations.lovable.app` |

## Verification Steps

After implementation:
1. Send a test email using the Email Preview in admin
2. Check the email source to verify the logo URL is correct
3. Confirm the logo displays in the email client

## Technical Notes

- The PNG logos in `public/images/` are correctly accessible at `https://train-catering-creations.lovable.app/images/logo-white.png` and `logo-red.png`
- The `logo-white.png` is white on transparent background (designed for crimson header)
- The `logo-red.png` is red on transparent background (designed for white footer)
- If SITE_URL secret is misconfigured, you'll need to update it in Supabase Dashboard > Settings > Edge Functions > Secrets
