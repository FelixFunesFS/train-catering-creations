
# Email System Consolidation & Consistency Plan

## Executive Summary

After reviewing the email-related edge functions and shared templates, I've identified several opportunities to remove redundant functions, consolidate logic to a single source of truth, and improve consistency. This plan outlines which functions can be safely removed and how to refactor the remaining functions.

## Current Architecture Analysis

### Functions Using Shared `getEmailContentBlocks()` (Single Source of Truth)
These functions properly use the centralized email template system:

| Function | Purpose | Status |
|----------|---------|--------|
| `send-customer-portal-email` | All customer emails (estimate, approval, payment, etc.) | **CANONICAL** |
| `preview-email` | Settings email previews | Uses shared helper |
| `email-qa-report` | Email testing/QA | Uses shared helper |

### Functions With Duplicate/Standalone Logic (Candidates for Removal/Refactor)

| Function | Current State | Recommendation |
|----------|--------------|----------------|
| `send-approval-workflow` | Builds own email content with outdated 25/50/25 payment logic | **REMOVE** (duplicate of `send-customer-portal-email` type='approval_confirmation') |
| `send-status-notification` | Standalone status email builder | **REMOVE** (functionality covered by `send-customer-portal-email`) |
| `send-email-fallback` | Resend fallback (uses RESEND_API_KEY) | **REMOVE** (not called anywhere, SMTP is primary) |

### Functions That Are Correctly Specialized (Keep)

| Function | Purpose | Why Keep |
|----------|---------|----------|
| `send-smtp-email` | Core SMTP transport | All emails route through here |
| `send-quote-notification` | Admin notification of new quotes | Specialized admin format |
| `send-admin-notification` | Admin alerts (approvals, changes, payments) | Uses shared generator but specialized admin content |
| `send-quote-confirmation` | Customer welcome email after quote | Could be migrated but works correctly |
| `send-payment-reminder` | Payment due reminders | Specialized logic for reminder context |
| `send-change-request-notification` | Change request responses | Specialized workflow |
| `send-event-reminders` | 7-day/2-day event reminders | Specialized timing logic |
| `send-event-followup` | Post-event follow-up | Specialized |

---

## Technical Implementation Plan

### Phase 1: Remove Unused `send-approval-workflow` Function

**Finding**: This function is NOT called anywhere in the codebase. The search revealed it only appears in documentation (`CODEBASE_MAP.md`) and `config.toml`.

**Evidence**:
- `approve-estimate` (the actual approval handler) calls `send-customer-portal-email` with `type: 'approval_confirmation'` (line 127)
- No other code invokes `send-approval-workflow`

**Problem with this function**:
- Uses outdated payment schedule (25/50/25) instead of the canonical tiered system (10/50/40 or 60% combined for rush)
- Builds custom content instead of using `getEmailContentBlocks()`

**Actions**:
1. Delete folder: `supabase/functions/send-approval-workflow/`
2. Remove from `supabase/config.toml` (lines 66-67)
3. Update `CODEBASE_MAP.md` to remove reference
4. Delete deployed function from Supabase

### Phase 2: Remove Unused `send-email-fallback` Function

**Finding**: This function uses Resend API as a backup but is never called.

**Evidence**:
- Search for `send-email-fallback` only found matches in the function's own file
- All email sending goes through `send-smtp-email`
- `RESEND_API_KEY` is not in the secrets list

**Actions**:
1. Delete folder: `supabase/functions/send-email-fallback/`
2. Remove from `supabase/config.toml` if present (not currently listed)
3. Delete deployed function from Supabase

### Phase 3: Refactor `send-status-notification` to Use Shared Helper

**Current State**: Called by `useUnifiedStatusManagement.tsx` when status changes occur. Builds its own email content with a large `switch` statement duplicating logic from `getEmailContentBlocks()`.

**Recommendation**: Instead of removing (since it's actively used), refactor to use the shared helper.

**Refactor approach**:
```typescript
// Instead of building custom contentBlocks in buildStatusEmail():
const emailType = mapStatusToEmailType(status);
const { contentBlocks, ctaButton } = getEmailContentBlocks(emailType, 'customer', {
  quote, invoice, lineItems, portalUrl
});
```

**Status mapping**:
| Workflow Status | Maps To EmailType |
|-----------------|-------------------|
| `sent` | `estimate_ready` |
| `approved`, `customer_approved` | `approval_confirmation` |
| `revised` | `estimate_ready` (with isUpdated flag) |
| `confirmed` | `event_reminder` |
| Generic | Keep custom handling for edge cases |

### Phase 4: Content Redundancy Fixes in `getEmailContentBlocks()`

Per the earlier review, remove redundant "Questions?" blocks that duplicate footer content:

**Lines to modify in `supabase/functions/_shared/emailTemplates.ts`**:

1. **Line 1632** (`quote_confirmation`): Remove or simplify
   ```typescript
   // Remove: "Questions? Just reply to this email — our family is happy to help."
   // Footer already has full contact info
   ```

2. **Line ~1728** (`estimate_ready`): Already has footer, check for duplicates

3. **Line ~1840** (`approval_confirmation`): Check for duplicate contact info

4. **Line ~1936** (`payment_reminder`): Check for duplicate "Questions? Contact us..."

### Phase 5: Update `send-approval-workflow` References in Existing Code

Since the function is not called, this is primarily documentation cleanup:

1. **`CODEBASE_MAP.md`**: Remove line referencing `send-approval-workflow`

---

## Files to Delete

| Path | Reason |
|------|--------|
| `supabase/functions/send-approval-workflow/` (entire folder) | Unused, duplicate logic, outdated payment schedule |
| `supabase/functions/send-email-fallback/` (entire folder) | Unused, Resend fallback never invoked |

## Files to Modify

| Path | Changes |
|------|---------|
| `supabase/config.toml` | Remove `[functions.send-approval-workflow]` section |
| `supabase/functions/send-status-notification/index.ts` | Refactor to use `getEmailContentBlocks()` |
| `supabase/functions/_shared/emailTemplates.ts` | Remove redundant "Questions?" blocks from email types |
| `CODEBASE_MAP.md` | Remove references to deleted functions |

---

## Benefits After Implementation

1. **Single Source of Truth**: All customer emails flow through `getEmailContentBlocks()`
2. **Correct Payment Logic**: No more outdated 25/50/25 schedule in stale functions
3. **Reduced Maintenance**: Fewer functions to update when branding/content changes
4. **Consistent Styling**: All emails use same color palette, fonts, buttons
5. **Smaller Codebase**: ~500+ lines of duplicate code removed

---

## Testing Checklist

After removal/refactor, verify these email types still work:

- [ ] Quote confirmation (after customer submits form)
- [ ] Estimate ready (admin sends estimate)
- [ ] Approval confirmation (customer approves)
- [ ] Payment received (Stripe webhook triggers)
- [ ] Payment reminder (cron job or manual)
- [ ] Event reminder (7-day/2-day)
- [ ] Change request notification

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `send-approval-workflow` might be called externally | Verified no calls exist in codebase; only in docs |
| `send-status-notification` refactor breaks status emails | Will preserve existing switch cases for edge statuses |
| Removing "Questions?" blocks may confuse customers | Footer contact info is comprehensive; reduces clutter |
