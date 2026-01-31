
# Fix Plan: Admin Black Page Issue

## Root Cause

The admin page shows a black screen because there's a **race condition** between two permission-checking mechanisms:

1. **`useAuth.checkAdminAccess`** (just fixed) - Uses `has_role` RPC which bypasses RLS
2. **`usePermissions.loadUserRoles`** (still broken) - Queries `user_roles` table directly with RLS

When a user logs in via Google OAuth:
- The `useAuth` hook correctly identifies them as admin (via RPC)
- The `usePermissions` hook tries to query the `user_roles` table
- RLS policy `user_id = auth.uid()` may fail if the session isn't fully established
- `usePermissions` defaults to `['user']` role on error
- `ProtectedRoute` backup check sees `isAdmin() = false` and signs the user out

---

## Additional Issue: `track-visitor` Function Crash

The `track-visitor` edge function has a variable naming conflict causing 503 errors:
- Line 137: `const body: VisitorData = await req.json();`
- Line 230: `let body = ...` (notification message)

This causes the function to fail on boot, but doesn't directly cause the black page.

---

## Solution

### Fix 1: Update `usePermissions` to Use RPC (Critical)

Change `usePermissions` to use the `has_role` RPC function instead of querying the table directly. This ensures consistent behavior with `useAuth`.

| File | Change |
|------|--------|
| `src/hooks/usePermissions.ts` | Replace direct table query with `has_role` RPC calls |

**Before:**
```typescript
const { data, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user?.id);
```

**After:**
```typescript
// Check each role using the security definer RPC
const adminCheck = await supabase.rpc('has_role', { 
  _user_id: user.id, 
  _role: 'admin' 
});

if (adminCheck.data === true) {
  setRoles(['admin']);
  return;
}

// Fallback: try direct query (will work once session is stable)
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);
```

### Fix 2: Fix `track-visitor` Variable Collision

Rename the notification body variable to avoid collision with the request body.

| File | Change |
|------|--------|
| `supabase/functions/track-visitor/index.ts` | Rename `body` to `messageBody` for notification content |

---

## Technical Details

### `usePermissions` Changes

The hook will:
1. First check for admin role using the RPC (most important for access control)
2. Then optionally fetch full role list for granular permissions
3. Handle errors gracefully without defaulting to restricted access during OAuth

### `track-visitor` Changes

Simple variable rename:
- `let body = ...` becomes `let messageBody = ...`
- All references to the notification message body are updated

---

## Summary

| Issue | Severity | Fix |
|-------|----------|-----|
| `usePermissions` uses RLS-blocked query | **CRITICAL** | Use `has_role` RPC for admin check |
| `track-visitor` variable collision | Medium | Rename variable |

Once these changes are deployed, the admin login flow will work reliably because both permission checks use the same RLS-bypassing mechanism.
