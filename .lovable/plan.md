

## Plan: Assign Staff Role + Fix Password Recovery

### Step 1: Insert staff role for margery.funes@gmail.com
- Insert into `user_roles`: `user_id = '97f844e6-92dd-4302-8fdf-67fd7df39f9b'`, `role = 'staff'`

### Step 2: Fix `initializeAuth` in `useAuth.tsx` to skip access check during recovery
- At the top of `initializeAuth`, check URL for `mode=recovery` (search params) or `type=recovery` (hash fragment)
- If detected: set `isPasswordRecovery = true`, set session/user from `getSession()`, set `loading = false`, and return early — skipping `checkAccess`
- This prevents the session from being destroyed before the password reset form renders

### Step 3: Guard `SIGNED_IN` handler in `onAuthStateChange`
- Add secondary URL check in the `SIGNED_IN` branch: if URL contains recovery indicators, skip access gating

### What stays untouched
- All other auth flows, routes, components

