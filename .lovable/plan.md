

# Fix Plan: Admin Black Page After OAuth Sign-In

## Root Cause Analysis

After thorough investigation, there are **two interacting issues**:

### Issue 1: OAuth Callback Redirecting to Wrong Domain (Immediate Cause)

When you signed in with Google, the callback redirected to:
```
https://preview--train-catering-creations.lovable.app/admin#access_token=...
```

Instead of:
```
https://www.soultrainseatery.com/admin#access_token=...
```

**Why this happens:**
- The `signInWithGoogle` function in `useAuth.tsx` (line 187) uses `window.location.origin`
- If you're on a preview/staging URL when you click "Sign in with Google", that's where the callback returns
- However, the Supabase **Site URL** setting determines the *default* callback when OAuth flows don't specify one

**Your Supabase Dashboard shows correct settings**, but you may have initiated the sign-in from a preview URL rather than www.soultrainseatery.com.

### Issue 2: Admin Role Verification Blocking Access (Secondary Cause)

The `useAuth` hook (lines 51-75) performs an admin role check on every `SIGNED_IN` event. If this check fails or times out, it:
1. Sets `isVerifyingAccess = true`
2. Calls `checkAdminAccess()`
3. If it fails, signs the user out

**The `has_role` RPC function is correctly set up as SECURITY DEFINER**, so it should bypass RLS. The database confirms your user has the admin role:

| user_id | role | created_at |
|---------|------|------------|
| 625eab9e-6da2-4d25-b491-0549cc80a3cc | admin | 2025-09-07 |

---

## Proposed Solution

### Fix 1: Hardcode Production Domain for OAuth Redirects

Instead of using `window.location.origin` (which varies based on where you're browsing from), force OAuth redirects to always go to the production domain.

**File: `src/hooks/useAuth.tsx`**

Change line 187 from:
```typescript
redirectTo: `${window.location.origin}/admin`
```

To:
```typescript
redirectTo: 'https://www.soultrainseatery.com/admin'
```

Also update lines 139, 145, and 171 for email signup and password reset flows.

### Fix 2: Add Error Handling for Admin Role Check

The `checkAdminAccess` function silently fails if the RPC call errors. Add better error handling and retry logic.

**File: `src/hooks/useAuth.tsx`**

Update `checkAdminAccess` function to:
1. Add a retry mechanism for transient network failures
2. Log errors more clearly for debugging
3. Add a timeout fallback

### Fix 3: Relax Admin-Only Enforcement (Optional - Per Your Preference)

You chose "Keep strict admin-only sessions", so the current behavior of signing out non-admins is correct. However, the aggressive check in `onAuthStateChange` can cause race conditions.

**Recommendation**: Move the admin check to happen *after* session is fully established, not during the auth state change callback.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAuth.tsx` | Hardcode production domain for all OAuth/email redirects; improve error handling in checkAdminAccess |

---

## Technical Details

### Current Flow (Problematic)
```
1. User on preview URL clicks "Sign in with Google"
2. redirectTo = preview URL (from window.location.origin)
3. Google OAuth completes
4. Supabase redirects to preview URL with access_token
5. App loads on preview URL
6. checkAdminAccess() runs → works
7. But user is on wrong domain → confusion/issues
```

### Fixed Flow
```
1. User on ANY URL clicks "Sign in with Google"  
2. redirectTo = www.soultrainseatery.com (hardcoded)
3. Google OAuth completes
4. Supabase redirects to production URL with access_token
5. App loads on production URL
6. checkAdminAccess() runs → works
7. User is on correct domain → success
```

---

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Wrong redirect domain | `window.location.origin` varies by URL | Hardcode production domain |
| Admin check timing | Race condition during auth state change | Improve error handling |

The primary fix is **hardcoding the production redirect URL** so that no matter where you initiate sign-in from (preview, lovable.app, or production), you always end up on www.soultrainseatery.com/admin after authentication.

