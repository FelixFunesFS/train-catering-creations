
# Email Logo Display & Delivery Fixes

## Problem Summary

### 1. Logo Display Issue
The email templates reference logos from `SITE_URL` which either:
- Falls back to `soultrainseatery.lovable.app` (incorrect - shows placeholder page)
- May be set to a domain that doesn't serve the images

**Current code:**
```typescript
const SITE_URL = Deno.env.get('SITE_URL') || 'https://soultrainseatery.lovable.app';
export const LOGO_URLS = {
  red: `${SITE_URL}/images/logo-red.svg`,
  white: `${SITE_URL}/images/logo-white.svg`,
};
```

**Issues:**
- Default URL `soultrainseatery.lovable.app` returns a placeholder page
- SVG format has limited support in some email clients (especially Gmail desktop)
- Images must be publicly accessible via HTTPS

### 2. Email Delivery Issue
The analytics show the email to `envision@mkqconsulting.com` was successfully sent via SMTP at `01:15:19`. This is a delivery/filtering issue, not a sending failure.

---

## Solution

### Step 1: Update SITE_URL Secret
Update the Supabase secret `SITE_URL` to use the correct published domain:
- **Current published URL**: `https://train-catering-creations.lovable.app`
- This domain correctly serves the logo files at `/images/logo-white.svg`

### Step 2: Convert Logos to PNG (Email Client Compatibility)
Gmail desktop and some other email clients have issues with SVG images. Convert to PNG:

1. Add PNG versions of logos to `public/images/`:
   - `logo-white.png`
   - `logo-red.png`

2. Update `emailTemplates.ts` to use PNG:
```typescript
export const LOGO_URLS = {
  red: `${SITE_URL}/images/logo-red.png`,
  white: `${SITE_URL}/images/logo-white.png`,
};
```

### Step 3: Update Default Fallback URL
Change the hardcoded fallback to the correct published URL:

```typescript
const SITE_URL = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';
```

---

## Email Delivery Troubleshooting

For the envision@mkqconsulting.com delivery issue:

1. **Check Spam/Junk folder** - Corporate email servers often quarantine new senders
2. **Check Quarantine** (if using Microsoft 365) - Admin may need to release the message
3. **Add sender to contacts** - Adding `soultrainseatery@gmail.com` to contacts helps future deliverability
4. **SPF/DKIM records** - For long-term deliverability, ensure your Gmail SMTP has proper authentication records

The email was definitely sent successfully by the system - the analytics confirm `email_send_success` with a message ID.

---

## File Changes

| File | Change |
|------|--------|
| `public/images/logo-white.png` | New file - PNG version of white logo |
| `public/images/logo-red.png` | New file - PNG version of red logo |
| `supabase/functions/_shared/emailTemplates.ts` | Update fallback URL and logo file extensions to `.png` |

---

## Supabase Secret Update

**Secret to update:** `SITE_URL`  
**New value:** `https://train-catering-creations.lovable.app`

This ensures all email portal links and images point to the live published site.

---

## Why This Approach

1. **PNG over SVG**: PNG images have near-universal email client support, while SVG can be blocked by Gmail, Outlook, and others
2. **Correct URL**: The published URL (`train-catering-creations.lovable.app`) is verified to serve images correctly
3. **Fallback safety**: Updating the hardcoded fallback ensures emails still work if the secret is ever cleared
4. **No database changes**: All fixes are in edge function code and static assets
