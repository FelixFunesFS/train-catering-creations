

## Plan Review: Auth Redirect Hook

### What the plan does

Add a `useAuthRedirect` hook to `AppContent` in `src/App.tsx` that detects Supabase auth hash fragments in the URL and redirects users to `/admin/auth`.

### Current problem

When Supabase sends invite or password-reset emails, the confirmation link lands on `/` (the public home page). The Supabase client silently processes the token, but:

- **Invited users** see the catering homepage with no guidance on where to go
- **Password reset users** never see the "Set New Password" form because they're on `/` instead of `/admin/auth`

### Outcome after implementation

1. **Password reset flow**: User clicks reset link in email → lands on `/` → hook detects `type=recovery` in hash → redirects to `/admin/auth?mode=recovery` → `AdminAuth.tsx` renders the "Set New Password" form → user sets password → redirected to `/admin` or `/staff` based on role

2. **Invite flow**: New user clicks invite link in email → lands on `/` → hook detects `type=invite` in hash → redirects to `/admin/auth` → Supabase session is active → `AdminAuth.tsx` checks role → redirects admin to `/admin`, staff to `/staff`

3. **Magic link / signup flow**: Same pattern — hash detected, user routed to `/admin/auth`, role-based redirect takes over

### What changes

**One file modified: `src/App.tsx`**

- Add ~15-line `useAuthRedirect` hook inside `AppContent` that:
  - Checks `window.location.hash` on mount for `access_token` + `type=` fragments
  - Maps `type=recovery` → `/admin/auth?mode=recovery`
  - Maps `type=invite`, `type=signup`, `type=magiclink` → `/admin/auth`
  - Clears the hash after redirect to prevent re-triggering

### What does NOT change

- `AdminAuth.tsx` — already handles recovery mode, role-based redirects, and the sign-in form
- `useAuth.tsx` — already handles `PASSWORD_RECOVERY` event and role verification
- No database changes
- No new dependencies

### Risk assessment

- **Low risk**: The hook only fires when a Supabase auth hash is present (normal page loads have no hash fragment)
- **No impact on public users**: Regular visitors never have `#access_token=...` in their URL
- **Existing flows preserved**: The hook just adds a redirect step before the existing auth logic takes over

