

# Domain Configuration: Standardize for mkqdevtesting.com Testing

## Current Situation

You're actively testing on `mkqdevtesting.com`. Your `SITE_URL` secret should already be set to this domain. The problem is **13 Edge Function files have inconsistent hardcoded fallback URLs** that don't match.

---

## The Problem

| Current Fallback | Files Using It | Issue |
|------------------|----------------|-------|
| `soultrainseatery.lovable.app` | 10 files | Outdated, doesn't exist |
| `train-catering-creations.lovable.app` | 4 files | Lovable staging URL |
| `mkqdevtesting.com` | 1 file | Your testing domain (correct) |

If your `SITE_URL` secret is set correctly, these fallbacks don't matter. But if the secret is ever missing, functions will break with mixed domains.

---

## Recommended Strategy

### Use `SITE_URL` Secret as the Single Source of Truth

**Current (Testing):**
```
SITE_URL = https://mkqdevtesting.com
```

**Production (Later):**
```
SITE_URL = https://soultrainseatery.com
```

### Standardize Fallbacks to Lovable Published URL

Even though you're testing on `mkqdevtesting.com`, the **fallback** should be the Lovable published URL (`train-catering-creations.lovable.app`) because:

1. It's guaranteed to always work (Lovable hosts it)
2. It has the PNG logos at `/images/logo-*.png`
3. If secrets fail, emails still function on a working domain
4. Your `SITE_URL` secret overrides the fallback anyway

---

## Files to Update

| File | Current Fallback | Change To |
|------|------------------|-----------|
| `_shared/emailTemplates.ts` (line 1176) | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `_shared/emailTemplates.ts` (line 1477) | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `send-customer-portal-email/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `send-status-notification/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `send-approval-workflow/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `send-admin-notification/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `preview-email/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `email-qa-report/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `approve-estimate/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `send-payment-reminder/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `send-event-followup/index.ts` | `soultrainseatery.lovable.app` | `train-catering-creations.lovable.app` |
| `create-payment-link/index.ts` | `mkqdevtesting.com` | `train-catering-creations.lovable.app` |

**Already Correct (no changes needed):**
- `send-quote-notification/index.ts` - Updated in last edit
- `workflow-orchestrator/index.ts`
- `token-renewal-manager/index.ts`
- `_shared/emailTemplates.ts` (line 19)

---

## How It Works

```text
┌────────────────────────────────────────────────────────────┐
│              Edge Function Execution                       │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  Deno.env.get('SITE_URL')    │
          │  (Supabase Secret)           │
          └──────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    Secret EXISTS                  Secret MISSING
         │                               │
         ▼                               ▼
┌─────────────────────┐     ┌─────────────────────────────┐
│ mkqdevtesting.com   │     │ train-catering-creations.   │
│ (your test domain)  │     │ lovable.app (safe fallback) │
└─────────────────────┘     └─────────────────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  Logos: {domain}/images/...  │
          │  Portal: {domain}/estimate   │
          │  Payment: {domain}/checkout  │
          └──────────────────────────────┘
```

---

## Production Transition (When Ready)

When you're ready to go live with `soultrainseatery.com`:

### Step 1: Connect Custom Domain
1. Lovable Project Settings → Domains
2. Add `soultrainseatery.com` and `www.soultrainseatery.com`
3. Add DNS A records pointing to `185.158.133.1`
4. Wait for SSL provisioning

### Step 2: Update Supabase Secrets
```
SITE_URL = https://soultrainseatery.com
FRONTEND_URL = https://soultrainseatery.com
```

### Step 3: Verify
- Test that `https://soultrainseatery.com/images/logo-white.png` loads
- Send a test email and confirm logos display
- Verify all portal links point to the correct domain

---

## Technical Summary

| Phase | SITE_URL Secret | Fallback (Safety Net) |
|-------|-----------------|----------------------|
| **Now (Testing)** | `https://mkqdevtesting.com` | `train-catering-creations.lovable.app` |
| **Production** | `https://soultrainseatery.com` | `train-catering-creations.lovable.app` |

---

## Edge Functions to Redeploy

After updating, redeploy these 10 functions:
1. `send-customer-portal-email`
2. `send-status-notification`
3. `send-approval-workflow`
4. `send-admin-notification`
5. `preview-email`
6. `email-qa-report`
7. `approve-estimate`
8. `send-payment-reminder`
9. `send-event-followup`
10. `create-payment-link`

