
# Final Publishing Readiness Review

## Summary

After thorough end-to-end review, the system is **production-ready** with a few actionable items to complete before going live. The core workflows (quote submission, payment processing, customer portal, admin management) are all functional.

---

## CRITICAL: Must Complete Before Publishing

### 1. Update Supabase Secrets (SITE_URL and FRONTEND_URL)

**Current State:** Both secrets exist but may still point to the staging domain
**Required Values:**
- `SITE_URL` = `https://www.soultrainseatery.com`
- `FRONTEND_URL` = `https://www.soultrainseatery.com`

**Impact:** 13 edge functions use these URLs for:
- Email logo URLs
- Customer portal links
- Payment success/cancel redirects
- PDF logo (if we update it)

**Action:** Go to Supabase Dashboard > Settings > Edge Functions > Secrets and update both values

---

### 2. Remove Broken Cron Job (SQL Required)

**Issue:** The `send-automated-reminders-daily` cron job (ID: 2) calls a function that no longer exists (`send-automated-reminders`). The `unified-reminder-system` now handles all reminder functionality.

**Current Active Cron Jobs:**
| ID | Job Name | Schedule | Status |
|----|----------|----------|--------|
| 1 | auto-workflow-manager-every-15-min | Every 15 min | Working |
| 2 | send-automated-reminders-daily | 9 AM daily | BROKEN - Function deleted |
| 3 | send-event-followup-daily | 10 AM daily | Working |
| 8 | token-renewal-manager-daily | 2 AM daily | Working |

**SQL to run in Supabase SQL Editor:**
```sql
SELECT cron.unschedule('send-automated-reminders-daily');
```

**Note:** The `unified-reminder-system` is not currently scheduled as a cron job. It's invoked by `auto-workflow-manager` as part of its workflow. If you want independent daily reminders, schedule it separately.

---

### 3. Remove Instagram Placeholder Link

**File:** `src/components/Footer.tsx` (lines 120-122)
**Issue:** Instagram link points to `#` - non-functional placeholder
**Action:** Remove the link and unused import

---

### 4. Fix PDF Logo URL

**File:** `supabase/functions/generate-invoice-pdf/index.ts` (line 236)
**Issue:** Logo URL uses `.lovableproject.com` subdomain which may not resolve properly in production
**Current:** `https://qptprrqjlcvfkhfdnnoa.lovableproject.com/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png`
**Action:** Update to use SITE_URL secret for consistent branding:
```typescript
const siteUrl = Deno.env.get('SITE_URL') || 'https://www.soultrainseatery.com';
const logoUrl = `${siteUrl}/images/logo-red.png`;
```

---

## SSL/HTTPS Configuration

SSL is automatically provisioned by Lovable when DNS is properly configured. Verification:

**Required DNS Records:**
| Type | Name | Value |
|------|------|-------|
| A | @ | 185.158.133.1 |
| A | www | 185.158.133.1 |
| TXT | _lovable | (from Lovable dashboard) |

**Status:** Once both domains are added in Lovable Project Settings > Domains:
- SSL certificates are auto-provisioned (usually within minutes)
- Set `www.soultrainseatery.com` as Primary (recommended)
- Root domain will redirect to www

**Already Configured Correctly:**
- `robots.txt` references `https://www.soultrainseatery.com`
- `sitemap.xml` uses `https://www.soultrainseatery.com` as canonical

---

## Optional Cleanup: Orphaned Edge Function Folders

These folders exist but are NOT in `config.toml`, meaning they're not deployed:

| Folder | Status | Recommendation |
|--------|--------|----------------|
| `confirm-event/` | Not deployed | Safe to delete |
| `create-payment-intent/` | Not deployed | Safe to delete |
| `event-timeline-generator/` | Not deployed | Safe to delete |
| `send-manual-email/` | Not deployed | Safe to delete |
| `send-status-notification/` | Not deployed | Safe to delete |
| `sync-invoice-with-quote/` | Not deployed | Safe to delete |
| `validate-invoice-totals/` | Not deployed | Safe to delete |
| `workflow-orchestrator/` | Not deployed | Safe to delete |

**Note:** These won't cause issues - they're just dead code. Cleanup is optional but recommended for maintainability.

---

## Verified Working Systems

| Component | Status | Notes |
|-----------|--------|-------|
| Quote Form Submission | Working | `submit-quote-request` with rate limiting (3/hr), honeypot spam protection, validation |
| Email System | Working | SMTP configured, all secrets present |
| Payment Flow | Working | `create-checkout-session` with access token security, proper SITE_URL usage |
| Stripe Webhook | Working | Signature verification enforced, `STRIPE_WEBHOOK_SECRET` configured |
| Customer Portal | Working | Token-based access, idempotent approval handling |
| PDF Generation | Working | Needs logo URL fix for production domain |
| Auto-Workflow Manager | Working | Runs every 15 minutes |
| Event Followup | Working | Runs daily at 10 AM |
| Token Renewal | Working | Runs daily at 2 AM |
| robots.txt | Correct | Production domain, sensitive routes blocked |
| sitemap.xml | Correct | All public pages included |

---

## Implementation Checklist

### Code Changes (2 files)

**1. src/components/Footer.tsx**
- Remove Instagram link (lines 120-122)
- Remove unused `Instagram` import

**2. supabase/functions/generate-invoice-pdf/index.ts**
- Update logo URL to use SITE_URL (line 236)

### Manual Actions (Supabase Dashboard)

**1. Secrets (Settings > Edge Functions > Secrets)**
- Verify `SITE_URL` = `https://www.soultrainseatery.com`
- Verify `FRONTEND_URL` = `https://www.soultrainseatery.com`

**2. SQL Editor (Run SQL)**
```sql
SELECT cron.unschedule('send-automated-reminders-daily');
```

**3. Domains (Project Settings > Domains)**
- Add `soultrainseatery.com`
- Add `www.soultrainseatery.com`
- Set `www` as Primary

**4. Stripe Dashboard**
- Verify webhook endpoint: `https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/stripe-webhook`
- Events enabled: `checkout.session.completed`, `checkout.session.async_payment_failed`

---

## End-to-End Payment Test (Post-Publishing)

1. Submit a quote via the form
2. Verify confirmation email arrives with correct logos
3. Admin: Generate estimate and send
4. Customer: Click portal link in email
5. Customer: Approve estimate (verify terms checkbox)
6. Customer: Complete Stripe payment
7. Verify webhook fires (check Edge Function logs for `stripe-webhook`)
8. Verify payment confirmation email sent
9. Return to portal - verify payment shows complete

---

## Files to Modify Summary

| File | Change |
|------|--------|
| `src/components/Footer.tsx` | Remove Instagram link and import |
| `supabase/functions/generate-invoice-pdf/index.ts` | Update logo URL to use SITE_URL |
