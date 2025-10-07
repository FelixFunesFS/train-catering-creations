# Soul Train's Eatery Admin Dashboard Guide

## Dashboard Overview

The admin dashboard provides a comprehensive event management system with 10 specialized views:

### 🎯 **Core Views**

1. **Workflow** - Main quote/estimate management interface
2. **Pipeline** - Kanban board showing all events by workflow stage
3. **At-Risk** - Alert panel for events requiring immediate attention
4. **Today** - Daily checklist for events happening today
5. **Status** - Comprehensive event status overview
6. **Timeline** - Event timeline and task management

### 📋 **Operations Views**

7. **Changes** - Customer change request management
8. **Payments** - Payment processing and tracking
9. **Docs** - Document management and sharing
10. **Testing** - Edge function testing and debugging

---

## Daily Workflow

### ⏰ **Start Here Every Morning**

1. **Check "Today's Events" Panel**
   - View all events happening today
   - Review setup checklist
   - Mark tasks as complete
   - Note any last-minute requirements

2. **Review "At-Risk Events"**
   - Events with overdue payments
   - Upcoming events with incomplete tasks
   - Events missing critical information
   - Events pending approval

3. **Process New Quote Requests**
   - Go to "Workflow" tab
   - Review pending quotes
   - Create estimates
   - Send to customers

---

## Common Tasks

### 📝 **How to Create an Estimate**

1. Navigate to **Workflow** tab
2. Find the quote request (status: "Pending" or "Under Review")
3. Click "View Details"
4. Click "Create Estimate" button
5. System auto-generates line items from quote data
6. Review pricing:
   - Verify all selections are priced correctly
   - Check tax calculation (0% for government contracts)
   - Add any custom line items
7. Set payment schedule:
   - Standard: 50% deposit + 50% balance
   - Government: Net 30 after event
   - Custom: Define custom milestones
8. Click "Save Estimate"
9. Review Terms & Conditions inclusion
10. Click "Send to Customer"

### 📧 **How to Send an Estimate**

1. From estimate details page, click "Send Estimate"
2. System will:
   - Generate customer portal link
   - Send email with estimate link
   - Add email tracking pixel
   - Update status to "Sent"
3. Customer receives email with:
   - Direct link to estimate portal
   - Event details summary
   - Next steps

### 🔄 **How to Process a Change Request**

1. Navigate to **Changes** tab
2. Find pending change request
3. Click "Review"
4. Read customer's requested changes
5. Evaluate cost impact:
   - Increase guest count → Calculate per-person pricing
   - Add items → Add to line items
   - Remove items → Subtract from total
6. Choose action:
   - **Approve**: Creates new estimate version automatically
   - **Reject**: Send explanation to customer
   - **Negotiate**: Contact customer to discuss
7. If approved, new estimate is sent automatically

### ✉️ **How to Manually Resend Emails**

**For Estimates:**
1. Go to **Workflow** → Find event
2. Click "Resend Estimate" button
3. Confirm action
4. New email sent with tracking

**For Payment Links:**
1. Go to **Payments** tab
2. Find invoice
3. Click "Resend Payment Link"
4. Customer receives new Stripe checkout link

### 💳 **How to Track Payment Status**

**Quick View:**
- **Pipeline** tab shows payment status badge on each event card
- **At-Risk** tab highlights overdue payments in red

**Detailed View:**
1. Go to **Payments** tab
2. View all invoices with:
   - Payment status (Pending, Partially Paid, Paid, Overdue)
   - Amount paid vs. total
   - Payment method
   - Transaction history
3. Click invoice to see:
   - All payment transactions
   - Milestone completion
   - Customer payment history

**What Each Status Means:**
- `draft` - Estimate not sent yet
- `sent` - Estimate sent to customer
- `approved` - Customer approved, awaiting payment
- `partially_paid` - Deposit received, balance pending
- `paid` - Fully paid
- `overdue` - Payment past due date

---

## Mobile Access

The admin dashboard is **fully responsive** and optimized for mobile devices:

### 📱 **Mobile Navigation**
- Tap top menu to switch between views
- Horizontal scroll for all tabs on smaller screens
- Cards stack vertically on mobile
- Touch-friendly buttons and forms

### 📸 **Recommended Mobile Workflow**

**On the go:**
1. Check "Today" and "At-Risk" tabs
2. Mark checklist items complete
3. Send quick email updates
4. View payment status

**At your desk:**
1. Create/edit estimates
2. Process change requests
3. Upload documents
4. Run detailed reports

---

## Troubleshooting

### ❌ **Customer Didn't Receive Email**

**Solution:**
1. Check customer's email address is correct
2. Ask customer to check spam folder
3. Use "Resend Estimate" button in Workflow tab
4. Check edge function logs in **Testing** tab for email errors
5. Verify email template is active in system

### 💳 **Payment Button Not Working**

**Solution:**
1. Verify Stripe API keys are configured
2. Check **Testing** → Edge Function Tester
3. Test `create-checkout-session` function
4. Check Stripe Dashboard for webhook status
5. View logs at: [Stripe Logs](https://supabase.com/dashboard/project/qptprrqjlcvfkhfdnnoa/functions/create-checkout-session/logs)

### 📊 **Email Tracking Not Working**

**Solution:**
1. Go to **Testing** tab
2. Click "Test Email Tracking"
3. Check edge function logs
4. Verify tracking pixel is in email template
5. Check database for `analytics_events` records

### 🔄 **Quote Not Syncing to Calendar**

**Solution:**
1. Verify Google Calendar integration is active
2. Check calendar credentials in settings
3. Manually sync from Event Timeline tab
4. Check edge function logs for sync errors

### 📄 **Document Upload Failed**

**Solution:**
1. Check file size (max 10MB)
2. Verify file type is allowed
3. Check storage bucket permissions
4. Try uploading a smaller file first
5. Check browser console for errors

---

## Payment Workflow

### 💰 **Standard Payment Process**

1. **Customer Approves Estimate**
   - Accepts Terms & Conditions
   - Status → "Approved"

2. **Customer Chooses Payment Option**
   - 50% Deposit (recommended)
   - Full Payment

3. **Stripe Checkout**
   - Secure redirect to Stripe
   - Card payment processing
   - 3D Secure authentication if required

4. **Webhook Processes Payment**
   - Updates transaction status
   - Marks milestone as paid
   - Updates invoice status
   - Sends admin notification
   - Sends customer confirmation

5. **Admin Receives Notification**
   - Email alert for payment received
   - Shows in "At-Risk" (removed from list)
   - Status updates to "Paid" or "Partially Paid"

### 🏛️ **Government Contract Payment**

Government contracts work differently:

- No upfront deposit required
- Net 30 payment terms after event
- Tax-exempt (0% tax)
- Requires PO number
- Invoice sent after event completion

**Process:**
1. Event completes
2. Admin generates final invoice
3. Customer provides PO number
4. Invoice sent with Net 30 terms
5. Payment received within 30 days
6. Status → "Paid"

---

## Event Lifecycle

### 📅 **Complete Event Journey**

**Stage 1: Request Received**
- Customer submits quote request form
- Appears in **Workflow** → "Pending"
- Admin receives notification

**Stage 2: Under Review**
- Admin reviews request details
- Calls customer if clarification needed
- Begins estimate creation

**Stage 3: Estimate Created**
- Line items generated from quote data
- Pricing calculated
- Payment schedule defined
- Status → "Quoted"

**Stage 4: Estimate Sent**
- Email sent to customer with portal link
- Tracking pixel tracks email opens
- Status → "Sent"
- Moves to **Pipeline** → "Estimated" column

**Stage 5: Customer Reviews**
- Customer opens email (tracked)
- Reviews estimate in portal
- Can request changes or approve
- Status → "Viewed"

**Stage 6: Approved**
- Customer accepts T&C
- Status → "Approved"
- Payment options displayed
- Appears in **At-Risk** if no payment within 48 hours

**Stage 7: Paid**
- Customer completes payment
- Webhook processes transaction
- Status → "Paid" (or "Partially Paid")
- Date secured, removed from "At-Risk"

**Stage 8: Confirmed**
- All payments complete
- Event date locked in calendar
- Status → "Confirmed"
- Appears in **Today** on event day

**Stage 9: In Progress**
- Event day arrives
- Shows in **Today** tab with checklist
- Admin marks setup tasks complete

**Stage 10: Completed**
- Event finished successfully
- Status → "Completed"
- Thank you email sent
- Request review from customer

---

## Tips & Best Practices

### ✅ **Do's**

- Check "At-Risk" panel daily
- Respond to change requests within 24 hours
- Send payment reminders 7 days before event
- Mark checklist items complete in real-time
- Use templates for common email responses
- Track customer communications in notes

### ❌ **Don'ts**

- Don't skip Terms & Conditions
- Don't manually edit payment amounts (use change requests)
- Don't delete completed events (archive instead)
- Don't ignore "At-Risk" events
- Don't send estimates without reviewing pricing

---

## Keyboard Shortcuts

- `W` - Switch to Workflow tab
- `P` - Switch to Pipeline tab
- `R` - Switch to At-Risk tab
- `T` - Switch to Today tab
- `S` - Switch to Status tab
- `/` - Focus search
- `Esc` - Close modal

---

## Support & Questions

**Technical Issues:**
- Check **Testing** tab for edge function logs
- Review browser console for errors
- Contact system administrator

**Business Questions:**
- Review this guide first
- Check quote/estimate history
- Contact business owner

**Feature Requests:**
- Document the request
- Discuss with team
- Submit to development queue

---

## Version History

- **v2.0** - Complete admin dashboard redesign
- **v1.5** - Added payment processing
- **v1.0** - Initial release

Last Updated: 2025-10-07
