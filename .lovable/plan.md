

## Fix: Eliminate Two-Flag Race Condition in Auth Initialization

### Root Cause (The Real One)

The black screen is caused by a **state gap** between two flags in `useAuth.tsx`:

```text
Line 165: setLoading(false)      -- ProtectedRoute stops showing spinner
Line 166: initializedRef = true
Line 169: setIsVerifyingAccess(true) -- but React may have already rendered!

During that render gap:
  loading = false
  user = exists
  isVerifyingAccess = false  (not yet set!)
  userRole = null

ProtectedRoute sees: user exists + no role + not verifying = REDIRECT or BLACK SCREEN
```

Even with React 18 batching, `async/await` boundaries can break batching guarantees, and the `getUser()` call before these lines introduces one.

### The Fix: Single Loading Gate

**Keep `loading=true` until session AND role are BOTH resolved.** Move `setLoading(false)` to the `finally` block so it only fires once, after everything is complete. Remove the intermediate `isVerifyingAccess` flag from the initialization path entirely.

### File: `src/hooks/useAuth.tsx`

Replace the `initializeAuth` function (lines 145-203) with:

```typescript
const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Validate token server-side BEFORE trusting the cached session
      const { error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.warn('Stale session detected, clearing:', userError.message);
        await supabase.auth.signOut();
        // State stays at defaults (null user), finally sets loading=false
        return;
      }

      // Token valid -- set user for ProtectedRoute, but keep loading=true
      // so the dashboard does NOT render yet
      setSession(session);
      setUser(session.user);

      // Resolve role BEFORE setting loading=false (no two-flag race)
      const role = await Promise.race([
        checkAccess(session.user.id, 2),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);

      if (!role) {
        // Valid session but no admin/staff role -- sign out
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setUserRole(null);
      } else {
        setUserRole(role);
      }
    }
  } catch (err) {
    console.error('Auth initialization error:', err);
  } finally {
    // SINGLE loading gate -- only goes false after everything is resolved
    setLoading(false);
    initializedRef.current = true;
  }
};
```

### File: `src/components/ProtectedRoute.tsx`

No changes needed -- the existing code already checks `authLoading` first, and since `loading` now stays `true` until role is resolved, `ProtectedRoute` will show `AuthLoadingScreen` throughout the entire initialization, then render the correct result (dashboard or redirect) in a single transition.

### Why This Fixes It Permanently

| Scenario | Old behavior | New behavior |
|---|---|---|
| Valid admin, fast network | loading=false before role check, gap causes flash | loading stays true until role confirmed, single transition to dashboard |
| Valid admin, slow network | 2-5s of black screen during role check | 2-5s of spinner, then dashboard |
| Stale token | Black screen until timeout | Spinner, then redirect to login |
| No session | Works (immediate redirect) | No change |
| Role check timeout (5s) | May get stuck | Spinner for 5s, then redirect to login |

### What About Auto-Login?

Still works. Returning admins with valid tokens will see a spinner for under 1 second (the time for `getUser()` + `checkAccess()` to complete), then the dashboard loads. This is standard behavior for production admin portals.

### What About the `onAuthStateChange` SIGNED_IN Handler?

The `isVerifyingAccess` flag is still used for the explicit sign-in flow (lines 96-126) where the user submits credentials. That path is separate from initialization and continues to work as-is.

