# Soul Train's Eatery — Admin Dashboard Guide v3.0

## Dashboard Overview

The admin dashboard at `/admin` has **3 views** accessible from the navigation bar, plus a separate **Staff** route:

| View | Nav Icon | What It Shows |
|------|----------|---------------|
| **Events** (default) | 📅 Calendar | New submissions + all active events |
| **Billing** | 💳 CreditCard | Invoices, payments, and transaction history |
| **Settings** | ⚙️ Settings | Notifications, email templates, email delivery monitoring |
| **Staff** | 👥 Users | Staff schedule and event assignments (separate `/staff` route) |

### Navigation

- **Mobile**: Fixed bottom nav bar with 5 buttons — Events, Billing, Staff, Settings, Logout
- **Desktop (lg+)**: Sticky top header with inline nav links + Sign Out button

---

## Daily Workflow

### ⏰ Start Here Every Morning

1. **Open the Events view** (default when you log in)
   - The **Submissions Card** at the top shows new quote requests (status: `pending` or `under_review`)
   - Review each submission and begin creating estimates

2. **Scan the Event List** below the submissions card
   - Shows all events excluding pending/under_review
   - Sort or filter to find events needing attention
   - Look for upcoming events, overdue payments, or incomplete tasks

3. **Check Billing view** for payment status
   - Review outstanding invoices
   - Follow up on overdue payments

---

## Common Tasks

### 📝 How to Create an Estimate

1. Go to **Events** view
2. Find the quote in the **Submissions Card** (or search the Event List)
3. Click the event to open its detail page (`/admin/event/:quoteId`)
4. Open the **Estimate** panel
5. System auto-generates line items from quote data
6. Review pricing:
   - Verify all selections are priced correctly
   - Check tax calculation (0% for government contracts)
   - Add any custom line items
7. Set payment schedule:
   - Standard: 50% deposit + 50% balance
   - Government: Net 30 after event
   - Custom: Define custom milestones
8. Click **Save Estimate**
9. Review Terms & Conditions inclusion

### 📧 How to Send an Estimate

1. From the event detail page, open the **Estimate** panel
2. Click **Send to Customer**
3. System will:
   - Generate a customer portal link
   - Send email via Gmail SMTP with estimate link
   - Update status to "Sent"
4. Customer receives email with a direct link to their estimate portal

### 🔄 How to Process a Change Request

1. Navigate to the event's detail page
2. Open the **Change Requests** section
3. Review the customer's requested changes
4. Evaluate cost impact:
   - Increase guest count → recalculate per-person pricing
   - Add/remove items → adjust line items
5. Choose action:
   - **Approve**: Creates new estimate version automatically
   - **Reject**: Send explanation to customer
6. If approved, updated estimate is sent automatically

### ✉️ How to Resend Emails

**For Estimates:**
1. Go to **Events** → click the event
2. In the Estimate panel, click **Resend Estimate**
3. New email sent with tracking

**For Payment Links:**
1. Go to **Billing** view
2. Find the invoice
3. Click **Resend Payment Link**
4. Customer receives new Stripe checkout link

### 💳 How to Track Payment Status

1. Go to **Billing** view
2. View all invoices with:
   - Payment status (Pending, Partially Paid, Paid, Overdue)
   - Amount paid vs. total
   - Payment method
   - Transaction history
3. Click an invoice to see:
   - All payment transactions
   - Milestone completion
   - Customer payment history

**Status Reference:**
- `draft` — Estimate not sent yet
- `sent` — Estimate sent to customer
- `approved` — Customer approved, awaiting payment
- `partially_paid` — Deposit received, balance pending
- `paid` — Fully paid
- `overdue` — Payment past due date

---

## Mobile Access

The admin dashboard is **fully responsive** with a mobile-first design.

### 📱 Mobile Navigation

A fixed bottom nav bar provides quick access to all views:

| Button | Destination |
|--------|-------------|
| Events | `/admin?view=events` |
| Billing | `/admin?view=billing` |
| Staff | `/staff` |
| Settings | `/admin?view=settings` |
| Logout | Signs out |

Cards and tables stack vertically on mobile with touch-friendly buttons.

### 📸 Recommended Mobile Workflow

**On the go:**
1. Check Events view for new submissions
2. Review event details and mark tasks complete
3. Send quick email updates
4. View payment status in Billing

**At your desk:**
1. Create/edit estimates with line items
2. Process change requests
3. Configure notification preferences
4. Review email delivery logs

---

## Troubleshooting

### ❌ Customer Didn't Receive Email

1. Check the customer's email address is correct
2. Ask customer to check spam folder
3. Resend from the event detail page
4. Go to **Settings** → **Email Delivery** to check delivery logs
5. Verify Gmail SMTP credentials are configured in Supabase secrets

### 💳 Payment Button Not Working

1. Verify Stripe API keys are configured in Supabase secrets
2. Check Stripe Dashboard for webhook status
3. Review edge function logs in the Supabase dashboard
4. Test `create-checkout-session` function

### 📊 Email Delivery Issues

1. Go to **Settings** → **Email Delivery** tab
2. Review recent email delivery status
3. Check for bounce or error messages
4. Verify Gmail OAuth tokens are current

### 🔄 Event Status Not Updating

1. Check edge function logs in the Supabase dashboard
2. Verify database triggers are active
3. Refresh the page and check again
4. Review `workflow_state_log` table for transition errors

---

## Payment Workflow

### 💰 Standard Payment Process

1. **Customer Approves Estimate** — Accepts Terms & Conditions → Status: "Approved"
2. **Customer Chooses Payment Option** — 50% Deposit (recommended) or Full Payment
3. **Stripe Checkout** — Secure redirect to Stripe, card processing, 3D Secure if required
4. **Webhook Processes Payment** — Updates transaction, marks milestone paid, sends notifications
5. **Admin Sees Update** — Payment reflected in Billing view, status updates automatically

### 🏛️ Government Contract Payment

- No upfront deposit required
- Net 30 payment terms after event
- Tax-exempt (0% tax)
- Requires PO number
- Invoice sent after event completion

---

## Event Lifecycle

| Stage | What Happens | Status |
|-------|-------------|--------|
| 1. Request Received | Customer submits quote form | `pending` |
| 2. Under Review | Admin reviews details | `under_review` |
| 3. Estimate Created | Line items and pricing set | `estimated` |
| 4. Estimate Sent | Email sent with portal link | `sent` |
| 5. Customer Reviews | Customer views estimate in portal | `viewed` |
| 6. Approved | Customer accepts T&C | `approved` |
| 7. Paid | Payment completed via Stripe | `paid` / `partially_paid` |
| 8. Confirmed | All payments complete, date locked | `confirmed` |
| 9. In Progress | Event day, tasks in progress | `in_progress` |
| 10. Completed | Event finished, follow-up sent | `completed` |

---

## Tips & Best Practices

### ✅ Do's

- Check the Events view daily for new submissions
- Respond to change requests within 24 hours
- Send payment reminders 7 days before event
- Mark checklist items complete in real-time
- Use the Billing view to monitor cash flow

### ❌ Don'ts

- Don't skip Terms & Conditions
- Don't manually edit payment amounts (use change requests)
- Don't delete completed events (archive instead)
- Don't send estimates without reviewing pricing

---

## Settings

The **Settings** view has 4 tabs:

| Tab | Purpose |
|-----|---------|
| **Notifications** | Configure alert preferences (quote alerts, payment alerts, quiet hours) |
| **Email Templates** | Preview email templates with sample data |
| **Email Delivery** | Monitor email delivery status and troubleshoot issues |
| **General** | General settings (coming soon) |

---

## Support & Questions

**Technical Issues:**
- Check **Settings → Email Delivery** for email problems
- Review edge function logs in Supabase dashboard
- Check browser console for frontend errors

**Business Questions:**
- Review this guide first
- Check quote/estimate history in Events view
- Contact business owner

---

## Version History

- **v3.0** — Consolidated 3-view dashboard (Events, Billing, Settings)
- **v2.0** — Complete admin dashboard redesign
- **v1.5** — Added payment processing
- **v1.0** — Initial release

Last Updated: 2026-02-10
