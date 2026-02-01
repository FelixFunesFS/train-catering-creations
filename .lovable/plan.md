

# Staff View Implementation Plan (Updated)

## Overview

Create a mobile-first Staff Schedule page that allows team members to view upcoming events with full operational details (excluding pricing) and staff assignments. This integrates with the existing admin authentication and navigation systems.

Ceremony references have been removed from this implementation as they will not be used.

---

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────┐
│                        STAFF VIEW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │ useStaffEvents  │ -> │ StaffSchedule (Page)                │ │
│  │ (Data Hook)     │    │ - Filter tabs: Today | Week | All   │ │
│  └─────────────────┘    │ - Mobile: Full-screen cards         │ │
│          │              │ - Desktop: Split-panel layout       │ │
│          ▼              └─────────────────────────────────────┘ │
│  ┌─────────────────┐                    │                       │
│  │ StaffEventCard  │ <──────────────────┤                       │
│  │ - Countdown     │                    │                       │
│  │ - Location link │                    ▼                       │
│  │ - Staff summary │    ┌─────────────────────────────────────┐ │
│  └─────────────────┘    │ StaffEventDetails                   │ │
│                         │ - Collapsible sections              │ │
│                         │ - Menu, Equipment, Staff            │ │
│                         │ - Add to Calendar button            │ │
│                         └─────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Layer: useStaffEvents Hook

### Fields Included (Operational Only)

| Field | Purpose |
|-------|---------|
| `id` | Event identifier |
| `event_name` | Display name |
| `event_date` | Date of event |
| `start_time` | Event start time |
| `serving_start_time` | When service begins |
| `location` | Venue address (tappable for Maps) |
| `guest_count` | Number of guests |
| `event_type` | Type (wedding, corporate, etc.) |
| `service_type` | Service style (buffet, plated, etc.) |
| `proteins` | Menu proteins array |
| `sides` | Menu sides array |
| `appetizers` | Menu appetizers array |
| `desserts` | Menu desserts array |
| `drinks` | Menu drinks array |
| `vegetarian_entrees` | Vegetarian options |
| `dietary_restrictions` | Guest restrictions |
| `special_requests` | Customer notes |
| `chafers_requested` | Equipment flag |
| `plates_requested` | Equipment flag |
| `cups_requested` | Equipment flag |
| `napkins_requested` | Equipment flag |
| `serving_utensils_requested` | Equipment flag |
| `ice_requested` | Equipment flag |
| `wait_staff_requested` | Service add-on |
| `bussing_tables_needed` | Service add-on |
| `cocktail_hour` | Service add-on |
| `staff_assignments` | Joined from staff_assignments table |

### Fields Excluded (Financial/Sensitive)

- `email`, `phone` - Customer contact info
- `estimated_total`, `final_total` - Pricing
- `po_number`, `requires_po_number` - Billing
- `compliance_level` - Admin internal
- `ceremony_included` - NOT USED
- All invoice-related data

### Computed Fields

| Field | Calculation |
|-------|-------------|
| `days_until` | Days from today to event_date |
| `is_today` | event_date === today |
| `is_this_week` | event_date within 7 days |

### Query Filter

Only fetch events with `workflow_status` in: `confirmed`, `approved`, `quoted`, `estimated` (active events)

---

## Files to Create

### 1. `src/hooks/useStaffEvents.ts`

Data hook for staff-safe event queries with types for `StaffEvent` interface and hooks:
- `useStaffEvents(filter)` - List of upcoming events
- `useStaffEvent(eventId)` - Single event details

### 2. `src/components/staff/StaffEventCard.tsx`

Mobile-optimized event card showing:
- Countdown badge (color-coded: TODAY=red, TOMORROW=amber, IN X DAYS=blue)
- Event name and date/time
- Tappable location (opens Google Maps)
- Guest count and service type badges
- Staff assignment summary (X staff, Y/Z confirmed)
- Quick calendar icon button (uses existing AddToCalendarButton)

Touch targets: minimum 44x44px
Active state: `active:bg-muted/50` for tap feedback

### 3. `src/components/staff/StaffEventDetails.tsx`

Expanded event view with collapsible sections:

**Header Section**
- Event name with countdown badge
- Date, time, location (tappable)
- Guest count and service type
- Add to Calendar button (full variant)

**Collapsible Sections**

1. **Menu Items**
   - Proteins list
   - Sides list
   - Appetizers (if any)
   - Desserts (if any)
   - Drinks (if any)
   - Vegetarian options
   - Dietary restrictions (highlighted)
   
2. **Equipment Needed**
   - Chafers, plates, cups, napkins, utensils, ice
   - Visual checkmarks for requested items
   
3. **Service Details**
   - Wait staff requirements
   - Bussing needs
   - Cocktail hour
   - Special requests
   
4. **Staff Assignments**
   - List of assigned staff with:
     - Name and role (color-coded badge)
     - Arrival time
     - Confirmation status
     - Individual "Add to Calendar" button per assignment

### 4. `src/pages/StaffSchedule.tsx`

Main page component:

**Mobile Layout (< 1024px)**
- Full-screen card list
- Filter tabs: Today | This Week | All
- Tap card to expand details inline or navigate

**Desktop Layout (>= 1024px)**
- ResizablePanelGroup with two panels
- Left panel: Event list
- Right panel: Selected event details

**Safe Area Support**
- `pt-[env(safe-area-inset-top)]` for iOS notch
- `pb-20` to account for mobile nav bar

---

## Files to Modify

### 5. `src/App.tsx`

Add new route:

```typescript
// Import (lazy loaded)
const StaffSchedule = lazy(() => import("./pages/StaffSchedule"));

// Route (protected, inside Routes after line 117)
<Route 
  path="/staff" 
  element={
    <ProtectedRoute>
      <StaffSchedule />
    </ProtectedRoute>
  } 
/>
```

### 6. `src/components/admin/mobile/MobileAdminNav.tsx`

Add Staff nav item:
- Update `grid-cols-4` to `grid-cols-5`
- Add new nav item with Users icon before Settings
- Uses direct path `/staff` (not query param)

---

## Mobile UX Patterns

| Pattern | Implementation |
|---------|----------------|
| Touch targets | All buttons min 44x44px |
| Tap feedback | `active:bg-muted/50` or `active:scale-95` |
| Safe areas | iOS notch/home indicator support |
| Bottom nav | 5-column grid for mobile admin nav |
| Collapsibles | Animated expand/collapse using Radix Collapsible |
| Maps link | `href="https://maps.google.com/?q={location}"` |

---

## Countdown Badge Logic

```typescript
function getCountdownBadge(daysUntil: number): { text: string; color: string } {
  if (daysUntil < 0) return { text: 'PAST', color: 'bg-gray-500' };
  if (daysUntil === 0) return { text: 'TODAY', color: 'bg-red-500' };
  if (daysUntil === 1) return { text: 'TOMORROW', color: 'bg-amber-500' };
  if (daysUntil <= 7) return { text: `IN ${daysUntil} DAYS`, color: 'bg-blue-500' };
  return { text: format(eventDate, 'MMM d'), color: 'bg-slate-500' };
}
```

---

## Integration with Existing Calendar Button

The `AddToCalendarButton` component (already created) will be used in:
1. StaffEventCard (icon variant) - Quick add from list
2. StaffEventDetails header (full variant) - Primary action
3. Per-staff assignment in details (icon variant) - Individual schedules

---

## Security Considerations

- Reuses existing admin authentication via `ProtectedRoute`
- No new database permissions required (RLS already in place for `is_admin()`)
- Financial data excluded at query level (not just hidden in UI)
- Customer contact info (email, phone) excluded for staff privacy

---

## Implementation Order

1. Create `useStaffEvents` hook (data layer)
2. Create `StaffEventCard` component
3. Create `StaffEventDetails` component  
4. Create `StaffSchedule` page
5. Add `/staff` route to App.tsx
6. Update MobileAdminNav with Staff tab

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/hooks/useStaffEvents.ts` | **Create** - Data hook excluding pricing |
| `src/components/staff/StaffEventCard.tsx` | **Create** - Mobile card with countdown |
| `src/components/staff/StaffEventDetails.tsx` | **Create** - Expanded view with collapsibles |
| `src/pages/StaffSchedule.tsx` | **Create** - Responsive page container |
| `src/App.tsx` | **Modify** - Add `/staff` protected route |
| `src/components/admin/mobile/MobileAdminNav.tsx` | **Modify** - Add Staff tab |

