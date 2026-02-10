# 💳 Payment Flow Testing Guide

Complete guide for testing Stripe payment integration end-to-end.

---

## **Prerequisites**

- ✅ Stripe account configured
- ✅ `STRIPE_SECRET_KEY` added to Supabase secrets
- ✅ Edge functions deployed (`create-payment-intent`, `create-checkout-session`)
- ✅ Test mode enabled in Stripe dashboard

---

## **Test Payment Cards**

Use these Stripe test cards (never use real cards in test mode):

| Card Number | Brand | Scenario |
|-------------|-------|----------|
| `4242 4242 4242 4242` | Visa | Success |
| `4000 0025 0000 3155` | Visa | 3D Secure required |
| `4000 0000 0000 9995` | Visa | Declined (insufficient funds) |
| `4000 0000 0000 0341` | Visa | Declined (lost card) |

**For all test cards:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## **Test Scenario 1: Standard Payment (50/50 Split)**

### Step 1: Create Test Quote
```typescript
// In admin dashboard
1. Navigate to /admin
2. Find a pending quote
3. Click "Create Estimate"
4. Add line items:
   - BBQ Chicken Platter: $500 x 2 = $1,000
   - Mac & Cheese: $200 x 3 = $600
   - Setup Fee: $200 x 1 = $200
   Total: $1,800 + 8% tax = $1,944
```

### Step 2: Generate Payment Milestones
```sql
-- Run this in Supabase SQL Editor
INSERT INTO payment_milestones (invoice_id, milestone_type, percentage, amount_cents, description, status)
VALUES 
  ('your-invoice-id', 'deposit', 50, 97200, '50% Deposit', 'pending'),
  ('your-invoice-id', 'final', 50, 97200, '50% Final Payment', 'pending');
```

### Step 3: Send Estimate to Customer
```typescript
// Use send-customer-portal-email edge function
const { data, error } = await supabase.functions.invoke('send-customer-portal-email', {
  body: {
    quote_request_id: 'your-quote-id',
    type: 'estimate_ready'
  }
});
```

### Step 4: Customer Views & Approves
```typescript
// Customer opens email link
https://yoursite.lovable.app/estimate?token=abc123...

// Customer clicks "Approve Estimate"
// Invoice status changes: sent → approved
```

### Step 5: Process First Payment (Deposit)
```typescript
// Customer clicks "Pay 50% Deposit ($972.00)"
// This calls create-checkout-session edge function

// Use Stripe test card: 4242 4242 4242 4242
// Expected: Payment succeeds
// Check: payment_transactions table has new record
// Check: payment_milestones[0].status = 'paid'
```

### Step 6: Process Final Payment
```typescript
// After some time, customer pays final amount
// Use same test card
// Expected: Payment succeeds
// Check: payment_milestones[1].status = 'paid'
// Check: invoice.workflow_status = 'paid'
// Check: quote.workflow_status = 'confirmed'
```

---

## **Test Scenario 2: Failed Payment Handling**

### Step 1: Attempt Payment with Declined Card
```typescript
// Use card: 4000 0000 0000 9995 (insufficient funds)
// Expected: Payment fails with error message
// Check: payment_transactions.status = 'failed'
// Check: payment_transactions.failed_reason = 'insufficient_funds'
```

### Step 2: Retry with Valid Card
```typescript
// Use card: 4242 4242 4242 4242
// Expected: Payment succeeds
// Check: New payment_transactions record created
// Check: payment_milestones.status = 'paid'
```

---

## **Test Scenario 3: Government Contract (NET30)**

### Step 1: Create Government Quote
```typescript
// Set compliance_level = 'government' on quote
UPDATE quote_requests 
SET compliance_level = 'government', 
    requires_po_number = true,
    po_number = 'PO-2024-001'
WHERE id = 'your-quote-id';
```

### Step 2: Verify Tax Exemption
```sql
-- Check invoice totals
SELECT subtotal, tax_amount, total_amount 
FROM invoices 
WHERE quote_request_id = 'your-quote-id';

-- Expected: tax_amount = 0
-- Example: subtotal = 1800, tax = 0, total = 1800
```

### Step 3: Verify NET30 Payment Terms
```sql
-- Check invoice due date
SELECT due_date, workflow_status 
FROM invoices 
WHERE quote_request_id = 'your-quote-id';

-- Expected: due_date = event_date + 30 days
```

---

## **Test Scenario 4: Webhook Integration**

### Step 1: Configure Webhook in Stripe
```
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: https://yourproject.supabase.co/functions/v1/stripe-webhook
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - checkout.session.completed
```

### Step 2: Test Webhook Delivery
```typescript
// Make a test payment
// Check Supabase edge function logs:
supabase functions logs stripe-webhook

// Expected log output:
// "Webhook received: payment_intent.succeeded"
// "Payment transaction updated: txn_123"
```

### Step 3: Verify Database Updates
```sql
-- Check payment was recorded
SELECT * FROM payment_transactions 
WHERE stripe_payment_intent_id = 'pi_test_123'
ORDER BY created_at DESC LIMIT 1;

-- Expected: status = 'succeeded'
```

---

## **Test Scenario 5: Overdue Invoice Automation**

### Step 1: Create Past-Due Invoice
```sql
-- Set invoice due date to past
UPDATE invoices 
SET due_date = CURRENT_DATE - INTERVAL '5 days',
    workflow_status = 'sent'
WHERE id = 'your-invoice-id';
```

### Step 2: Trigger Unified Reminder System
```typescript
// Manually invoke edge function
const { data, error } = await supabase.functions.invoke('unified-reminder-system', {
  body: { manual_trigger: true }
});

console.log(data);
// Expected: { overdue_marked: 1, ... }
```

### Step 3: Verify Status Change
```sql
-- Check invoice status
SELECT workflow_status, last_status_change 
FROM invoices 
WHERE id = 'your-invoice-id';

-- Expected: workflow_status = 'overdue'

-- Check state log
SELECT * FROM workflow_state_log 
WHERE entity_id = 'your-invoice-id'
ORDER BY created_at DESC LIMIT 1;

-- Expected: new_status = 'overdue', changed_by = 'unified_reminder_system'
```

---

## **Test Scenario 6: Payment Reminder Emails**

### Step 1: Set Up Upcoming Milestone
```sql
-- Set milestone due in 2 days
UPDATE payment_milestones 
SET due_date = CURRENT_DATE + INTERVAL '2 days',
    status = 'pending'
WHERE id = 'your-milestone-id';
```

### Step 2: Trigger Reminder Check
```typescript
// unified-reminder-system runs daily at 9 AM
// Or manually invoke:
const { data } = await supabase.functions.invoke('unified-reminder-system', {
  body: { manual_trigger: true }
});

console.log(data);
// Expected: { reminders_sent: 1 }
```

### Step 3: Verify Email Sent
```sql
-- Check reminder logs
SELECT * FROM reminder_logs 
WHERE invoice_id = 'your-invoice-id'
ORDER BY sent_at DESC LIMIT 1;

-- Expected: reminder_type = 'payment_due_soon'
```

---

## **Verification Checklist**

After each payment test, verify:

### Database Updates
- [ ] `payment_transactions` record created with correct amount
- [ ] `payment_transactions.status` = 'succeeded' (or 'failed')
- [ ] `payment_milestones.status` updated to 'paid'
- [ ] `invoices.workflow_status` updated correctly
- [ ] `quote_requests.workflow_status` updated when fully paid
- [ ] `workflow_state_log` contains state change entry

### Email Notifications
- [ ] Customer receives payment confirmation email
- [ ] Email contains correct amount and date
- [ ] Email links work (receipt, invoice PDF)

### Stripe Dashboard
- [ ] Payment appears in Stripe → Payments
- [ ] Customer record created/updated
- [ ] Payment intent marked as succeeded
- [ ] Webhook events delivered successfully

### Admin Dashboard
- [ ] Payment shows in admin payment history
- [ ] Invoice status badge updated
- [ ] Quote card shows correct payment progress
- [ ] Audit log shows payment event

---

## **Common Issues & Fixes**

### Issue 1: Payment Intent Creation Fails
```
Error: "No such customer: cus_xyz"
```
**Fix:** Ensure customer exists in Stripe or create one first
```typescript
const { data: customer } = await supabase.functions.invoke('create-stripe-customer', {
  body: { email: 'customer@example.com', name: 'John Doe' }
});
```

### Issue 2: Webhook Not Receiving Events
```
Stripe dashboard shows "Failed" webhooks
```
**Fix:** 
1. Check edge function logs for errors
2. Verify webhook secret matches
3. Ensure endpoint URL is correct
4. Check edge function is deployed

### Issue 3: Totals Don't Match
```
Expected: $1,944.00
Actual: $1,800.00
```
**Fix:** Check database trigger is firing
```sql
-- Verify trigger exists
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'recalculate_invoice_totals_trigger';

-- Manually trigger recalculation
UPDATE invoice_line_items 
SET quantity = quantity 
WHERE invoice_id = 'your-invoice-id';
```

### Issue 4: Customer Access Token Expired
```
Error: "Access token has expired"
```
**Fix:** Check token expiry
```sql
SELECT customer_access_token, token_expires_at 
FROM invoices 
WHERE id = 'your-invoice-id';

-- Extend expiry
UPDATE invoices 
SET token_expires_at = NOW() + INTERVAL '1 year'
WHERE id = 'your-invoice-id';
```

---

## **Performance Testing**

### Test 1: Concurrent Payments
```typescript
// Simulate 10 customers paying simultaneously
const promises = Array.from({ length: 10 }, (_, i) => 
  supabase.functions.invoke('create-checkout-session', {
    body: {
      invoice_id: `invoice-${i}`,
      amount_cents: 100000,
      customer_email: `test${i}@example.com`
    }
  })
);

await Promise.all(promises);
// Expected: All payments process successfully
```

### Test 2: Large Invoice with Many Line Items
```typescript
// Create invoice with 100+ line items
// Check: Totals calculate in < 2 seconds
// Check: No timeout errors
// Check: Database trigger completes
```

---

## **Security Testing**

### Test 1: Invalid Access Token
```typescript
// Try to access estimate with fake token
fetch('/estimate?token=invalid-uuid')
// Expected: "Invalid access token" error
```

### Test 2: Expired Access Token
```sql
-- Set token to expired
UPDATE invoices 
SET token_expires_at = NOW() - INTERVAL '1 day'
WHERE id = 'your-invoice-id';
```
```typescript
// Try to access estimate
fetch('/estimate?token=valid-but-expired-uuid')
// Expected: "Access token has expired" message
```

### Test 3: SQL Injection Protection
```typescript
// Try malicious input in payment amount
supabase.functions.invoke('create-payment-intent', {
  body: {
    amount_cents: "1000; DROP TABLE invoices;--"
  }
});
// Expected: Type error or sanitization, no SQL execution
```

---

## **Monitoring & Logging**

### Check Edge Function Logs
```bash
# View logs in Supabase Dashboard
Project → Functions → create-checkout-session → Logs

# Look for:
- Payment intent created: pi_xxx
- Checkout session created: cs_xxx
- Customer charged: $XXX.XX
- Status updated: approved → paid
```

### Check Database Audit Trail
```sql
-- Recent payment activity
SELECT 
  i.invoice_number,
  pt.amount / 100.0 as amount_dollars,
  pt.status,
  pt.created_at,
  pt.stripe_payment_intent_id
FROM payment_transactions pt
JOIN invoices i ON pt.invoice_id = i.id
ORDER BY pt.created_at DESC
LIMIT 20;
```

---

## **Documentation After Testing**

Document your findings in:

1. **Payment Process Flow** - Update with actual timings
2. **Error Scenarios** - List encountered errors and fixes
3. **Integration Points** - Map all Stripe ↔ Supabase touchpoints
4. **Monitoring Alerts** - Set up alerts for failed payments
5. **Customer Support Guide** - Common payment issues customers face
