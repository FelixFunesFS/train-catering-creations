

## Fix: Two Remaining Bugs Causing Infinite Black Screen

### Bug 1: `signOut()` calls can hang forever (`useAuth.tsx`)

We added timeouts to `getSession()`, `getUser()`, and `checkAccess()`. But when any of those timeout or fail, the code calls `await supabase.auth.signOut()` — which has **no timeout**. If `signOut()` also hangs (same browser Web Locks issue), `initializeAuth()` never reaches the `finally` block, so `loading` stays `true` forever.

There are three unprotected `signOut()` calls:
- Line 166: after `getUser()` timeout
- Line 173: after stale session detected
- Line 188: after role check fails (also missing `.catch()`)

**Fix:** Remove the `await` on all three `signOut()` calls inside `initializeAuth`. Fire-and-forget them. The important thing is reaching `finally` to set `loading = false`. The sign-out will complete in the background.

```text
// Lines 166, 173: Change from:
await supabase.auth.signOut().catch(() => {});

// To:
supabase.auth.signOut().catch(() => {});

// Line 188: Change from:
await supabase.auth.signOut();

// To:
supabase.auth.signOut().catch(() => {});
```

### Bug 2: `navigate()` called during render (`ProtectedRoute.tsx`)

Line 20 calls `navigate('/admin/auth')` directly inside the render function. React Router ignores navigation calls made during render — they must be in a `useEffect`. This means the auto-redirect never actually fires; the user just sees the "Redirecting..." text forever (or a black screen if CSS isn't applied).

**Fix:** Move the timeout redirect into a `useEffect`, and add a nuclear `window.location.href` fallback that fires 2 seconds later as an absolute last resort.

```text
// Replace the timedOut block with a useEffect:
useEffect(() => {
  if (timedOut) {
    // Try React Router navigation first
    navigate('/admin/auth', { replace: true });
    
    // Nuclear fallback: if React navigation fails, force browser redirect
    const fallback = setTimeout(() => {
      window.location.href = '/admin/auth';
    }, 2000);
    
    return () => clearTimeout(fallback);
  }
}, [timedOut, navigate]);
```

### Summary of Changes

**`src/hooks/useAuth.tsx`** (3 lines):
- Lines 166, 173: Remove `await` from `signOut()` calls
- Line 188: Remove `await`, add `.catch(() => {})`

**`src/components/ProtectedRoute.tsx`**:
- Move `navigate()` from render into a `useEffect` triggered by `timedOut`
- Add `window.location.href` nuclear fallback after 2 seconds
- Keep the visible "Redirecting..." JSX with white background

### Why This Finally Fixes It

| Scenario | Before | After |
|---|---|---|
| `signOut()` hangs after timeout | `loading` stays `true` forever (black screen) | `signOut` fires in background, `loading` becomes `false` immediately |
| 4s ProtectedRoute timeout fires | `navigate()` called during render (silently ignored) | `navigate()` in useEffect (works correctly) |
| React navigation also fails | No fallback | `window.location.href` forces browser redirect after 6s total |
| **Total worst-case wait** | **Forever** | **6 seconds, then hard browser redirect** |

### Impact on Normal Usage

- Logged-in admin: Auth resolves in under 1 second, no change
- Not logged in: Instant redirect to `/admin/auth`, no change
- Auth hangs: Maximum 6 seconds before forced redirect to login

