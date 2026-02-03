

# Fix MenuActionsPanel Missing accessToken Prop

## Problem Summary

The `MenuActionsPanel` component (used in the desktop 3-column layout's right panel) is missing the `accessToken` prop, causing approval failures for desktop users who click the "Approve Estimate" button in the right panel.

## Current State

| Layout | Component | Location | Has Token? |
|--------|-----------|----------|------------|
| Mobile | `MainContent → CustomerActions` | Full page | Yes |
| Desktop | `CustomerDetailsSidebar → CustomerActions` | Left panel | Yes |
| Desktop | `MenuActionsPanel → CustomerActions` | Right panel | **No** |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/customer/MenuActionsPanel.tsx` | Add `accessToken` prop to interface and pass to `CustomerActions` |
| `src/components/customer/CustomerEstimateView.tsx` | Pass `accessToken` (which is the `token` from URL) to `MenuActionsPanel` |

## Implementation Details

### 1. MenuActionsPanel.tsx

**Add to interface (around line 25):**
```typescript
interface MenuActionsPanelProps {
  // ... existing props
  accessToken?: string;  // ADD THIS
}
```

**Add to destructured props (around line 35):**
```typescript
export function MenuActionsPanel({
  // ... existing props
  accessToken,  // ADD THIS
}: MenuActionsPanelProps) {
```

**Pass to CustomerActions (around line 95):**
```typescript
<CustomerActions
  invoiceId={invoiceId}
  customerEmail={customerEmail}
  status={workflowStatus}
  quoteRequestId={quoteRequestId}
  amountPaid={amountPaid}
  onStatusChange={onStatusChange}
  autoApprove={autoApprove}
  accessToken={accessToken}  // ADD THIS
/>
```

### 2. CustomerEstimateView.tsx

**Pass token to MenuActionsPanel (around line 490):**
```typescript
<MenuActionsPanel
  lineItems={lineItems}
  subtotal={invoice.subtotal}
  taxAmount={invoice.tax_amount || 0}
  total={invoice.total_amount}
  notes={invoice.notes}
  invoiceId={invoice.id}
  customerEmail={quote.email}
  workflowStatus={invoice.workflow_status}
  quoteRequestId={invoice.quote_request_id}
  amountPaid={amountPaid}
  onStatusChange={refetch}
  autoApprove={shouldAutoApprove}
  accessToken={token}  // ADD THIS - 'token' is already available from useSearchParams
/>
```

## After Fix

| Layout | Component | Location | Has Token? |
|--------|-----------|----------|------------|
| Mobile | `MainContent → CustomerActions` | Full page | Yes |
| Desktop | `CustomerDetailsSidebar → CustomerActions` | Left panel | Yes |
| Desktop | `MenuActionsPanel → CustomerActions` | Right panel | **Yes** |

## Testing Checklist

1. Desktop right panel: Click "Approve Estimate" button - should succeed
2. Desktop left panel: Click "Approve Estimate" button - should still work
3. Mobile: Click "Approve Estimate" button - should still work
4. Email one-click approval: Should still work (unchanged)

