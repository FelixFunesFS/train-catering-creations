# Email System Consolidation - COMPLETED

## Summary

Consolidated email system to a single source of truth. All customer emails now flow through `getEmailContentBlocks()`.

## Changes Made

### Functions Deleted
- ✅ `supabase/functions/send-approval-workflow/` - Unused, had outdated 25/50/25 payment logic
- ✅ `supabase/functions/send-email-fallback/` - Unused Resend fallback

### Files Modified
- ✅ `supabase/config.toml` - Removed `[functions.send-approval-workflow]` section
- ✅ `supabase/functions/send-status-notification/index.ts` - Refactored to use `getEmailContentBlocks()`
- ✅ `supabase/functions/_shared/emailTemplates.ts` - Removed redundant "Questions?" blocks from `quote_confirmation` and `estimate_ready`
- ✅ `CODEBASE_MAP.md` - Removed reference to deleted function

### Deployed Functions Deleted
- ✅ `send-approval-workflow`
- ✅ `send-email-fallback`

## Architecture After Consolidation

### Single Source of Truth
All customer emails now use `getEmailContentBlocks()` from `_shared/emailTemplates.ts`:

| Function | Uses Shared Helper | Purpose |
|----------|-------------------|---------|
| `send-customer-portal-email` | ✅ | Primary customer emails |
| `send-status-notification` | ✅ (now) | Status change notifications |
| `preview-email` | ✅ | Settings previews |
| `email-qa-report` | ✅ | Email testing |

### Specialized Functions (Correctly Keep Separate)
| Function | Purpose |
|----------|---------|
| `send-smtp-email` | Core SMTP transport |
| `send-quote-notification` | Admin new quote alerts |
| `send-quote-confirmation` | Customer welcome email |
| `send-payment-reminder` | Payment reminders |
| `send-event-reminders` | Event countdown emails |
| `send-change-request-notification` | Change request responses |

## Benefits
1. **Single source of truth** - No more duplicate/outdated payment logic
2. **Consistent branding** - All emails use same templates
3. **Reduced maintenance** - ~500 lines of duplicate code removed
4. **Correct payment schedule** - Uses canonical 10/50/40 tiered system
