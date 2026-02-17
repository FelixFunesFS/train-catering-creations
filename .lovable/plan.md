

## Plan: Fix Jumbled Email Subject Lines + Resolve Build Error

Two changes to fix the email subject corruption, plus one unrelated build error fix.

---

### Change 1: Remove Emojis from Subject Lines
**File:** `supabase/functions/send-customer-portal-email/index.ts` (lines ~190-198)

Replace the 3 emoji-containing subject lines in the `subjectMap`:

- `🎉 Payment Confirmed...` becomes `[CONFIRMED] Payment Received - Your Event is Secured!`
- `💰 Deposit Received...` becomes `[PAYMENT] Deposit Received - {event_name}`
- `✅ Estimate Approved...` becomes `[APPROVED] Estimate Approved - Next Steps for {event_name}`

The other two entries (`quote_confirmation`, `estimate_ready`) are already ASCII-safe -- no changes needed.

---

### Change 2: Add Safety Net Sanitizer
**File:** `supabase/functions/send-smtp-email/index.ts`

Add one line before the subject is passed to the SMTP client to strip any non-ASCII characters:

```
const safeSubject = subject.replace(/[^\x00-\x7F]/g, '').trim();
```

Then use `safeSubject` in the email message object instead of `subject`. This prevents any future emoji from reaching the SMTP layer.

---

### Change 3: Fix Build Error in usePushSubscription.ts
**File:** `src/hooks/usePushSubscription.ts` (lines 61, 122)

The `pushManager` property is not recognized on `ServiceWorkerRegistration` in the current TypeScript config. Fix by casting the registration:

```typescript
const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistration & { pushManager: any };
```

This resolves the two TS2339 errors at lines 61 and 122.

---

### Summary

| File | Change | Risk |
|------|--------|------|
| `send-customer-portal-email/index.ts` | Replace 3 emoji subjects with ASCII labels | None -- cosmetic only |
| `send-smtp-email/index.ts` | Add 1-line non-ASCII sanitizer | None -- safety net only |
| `src/hooks/usePushSubscription.ts` | Fix TypeScript type error | None -- type cast only |

No functionality changes. No template changes. No data changes.

