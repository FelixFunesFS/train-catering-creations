

## Fix: Black Screen on Direct `/admin` Navigation

### Root Cause

`supabase.auth.getSession()` uses the browser's Web Locks API internally. If a previous tab/session crashed or closed mid-operation, the lock is never released. When `getSession()` hangs, the `initializeAuth` function never completes, `loading` stays `true` forever, and the page appears blank/black (the `AuthLoadingScreen` may render but in dark mode appears as a near-black page with subtle elements).

This explains why:
- Hard refresh sometimes works (clears the lock)
- It happens whether logged in or not (the hang occurs before session data is even read)
- The preview environment works fine (fresh browser context each time)

### Fix (2 changes)

#### 1. Add a timeout around `getSession()` in `src/hooks/useAuth.tsx`

Wrap the `getSession()` call in a `Promise.race` with a 4-second timeout. If it hangs, treat it as "no session" and proceed to the login page gracefully.

```text
Before:
  const { data: { session } } = await supabase.auth.getSession();

After:
  const sessionResult = await Promise.race([
    supabase.auth.getSession(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
  ]);
  
  if (!sessionResult) {
    console.warn('getSession() timed out - possible browser lock issue');
    // Fall through to finally block, which sets loading=false
    // User will see login page instead of black screen
    return;
  }
  
  const { data: { session } } = sessionResult;
```

#### 2. Improve `AuthLoadingScreen` visibility in `src/components/ProtectedRoute.tsx`

Add the Soul Train's logo and a white/light background override so the loading screen is always visible regardless of light/dark mode:

- Add the Soul Train's logo image above the spinner
- Use explicit light background colors so the loading screen is never "invisible" in dark mode

### Why This Fixes It

| Scenario | Before | After |
|---|---|---|
| getSession() hangs (lock stuck) | Black screen forever | 4s timeout, then redirects to login |
| Normal load, logged in | Works (after our previous fix) | Same, no change |
| Normal load, not logged in | Should redirect but hangs if lock stuck | 4s max wait, then redirect |
| Dark mode loading screen | Nearly invisible black-on-black | Clearly visible with explicit styling |

### No Other Files Need Changes

The auth initialization flow and ProtectedRoute logic are otherwise correct (confirmed by preview testing). This fix targets the specific production-only failure mode.

