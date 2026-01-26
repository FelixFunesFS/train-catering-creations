
# Separate Estimate Status and Payment Status Badges (Refined)

## Summary

Implement distinct **Estimate Status** and **Payment Status** badges in the customer portal and admin event list. Payment status labels will be context-aware based on the specific milestone type that is currently due, differentiating between deposit, booking payment, milestone, and balance payments.

## The Mental Model

### Estimate Status (Document Lifecycle)
- Draft → Under Review → Sent → Viewed → **Approved** → Cancelled

### Payment Status (Money Collection - only after approval)
Derived from the **next unpaid milestone's type**:

| Milestone Type | Payment Label | When Used |
|----------------|---------------|-----------|
| `DEPOSIT` | **Deposit Due** | 45+ days out, 10% to secure date |
| `COMBINED` | **Booking Payment Due** | 15-44 days out, 60% combined |
| `FULL` | **Full Payment Due** | ≤14 days (rush), 100% required |
| `MILESTONE` | **Milestone Due** | 50% at 30 days before |
| `BALANCE` | **Balance Due** | Final 40% payment |
| `FINAL` | **Net 30 Pending** | Government contracts |
| *(all paid)* | **Paid in Full** | All milestones completed |
| *(overdue)* | **Overdue** | Past due date, unpaid |

## Technical Implementation

### File 1: New Utility - `src/utils/statusHelpers.ts`

Create centralized helpers for deriving estimate and payment status:

```typescript
export interface EstimateStatusInfo {
  label: string;
  color: string;
  icon: string;
}

export interface PaymentStatusInfo {
  label: string;
  color: string;
  icon: string;
  showBadge: boolean;
}

// Derive estimate status from invoice workflow status
export function getEstimateStatus(workflowStatus: string): EstimateStatusInfo {
  const statusMap: Record<string, EstimateStatusInfo> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'FileEdit' },
    pending_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'Clock' },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'Send' },
    viewed: { label: 'Viewed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'Eye' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    payment_pending: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    partially_paid: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    paid: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    overdue: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: 'XCircle' },
  };
  return statusMap[workflowStatus] || statusMap.draft;
}

// Derive payment status from workflow status AND next due milestone type
export function getPaymentStatus(
  workflowStatus: string, 
  nextMilestoneType?: string | null
): PaymentStatusInfo | null {
  // Only show payment status for approved+ states
  const paymentStates = ['approved', 'payment_pending', 'partially_paid', 'paid', 'overdue'];
  if (!paymentStates.includes(workflowStatus)) return null;

  // Paid in full - no milestone needed
  if (workflowStatus === 'paid') {
    return { 
      label: 'Paid in Full', 
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
      icon: 'CheckCircle2',
      showBadge: true 
    };
  }

  // Overdue
  if (workflowStatus === 'overdue') {
    return { 
      label: 'Overdue', 
      color: 'bg-red-100 text-red-700 border-red-200', 
      icon: 'AlertTriangle',
      showBadge: true 
    };
  }

  // Context-aware labels based on milestone type
  const milestoneLabels: Record<string, PaymentStatusInfo> = {
    deposit: { 
      label: 'Deposit Due', 
      color: 'bg-amber-100 text-amber-700 border-amber-200', 
      icon: 'Lock',
      showBadge: true 
    },
    combined: { 
      label: 'Booking Payment Due', 
      color: 'bg-amber-100 text-amber-700 border-amber-200', 
      icon: 'CreditCard',
      showBadge: true 
    },
    full: { 
      label: 'Full Payment Due', 
      color: 'bg-orange-100 text-orange-700 border-orange-200', 
      icon: 'AlertCircle',
      showBadge: true 
    },
    milestone: { 
      label: 'Milestone Due', 
      color: 'bg-blue-100 text-blue-700 border-blue-200', 
      icon: 'Clock',
      showBadge: true 
    },
    balance: { 
      label: 'Balance Due', 
      color: 'bg-purple-100 text-purple-700 border-purple-200', 
      icon: 'Wallet',
      showBadge: true 
    },
    final: { 
      label: 'Net 30 Pending', 
      color: 'bg-slate-100 text-slate-700 border-slate-200', 
      icon: 'FileText',
      showBadge: true 
    },
  };

  // Use milestone type if provided, otherwise generic "Payment Due"
  if (nextMilestoneType && milestoneLabels[nextMilestoneType.toLowerCase()]) {
    return milestoneLabels[nextMilestoneType.toLowerCase()];
  }

  // Fallback for partially_paid without specific milestone info
  if (workflowStatus === 'partially_paid') {
    return { 
      label: 'Partial', 
      color: 'bg-teal-100 text-teal-700 border-teal-200', 
      icon: 'CircleDot',
      showBadge: true 
    };
  }

  // Generic payment due
  return { 
    label: 'Payment Due', 
    color: 'bg-amber-100 text-amber-700 border-amber-200', 
    icon: 'CreditCard',
    showBadge: true 
  };
}

// Helper to get next unpaid milestone from a list
export function getNextUnpaidMilestone(milestones: Array<{ 
  milestone_type: string; 
  status: string | null;
  due_date: string | null;
}>): { milestone_type: string; due_date: string | null } | null {
  if (!milestones || milestones.length === 0) return null;
  
  // Find first non-paid milestone, ordered by due_date
  const unpaid = milestones
    .filter(m => m.status !== 'paid')
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  
  return unpaid[0] || null;
}
```

### File 2: Customer Portal - `src/components/customer/CustomerEstimateView.tsx`

#### 2a. Import new helpers and fetch milestone data

The component already has access to `milestones` from the `useEstimateData` hook.

#### 2b. Update status badge section (around line 147)

```tsx
import { getEstimateStatus, getPaymentStatus, getNextUnpaidMilestone } from '@/utils/statusHelpers';
import { FileText, CreditCard, Lock, AlertCircle } from 'lucide-react';

// Inside component, derive statuses
const estimateStatus = getEstimateStatus(invoice.workflow_status);
const nextMilestone = getNextUnpaidMilestone(milestones);
const paymentStatus = getPaymentStatus(
  invoice.workflow_status, 
  nextMilestone?.milestone_type
);

// In JSX - replace single badge with two badges
<div className="flex flex-wrap justify-center gap-2 mt-2">
  {/* Estimate Status Badge */}
  <Badge variant="outline" className={`${estimateStatus.color} border`}>
    <FileText className="h-3 w-3 mr-1" />
    {estimateStatus.label}
  </Badge>
  
  {/* Payment Status Badge - only shown after approval */}
  {paymentStatus && paymentStatus.showBadge && (
    <Badge variant="outline" className={`${paymentStatus.color} border`}>
      <CreditCard className="h-3 w-3 mr-1" />
      {paymentStatus.label}
    </Badge>
  )}
</div>
```

### File 3: EventList - `src/components/admin/events/EventList.tsx`

#### 3a. Update invoice query to include milestone data

```typescript
function useRawInvoices() {
  return useQuery({
    queryKey: ['invoices', 'raw-for-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id, 
          quote_request_id, 
          workflow_status, 
          total_amount, 
          sent_at, 
          viewed_at, 
          email_opened_at, 
          invoice_number,
          payment_milestones (
            id,
            milestone_type,
            status,
            due_date
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
```

#### 3b. Add Payment column to desktop table header

After the Status column header:

```tsx
<SortableTableHead 
  label="Payment" 
  sortKey="payment_status" 
  currentSortBy={sortBy} 
  currentSortOrder={sortOrder}
  onSort={handleSort}
  className="hidden lg:table-cell"
/>
```

#### 3c. Add payment badge to table rows

```tsx
// Calculate payment status for each row
const nextMilestone = invoice?.payment_milestones 
  ? getNextUnpaidMilestone(invoice.payment_milestones)
  : null;
const paymentStatus = invoice 
  ? getPaymentStatus(invoice.workflow_status, nextMilestone?.milestone_type)
  : null;

// In TableCell
<TableCell className="hidden lg:table-cell">
  {paymentStatus ? (
    <Badge variant="outline" className={`text-xs ${paymentStatus.color} border`}>
      {paymentStatus.label}
    </Badge>
  ) : (
    <span className="text-muted-foreground text-sm">—</span>
  )}
</TableCell>
```

#### 3d. Update mobile card layout

```tsx
<div className="flex flex-wrap gap-2 mb-2">
  {/* Event/Quote Status */}
  <Badge variant="outline" className={eventStatusColors[event.workflow_status]}>
    {formatStatus(event.workflow_status)}
  </Badge>
  
  {/* Payment Status (context-aware) */}
  {paymentStatus && (
    <Badge variant="outline" className={`${paymentStatus.color} border`}>
      💰 {paymentStatus.label}
    </Badge>
  )}
</div>
```

## Visual Examples

### Customer Portal - Standard Event (45+ days)
```
┌──────────────────────────────────────────┐
│         Soul Train's Eatery              │
│      Your Custom Catering Estimate       │
│                                          │
│    [📄 Approved]  [🔒 Deposit Due]       │
│                                          │
│  Secure your date with a 10% deposit     │
```

### Customer Portal - Rush Event (≤14 days)
```
┌──────────────────────────────────────────┐
│         Soul Train's Eatery              │
│      Your Custom Catering Estimate       │
│                                          │
│    [📄 Approved]  [⚠️ Full Payment Due]  │
│                                          │
│  Full payment required for rush events   │
```

### Customer Portal - After Deposit Paid (Standard tier)
```
┌──────────────────────────────────────────┐
│    [📄 Approved]  [📅 Milestone Due]     │
│                                          │
│  Next payment: 50% due 30 days before    │
```

### Admin Events Table
```
| Date   | Customer   | Event         | Status    | Payment            | Total     |
|--------|------------|---------------|-----------|-------------------|-----------|
| Mar 15 | John Smith | Smith Wedding | Confirmed | Balance Due       | $3,500.00 |
| Mar 20 | Jane Doe   | Corp Event    | Approved  | Deposit Due       | $1,200.00 |
| Mar 22 | USMC       | Military Ball | Approved  | Net 30 Pending    | $5,000.00 |
| Mar 25 | Bob Wilson | Rush Birthday | Approved  | Full Payment Due  | $800.00   |
```

## Files Modified

1. **NEW**: `src/utils/statusHelpers.ts` - Status derivation with milestone-aware payment labels
2. `src/components/customer/CustomerEstimateView.tsx` - Dual badges with context-aware payment status
3. `src/components/admin/events/EventList.tsx` - Payment column + milestone data fetch

## Benefits

- **Deposit vs Payment clarity**: Customers clearly see "Deposit Due" for securing their date vs "Milestone Due" for subsequent payments
- **Rush event awareness**: "Full Payment Due" creates appropriate urgency for last-minute bookings
- **Government handling**: "Net 30 Pending" clearly indicates post-event billing terms
- **Progress tracking**: Badge changes as payments are made (Deposit → Milestone → Balance → Paid)
- **Admin visibility**: Quick glance shows exactly what payment stage each event is in
