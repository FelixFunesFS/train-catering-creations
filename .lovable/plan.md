
## Add Clear Labels to Billing Info Grid

### The Change

**File:** `src/components/admin/billing/PaymentList.tsx` (lines 199-218)

Replace the current flat icon + value rows with a stacked layout: a small muted label on top, then icon + value below.

### Responsive Behavior

The existing `grid grid-cols-2 sm:grid-cols-4` stays unchanged -- it already handles mobile (2 columns) and desktop (4 columns) correctly. The only change is adding a `text-xs text-muted-foreground` label above each value inside the existing grid cells.

### Updated Markup

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
  <div className="space-y-1">
    <span className="text-xs text-muted-foreground">Event Date</span>
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span>{formatted date or 'TBD'}</span>
    </div>
  </div>
  <div className="space-y-1">
    <span className="text-xs text-muted-foreground">Guests</span>
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <span>{guest count} guests</span>
    </div>
  </div>
  <div className="space-y-1">
    <span className="text-xs text-muted-foreground">Total</span>
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{total amount}</span>
    </div>
  </div>
  <div className="space-y-1">
    <span className="text-xs text-muted-foreground">Balance Due</span>
    <div className="flex items-center gap-2">
      <CreditCard className="h-4 w-4 text-muted-foreground" />
      <span className={color based on balance}>
        {balance > 0 ? amount : 'Paid in Full'}
      </span>
    </div>
  </div>
</div>
```

### Mobile (< 640px): 2-column grid

```text
Event Date          Guests
Mar 15, 2025        150 guests

Total               Balance Due
$3,500.00           $1,750.00
```

### Desktop (640px+): 4-column grid

```text
Event Date          Guests          Total           Balance Due
Mar 15, 2025        150 guests      $3,500.00       $1,750.00
```

### What Changes
- Single file: `PaymentList.tsx`, lines 199-218
- Add `space-y-1` wrapper and label `span` to each of the 4 grid cells
- Change "Paid" to "Paid in Full" when balance is zero
- No grid, logic, or data changes

