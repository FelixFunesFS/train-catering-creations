

# Split Equipment Descriptions into Bullet Lists

## Problem
When a single equipment/service item has a comma-separated description like "Food Warmers with Fuel, Professional serving utensils, Disposable plates, Disposable cups, Napkins", it renders as one long run-on string. Staff would benefit from a clean bulleted list.

## Fix — `StaffEventDetails.tsx`, `LineItemsForCategories` only

In the `isSingleWithDescription` branch (line 255-256), split `item.description` on commas and render each segment as a separate list item with a checkmark icon:

```tsx
{isSingleWithDescription ? (
  <ul className="space-y-1">
    {item.description!.split(',').map((part, i) => (
      <li key={i} className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
        <span>{part.trim()}</span>
      </li>
    ))}
  </ul>
) : ( ... )}
```

This replaces the outer `<li>` + single `<span>` with an inner `<ul>` of individual items. The parent `<li>` wrapper stays but renders the nested list instead of a run-on string. Single file, render-only change — no data or logic impact.

