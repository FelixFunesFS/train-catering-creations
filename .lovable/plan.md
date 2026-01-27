

# Customer Portal & Email Consistency Audit - Comprehensive Fix Plan

## Executive Summary

After thorough analysis, I've identified **5 distinct issues** spanning the customer portal UI and email templates:

---

## Issue 1: Customer Portal Badge Not Showing "Approved"

### Root Cause Analysis
The `getEstimateStatus()` function in `src/utils/statusHelpers.ts` (lines 23-37) correctly maps `approved`, `payment_pending`, `partially_paid`, and `paid` to show "Approved" label.

**However**, looking at the HeaderSection in `CustomerEstimateView.tsx` (lines 156-168):
```typescript
<Badge variant="outline" className={`${estimateStatus.color} border`}>
  <FileText className="h-3 w-3 mr-1" />
  {estimateStatus.label}
</Badge>
```

The status **is** being computed correctly. The issue is likely that:
1. The invoice has `workflow_status = 'sent'` or `'viewed'` instead of `'approved'`
2. OR the approval action didn't update the status correctly

**Verification needed**: Check the actual `workflow_status` value in the database for the invoices being tested.

### Data Check (from query results)
Looking at the invoices:
- `INV-2026-0193` (Margery Funes Wedding): `workflow_status: 'sent'` - **NOT approved**
- `INV-2026-0196`: `workflow_status: 'paid'` - Should show "Approved" badge

**Conclusion**: The badge logic is correct. The issue is that the specific invoice being tested hasn't been approved yet (`workflow_status = 'sent'`).

### No Code Change Required
The status badge logic is functioning correctly. The invoice needs to go through the approval flow.

---

## Issue 2: Move CTAs to Top Left on Desktop

### Current State
In `CustomerEstimateView.tsx` (lines 424-490), the desktop 3-column layout places:
- Left Panel (25%): `CustomerDetailsSidebar` - customer details + event info
- Center Panel (35%): `PaymentCard` - payment schedule/actions
- Right Panel (40%): `MenuActionsPanel` - menu items + customer actions (approve/request changes)

### Problem
The "Approve Estimate" and "Request Changes" CTAs are buried in the **right panel** inside `MenuActionsPanel`, requiring horizontal scrolling/navigation to find them.

### Proposed Fix
Move `CustomerActions` component from `MenuActionsPanel` to the **Left Panel** (CustomerDetailsSidebar) on desktop, positioning it prominently at the TOP of that sidebar.

**Changes Required:**

1. **`CustomerDetailsSidebar.tsx`** - Add CustomerActions prop and render at top
2. **`CustomerEstimateView.tsx`** - Pass action props to sidebar instead of MenuActionsPanel
3. **`MenuActionsPanel.tsx`** - Remove CustomerActions from desktop view (keep for mobile)

### Technical Implementation

```typescript
// CustomerDetailsSidebar.tsx - Add props for actions
interface CustomerDetailsSidebarProps {
  quote: { ... };
  // NEW: Action props for desktop CTA placement
  invoiceId?: string;
  customerEmail?: string;
  workflowStatus?: string;
  quoteRequestId?: string | null;
  amountPaid?: number;
  onStatusChange?: () => void;
  autoApprove?: boolean;
}

// Render CustomerActions at TOP of sidebar (before "Your Details" card)
{invoiceId && (
  <Card className="mb-4">
    <CardContent className="pt-4">
      <CustomerActions
        invoiceId={invoiceId}
        customerEmail={customerEmail}
        status={workflowStatus}
        quoteRequestId={quoteRequestId}
        amountPaid={amountPaid}
        onStatusChange={onStatusChange}
        autoApprove={autoApprove}
      />
    </CardContent>
  </Card>
)}
```

---

## Issue 3: "Make a Payment" CTA Not Displaying

### Root Cause Analysis
In `PaymentCard.tsx` (line 55):
```typescript
const showPaymentActions = ['approved', 'partially_paid', 'payment_pending'].includes(workflowStatus);
```

The payment actions (Pay Now button) **only appear** when:
1. `workflowStatus` is `'approved'`, `'partially_paid'`, or `'payment_pending'`

### Problem
If the invoice is still in `'sent'` or `'viewed'` status, the PaymentCard shows only the **read-only schedule** without any payment buttons.

### This is Correct Behavior
The customer must first **approve the estimate** before payment options become available. This is by design to ensure the customer agrees to the terms before paying.

### No Code Change Required
The payment CTA visibility is working as designed. The customer needs to click "Approve Estimate" first.

---

## Issue 4: Email Service Addons Duplication (Table Bussing & Cocktail Hour)

### Root Cause Analysis
In the confirmation email, "Services Included" shows:
- 🧹 Table Bussing
- 🍸 Cocktail Hour

These are **also** conceptually part of the menu/service package, causing perceived duplication.

### Current Logic (emailTemplates.ts lines 336-380)
The `generateServiceAddonsSection()` function always renders these boolean flags as separate badges whenever:
- `quote.bussing_tables_needed = true`
- `quote.cocktail_hour = true`

### The Issue
When using `full_selection` block (which combines menu + services + supplies), services are rendered twice:
1. Once in the menu items (if priced as line items)
2. Again in the dedicated "Services Included" section

### Proposed Fix
Modify `generateServiceAddonsSection()` to **skip rendering** services that are already visible as priced line items in the menu:

```typescript
export function generateServiceAddonsSection(quote: any, lineItems?: any[]): string {
  const services: { label: string; ... }[] = [];
  
  // Check if service is already in line items (by category or title)
  const hasInLineItems = (searchTerms: string[]) => {
    if (!lineItems) return false;
    return lineItems.some(item => 
      searchTerms.some(term => 
        (item.title || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term)
      )
    );
  };

  // Only add if NOT already a priced line item
  if (quote.bussing_tables_needed && !hasInLineItems(['bussing', 'table bussing'])) {
    services.push({ ... });
  }
  if (quote.cocktail_hour && !hasInLineItems(['cocktail', 'cocktail hour'])) {
    services.push({ ... });
  }
  // ... etc
}
```

**Alternative Approach** (simpler):
For emails using `full_selection`, skip the `service_addons` block entirely since all services are implied by the menu section. Only show `service_addons` in emails that don't include the full menu.

---

## Issue 5: Payment Email "10% Deposit Due Now" Showing Wrong Date

### Root Cause Analysis
The email shows:
```
💳 10% booking deposit due now
$4,305.50 remaining • Due Sunday, January 25, 2026
```

**The Logic Issue:**
Looking at `emailTemplates.ts` lines 1850-1914:

```typescript
const nextMilestone = remainingMilestones[0]; // First unpaid milestone
const nextDueText = nextMilestone.due_date ? formatDate(nextMilestone.due_date) : 'upon confirmation';
```

When a payment is received, the email shows the **next milestone's** description and due date. But the way it's worded implies the deposit itself is due on that date.

### Data from Database
For INV-2026-0193 (June 20, 2026 event):
- DEPOSIT (10%): $43,055 - Due Jan 26, 2026 (is_due_now: true)
- MILESTONE (50%): $215,275 - Due May 21, 2026
- FINAL (40%): $172,220 - Due June 6, 2026

### The Bug
When a customer receives a "Payment Received" email after paying the deposit, the code shows:
- Payment received: `$430.55` (10% of $4,305.50 total... wait, that's wrong math)

**Wait - let me re-check the math:**
- Total: $430,550 cents = $4,305.50
- 10% deposit: $43,055 cents = $430.55

So the payment received ($430.55) matches the 10% deposit. But then:
- Remaining: $4,305.50 - $430.55 = $3,874.95 (90% remaining)

But the email shows "Remaining: $4,305.50 (3 payments remaining)" - that's the **total**, not the remaining balance!

### Real Bug Found
The `payment_received` email is showing the TOTAL amount as the remaining balance instead of calculating it correctly from milestones.

Looking at line 1851-1852:
```typescript
const remainingMilestones = milestones?.filter(m => m.status !== 'paid') || [];
const remainingBalance = remainingMilestones.reduce((sum, m) => sum + m.amount_cents, 0);
```

This code is **correct** IF the milestones are updated with `status: 'paid'` after payment. But if the payment was just received and milestones haven't been updated yet, ALL milestones still have `status: 'pending'`, causing the sum to equal the total.

### Fix Required
The milestone status update must happen **before** the payment confirmation email is sent. Check `stripe-webhook/index.ts` to ensure milestones are marked as paid before triggering the email.

---

## Summary of Changes Required

| Issue | File | Change |
|-------|------|--------|
| #1 Badge | No change | Badge logic correct; invoice needs approval |
| #2 CTA Placement | `CustomerDetailsSidebar.tsx`, `CustomerEstimateView.tsx` | Move CustomerActions to left sidebar on desktop |
| #3 Make Payment | No change | Payment CTA correctly hidden until approved |
| #4 Service Duplication | `emailTemplates.ts` | Pass lineItems to `generateServiceAddonsSection()` and skip duplicates |
| #5 Payment Balance | `stripe-webhook/index.ts` or `emailTemplates.ts` | Ensure milestone status updates before email OR calculate remaining differently |

---

## Implementation Priority

1. **Issue #2 (CTA Placement)** - High impact UX fix
2. **Issue #5 (Payment Balance)** - Critical data accuracy issue
3. **Issue #4 (Service Duplication)** - Email clarity improvement

---

## Testing Verification Plan

After implementation:

1. **Approve an estimate** from `sent` status → verify badge changes to "Approved"
2. **Check desktop layout** → verify CTAs appear in left sidebar
3. **Make a payment** → verify remaining balance is correct (total - paid)
4. **Review payment email** → verify services aren't duplicated from menu
5. **Check due dates** → verify milestone descriptions match the correct dates

