
# Fix Plan: Restore Admin Google OAuth Login

## Root Cause

The admin user (`soultrainseatery@gmail.com`) is being immediately signed out after a successful Google OAuth login due to a timing/RLS issue:

1. Google OAuth completes successfully (confirmed in Supabase logs)
2. The `onAuthStateChange` callback fires with `SIGNED_IN` event
3. `checkAdminAccess()` queries the `user_roles` table
4. The RLS policy `user_id = auth.uid()` may block the query if the session isn't fully established yet
5. When `checkAdminAccess` returns `false` (due to empty result or error), the user is immediately signed out

The user **does have an admin role** in the database (confirmed), so this is a timing/query issue, not a permissions issue.

---

## Quick Fix (Recommended)

Modify the `checkAdminAccess` function to use a more reliable approach that works even during the OAuth callback timing window.

### Option A: Use the has_role Database Function (Best)

The project already has a `has_role(_user_id uuid, _role user_role)` function defined as `SECURITY DEFINER`. This function bypasses RLS and can check roles reliably.

**Change in `src/hooks/useAuth.tsx`:**

Replace the current `checkAdminAccess` function to call the database function via RPC instead of querying the table directly.

### Option B: Add Retry Logic with Delay

Add a small delay and retry mechanism to handle the timing issue.

---

## Implementation Details

### Primary Fix: Use RPC Call to has_role Function

The existing `has_role` database function is defined as `SECURITY DEFINER` which means it runs with elevated privileges and bypasses RLS. We should use this instead of querying the table directly.

**File: `src/hooks/useAuth.tsx`**

```typescript
// Replace the checkAdminAccess function with this:
const checkAdminAccess = async (userId: string): Promise<boolean> => {
  try {
    // Use the security definer function that bypasses RLS
    const { data, error } = await supabase
      .rpc('has_role', { 
        _user_id: userId, 
        _role: 'admin' 
      });
    
    if (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
    
    return data === true;
  } catch (err) {
    console.error('Error checking admin access:', err);
    return false;
  }
};
```

This approach:
- Uses the existing `has_role` database function
- Bypasses RLS via `SECURITY DEFINER`
- Works reliably regardless of session timing
- Is already designed for this exact purpose

---

## Why This Fixes the Problem

| Current Approach | Problem |
|------------------|---------|
| Direct query: `supabase.from('user_roles').select(...)` | Subject to RLS policy `user_id = auth.uid()` which may fail if session isn't ready |

| New Approach | Solution |
|--------------|----------|
| RPC call: `supabase.rpc('has_role', {...})` | Uses `SECURITY DEFINER` function that bypasses RLS |

The `has_role` function already exists and is specifically designed for this use case:

```sql
create or replace function public.has_role(_user_id uuid, _role user_role)
returns boolean
language sql
stable
security definer  -- <-- This is key - bypasses RLS
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Replace `checkAdminAccess` to use `supabase.rpc('has_role', ...)` instead of direct table query |

---

## Alternative: Add Fallback Retry

If for any reason the RPC approach doesn't work, we can add a retry mechanism:

```typescript
const checkAdminAccess = async (userId: string, retries = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });
      
      if (!error && data === true) {
        return true;
      }
      
      // Wait before retry
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      console.error(`Admin check attempt ${i + 1} failed:`, err);
    }
  }
  return false;
};
```

---

## Testing

After implementation:
1. Navigate to `/admin/auth`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Verify redirect to `/admin` dashboard (not kicked back to login)

---

## Summary

The fix is simple: change one function to use the existing `has_role` RPC call instead of a direct table query. This uses `SECURITY DEFINER` to bypass RLS and eliminates the timing issue.
