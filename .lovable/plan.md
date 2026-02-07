

## Fix: Auth Hangs on New Browser Windows (isVerifyingAccess Never Resets)

### Root Cause Found

There is a critical bug in `useAuth.tsx` at line 149. When `checkAccess()` throws an uncaught exception or when `supabase.auth.signOut()` (line 140) throws, the code inside the `try` block never reaches `setIsVerifyingAccess(false)` on line 149.

```text
try {
  session = getSession()
  setIsVerifyingAccess(true)    <-- turns ON
  role = checkAccess(...)
  if (!role) signOut()          <-- can throw, skipping line 149
  setIsVerifyingAccess(false)   <-- NEVER REACHED if anything above throws
} catch {
  console.error(...)            <-- does NOT reset isVerifyingAccess
} finally {
  setLoading(false)             <-- loading is cleared, but...
  initializedRef = true
}
```

`ProtectedRoute` checks: `if (authLoading || isVerifyingAccess || rolesLoading)` -- since `isVerifyingAccess` stays `true` forever, the loading screen persists indefinitely. The page appears as a dark/black screen because the spinner blends with the dark-mode background.

A hard refresh works because it completely destroys the React state tree and restarts from scratch, sometimes with slightly different timing that avoids the error path.

### Why a Second Issue Exists

The Supabase SDK fires an `INITIAL_SESSION` event synchronously when `onAuthStateChange` is registered. The current code does not handle this event -- it falls through to a catch-all that sets `user` and `session` without managing any loading flags. This can cause a mismatch where `ProtectedRoute` sees a `user` but no resolved `role`, leading to incorrect redirects.

### The Fix -- 1 file: `src/hooks/useAuth.tsx`

**Change 1: Move `setIsVerifyingAccess(false)` into the `finally` block**
This guarantees it always resets, even if `checkAccess` or `signOut` throws.

**Change 2: Handle `INITIAL_SESSION` event explicitly**
Skip it (return early) and let `initializeAuth` be the single handler for the initial session. This prevents the listener from setting partial state.

**Change 3: Guard all unhandled events**
Any event that isn't `PASSWORD_RECOVERY`, `SIGNED_IN`, `SIGNED_OUT`, or `INITIAL_SESSION` should only update state after initialization is complete, to prevent partial state writes during startup.

### Technical Detail

```text
// Fixed initializeAuth
const initializeAuth = async () => {
  try {
    const session = await supabase.auth.getSession();
    if (session?.user) {
      setIsVerifyingAccess(true);
      const role = await checkAccess(session.user.id);
      if (!role) {
        await supabase.auth.signOut();
        // clear user/session/role state
      } else {
        // set user/session/role state
      }
    }
  } catch (err) {
    console.error('Auth initialization error:', err);
  } finally {
    setIsVerifyingAccess(false);   // <-- ALWAYS resets
    setLoading(false);
    initializedRef.current = true;
  }
};

// Fixed onAuthStateChange
onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') return;  // <-- let initializeAuth handle it
  if (event === 'PASSWORD_RECOVERY') { ... }
  if (event === 'SIGNED_IN' && !initializedRef.current) return;
  // ... rest stays the same
});
```

### Expected Result
- New browser windows with cached sessions will auto-login reliably
- If anything fails during initialization, the loading state always clears
- The 10-second timeout safety net (already in ProtectedRoute) will be reachable since `isVerifyingAccess` no longer hangs permanently
- Works across all browsers (Chrome, Edge, Safari, Firefox)
