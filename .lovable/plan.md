

# De-duplicate Redundant Category Titles in Staff Event Details

## Scope Confirmation
`LineItemsByCategory` and `LineItemsForCategories` are **private components** defined within `src/components/staff/StaffEventDetails.tsx` — they are not exported or used anywhere else. All changes below affect only the `/staff` route. No email templates, admin views, or customer-facing views are impacted.

## Changes (single file: `StaffEventDetails.tsx`)

### 1. `LineItemsByCategory` (lines 211-237) — collapse single-item categories
When a category group has exactly **one item**, skip the `<h4>` category sub-header entirely. The item's own title + description serves as the label. This eliminates "Catering Package → Catering Package ×150" and "Appetizers → Appetizer Selection ×150" redundancy.

Multi-item categories keep the existing header + list layout unchanged.

### 2. `LineItemsForCategories` (lines 241-262) — hide generic package titles
When the filtered list has exactly **one item** that has a description, skip the bold item title and render only the description with a checkmark. The collapsible section header (e.g., "Equipment & Supplies") already names the section — repeating "Supply & Equipment Package" adds nothing.

When there are multiple items or no description, keep current rendering.

### Result
- "Event Requirements" → items show directly without echoing category headers
- "Equipment & Supplies" → shows the description (e.g., "Food Warmers with Fuel, plates…") without the redundant "Supply & Equipment Package" title
- "Service Details" → shows "Delivery with Setup" without the redundant "Service Package" title

No data, logic, or workflow changes.

