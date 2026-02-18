

## Prevent Duplicate Approval Notifications

### Summary

Make the `approve-estimate` edge function truly idempotent: first click does everything (DB update, milestones, emails, admin notification), subsequent clicks just return a portal URL with no side effects.

### Changes

**1. Edge Function: `supabase/functions/approve-estimate/index.ts`**

Restructure so that when `alreadyApproved` is true, the function returns early before any milestone, email, or notification logic runs:

- Move `portalUrl` construction before the approval check
- When `alreadyApproved`: return `{ success: true, alreadyApproved: true, portalUrl }` immediately
- When not approved: run the full flow (DB update, milestones, email, admin notification), then return `{ success: true, alreadyApproved: false, portalUrl }`

**2. Frontend: `src/pages/ApproveEstimate.tsx`**

- Add `alreadyApproved` to the success state type
- Pass `data.alreadyApproved` through to state
- Show "Already Approved -- Taking you to your portal..." instead of "Approved!" when it's a re-click

**3. Frontend: `src/components/customer/CustomerActions.tsx`**

- Check `data.alreadyApproved` in the toast after approval
- Show "Already Approved" / "Your estimate was already approved" for re-clicks instead of "Estimate Approved!"

### What Does NOT Change

- First-time approval flow is identical (DB update, milestones, emails, admin notification all fire)
- Admin resend without changes keeps status unchanged, so re-clicks still early-return correctly
- Admin revision resets status to `sent`, so the next customer approval triggers the full flow again
- Payment flows, Stripe, change requests -- all unchanged
- Database schema, RLS, triggers -- all unchanged

