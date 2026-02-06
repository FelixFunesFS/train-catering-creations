

## Fix: Invisible Loading Spinner and Redundant Role Checks

### Problem
Two issues are combining to create the "blank black page":

1. **Invisible spinner**: The `ProtectedRoute` loading spinner uses `text-primary` on `bg-background`. In dark mode, the background is near-black (`220 25% 7%`), and if primary is also dark-toned, the spinner is practically invisible -- the user sees what appears to be a blank page when it's actually loading.

2. **Redundant role checks cause delays**: After `useAuth` already resolves the user's role via `has_any_role` RPC, the `usePermissions` hook fires 2 MORE `has_role` RPC calls (one for admin, one for staff). This triples the network time and increases the chance of a hang. On slow connections or if the RPC is unresponsive, the page stays on the invisible spinner indefinitely.

### Solution

**File 1: `src/hooks/usePermissions.ts`**
- When `useAuth` has already resolved `userRole` (admin or staff), use it directly instead of making additional RPC calls
- Only fall back to RPC if `userRole` is null and the user is authenticated (edge case)
- This eliminates 2 out of 3 RPC calls in the normal login flow

**File 2: `src/components/ProtectedRoute.tsx`**
- Change the spinner color from `text-primary` to a guaranteed-visible color like `text-white` or a dual-tone approach
- Add a "Verifying access..." text label so even if the spinner were hard to see, there's readable text
- Add a timeout safety net: if loading exceeds 10 seconds, show a "retry" button or force redirect to login

**File 3: `src/pages/AdminAuth.tsx`**
- Same spinner visibility fix for the "Verifying access..." state on the auth page

### Expected Result
- The loading state is always visible regardless of light/dark mode
- Login resolves in ~1 RPC call instead of ~3-5
- If something hangs, the user sees a message and can retry rather than staring at a black screen
- Cached session auto-login works fast because only one role check is needed

