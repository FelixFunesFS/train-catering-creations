

# Staff View Type Case & Service Details Fix

## Overview

Fix the Staff View to properly format database type values (`snake_case`, `kebab-case`) and show only the service details that were selected by the user, not all available options.

---

## Issue 1: Type Case Display

### Current Problem

Database stores values like:
- `event_type`: `private_party`, `birthday`, `military_function`
- `service_type`: `delivery-only`, `full-service`

These appear raw in badges without proper formatting.

### Solution

Create a shared utility file with label maps and a fallback formatter for both types.

---

## Issue 2: Service Details Display

### Current Problem

The Equipment and Service Details sections show ALL options with visual indicators:

```text
Equipment Needed:
  ✓ Chafers
  ○ Plates        <- shown even if not requested
  ○ Cups          <- shown even if not requested
  ✓ Napkins
```

### Solution

Only display items that are `true` (selected). Hide items not requested.

```text
Equipment Needed:
  • Chafers
  • Napkins
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/utils/eventTypeLabels.ts` | Shared label maps and formatting functions |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/staff/StaffEventCard.tsx` | Use shared labels, add event type badge formatting |
| `src/components/staff/StaffEventDetails.tsx` | Use shared labels, show only selected equipment/service items |

---

## Implementation Details

### 1. Create `src/utils/eventTypeLabels.ts`

```typescript
export const eventTypeLabels: Record<string, string> = {
  'private_party': 'Private Party',
  'birthday': 'Birthday',
  'military_function': 'Military Function',
  'wedding': 'Wedding',
  'corporate': 'Corporate',
  'graduation': 'Graduation',
  'anniversary': 'Anniversary',
  'baby_shower': 'Baby Shower',
  'retirement': 'Retirement',
  'holiday': 'Holiday',
  'other': 'Other',
};

export const serviceTypeLabels: Record<string, string> = {
  'full-service': 'Full Service',
  'delivery-only': 'Delivery Only',
  'drop-off': 'Drop-Off',
  'buffet': 'Buffet',
  'plated': 'Plated',
  'family-style': 'Family Style',
};

// Format unknown types by converting snake_case/kebab-case to Title Case
function formatUnknownType(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function formatEventType(value: string): string {
  return eventTypeLabels[value] || formatUnknownType(value);
}

export function formatServiceType(value: string): string {
  return serviceTypeLabels[value] || formatUnknownType(value);
}
```

### 2. Update `StaffEventCard.tsx`

- Import shared labels from utility file
- Remove local `serviceTypeLabels` definition
- Add event type badge with proper formatting

```typescript
// Line 106-109: Update badge to use formatted types
<Badge variant="outline">
  {formatServiceType(event.service_type)}
</Badge>
<Badge variant="outline">
  {formatEventType(event.event_type)}
</Badge>
```

### 3. Update `StaffEventDetails.tsx`

**A) Import shared labels:**
```typescript
import { formatEventType, formatServiceType } from '@/utils/eventTypeLabels';
```

**B) Update header badges (lines 225-226):**
```typescript
<Badge variant="outline">{formatServiceType(event.service_type)}</Badge>
<Badge variant="outline">{formatEventType(event.event_type)}</Badge>
```

**C) Refactor Equipment section to show only selected items (lines 273-282):**

Replace the grid showing all items with checkmarks:
```typescript
// Before: Shows all 6 items with ✓ or ○
<div className="grid grid-cols-2 gap-2">
  <EquipmentItem label="Chafers" checked={event.chafers_requested} />
  <EquipmentItem label="Plates" checked={event.plates_requested} />
  ...
</div>
```

With a filtered list showing only selected items:
```typescript
// After: Shows only requested items
const selectedEquipment = [
  event.chafers_requested && 'Chafers',
  event.plates_requested && 'Plates',
  event.cups_requested && 'Cups',
  event.napkins_requested && 'Napkins',
  event.serving_utensils_requested && 'Serving Utensils',
  event.ice_requested && 'Ice',
].filter(Boolean) as string[];

// Render as simple list
<ul className="space-y-2">
  {selectedEquipment.map((item) => (
    <li key={item} className="text-sm flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      {item}
    </li>
  ))}
</ul>
```

**D) Refactor Service Details section (lines 291-296):**

Same approach - show only selected service options:
```typescript
const selectedServices = [
  event.wait_staff_requested && 'Wait Staff',
  event.bussing_tables_needed && 'Bussing Tables',
  event.cocktail_hour && 'Cocktail Hour',
].filter(Boolean) as string[];

// Render only selected items
{selectedServices.length > 0 && (
  <ul className="space-y-2">
    {selectedServices.map((item) => (
      <li key={item} className="text-sm flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        {item}
      </li>
    ))}
  </ul>
)}
```

---

## Visual Comparison

### Before (Equipment)
```text
┌─────────────────────────────────┐
│ Equipment Needed                │
│ ✓ Chafers       ○ Plates        │
│ ○ Cups          ✓ Napkins       │
│ ○ Utensils      ○ Ice           │
└─────────────────────────────────┘
```

### After (Equipment)
```text
┌─────────────────────────────────┐
│ Equipment Needed                │
│ ✓ Chafers                       │
│ ✓ Napkins                       │
└─────────────────────────────────┘
```

### Before (Badges)
```text
[delivery-only] [private_party]
```

### After (Badges)
```text
[Delivery Only] [Private Party]
```

---

## Summary

| Change | File | Description |
|--------|------|-------------|
| Create shared utility | `eventTypeLabels.ts` | Label maps + fallback formatter |
| Fix type display | `StaffEventCard.tsx` | Use shared formatters |
| Fix type display | `StaffEventDetails.tsx` | Use shared formatters |
| Filter equipment | `StaffEventDetails.tsx` | Show only selected items |
| Filter services | `StaffEventDetails.tsx` | Show only selected items |

