
# Batch Email Testing for Estimate #INV-2026-0196

## Summary

Create a new edge function that sends ALL email types in the system using the **real data** from invoice INV-2026-0196, allowing you to review every email template in your actual inbox.

---

## Invoice Data Available

| Field | Value |
|-------|-------|
| Invoice ID | `b9e5f0b4-9f01-4eb3-970e-64aa58d10520` |
| Invoice Number | INV-2026-0196 |
| Quote ID | `06e32371-dffb-49e8-a508-96fa0ff0d9ef` |
| Contact | Felix Margery Funes |
| Email | envision@mkqconsulting.com |
| Event | Super Bowl |
| Event Date | 2026-04-29 |
| Total | $457.80 |
| Status | Paid/Confirmed |

---

## Email Types to Send (17 Total)

### Customer Emails (10)
1. quote_confirmation - "Thank You for Your Request!"
2. estimate_ready - "Your Estimate is Ready"
3. estimate_reminder - "Your Estimate Awaits"
4. approval_confirmation - "You're All Set!"
5. payment_received - "Payment Confirmed"
6. payment_reminder - "Payment Reminder"
7. event_reminder - "Your Event is Approaching!"
8. change_request_submitted - "Change Request Received"
9. change_request_response - "Your Request Has Been Reviewed"
10. event_followup - "We Hope You Enjoyed!"

### Admin Emails (7)
1. quote_received - "New Quote Submission"
2. approval_confirmation - "Customer Approved Estimate"
3. payment_received - "Payment Received"
4. event_reminder - "Event Reminder"
5. change_request_submitted - "Customer Requested Changes"
6. admin_notification - "Admin Notification"
7. (no admin variant for several types)

---

## Implementation Plan

### Step 1: Create `send-batch-test-emails` Edge Function

A new function that:
1. Accepts an invoice ID and target email address
2. Fetches the REAL quote, invoice, line items, and milestones from the database
3. Loops through all EMAIL_CONFIGS types and variants
4. Generates each email using `generateStandardEmail()` with real data
5. Sends each email with a clear subject prefix (e.g., `[TEST 1/17] Quote Confirmation`)
6. Returns a summary of all emails sent

### Step 2: Function Parameters

```typescript
interface BatchTestEmailRequest {
  invoiceId: string;        // The invoice to use for data
  targetEmail: string;      // Where to send all test emails
  delayMs?: number;         // Optional delay between emails (default: 1000ms)
  typesToSend?: EmailType[]; // Optional: specific types to test
}
```

### Step 3: Example Request

```json
{
  "invoiceId": "b9e5f0b4-9f01-4eb3-970e-64aa58d10520",
  "targetEmail": "your-test-email@example.com",
  "delayMs": 2000
}
```

### Step 4: Response Format

```json
{
  "success": true,
  "invoice_number": "INV-2026-0196",
  "event_name": "Super Bowl",
  "emails_sent": 17,
  "results": [
    { "type": "quote_confirmation", "variant": "customer", "status": "sent" },
    { "type": "quote_received", "variant": "admin", "status": "sent" },
    // ... all 17 emails
  ]
}
```

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/send-batch-test-emails/index.ts` | Main function |

### Function Logic

```typescript
// Pseudocode
1. Validate invoiceId and targetEmail
2. Fetch invoice with quote_request_id
3. Fetch quote_requests by id
4. Fetch invoice_line_items for invoice
5. Fetch payment_milestones for invoice
6. Build portalUrl using customer_access_token

7. For each emailType in EMAIL_CONFIGS:
   a. For each variant (customer/admin) if defined:
      - Get contentBlocks via getEmailContentBlocks()
      - Generate HTML via generateStandardEmail()
      - Send via send-smtp-email with subject prefix
      - Wait delayMs between sends
      - Log result

8. Return summary
```

### Update supabase/config.toml

Add the new function to the config file.

---

## Alternative: Quick Manual Testing

If you prefer not to create a new function, you can test using the **existing infrastructure**:

1. Navigate to `/admin/settings` in the app
2. Click the **"Email Templates"** tab
3. Use the **Email Preview Studio** to:
   - Preview each email type visually
   - Click "Send Test Email" for each one

However, this uses **sample data** instead of the real invoice data. The batch function approach gives you emails with your **actual event details**.

---

## Benefits of Batch Approach

1. Uses REAL invoice data (Super Bowl event, actual totals, real milestones)
2. Sends all 17 emails in one call
3. Numbered subjects make it easy to track (`[TEST 1/17]`, `[TEST 2/17]`, etc.)
4. Can filter to specific email types if needed
5. Delay between sends prevents rate limiting
6. Returns comprehensive results for verification
