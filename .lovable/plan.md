

# Verification & Fix Plan: Push Notifications End-to-End

## Current Status

You've updated the VAPID keys in:
- `.env` file: `VITE_VAPID_PUBLIC_KEY` is now set
- Supabase secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` are configured

## Critical Issues Found

### Issue 1: Service Worker Push Handlers Not Loaded (CRITICAL)

The `public/sw-push.js` file contains the push notification event handlers:
- `push` event - shows the notification
- `notificationclick` event - opens the app when clicked
- `notificationclose` event - logging

**Problem**: This file is never imported into the service worker. The VitePWA plugin generates its own Workbox service worker, but it doesn't include the custom push handlers.

**Impact**: When push notifications arrive, the service worker won't know how to display them.

### Issue 2: Edge Function VAPID Signing is Broken (CRITICAL)

In `supabase/functions/send-push-notification/index.ts`, line 166:
```typescript
// For simplicity, we'll create a basic JWT structure
// In production, you'd want proper ECDSA signing
const jwt = `${headerB64}.${payloadB64}.signature`;
```

The JWT signature is literally the string "signature" instead of an actual cryptographic signature.

**Impact**: All push notification requests to push services (FCM, Apple, etc.) will fail authentication.

---

## Solution

### Fix 1: Integrate Push Handlers into Service Worker

Configure VitePWA to use `injectManifest` mode and import the push handlers:

**File: `vite.config.ts`**
- Change from `generateSW` (implicit) to `injectManifest` mode
- OR use the `importScripts` option to load `sw-push.js`

**Simpler approach**: Use the `additionalManifestEntries` and custom service worker:
```typescript
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'public',
  filename: 'sw-push.js',
  // ... rest of config
})
```

### Fix 2: Implement Proper VAPID Signing in Edge Function

Replace the placeholder with actual ECDSA P-256 signing using Deno's Web Crypto API.

**File: `supabase/functions/send-push-notification/index.ts`**

The VAPID private key needs to be:
1. Converted from base64url to raw bytes
2. Imported as an ECDSA P-256 key
3. Used to sign the JWT header.payload

---

## Technical Changes

| File | Change |
|------|--------|
| `vite.config.ts` | Switch to `injectManifest` strategy to include push handlers |
| `public/sw.ts` (NEW) | Create custom service worker that imports Workbox and push handlers |
| `supabase/functions/send-push-notification/index.ts` | Implement proper ECDSA signing for VAPID JWT |

---

## Implementation Details

### 1. Custom Service Worker (`public/sw.ts`)

Create a custom service worker that:
- Imports Workbox for caching
- Includes push notification handlers
- Handles notification clicks to open the admin portal

### 2. VitePWA Configuration

Update to use `injectManifest`:
```typescript
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'public',
  filename: 'sw.ts',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
    globIgnores: ['**/lovable-uploads/**'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  },
  // ...
})
```

### 3. Fix VAPID Signing

Implement proper ECDSA signing:
```typescript
async function signVapidJwt(
  headerPayload: string,
  privateKeyBase64: string
): Promise<string> {
  // Convert base64url to raw 32-byte private key
  const keyBytes = base64UrlToUint8Array(privateKeyBase64);
  
  // Import as ECDSA P-256 key
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  
  // Sign the JWT
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(headerPayload)
  );
  
  return base64UrlEncode(signature);
}
```

---

## Summary

| Issue | Severity | Fix |
|-------|----------|-----|
| Push handlers not in service worker | **CRITICAL** | Switch to injectManifest, create custom SW |
| VAPID JWT not signed | **CRITICAL** | Implement ECDSA signing in edge function |
| VAPID keys configured | **DONE** | Already set in .env and Supabase |

Both issues must be fixed for push notifications to work. The first prevents notifications from being displayed, and the second prevents them from being sent.

