## What I found from the logs/audit

I pulled the available Supabase-side logs and checked the deployment-related files.

Available logs showed:
- No runtime logs for `unified-reminder-system`.
- No recent `function_edge_logs` entries in the last 24 hours.

That usually means the failure is happening during the deploy/upload step, before the function ever runs, so it will not show up as normal function runtime logs.

The code/config audit found one concrete stale deploy target:

```text
Configured in supabase/config.toml, but no function folder exists:
- send-custom-invoice-email
```

I also confirmed:
- `send-event-reminders` is no longer referenced in `supabase/config.toml`.
- The current cron calls `unified-reminder-system` only.
- Customer submission flow still uses separate functions such as `submit-quote-request`, not the reminder function.

## Likely cause

The recurring “Couldn't deploy Supabase functions” warning is likely caused by `supabase/config.toml` still declaring a function that no longer exists in the repository:

```toml
[functions.send-custom-invoice-email]
verify_jwt = false
```

Because there is no `supabase/functions/send-custom-invoice-email/index.ts`, the deploy pipeline may keep trying to process a function target that cannot be packaged.

## Customer impact

Current customer submissions should not be blocked by this specific issue because:

- Quote submissions use `submit-quote-request`.
- Payments use `create-checkout-session`, `stripe-webhook`, and `verify-payment`.
- Customer portal access uses existing estimate/portal routes and deployed functions.
- The repeated failure appears tied to backend function deployment metadata, not the public quote form.

The risk is backend update drift: changes to edge functions may not reliably go live until the deploy issue is cleaned up.

## Fix plan

### 1. Remove stale function config

Edit `supabase/config.toml` and remove this unused block:

```toml
[functions.send-custom-invoice-email]
verify_jwt = false
```

Reason: there is no matching function folder and no code references it.

### 2. Re-check for missing configured functions

Run the config-vs-folder audit again and confirm there are no configured functions without a matching folder.

Expected result:

```text
Configured functions without folder: none
```

### 3. Deploy only the affected function first

Deploy `unified-reminder-system` directly instead of relying on a broad automatic deploy.

This validates whether the recently edited reminder function can package and upload cleanly after the stale config is removed.

### 4. If targeted deploy succeeds, smoke-test the deployed function

Call `unified-reminder-system` directly and verify it returns a structured JSON response like:

```json
{
  "success": true,
  "workflow": { ... },
  "reminders": [ ... ],
  "totalEmailsSent": 0
}
```

I will also review the function logs after the call to confirm it reached the deployed runtime.

### 5. If targeted deploy still fails

Then the stale config was not the only problem. Next fallback steps:

- Check whether the deployment is failing on an import/package resolution issue.
- Review `unified-reminder-system` imports from:
  - `../_shared/emailTemplates.ts`
  - `../_shared/dateHelpers.ts`
  - `https://esm.sh/@supabase/supabase-js@2.52.1`
- If needed, simplify/remediate the function import surface and redeploy again.

## Verification checklist after approval

- `supabase/config.toml` no longer references missing function folders.
- `unified-reminder-system` deploys successfully.
- Direct function call succeeds.
- Function logs show the new version running.
- No changes are made to customer quote submission code.
- No database schema changes required.