

# Decouple Invoice Status from Event Completion + Send Test Thank You Email

## Summary

This plan addresses three key requirements:
1. **Decouple invoice status from event completion** - Mark Complete should ONLY update the quote status, not the invoice
2. **Show "Mark Complete" button only on/after event date** - Add date validation
3. **Visual differentiation when completed** - Grey out or change button state
4. **Send test thank you email for INV-2026-0196**

---

## Current Problem

### Current Behavior (useEstimateActions.tsx lines 232-280)
When "Mark Complete" is clicked:
1. Updates quote `workflow_status` to `completed`
2. **Also updates invoice `workflow_status` to `paid` and sets `paid_at`** ← This is wrong for Net30/late payment scenarios

### Current Button Logic (EventDetailsPanelContent.tsx lines 52-55)
```typescript
const canMarkComplete = quote?.workflow_status && 
  ['confirmed', 'paid', 'approved', 'awaiting_payment'].includes(quote.workflow_status) &&
  quote.workflow_status !== 'completed';
```
- Missing: Date check (should only show on/after event date)
- Missing: Visual differentiation for completed state

---

## Implementation Plan

### Step 1: Fix useEstimateActions.tsx - Decouple Invoice Status

**File:** `src/hooks/useEstimateActions.tsx`
**Lines:** 231-280

**Change:** Remove the invoice status update from `handleMarkEventCompleted`

**Before:**
```typescript
const handleMarkEventCompleted = useCallback(async () => {
  if (!quoteId || !invoiceId) return;
  // ... updates BOTH quote AND invoice
```

**After:**
```typescript
const handleMarkEventCompleted = useCallback(async () => {
  if (!quoteId) return;  // Remove invoiceId requirement
  setIsMarkingComplete(true);
  try {
    // ONLY update quote status to completed
    const { error: quoteError } = await supabase
      .from('quote_requests')
      .update({ 
        workflow_status: 'completed',
        last_status_change: new Date().toISOString(),
        status_changed_by: 'admin',
      })
      .eq('id', quoteId);
    
    if (quoteError) throw quoteError;
    
    // DO NOT update invoice status - payment is separate from event completion
    // Invoice status will be updated when actual payment is received
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['quotes'] });
    queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    
    toast({ 
      title: 'Event Marked Complete', 
      description: 'The event has been marked as completed. Invoice payment status remains unchanged.' 
    });
    
  } catch (err: any) {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
  } finally {
    setIsMarkingComplete(false);
  }
}, [quoteId, queryClient, toast]);  // Remove invoiceId, onClose from dependencies
```

---

### Step 2: Update EventDetailsPanelContent.tsx - Add Date Check & Completed State

**File:** `src/components/admin/events/EventDetailsPanelContent.tsx`
**Lines:** 52-84

**Changes:**
1. Add date validation (only show on/after event date)
2. Show greyed-out "Completed" state when already completed
3. Pass `eventDate` to hook props

**New Logic:**
```typescript
// Date check - only allow marking complete on or after event day
const isEventDayOrLater = useMemo(() => {
  if (!quote?.event_date) return false;
  const eventDate = new Date(quote.event_date);
  eventDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= eventDate;
}, [quote?.event_date]);

// Check if already completed
const isCompleted = quote?.workflow_status === 'completed';

// Determine if "Mark Complete" button should show
const canMarkComplete = quote?.workflow_status && 
  ['confirmed', 'paid', 'approved', 'awaiting_payment'].includes(quote.workflow_status) &&
  isEventDayOrLater;
```

**Button UI Changes:**
```tsx
{/* Show completed state or mark complete button */}
{isCompleted ? (
  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
    <CheckCircle2 className="h-3 w-3 mr-1" />
    Completed
  </Badge>
) : canMarkComplete && onMarkCompleted ? (
  <Button 
    size="sm" 
    variant="default" 
    onClick={onMarkCompleted}
    disabled={isMarkingComplete}
    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
  >
    {isMarkingComplete ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <CheckCircle2 className="h-4 w-4" />
    )}
    Mark Complete
  </Button>
) : null}
```

---

### Step 3: Update MobileEstimateView.tsx - Same Logic

**File:** `src/components/admin/mobile/MobileEstimateView.tsx`
**Lines:** 252-269

Apply the same changes:
1. Add `isEventDayOrLater` check
2. Show "Completed" badge when already marked complete
3. Only show button on/after event date

---

### Step 4: Update auto-workflow-manager - Consistent Logic

**File:** `supabase/functions/auto-workflow-manager/index.ts`
**Lines:** 112-149 (Section 3: Auto-complete events)

The auto-complete logic is already correct - it only updates the quote status, not the invoice.

Current behavior:
- Updates `quote_requests.workflow_status` to `completed`
- Does NOT touch invoice status

This is already aligned with the desired behavior. No changes needed here.

---

## Test Thank You Email for INV-2026-0196

**Quote Details Found:**
- Quote ID: `06e32371-dffb-49e8-a508-96fa0ff0d9ef`
- Invoice ID: `b9e5f0b4-9f01-4eb3-970e-64aa58d10520`
- Event Name: Super Bowl
- Contact: Felix Margery Funes
- Email: envision@mkqconsulting.com
- Event Date: 2026-04-29 (future)
- Access Token: `0bf72903-9f44-440b-9e24-3aa365a1d9e1`
- Quote Status: `confirmed`
- Invoice Status: `paid`

**To send a test thank you email**, I will invoke the `send-event-followup` function manually for this specific quote. This requires either:

**Option A: Manual SQL update + cron trigger**
- Temporarily set the event_date to yesterday
- Trigger the send-event-followup function
- Reset the date back

**Option B: Create a test endpoint in send-event-followup**
- Add a `test_quote_id` parameter that bypasses the date filter

**Recommended: Option B** - Add test mode to the function for admin testing.

After implementation, I can call the edge function with a test parameter to trigger the thank you email.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useEstimateActions.tsx` | Remove invoice status update from handleMarkEventCompleted |
| `src/components/admin/events/EventDetailsPanelContent.tsx` | Add date validation, show completed state |
| `src/components/admin/mobile/MobileEstimateView.tsx` | Same date validation and completed state |
| `supabase/functions/send-event-followup/index.ts` | Add test mode for manual email trigger |

---

## How to Think About This

### Separation of Concerns

```text
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT LIFECYCLE                               │
│  pending → under_review → estimated → approved → confirmed →     │
│                                                     ↓            │
│                                                 COMPLETED        │
│  (triggered by: event date passed OR admin clicks Mark Complete) │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   INVOICE/PAYMENT LIFECYCLE                      │
│  draft → sent → approved → payment_pending → partially_paid →   │
│                                                     ↓            │
│                                                   PAID           │
│  (triggered by: actual payment via Stripe webhook OR admin)      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight:** These are INDEPENDENT lifecycles. An event can be:
- **Completed + Paid** (standard case)
- **Completed + Pending Payment** (Net30 government contracts)
- **Completed + Partially Paid** (customer paying in installments after event)
- **Completed + Overdue** (late payment)

### Button State Logic

```text
Is event completed?
├── YES → Show "Completed" badge (greyed out, non-clickable)
└── NO → Is today >= event date?
    ├── YES → Is status confirmable? (confirmed/paid/approved/awaiting_payment)
    │   ├── YES → Show "Mark Complete" button (clickable)
    │   └── NO → Hide button
    └── NO → Hide button (too early to mark complete)
```

---

## Workflow After Completion

1. **Admin marks event complete** → Quote status = `completed`
2. **Invoice status unchanged** → Could be `paid`, `pending`, `overdue`, etc.
3. **Next day at 10 AM**: `send-event-followup` cron sends thank you email
4. **Invoice payment** → Handled separately via:
   - Stripe webhook (automatic)
   - Admin manual update
   - Auto-workflow-manager marking overdue if past due

---

## Implementation Summary

1. **useEstimateActions.tsx**: Remove invoice update from Mark Complete
2. **EventDetailsPanelContent.tsx**: Add date check + completed state badge
3. **MobileEstimateView.tsx**: Mirror desktop logic
4. **send-event-followup**: Add test mode, then send test email

