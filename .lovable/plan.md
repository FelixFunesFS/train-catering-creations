

# Fix Plan: Inconsistent URL Redirects Causing Admin Black Page

## Root Cause Identified

There are **TWO separate issues** causing the admin redirect to `localhost`:

### Issue 1: Supabase Dashboard Configuration (CRITICAL)
The Supabase Dashboard's **Authentication URL Configuration** has:
- **Site URL**: `http://localhost:3000` (this is the problem!)
- This setting controls where OAuth callbacks redirect

When you sign in with Google on `https://www.soultrainseatery.com/admin`, Supabase's server sends the OAuth callback to `localhost:3000` instead of your production domain.

### Issue 2: supabase/config.toml (Local Dev Only)
```toml
# Line 32-33:
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
```
This file only affects local development, but should be updated for consistency.

### Issue 3: Inconsistent Fallback URLs in Edge Functions
Several edge functions have inconsistent fallback URLs:

| File | Line | Current Fallback | Should Be |
|------|------|------------------|-----------|
| `_shared/emailTemplates.ts` | 1298 | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `_shared/emailTemplates.ts` | 1605 | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `send-event-reminders/index.ts` | 57 | `soultrainseatery.lovable.app` | `www.soultrainseatery.com` |

---

## Required Fixes

### Fix 1: Supabase Dashboard Configuration (MANUAL - Cannot be done by code)

You must update these settings in the **Supabase Dashboard**:

**Location**: [Authentication URL Configuration](https://supabase.com/dashboard/project/qptprrqjlcvfkhfdnnoa/auth/url-configuration)

| Setting | Current Value | Change To |
|---------|--------------|-----------|
| Site URL | `http://localhost:3000` | `https://www.soultrainseatery.com` |

**Redirect URLs to Add**:
- `https://www.soultrainseatery.com/**`
- `https://www.soultrainseatery.com/admin`
- `https://train-catering-creations.lovable.app/**` (keep for staging)
- `https://id-preview--c4c8d2d1-63da-4772-a95b-bf211f87a132.lovable.app/**` (keep for preview)

### Fix 2: Update config.toml (Code Change)

Update the local config to reflect production URLs for documentation clarity:

**File**: `supabase/config.toml`
```toml
[auth]
site_url = "https://www.soultrainseatery.com"
additional_redirect_urls = [
  "https://www.soultrainseatery.com/**",
  "https://train-catering-creations.lovable.app/**",
  "http://localhost:3000"
]
```

### Fix 3: Fix Inconsistent Edge Function Fallbacks (Code Changes)

**File**: `supabase/functions/_shared/emailTemplates.ts`
- Line 1298: Change fallback from `train-catering-creations.lovable.app` to `www.soultrainseatery.com`
- Line 1605: Change fallback from `train-catering-creations.lovable.app` to `www.soultrainseatery.com`

**File**: `supabase/functions/send-event-reminders/index.ts`
- Line 57: Change fallback from `soultrainseatery.lovable.app` to `www.soultrainseatery.com`

---

## Why This Happens

The OAuth flow works like this:

```text
1. User clicks "Sign in with Google" on www.soultrainseatery.com
2. App calls supabase.auth.signInWithOAuth({ redirectTo: window.location.origin + '/admin' })
3. Supabase receives the request
4. Supabase's SERVER checks its Site URL setting (localhost:3000)
5. After Google auth, Supabase redirects to localhost:3000 (ignoring the client-side redirectTo)
6. User sees "localhost refused to connect"
```

The `redirectTo` parameter in the code is **overridden** by Supabase's server-side Site URL configuration.

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/config.toml` | Update `site_url` and `additional_redirect_urls` |
| `supabase/functions/_shared/emailTemplates.ts` | Fix 2 fallback URLs |
| `supabase/functions/send-event-reminders/index.ts` | Fix 1 fallback URL |

---

## Summary

| Issue | Type | Fix |
|-------|------|-----|
| OAuth redirects to localhost | **Dashboard Config** | Update Site URL in Supabase Dashboard |
| Inconsistent fallback URLs | Code | Update 3 edge function files |
| Local dev config outdated | Code | Update config.toml |

**Most Critical**: The Supabase Dashboard Site URL setting MUST be changed to `https://www.soultrainseatery.com` for the admin login to work on your custom domain.

