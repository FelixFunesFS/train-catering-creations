

# Simplified Calendar Integration

## The Problem with Multiple Options

Having 4+ calendar choices (Apple, Google, Outlook, Office 365, .ics) creates:
- Decision fatigue for users
- Cluttered mobile UI
- Unnecessary complexity for a simple action

## The Reality

**.ics files work with everything:**
- Apple Calendar (iOS/macOS) - auto-opens
- Google Calendar - imports seamlessly
- Outlook (all versions) - native support
- Android calendar apps - handled automatically
- Any standards-compliant calendar app

## Simplified UX Approach

### Single-Action Button

Instead of a dropdown/drawer with multiple options:

```text
┌─────────────────────────────────┐
│  [📅 Add to Calendar]           │  ← One tap, downloads .ics
└─────────────────────────────────┘
```

That's it. One button. One action. The user's device handles the rest.

### Optional: Smart Platform Detection

For an enhanced but still simple experience:

| Platform | Behavior |
|----------|----------|
| **iOS** | Download .ics (opens Calendar app automatically) |
| **Android** | Download .ics OR open Google Calendar URL (smoother app experience) |
| **Desktop** | Download .ics |

On Android, Google Calendar URL opens directly in the app without a file download step - slightly smoother. But even this is optional.

## Implementation

### Minimal Changes to `calendarExport.ts`

Add staff-specific content generator:

```typescript
export const generateStaffICSFile = (data: StaffCalendarEventData): string => {
  // Uses arrival time as DTSTART
  // Includes role, menu highlights, guest count
  // Excludes all pricing
  // Adds reminder 2 hours before
};

export const downloadStaffICSFile = (data: StaffCalendarEventData): void => {
  const icsContent = generateStaffICSFile(data);
  // Download with descriptive filename
};
```

### Simple Button Component

```typescript
// No drawer, no dropdown - just a button
export function AddToCalendarButton({ event, staffAssignment }) {
  const handleClick = () => {
    downloadStaffICSFile({
      eventName: event.event_name,
      eventDate: event.event_date,
      staffArrivalTime: staffAssignment?.arrival_time || event.start_time,
      location: event.location,
      staffRole: staffAssignment?.role,
      guestCount: event.guest_count,
      menuHighlights: [...(event.proteins || []), ...(event.sides?.slice(0, 2) || [])]
    });
    
    toast.success("Calendar event downloaded");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className="h-11 min-w-[44px]">
      <CalendarPlus className="h-4 w-4" />
      <span className="ml-2">Add to Calendar</span>
    </Button>
  );
}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/utils/calendarExport.ts` | Add `generateStaffICSFile()` and `downloadStaffICSFile()` |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/staff/AddToCalendarButton.tsx` | Simple one-click calendar button |

## Result

- Clean, uncluttered mobile UI
- Single tap action
- Universal compatibility
- No user confusion
- Follows the "don't make me think" principle

