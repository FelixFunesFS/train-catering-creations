

# Fix: Show Descriptions in Equipment & Service Line Items

## Problem
The `LineItemsForCategories` component (used for Equipment & Supplies and Service Details sections) only renders `item.title` — it completely ignores `item.description`. So staff sees "Supply & Equipment Package" as both the section title and the item title, with no actual details about what's included. Same issue with "Service Package" under Service Details.

## Root Cause
`LineItemsByCategory` (used in Event Requirements) correctly renders descriptions at line 228:
```tsx
{item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
```

But `LineItemsForCategories` (lines 241-258) only renders the title — no description output exists.

## Fix — `StaffEventDetails.tsx` only

**Update `LineItemsForCategories` (lines 246-256)** to show descriptions below each item title, matching the pattern already used in `LineItemsByCategory`:

Change from a flat single-line layout to a stacked layout with description:
```tsx
<li key={item.id} className="text-sm flex items-start gap-2">
  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
  <div>
    <span className="font-medium">{item.title}</span>
    {item.quantity > 1 && (
      <span className="text-muted-foreground ml-1">×{item.quantity}</span>
    )}
    {item.description && (
      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
    )}
  </div>
</li>
```

This ensures staff can see what's actually in each package (e.g., "Includes chafers, plates, napkins, serving utensils") rather than just a category-like title.

No logic, data, or workflow changes — only the render output of existing data.

