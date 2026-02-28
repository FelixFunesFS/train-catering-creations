

## Problem

The current plan only changed `EventDetail.tsx`, which is the **mobile-only** modal. On desktop (your current view at `/admin?view=events`), clicking an event row navigates to `/admin/event/:id`, which renders `EventEstimateFullView` → `EventDetailsPanelContent`. This component has **zero cancel functionality** — no prop, no button, no hook. That's why you don't see it.

## Revised Plan

### 1. Add cancel props to `EventDetailsPanelContent.tsx`

Add two optional props to the interface:
- `onCancelEvent?: () => void`
- `isCancelling?: boolean`

Render a "Cancel Event" button (destructive variant) in the existing status actions area, visible when `quote.workflow_status !== 'cancelled'`.

### 2. Wire cancel logic in `EventEstimateFullView.tsx`

- Import `useUpdateQuoteStatus` hook (same one used in `EventDetail.tsx`)
- Create a `handleCancelEvent` callback that calls `updateStatus('cancelled')`
- Pass `onCancelEvent` and `isCancelling` props down to `EventDetailsPanelContent`

### 3. Keep `EventDetail.tsx` change as-is

The previous fix remains valid for the mobile modal flow — no rollback needed.

### What does NOT change

- No new database changes, no new statuses
- All other workflow buttons (Mark In Progress, Mark Completed, Send Thank You) stay unchanged
- Admin-only scope: `EventDetailsPanelContent` and `EventEstimateFullView` are only used under `/admin/*` routes behind `ProtectedRoute`
- Customer views are completely unaffected

