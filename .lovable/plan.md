

# Add Military Badge to Admin EventList Table & Calendar Views

## Overview

This plan adds visual military function indicators to the admin EventList table view and both calendar views (Week and Month), allowing admins to quickly identify military events at a glance.

---

## Files to Modify

### 1. EventList.tsx (Table + Mobile Card Views)

**Import Changes (Line 15):**
- Add `Shield` to lucide-react imports
- Import `isMilitaryEvent`, `getMilitaryBadgeStyles` from `@/utils/eventTypeUtils`

**Mobile Card Layout (Lines 330-341):**
After the contact name/event name display, add a military badge:
```tsx
{isMilitaryEvent(event.event_type) && (
  <Badge className={getMilitaryBadgeStyles().className + " text-[10px] px-1.5 py-0"}>
    <Shield className="h-2.5 w-2.5 mr-0.5" />
    Military
  </Badge>
)}
```

**Desktop Table Layout (Lines 552-560):**
In the Customer cell, add military indicator below the email:
```tsx
<TableCell>
  <div>
    <p className="font-medium">{event.contact_name}</p>
    <p className="text-xs text-muted-foreground hidden sm:block">{event.email}</p>
    {isMilitaryEvent(event.event_type) && (
      <Badge className={getMilitaryBadgeStyles().className + " text-[10px] px-1 py-0 mt-0.5"}>
        <Shield className="h-2.5 w-2.5 mr-0.5" />
        Military
      </Badge>
    )}
  </div>
</TableCell>
```

---

### 2. EventWeekView.tsx (Week Calendar)

**Import Changes (Line 7):**
- Add `Shield` to lucide-react imports
- Import `isMilitaryEvent`, `getMilitaryBadgeStyles` from `@/utils/eventTypeUtils`

**EventCard Component (Lines 43-91):**
After the guest count display (line 66), add military indicator:
```tsx
{isMilitaryEvent(event.event_type) && (
  <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-600">
    <Shield className="h-3 w-3" />
    <span className="truncate">{event.military_organization || 'Military'}</span>
  </div>
)}
```

---

### 3. EventMonthView.tsx (Month Calendar)

**Import Changes (Line 19):**
- Add `Shield` to lucide-react imports  
- Import `isMilitaryEvent` from `@/utils/eventTypeUtils`

**Calendar Day Cell Event Dots (Lines 157-172):**
Add military shield icon next to the status dot for military events:
```tsx
<div 
  key={event.id}
  className="flex items-center gap-1 group"
  onClick={(e) => {
    e.stopPropagation();
    onEventClick(event);
  }}
>
  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
    statusDotColors[event.workflow_status] || 'bg-gray-400'
  }`} />
  {isMilitaryEvent(event.event_type) && (
    <Shield className="h-2.5 w-2.5 text-blue-600 shrink-0" />
  )}
  <span className="text-[10px] truncate text-muted-foreground group-hover:text-foreground">
    {event.contact_name}
  </span>
</div>
```

**Selected Day Event Card (Lines 221-243):**
Add military badge in the event card header:
```tsx
<div className="flex items-start justify-between gap-2 mb-1">
  <div className="flex items-center gap-1.5">
    <p className="font-medium text-sm">{event.contact_name}</p>
    {isMilitaryEvent(event.event_type) && (
      <Shield className="h-3.5 w-3.5 text-blue-600" />
    )}
  </div>
  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
    statusDotColors[event.workflow_status] || 'bg-gray-400'
  }`} />
</div>
```

---

## Visual Design

| View | Military Indicator |
|------|-------------------|
| EventList (Mobile Card) | Blue badge with shield icon + "Military" text |
| EventList (Desktop Table) | Small blue badge below email in Customer column |
| EventWeekView (Event Cards) | Blue shield icon + organization name (or "Military") |
| EventMonthView (Calendar Dots) | Small blue shield icon next to status dot |
| EventMonthView (Selected Day) | Blue shield icon next to contact name |

---

## Technical Notes

- Uses existing `isMilitaryEvent()` utility from `eventTypeUtils.ts`
- Uses existing `getMilitaryBadgeStyles()` for consistent blue color scheme
- Shield icon from lucide-react (already used elsewhere in the codebase)
- Compact display: `text-[10px]` size to fit in constrained spaces
- Shows `military_organization` when available (Week View), falls back to "Military"

---

## Summary

| File | Changes |
|------|---------|
| `EventList.tsx` | Add military badge to mobile cards and desktop table rows |
| `EventWeekView.tsx` | Add military indicator to EventCard component |
| `EventMonthView.tsx` | Add shield icon to calendar dots and selected day cards |

