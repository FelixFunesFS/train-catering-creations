
# Fix Customer Invoice Approval Flow ✅ COMPLETED

## Status: Implemented

All changes have been applied:
- ✅ CustomerActions.tsx now uses edge function for approval (bypasses RLS)
- ✅ CustomerEstimateView.tsx passes accessToken to CustomerActions
- ✅ CustomerDetailsSidebar.tsx passes accessToken for desktop layout
- ✅ Email templates updated with CTAs for event_reminder and change_request_submitted

## Problem Diagnosis

The customer approval from within the portal is **silently failing** due to Row-Level Security (RLS) policies. The `invoices` table only allows customers to **SELECT** (read), not **UPDATE**.

### Current Approval Paths

| Path | Mechanism | Works? |
|------|-----------|--------|
| One-Click Email Link (`/approve?token=...`) | Edge function with service role | Yes |
| In-Portal "Approve Estimate" button | Direct Supabase client update | **No** (RLS blocks UPDATE) |

### Root Cause
The `CustomerActions.tsx` component attempts a direct database update:
```typescript
await supabase.from('invoices').update({ workflow_status: 'approved' }).eq('id', invoiceId);
```

But the RLS policy only allows admins to update invoices:
```sql
Policy: "Admin can manage invoices"
Command: ALL
Using: is_admin()
```

Customers have **SELECT-only** access, so the update fails silently.

---

## Solution Strategy

**Option A (Recommended):** Route all customer approvals through the existing `approve-estimate` edge function. This function already:
- Validates the customer token
- Updates the invoice status (with service role)
- Generates payment milestones
- Sends confirmation emails
- Logs the approval

**Why not add an UPDATE policy for customers?**
- Security risk: Customers could modify invoice amounts, due dates, or other fields
- The edge function provides controlled, audited updates with proper validation

---

## Implementation Plan

### 1. Update CustomerActions.tsx

Replace the direct Supabase update with a call to the `approve-estimate` edge function.

**Current (broken):**
```typescript
const { error } = await supabase
  .from('invoices')
  .update({ workflow_status: 'approved', ... })
  .eq('id', invoiceId);
```

**Fixed:**
```typescript
const { data, error } = await supabase.functions.invoke('approve-estimate', {
  body: { token: accessToken }
});
```

### 2. Pass the access token to CustomerActions

The component needs the `customer_access_token` to call the edge function. This is available in the `CustomerEstimateView` parent component.

**Add prop:**
```typescript
interface CustomerActionsProps {
  // ... existing props
  accessToken?: string;  // Add this
}
```

**Update CustomerEstimateView.tsx:**
```typescript
<CustomerActions
  // ... existing props
  accessToken={invoice.customer_access_token}
/>
```

### 3. Simplify the approval logic

Since `approve-estimate` already handles:
- Invoice status update
- Milestone generation
- Confirmation email
- Admin notification

We can remove the duplicate logic from `CustomerActions.tsx`:
- Remove direct milestone generation call (edge function does this)
- Remove email sending call (edge function does this)
- Keep only the toast notifications and UI state management

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/customer/CustomerActions.tsx` | Use edge function for approval |
| `src/components/customer/CustomerEstimateView.tsx` | Pass accessToken prop |

---

## Code Changes

### CustomerActions.tsx

```typescript
// Add accessToken to props
interface CustomerActionsProps {
  invoiceId: string;
  customerEmail: string;
  status: string;
  quoteRequestId?: string;
  amountPaid?: number;
  onStatusChange?: () => void;
  autoApprove?: boolean;
  layout?: 'auto' | 'stacked';
  accessToken?: string;  // NEW
}

// Update handleApprove function
const handleApprove = async () => {
  if (!accessToken) {
    toast({
      title: 'Approval Error',
      description: 'Missing access credentials. Please use the link from your email.',
      variant: 'destructive',
    });
    return;
  }

  setIsApproving(true);
  try {
    // Use the edge function which has proper permissions
    const { data, error } = await supabase.functions.invoke('approve-estimate', {
      body: { token: accessToken }
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Approval failed');

    toast({
      title: 'Estimate Approved!',
      description: 'Your payment options are now available below.',
    });

    onStatusChange?.();
  } catch (error) {
    console.error('Failed to approve estimate:', error);
    toast({
      title: 'Approval Failed',
      description: 'Unable to approve. Please try again or contact us at (843) 970-0265.',
      variant: 'destructive',
    });
  } finally {
    setIsApproving(false);
  }
};
```

### CustomerEstimateView.tsx

```typescript
// Pass accessToken to CustomerActions
<CustomerActions
  invoiceId={invoice.id}
  customerEmail={quote.email}
  status={invoice.workflow_status}
  quoteRequestId={quote.id}
  amountPaid={amountPaid}
  onStatusChange={refetch}
  autoApprove={shouldAutoApprove}
  accessToken={invoice.customer_access_token}  // NEW
/>
```

---

## Bonus Fixes: Missing Email CTAs

While investigating, I found two email templates missing CTA buttons for customers:

| Email Type | Issue | Fix |
|------------|-------|-----|
| `event_reminder` (customer) | No CTA button | Add `ctaButton` with portal link |
| `change_request_submitted` (customer) | No CTA button | Add `ctaButton` with portal link |

These should be added to `supabase/functions/_shared/emailTemplates.ts`:

```typescript
// event_reminder customer variant (after line 2019)
ctaButton = { text: 'View Event Details', href: effectivePortalUrl, variant: 'primary' };

// change_request_submitted customer variant (after line 2041)
ctaButton = { text: 'View Your Event', href: effectivePortalUrl, variant: 'primary' };
```

---

## Testing Checklist

1. **In-Portal Approval**: Customer clicks "Approve Estimate" button in portal
2. **One-Click Approval**: Customer clicks approval link in email
3. **Auto-Approve**: Customer arrives via `?action=approve` URL param
4. **Email CTAs**: Verify event_reminder and change_request emails have buttons
5. **Payment Flow**: After approval, customer can proceed to payment

---

## Summary

| Issue | Cause | Solution |
|-------|-------|----------|
| Customer can't approve from portal | RLS blocks UPDATE | Use `approve-estimate` edge function |
| Missing email CTAs | Incomplete template logic | Add `ctaButton` to customer variants |
| Silent failures | No error handling for RLS | Edge function returns proper errors |
