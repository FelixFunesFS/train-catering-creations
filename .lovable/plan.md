

## Fix: Remove Redundant Access Check That Causes Black Screen on Refresh

### Problem

`isVerifyingAccess` is the direct cause of the black screen. When a logged-in admin refreshes `/admin`:

1. `initializeAuth` correctly validates the session and role
2. Supabase then fires a **duplicate** `SIGNED_IN` event
3. The handler at line 96-126 of `useAuth.tsx` sets `isVerifyingAccess = true` and re-runs the role check **with no timeout**
4. `ProtectedRoute` (line 75) sees `isVerifyingAccess = true` and shows the loading screen
5. If the RPC is slow, `isVerifyingAccess` stays stuck -- resulting in an infinite spinner / black screen

Non-logged-in users are unaffected because `ProtectedRoute` catches `!user` and redirects to `/admin/auth` immediately.

### Changes (3 files)

#### 1. `src/hooks/useAuth.tsx` -- Skip redundant SIGNED_IN after init

**Lines 96-126**: Add an early return before the existing handler. If `initializeAuth` already resolved the role (`initializedRef.current === true` and `userRole` is set), reuse that result instead of re-checking. Also add a 5-second timeout to the fallback `checkAccess` call for cases where the handler does need to run (fresh login).

```
// Add before existing line 96:
if (event === 'SIGNED_IN' && session?.user) {
  // Already resolved -- reuse, don't re-check
  if (initializedRef.current && userRole) {
    setSession(session);
    setUser(session.user);
    setLoading(false);
    return;
  }
  
  setIsVerifyingAccess(true);
  setTimeout(async () => {
    try {
      // Add 5s timeout (was missing)
      const role = await Promise.race([
        checkAccess(session.user.id),
        new Promise(r => setTimeout(() => r(null), 5000)),
      ]);
      // ... rest stays the same
```

#### 2. `src/pages/AdminAuth.tsx` -- Add 6-second escape hatch

If `isVerifyingAccess` somehow stays stuck (layers 1 and 2 both fail), stop waiting after 6 seconds and show the login form. The valid session will auto-redirect the user to the dashboard.

- Add a `verifyTimedOut` state with a `useEffect` timer
- Change the loading condition from `if (loading || isVerifyingAccess)` to `if (loading || (isVerifyingAccess && !verifyTimedOut))`

#### 3. `index.html` -- Add 8-second HTML fallback

Add a small inline script that redirects to `/admin/auth` if the React root is still empty after 8 seconds. This handles the extreme edge case where cached JS fails to execute entirely.

### What each layer catches

| Layer | Scenario | Timeout |
|-------|----------|---------|
| Layer 1 (useAuth skip) | Redundant SIGNED_IN after successful init | Instant -- no check runs at all |
| Layer 2 (Promise.race) | checkAccess hangs during fresh login | 5 seconds |
| Layer 3 (AdminAuth escape) | isVerifyingAccess stuck for any reason | 6 seconds |
| Layer 4 (HTML fallback) | React never mounts (stale cached JS) | 8 seconds |

### What stays the same

- The role-checking security model (server-side RPC verification)
- The `initializeAuth` flow (already works correctly)
- The login flow for fresh sign-ins
- Non-logged-in user behavior (already redirects correctly)

