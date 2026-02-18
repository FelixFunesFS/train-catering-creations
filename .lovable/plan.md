

## Fix Hardcoded "50% Deposit" Label in Checkout Link Success Message

### The Problem

In `PaymentRecorder.tsx` line 367, the checkout link success message hardcodes `'50% Deposit'` instead of using the already-computed `depositLabel` variable (which dynamically shows the actual milestone type and percentage, e.g. "Deposit (10%)").

### The Fix

**File:** `src/components/admin/billing/PaymentRecorder.tsx` (line 367)

Replace the hardcoded string interpolation:

```
'50% Deposit'
```

with:

```
depositLabel
```

This is a single-line change. The `depositLabel` variable is already defined earlier in the component and correctly reflects the next pending milestone's label or falls back to "50% Deposit" when no milestones exist.

### What Does NOT Change

- All other components, services, and edge functions remain untouched
- No logic changes -- purely swapping a hardcoded string for the existing variable

