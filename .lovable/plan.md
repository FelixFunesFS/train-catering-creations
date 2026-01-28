

# Customer Portal Left Sidebar CTA Responsiveness Fix

## Problem Identified

The "Approve Estimate" and "Request Changes" buttons in the left sidebar of the desktop 3-column customer portal layout can overlap or overflow when the left panel is at narrower widths.

### Root Cause Analysis

1. **Panel Width Constraint**: The left `ResizablePanel` has `defaultSize={25}` with `minSize={20}` and `maxSize={30}` - meaning it can be as narrow as 20% of the viewport width.

2. **Button Layout Issue**: The `CustomerActions` component uses `flex-col sm:flex-row` for button layout. Since the sidebar is within a desktop viewport (>640px), the `sm:` breakpoint always applies, forcing buttons side-by-side even when the panel itself is too narrow.

3. **Flex-1 on Buttons**: Both buttons have `flex-1` class, attempting to share equal width. In a constrained 20% panel, this causes text truncation or overflow.

4. **No Container Query**: CSS relies on viewport width (`sm:` breakpoint = 640px), not the actual container width, causing the row layout to apply when the panel is still too narrow.

---

## Solution Approach

Since CSS Container Queries have limited browser support, use a responsive strategy that forces vertical stacking in the sidebar context:

### Option A: Force Column Layout in Sidebar (Recommended)

Override the `CustomerActions` button layout specifically when used inside `CustomerDetailsSidebar` by passing a prop or using a wrapper class.

### Option B: Increase Left Panel Minimum Width

Change `minSize={20}` to `minSize={25}` to ensure buttons always have enough room.

### Option C: Use Smaller Button Size in Sidebar

Apply `size="default"` or `size="sm"` instead of `size="lg"` for the sidebar context to reduce button text length.

**Recommended**: Combine Options A and C - force vertical stacking with slightly smaller buttons in the constrained sidebar.

---

## Implementation Plan

### Step 1: Add Variant Prop to CustomerActions

Modify `CustomerActions.tsx` to accept a `compact` or `layout` prop that forces column layout regardless of viewport:

```typescript
interface CustomerActionsProps {
  // ... existing props
  layout?: 'auto' | 'stacked'; // 'stacked' forces vertical layout
}

// In the button container:
<div className={cn(
  "flex gap-3",
  layout === 'stacked' ? "flex-col" : "flex-col sm:flex-row"
)}>
```

### Step 2: Update CustomerDetailsSidebar to Use Stacked Layout

Pass `layout="stacked"` when rendering CustomerActions in the sidebar:

```tsx
<CustomerActions
  invoiceId={invoiceId}
  customerEmail={customerEmail || quote.email}
  status={workflowStatus}
  quoteRequestId={quoteRequestId}
  amountPaid={amountPaid}
  onStatusChange={onStatusChange}
  autoApprove={autoApprove}
  layout="stacked" // Force vertical stacking
/>
```

### Step 3: Use Default Button Size in Sidebar

Change buttons from `size="lg"` to `size="default"` in the stacked layout context to fit better in narrow panels:

```tsx
<Button
  onClick={handleApprove}
  disabled={isApproving}
  size={layout === 'stacked' ? 'default' : 'lg'}
  className="flex-1 bg-primary hover:bg-primary/90"
>
```

### Step 4: Add Minimum Width Safety to Left Panel

As a safety net, increase the left panel minimum size from 20% to 22%:

```tsx
<ResizablePanel 
  defaultSize={25} 
  minSize={22}  // Increased from 20
  maxSize={30}
  className="bg-background"
>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/customer/CustomerActions.tsx` | Add `layout` prop, conditionally apply column layout and button size |
| `src/components/customer/CustomerDetailsSidebar.tsx` | Pass `layout="stacked"` to CustomerActions |
| `src/components/customer/CustomerEstimateView.tsx` | Increase left panel `minSize` from 20 to 22 |

---

## Testing Verification

Since all test data with "sent"/"viewed" status was deleted, verification will require:

1. Creating a new test quote request and invoice via the admin panel
2. Setting the invoice to "sent" status
3. Viewing the customer portal at various screen widths
4. Confirming buttons stack vertically in the left sidebar
5. Confirming buttons don't overflow or overlap at minimum panel width

---

## Visual Outcome

**Before Fix:**
- Buttons forced side-by-side in narrow 20% panel
- Text truncates or overflows at narrow widths
- Potential for visual overlap with adjacent content

**After Fix:**
- Buttons always stack vertically in sidebar
- Each button has full width within the panel
- Clean, consistent appearance at all panel widths
- Improved touch targets on each button

---

## Technical Notes

- The `MenuActionsPanel` (right column) retains the original `sm:flex-row` behavior since it has a larger panel allocation (40%)
- Mobile layout is unchanged (already uses `MainContent` component with different structure)
- No breaking changes to existing functionality
- The layout prop is optional with a default value, maintaining backward compatibility

