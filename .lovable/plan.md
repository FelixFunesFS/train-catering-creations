

# Fix: "Awaiting Payment" Showing in Status Column

## The Two Status Systems

Your app tracks two independent lifecycles that map to two columns in the events table:

```text
EVENT LIFECYCLE (quote_requests.workflow_status)    PAYMENT LIFECYCLE (invoice + milestones)
----------------------------------------------------  -----------------------------------------
pending          -> New submission                    (no invoice yet)
under_review     -> Admin reviewing                   (no invoice yet)
estimated        -> Estimate sent                     draft / sent / viewed
confirmed        -> Customer approved                 approved
awaiting_payment -> Deposit paid, more due            partially_paid  +  Deposit Paid badge
paid             -> Fully paid                        paid            +  Paid in Full badge
completed        -> Event finished                    (independent)
cancelled        -> Cancelled                         cancelled
```

The problem: `awaiting_payment` and `paid` are valid quote statuses (set by a database trigger that syncs from invoices), but the EventList UI doesn't know how to display them. It just capitalizes the raw value.

## What the Admin Should See

For Pryce and Felix:

| Column | Current | Should Be |
|--------|---------|-----------|
| Status | "Awaiting Payment" (unstyled) | "Confirmed" (green badge) |
| Payment | Deposit Paid (green) | Deposit Paid (green) -- already correct |

The **Status column** should show the business-level state: once a customer approves and pays anything, the event is "Confirmed." The **Payment column** (already working correctly) shows the financial detail.

## Changes

### 1. `src/components/admin/events/EventList.tsx`

**Add to `eventStatusColors` map (line 62-71):**
- `awaiting_payment` and `paid` -- same green as `confirmed`

**Update `formatStatus` (line 85):**
- Map `awaiting_payment`, `paid`, `partially_paid`, `payment_pending` to return `"Confirmed"` instead of raw text

**Update filter `statusMap` (line 183-189):**
- Add `awaiting_payment` and `paid` to the `confirmed` filter group so they appear when filtering by "Confirmed"

### 2. `src/utils/formatters.ts`

**Update `getStatusColor` (line 83):**
- Add entries for `awaiting_payment`, `partially_paid`, `payment_pending`, and `confirmed` so badges render correct colors everywhere (used by EventDetailsPanelContent header badge)

### 3. `src/components/admin/events/EventDetailsPanelContent.tsx`

**Update status badge display (line 87):**
- Use the same display mapping so the detail view header shows "CONFIRMED" instead of "AWAITING PAYMENT"

## No edge function or database changes needed

The database trigger that sets `awaiting_payment` is correct -- it accurately reflects the financial state. This is purely a display-layer fix to map granular DB statuses to admin-friendly labels.
