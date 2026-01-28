

# Test Data Cleanup & Payment Display Fix Plan

## Summary

You have two distinct issues to address:

**Issue A**: Need to delete all test events/invoices EXCEPT the one with the real payment (token `988d681d-b12f-4908-9616-d50903b16dcc`)

**Issue B**: The customer portal at `https://www.soultrainseatery.com/estimate?token=988d681d-b12f-4908-9616-d50903b16dcc` doesn't show the $40.33 payment as received because the DEPOSIT milestone is still marked `pending` instead of `paid`

---

## Part A: Test Data Cleanup

### What Will Be Deleted

Currently you have:
- 25 quote requests
- 25 invoices  
- 7 invoices with payment transactions

After cleanup, you will keep ONLY:
- Quote Request: `4598ed12-a1f1-410b-b607-14fecd6137c2` (Super Bowl Test)
- Invoice: `1e502e5b-e500-4ca0-803d-d02f587ab691` (INV-2026-0197)
- Associated line items, milestones, transactions, and history

### Safe Deletion Script

The script must delete in dependency order to avoid foreign key issues:

```text
STEP 1: Delete child records for invoices being removed
- quote_line_items (except for kept quote)
- admin_notes (except for kept quote)
- invoice_line_items (except for kept invoice)
- payment_milestones (except for kept invoice)
- payment_transactions (except for kept invoice)
- payment_history (except for kept invoice)
- invoice_audit_log (except for kept invoice)
- reminder_logs (except for kept invoice)
- estimate_versions (except for kept invoice)
- change_requests (except for kept invoice)

STEP 2: Delete invoices (except kept one)
- invoices where id != '1e502e5b-e500-4ca0-803d-d02f587ab691'

STEP 3: Delete quote-related records
- quote_request_history (except for kept quote)
- calendar_events (except for kept quote)
- event_documents (except for kept quote)
- event_timeline_tasks (except for kept quote)
- event_shopping_items (except for kept quote)
- staff_assignments (except for kept quote)
- workflow_step_completion (except for kept quote)
- message_threads (except for kept quote)

STEP 4: Delete quote_requests (except kept one)
- quote_requests where id != '4598ed12-a1f1-410b-b607-14fecd6137c2'

STEP 5: Clean up orphaned records
- customers without any linked quote/invoice
- workflow_state_log for deleted entities
```

### How to Execute

Since this is a data modification (not schema change), you will need to run this directly in the Supabase SQL Editor:
- Go to: https://supabase.com/dashboard/project/qptprrqjlcvfkhfdnnoa/sql/new
- Paste the SQL script (I'll provide the exact SQL when implementing)
- Execute with the **Test** environment selected

---

## Part B: Fix Payment Not Showing

### Root Cause Analysis

The payment was made successfully ($40.33), and both `payment_transactions` and `payment_history` show `completed`. However:

| Table | Current State | Expected State |
|-------|---------------|----------------|
| payment_transactions.status | `completed` ✅ | `completed` |
| payment_history.status | `completed` ✅ | `completed` |
| payment_milestones (DEPOSIT) | `pending` ❌ | `paid` |
| invoices.workflow_status | `approved` ❌ | `partially_paid` |

**Why did this happen?**

Looking at timestamps:
- Payment made: `2026-01-28 00:21:04`
- Payment history created: `2026-01-28 00:22:07`
- Milestones regenerated: `2026-01-28 00:40:32`

The milestones were regenerated AFTER the payment was processed, which reset them all to `pending` and wiped out the `paid` status.

### Fix Required

Two options:

**Option 1: Manual Data Fix (Quick)**
Run SQL to update the specific milestone and invoice:

```sql
-- Mark the DEPOSIT milestone as paid
UPDATE payment_milestones 
SET status = 'paid', updated_at = now()
WHERE invoice_id = '1e502e5b-e500-4ca0-803d-d02f587ab691'
  AND milestone_type = 'DEPOSIT';

-- Update invoice to partially_paid
UPDATE invoices
SET workflow_status = 'partially_paid', last_status_change = now()
WHERE id = '1e502e5b-e500-4ca0-803d-d02f587ab691';
```

**Option 2: Prevent Future Occurrence (Code Fix)**
The `generate-payment-milestones` function already preserves paid milestone AMOUNTS when regenerating, but it doesn't match them by amount. It should also check existing `payment_transactions` and mark milestones accordingly.

### Recommended Approach

1. Execute the manual SQL fix now to make the portal display correctly
2. Update `generate-payment-milestones` to check for completed transactions when regenerating, so this edge case is handled automatically in the future

---

## Part C: Verify Stripe Webhook is Working

Since you're testing on the custom domain (www.soultrainseatery.com), you need to ensure your Stripe webhook is configured to POST to your Supabase Edge Function URL, not a Lovable preview URL.

### Current Expected Webhook URL
```
https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/stripe-webhook
```

### Verify in Stripe Dashboard
1. Go to Stripe Dashboard > Developers > Webhooks
2. Check that the endpoint URL matches the Supabase function URL above
3. Verify the endpoint is listening for:
   - `checkout.session.completed`
   - `checkout.session.async_payment_failed`

### Test Webhook is Receiving Events
After the next payment, check the edge function logs:
https://supabase.com/dashboard/project/qptprrqjlcvfkhfdnnoa/functions/stripe-webhook/logs

You should see:
- "Webhook received"
- "Webhook signature verified"
- "Checkout session completed"
- "Transaction updated to completed"
- "Milestone marked as paid"

If you don't see these logs after a payment, the webhook URL configuration is incorrect.

---

## Implementation Steps

### Step 1: Fix Current Payment Display (SQL)
Run in Supabase SQL Editor to immediately fix the portal:

```sql
-- Fix DEPOSIT milestone
UPDATE payment_milestones 
SET status = 'paid', updated_at = now()
WHERE invoice_id = '1e502e5b-e500-4ca0-803d-d02f587ab691'
  AND milestone_type = 'DEPOSIT';

-- Update invoice status
UPDATE invoices
SET workflow_status = 'partially_paid', 
    last_status_change = now()
WHERE id = '1e502e5b-e500-4ca0-803d-d02f587ab691';
```

### Step 2: Delete Test Data (SQL)
Full cleanup script (will be provided during implementation)

### Step 3: Code Enhancement (Optional)
Update `generate-payment-milestones` to check for existing completed transactions and preserve milestone `paid` status accordingly

---

## Verification After Fixes

1. **Portal Payment Display**: Visit `https://www.soultrainseatery.com/estimate?token=988d681d-b12f-4908-9616-d50903b16dcc`
   - DEPOSIT milestone should show "Paid" badge
   - Progress bar should show 10% complete
   - Remaining balance should be ~$363

2. **Admin View**: Check admin panel event list
   - Only one event remaining (Super Bowl Test)
   - Payment status shows "Deposit Paid" or similar

3. **Next Payment Test**: Make the 50% milestone payment
   - Verify webhook logs show successful processing
   - Verify milestone updates to `paid`
   - Verify invoice stays `partially_paid`

