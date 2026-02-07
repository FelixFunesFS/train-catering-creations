

## Revised Fix: Instant Admin Portal Load with Background Verification

### The Real Problem

The current flow blocks rendering the admin portal until an RPC call (`has_any_role`) completes. With a cached session, this should be instant -- but if the RPC is slow, hangs, or the token needs refreshing, you stare at a dark loading screen that looks like a blank black page.

The previous fixes addressed the `finally` block and event handling, but the fundamental architecture is still "block everything until RPC completes." That's wrong for cached sessions.

### New Approach: Optimistic Load + Background Verification

Instead of blocking, we should:

1. **If there's a cached session**: set user/session immediately, set loading to false, and let the admin portal render
2. **Verify role in the background**: fire the RPC, and if it fails, sign out and redirect
3. **If there's no cached session**: immediately redirect to login (no RPC needed)

This means users with valid cached sessions see the admin portal instantly, and the rare case of an unauthorized cached session gets kicked out after ~1 second instead of blocking everyone.

### Technical Changes

**File: `src/hooks/useAuth.tsx`**

1. In `initializeAuth`, when a cached session exists:
   - Immediately set `user` and `session` state
   - Set `loading` to `false` right away (so ProtectedRoute stops blocking)
   - Fire `checkAccess` in the background (not blocking)
   - If the role check fails, sign out and clear state (ProtectedRoute will then redirect)
   - If it succeeds, set the `userRole`

2. Add a 5-second hard timeout on the background role check so it never hangs forever

3. Keep the `INITIAL_SESSION` skip and `initializedRef` guard from previous fixes

```text
initializeAuth flow:

  getSession()
    |
    +-- no session --> setLoading(false) --> ProtectedRoute redirects to /admin/auth
    |
    +-- has session:
          setUser(session.user)      // immediate
          setSession(session)        // immediate
          setLoading(false)          // immediate -- portal can render
          initializedRef = true
          |
          background: checkAccess(userId, retries=0)
            |
            +-- returns 'admin'/'staff' --> setUserRole(role) -- portal stays
            +-- returns null or throws --> signOut(), clear state -- redirects to login
            +-- 5s timeout --> signOut(), clear state -- redirects to login
```

**File: `src/components/ProtectedRoute.tsx`**

4. Update the guard logic: allow rendering children when `user` exists even if `userRole` hasn't resolved yet (optimistic), but redirect if `userRole` is explicitly checked and denied. The existing timeout safety net stays as a fallback.

5. Add a condition: if `!loading && user && !userRole && !isVerifyingAccess`, that means the background check completed and denied access -- redirect to `/admin/auth`.

### Why This Is Better

- **Cached valid sessions**: Admin portal appears instantly (zero wait)
- **Expired/invalid sessions**: `getSession()` returns null, instant redirect to login
- **Slow RPC**: Portal renders immediately; if verification fails later, user gets redirected
- **No more black screen**: Loading state clears immediately, so the spinner/screen is never shown for more than a frame

### Risk Mitigation

- For the brief moment before `userRole` resolves, the admin portal renders but any data fetches protected by RLS will still enforce security server-side
- If the role check fails, the redirect happens within 1-5 seconds -- the user might see the portal shell briefly before being kicked out, which is far better UX than a permanent black screen
