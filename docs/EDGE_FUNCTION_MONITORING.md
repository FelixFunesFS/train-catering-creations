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
- `auto-workflow-manager-every-15-min` - Schedule: `*/15 * * * *` (every 15 minutes)
- `token-renewal-manager-daily` - Schedule: `0 2 * * *` (daily at 2 AM)

Both should show `active = true` and recent `last_run_start_time`.

---

## Monitor Edge Function Invocations

### Check Recent Function Calls

Navigate to Supabase Dashboard:
- **Edge Functions Logs:** `https://supabase.com/dashboard/project/qptprrqjlcvfkhfdnnoa/functions`
- Click on each function to view logs:
  - `auto-workflow-manager`
  - `send-customer-portal-email`
  - `send-workflow-email`
  - `send-gmail-email`

**What to Look For:**
- ✅ Recent invocations (within last 15 minutes for auto-workflow)
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

### Check Resend Dashboard

1. Navigate to: `https://resend.com/emails`
2. Filter by:
   - **Status:** Delivered, Bounced, Spam
   - **Date Range:** Last 7 days
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

### Test Auto-Workflow Manager

```bash
curl -X POST \
  'https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/auto-workflow-manager' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE' \
  -H 'Content-Type: application/json' \
  -d '{}'
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
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE' \
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
1. Resend API key missing
2. Gmail OAuth tokens expired
3. Email provider blocking

**Solution:**
- Check secrets in Supabase: `https://supabase.com/dashboard/project/qptprrqjlcvfkhfdnnoa/settings/functions`
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for bounces
- Test with different email providers

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
