

# Fix Admin Forgot Password Flow

## The Core Problem

The "Forgot Password" flow fails at two points:
1. **Email never sends** -- Supabase Auth SMTP rejects with `534 5.7.9` (needs Gmail App Password)
2. **No UI to set new password** -- even if the email sent, clicking the reset link would auto-redirect to the dashboard without a password form

## Will This Impact Customer/Admin Emails?

**No.** There are two completely independent SMTP configurations:

| System | Configuration Location | Emails It Sends | Impact of This Fix |
|--------|----------------------|------------------|-------------------|
| Supabase Auth (GoTrue) | Supabase Dashboard > Settings > Auth > SMTP | Password reset, email verification | Updated here -- fixes forgot password |
| App Edge Function (`send-smtp-email`) | Edge Function secrets (`SMTP_HOST`, `SMTP_PASS`, etc.) | Estimates, invoices, reminders, notifications | Not touched -- no impact |

Updating the SMTP password in the Supabase Dashboard only affects authentication emails. Your customer estimates, invoices, payment reminders, and admin notifications flow through a completely separate path (`send-smtp-email` edge function) using its own set of secrets.

**However:** Both configurations use the same Gmail account (`soultrainseatery@gmail.com`). If 2FA is enabled on that Gmail account, **both** may need App Passwords. If your customer emails are currently sending successfully, the edge function secret is already correct and does not need changing.

## What Needs to Change

### Step 1: Fix SMTP Credential (Manual -- Supabase Dashboard)

You need to update the SMTP password in the **Supabase Dashboard** (not in code):

1. Go to your Gmail account > Security > 2-Step Verification > App Passwords
2. Generate a new App Password (select "Mail" as the app)
3. Copy the 16-character password
4. Go to Supabase Dashboard > Settings > Authentication > SMTP Settings
5. Paste the App Password into the SMTP password field
6. Save

This fixes the `534 5.7.9` error so reset emails actually send.

### Step 2: Add PASSWORD_RECOVERY Event Handler (Code Change)

**File:** `src/hooks/useAuth.tsx`

Currently, when a user clicks the password reset link in their email, Supabase fires a `PASSWORD_RECOVERY` auth event. The current code does not handle this event, so the user gets auto-redirected to `/admin` as a logged-in user -- with no opportunity to set a new password.

Add a handler that:
- Detects the `PASSWORD_RECOVERY` event
- Sets a flag (e.g., `isPasswordRecovery`) in auth state
- Prevents the normal redirect to `/admin`

### Step 3: Add "Set New Password" Form (Code Change)

**File:** `src/pages/AdminAuth.tsx`

Add a password reset form that appears when the `PASSWORD_RECOVERY` flag is active:
- Two fields: "New Password" and "Confirm Password"
- Validation: minimum 8 characters, passwords must match
- On submit: calls `supabase.auth.updateUser({ password })`
- On success: clears the recovery flag, shows success toast, redirects to `/admin`

The form replaces the normal login form when `mode=reset` is in the URL or the `PASSWORD_RECOVERY` event fires.

### Step 4: Wire Up the Recovery Request

**File:** `src/pages/AdminAuth.tsx`

The existing "Forgot Password?" link already navigates to `?mode=reset` and calls `supabase.auth.resetPasswordForEmail()`. This part works -- it just needs the SMTP fix (Step 1) to actually deliver the email.

Verify the `redirectTo` in the reset call points to the production domain with a recovery path:
```text
https://www.soultrainseatery.com/admin/auth?mode=recovery
```

## Files Summary

| File | Change |
|------|--------|
| Supabase Dashboard | Update Auth SMTP password with Gmail App Password (manual) |
| `src/hooks/useAuth.tsx` | Add PASSWORD_RECOVERY event handler, expose recovery flag |
| `src/pages/AdminAuth.tsx` | Add "Set New Password" form for recovery mode |

## What Does NOT Change

- `send-smtp-email` edge function and its secrets (customer/admin emails unaffected)
- All other email templates and sending logic
- Login flow, Google OAuth, session management
- Admin dashboard, staff routes, customer portal
- No database changes required

