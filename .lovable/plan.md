

## Fix: Black Screen on `/admin` -- Timeout `getUser()` and Auto-Redirect

### Problem

The previous fix only added a timeout to `getSession()`. But when a cached session exists, the code proceeds to `supabase.auth.getUser()` (line 159) which has **no timeout** -- if it hangs, the page stays black forever. The fallback timeout screen also uses theme colors that are invisible in dark mode.

### Changes

#### 1. `src/hooks/useAuth.tsx` -- Timeout `getUser()` (line 159)

Wrap the `getUser()` call in a 4-second `Promise.race`, matching the existing `getSession()` pattern. If it hangs, treat the session as stale and fall through to login.

```text
// Before (line 159):
const { error: userError } = await supabase.auth.getUser();
if (userError) {
  console.warn('Stale session detected, clearing:', userError.message);
  await supabase.auth.signOut();
  return;
}

// After:
const userResult = await Promise.race([
  supabase.auth.getUser(),
  new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
]);

if (!userResult) {
  console.warn('getUser() timed out -- possible browser lock issue');
  await supabase.auth.signOut().catch(() => {});
  return;
}

const { error: userError } = userResult;
if (userError) {
  console.warn('Stale session detected, clearing:', userError.message);
  await supabase.auth.signOut().catch(() => {});
  return;
}
```

#### 2. `src/components/ProtectedRoute.tsx` -- Reduce timeout and auto-redirect

Three sub-changes:

- **Line 8**: Reduce `AUTH_TIMEOUT_MS` from `10_000` to `4_000`
- **Lines 19-32**: On timeout, auto-navigate to `/admin/auth` instead of showing buttons on a potentially invisible screen
- **Timed-out screen**: Use explicit `style={{ background: '#fff' }}` so it is always visible

```text
// Line 8:
const AUTH_TIMEOUT_MS = 4_000;

// Lines 14-32 (timedOut block):
if (timedOut) {
  navigate('/admin/auth', { replace: true });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
         style={{ background: '#fff' }}>
      <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png"
           alt="Soul Train's Eatery"
           className="h-16 w-16 rounded-full object-cover" />
      <p style={{ color: '#6b7280' }} className="text-sm">Redirecting to login...</p>
    </div>
  );
}
```

### Summary

| Hang Point | Before | After |
|---|---|---|
| `getSession()` hangs | 4s timeout (already fixed) | Same |
| `getUser()` hangs | No timeout -- hangs forever | 4s timeout, then login redirect |
| Timeout fallback screen | Black background, invisible | White background + auto-redirect |
| Total worst-case wait | Forever (black screen) | 4 seconds, then login page |

### Impact on Normal Usage

- **Logged-in admin**: Auth resolves in under 1 second, dashboard loads normally -- no change
- **Not logged in**: Instant redirect to `/admin/auth` -- no change
- **Auth hangs (the bug)**: 4 seconds max, then auto-redirect to login instead of black screen forever

