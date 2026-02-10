# Edge Function Monitoring Guide

## Verify Cron Jobs Are Running

Check if cron jobs are configured and active:

```sql
-- View all cron jobs
SELECT 
  jobname,
  schedule,
  active,
  last_run_start_time,
  next_run_time,
  jobid
FROM cron.job
ORDER BY jobname;
```

**Expected Results:**
- `unified-reminder-system-daily` - Schedule: `0 9 * * *` (daily at 9 AM) — handles workflow transitions + reminders
- `token-renewal-manager-daily` - Schedule: `0 2 * * *` (daily at 2 AM)

Both should show `active = true` and recent `last_run_start_time`.

---

## Monitor Edge Function Invocations

### Check Recent Function Calls

Navigate to Supabase Dashboard:
- **Edge Functions Logs:** `https://supabase.com/dashboard/project/qptprrqjlcvfkhfdnnoa/functions`
- Click on each function to view logs:
  - `unified-reminder-system`
  - `send-customer-portal-email`
  - `send-workflow-email`
  - `send-gmail-email`

**What to Look For:**
- ✅ Recent invocations (daily at 9 AM for unified-reminder-system)
- ✅ Status 200 responses
- ❌ 404 errors = Function not deployed
- ❌ 500 errors = Function failing (check error message)

### Check Analytics Events

If you've instrumented analytics:

```sql
SELECT 
  event_type,
  metadata,
  created_at
FROM analytics_events
WHERE event_type IN ('email_sent', 'workflow_triggered', 'edge_function_invoked')
ORDER BY created_at DESC
LIMIT 50;
```

---

## Monitor Email Delivery

### Check Reminder Logs

```sql
-- Recent email reminders sent
SELECT 
  id,
  reminder_type,
  recipient_email,
  sent_at,
  urgency,
  created_at
FROM reminder_logs
ORDER BY sent_at DESC
LIMIT 20;
```

### Check Gmail SMTP Delivery

1. Verify Gmail OAuth tokens are valid (check edge function logs)
2. Monitor for bounced emails in the `reminder_logs` table
3. Verify emails are:
   - ✅ Delivered (not bouncing)
   - ✅ Not marked as spam
   - ✅ Being opened by customers

---

## Verify Token Expiry

Check that customer access tokens are set to 1 year:

```sql
-- Check token expiry dates
SELECT 
  id,
  invoice_number,
  customer_access_token,
  token_expires_at,
  EXTRACT(DAYS FROM (token_expires_at - created_at)) as days_until_expiry,
  created_at
FROM invoices
WHERE document_type = 'estimate'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:** `days_until_expiry` should be approximately 365 (1 year).

---

## Manual Test: Trigger Edge Functions

### Test Unified Reminder System

```bash
curl -X POST \
  'https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/unified-reminder-system' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"manual_trigger": true}'
```

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "overdue_marked": 2,
    "events_confirmed": 1,
    "events_completed": 0,
    "reminders_sent": 3
  }
}
```

### Test Email Sending

```bash
curl -X POST \
  'https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/send-workflow-email' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "invoiceId": "YOUR_INVOICE_UUID",
    "emailType": "estimate"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## Troubleshooting Common Issues

### Issue: Edge Functions Show Zero Logs

**Possible Causes:**
1. Functions not deployed
2. Cron jobs not configured
3. No trigger events (e.g., no overdue invoices)

**Solution:**
- Check deployment status in Supabase dashboard
- Verify cron jobs exist: `SELECT * FROM cron.job;`
- Manually trigger function using curl command above

### Issue: Emails Not Delivering

**Possible Causes:**
1. Gmail OAuth tokens expired
2. SMTP credentials misconfigured
3. Email provider blocking

**Solution:**
- Check secrets in Supabase edge function settings
- Verify Gmail SMTP credentials are set and valid
- Check edge function logs for SMTP errors
- Test with a different recipient email

### Issue: Customer Portal Links Don't Work

**Possible Causes:**
1. Token expired
2. Incorrect token format
3. RLS blocking access

**Solution:**
- Verify token expiry: Run SQL above
- Check link format in email template
- Temporarily disable RLS to test access

---

## Success Metrics

Monitor these weekly:

1. **Email Delivery Rate:** >95% delivered
2. **Cron Job Success Rate:** 100% (no failures)
3. **Edge Function Errors:** <1% error rate
4. **Customer Portal Access:** >80% of sent estimates viewed

---

## Next Steps After Verification

Once all edge functions are working:

1. ✅ Enable RLS on all tables (when ready)
2. ✅ Set up alerting for failed cron jobs
3. ✅ Implement E2E tests for critical workflows
4. ✅ Create customer feedback loop
