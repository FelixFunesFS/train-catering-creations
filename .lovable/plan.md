

# Email System Analysis & Production URL Fixes

## Summary of Findings

### Emails Received for INV-2026-0196 (Super Bowl - envision@mkqconsulting.com)

Based on the analytics and reminder logs, here's the complete email timeline:

| Timestamp | Email Type | Subject |
|-----------|-----------|---------|
| Jan 27, 02:37 AM | Estimate Ready | "Your Catering Estimate is Ready - Super Bowl" |
| Jan 27, 02:38 AM | Approval Confirmation | "✅ Estimate Approved - Next Steps for Super Bowl" |
| Jan 27, 21:30 PM | Payment Reminder | "Payment Reminder - Super Bowl" |
| Jan 27, 21:38 PM | Thank You | "Thank you for choosing Soul Train's Eatery - Super Bowl" |

### Payment Due vs Thank You Email - Key Differences

| Aspect | Payment Reminder | Thank You Email |
|--------|-----------------|-----------------|
| **Purpose** | Request outstanding payment | Thank customer after event |
| **Trigger** | Milestone due within 3 days or overdue | Day after event (status = completed) |
| **CTA Button** | "Pay Now" → customer portal | "Share Your Feedback" → feedback page |
| **Hero Badge** | 🔒 DEPOSIT DUE / 💳 PAYMENT DUE / ⚠️ OVERDUE | 🎉 THANK YOU |
| **Content** | Invoice details, amount due, urgency messaging | Gratitude message, feedback request, review links |
| **When Sent** | Before/during payment window | After event completion |

---

## Reminder Email Sequence for Approved Estimates

### Current Flow (unified-reminder-system)

```text
Customer approves estimate
        ↓
    24-HOUR COOLDOWN (prevents nagging immediately after approval)
        ↓
    Daily cron checks at each run:
        ↓
┌───────────────────────────────────────────────────────────────┐
│ If milestone due within 3 days AND status = pending:          │
│   → Send "Payment Due" reminder based on milestone type       │
│   → DEPOSIT: "🔒 Secure Your Date - Deposit Due"              │
│   → MILESTONE: "💳 Milestone Payment Due"                     │
│   → FINAL: "✅ Final Payment Due"                             │
└───────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────┐
│ If due_date < today AND workflow_status = overdue:            │
│   → Send "⚠️ URGENT: Payment Overdue" with days overdue      │
│   → Red urgency styling                                        │
└───────────────────────────────────────────────────────────────┘
```

### What Actually Happened for INV-2026-0196

The invoice has a **DEPOSIT** milestone due **today (2026-01-27)** with `is_due_now: true`:
- The unified-reminder-system triggered because the milestone was due within 3 days
- However, the subject line was generic "Payment Reminder - Super Bowl" instead of the context-aware "🔒 Secure Your Date - Deposit Due"

**Root Cause:** The `milestoneType` was passed as `undefined` to send-payment-reminder because the unified-reminder-system wasn't correctly passing the milestone data.

---

## CRITICAL: Production URL Issues

The site is now published to **www.soultrainseatery.com**, but several edge functions still have fallback URLs pointing to the old staging domain.

### Files with Incorrect Fallback URLs

| File | Current Fallback | Should Be |
|------|-----------------|-----------|
| `send-payment-reminder/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `send-admin-notification/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `send-quote-notification/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `approve-estimate/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `create-payment-link/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `preview-email/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `email-qa-report/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `send-status-notification/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `token-renewal-manager/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `send-customer-portal-email/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `_shared/emailTemplates.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |
| `workflow-orchestrator/index.ts` | `train-catering-creations.lovable.app` | `www.soultrainseatery.com` |

**Note:** The `send-event-followup` function already has the correct fallback: `www.soultrainseatery.com`

### Why This Matters

Even though `SITE_URL` and `FRONTEND_URL` secrets are set, the fallback values are used when:
1. Secrets are not yet loaded (race condition)
2. Function is invoked before secrets are available
3. Any edge case where env var resolution fails

**Best practice:** All fallbacks should point to production domain.

---

## Implementation Plan

### Step 1: Update All Fallback URLs to Production Domain

Update 12 files to change fallback URLs from `train-catering-creations.lovable.app` to `www.soultrainseatery.com`:

**Files to update:**
1. `supabase/functions/_shared/emailTemplates.ts` (line 19)
2. `supabase/functions/send-payment-reminder/index.ts` (line 60)
3. `supabase/functions/send-admin-notification/index.ts` (line 59)
4. `supabase/functions/send-quote-notification/index.ts` (line 97)
5. `supabase/functions/approve-estimate/index.ts` (line 35)
6. `supabase/functions/create-payment-link/index.ts` (line 173)
7. `supabase/functions/preview-email/index.ts` (line 95)
8. `supabase/functions/email-qa-report/index.ts` (line 56)
9. `supabase/functions/send-status-notification/index.ts` (line 21)
10. `supabase/functions/token-renewal-manager/index.ts` (line 92)
11. `supabase/functions/send-customer-portal-email/index.ts` (line 122)
12. `supabase/functions/workflow-orchestrator/index.ts` (line 35)

**Change pattern:**
```typescript
// Before
const siteUrl = Deno.env.get('SITE_URL') || 'https://train-catering-creations.lovable.app';

// After
const siteUrl = Deno.env.get('SITE_URL') || 'https://www.soultrainseatery.com';
```

---

## Recommended Deposit Reminder Sequence

For clarity, here's the optimal reminder flow after approval:

### Day 0: Approval
- Customer approves estimate
- Approval confirmation email sent immediately
- 24-hour cooldown starts

### Day 1+: Deposit Due (if `is_due_now: true`)
- If deposit milestone due within 3 days:
  - Subject: "🔒 Secure Your Date - Deposit Due for [Event Name]"
  - Hero: Gold theme with "DEPOSIT DUE" badge
  - Message: Emphasizes locking in the date

### Day 3+ after approval (if unpaid):
- Standard reminder continues daily until paid or overdue

### If due date passes (overdue):
- Subject: "⚠️ URGENT: Payment Overdue - [Event Name]"
- Hero: Crimson theme with "OVERDUE X DAYS" badge
- Message: Urgent action required

---

## Manual Action Required

After code updates are deployed, verify in Supabase Dashboard:
- **SITE_URL** = `https://www.soultrainseatery.com`
- **FRONTEND_URL** = `https://www.soultrainseatery.com`

---

## Files to Modify Summary

| File | Change |
|------|--------|
| `supabase/functions/_shared/emailTemplates.ts` | Update fallback URL |
| `supabase/functions/send-payment-reminder/index.ts` | Update fallback URL |
| `supabase/functions/send-admin-notification/index.ts` | Update fallback URL |
| `supabase/functions/send-quote-notification/index.ts` | Update fallback URL |
| `supabase/functions/approve-estimate/index.ts` | Update fallback URL |
| `supabase/functions/create-payment-link/index.ts` | Update fallback URL |
| `supabase/functions/preview-email/index.ts` | Update fallback URL |
| `supabase/functions/email-qa-report/index.ts` | Update fallback URL |
| `supabase/functions/send-status-notification/index.ts` | Update fallback URL |
| `supabase/functions/token-renewal-manager/index.ts` | Update fallback URL |
| `supabase/functions/send-customer-portal-email/index.ts` | Update fallback URL |
| `supabase/functions/workflow-orchestrator/index.ts` | Update fallback URL |

