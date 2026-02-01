

# Enhance Staff Calendar Export with Complete Event Details

## Overview

Update the calendar export to replace "Role" with "Staff Assigned" and include all event details (equipment, services, full menu, staff list) in the downloaded iCal file.

---

## Current vs Proposed

| Field | Current | Proposed |
|-------|---------|----------|
| Role | `Role: Server` | **Remove** |
| Staff | Not included | `Staff Assigned: John (Server), Jane (Chef)` |
| Menu | Only proteins + 3 sides | All categories formatted |
| Equipment | Not included | List of requested items |
| Services | Not included | Wait staff, bussing, cocktail hour |
| Dietary | Not included | Restrictions highlighted |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/calendarExport.ts` | Expand interface, update description builder |
| `src/components/staff/AddToCalendarButton.tsx` | Pass full event data including all details |

---

## Implementation Details

### 1. Update `StaffCalendarEventData` Interface

Expand to accept all event details:

```typescript
interface StaffCalendarEventData {
  eventName: string;
  eventDate: string;
  eventStartTime?: string;
  staffArrivalTime?: string;
  location?: string;
  guestCount?: number;
  serviceType?: string;
  eventType?: string;
  notes?: string;
  
  // Menu (all categories)
  proteins?: string[];
  sides?: string[];
  appetizers?: string[];
  desserts?: string[];
  drinks?: string[];
  vegetarianOptions?: string[];
  dietaryRestrictions?: string[];
  specialRequests?: string | null;
  
  // Equipment (boolean flags)
  chafersRequested?: boolean;
  platesRequested?: boolean;
  cupsRequested?: boolean;
  napkinsRequested?: boolean;
  servingUtensilsRequested?: boolean;
  iceRequested?: boolean;
  
  // Services
  waitStaffRequested?: boolean;
  bussingTablesNeeded?: boolean;
  cocktailHour?: boolean;
  
  // Staff assignments (replaces staffRole)
  staffAssignments?: Array<{
    name: string;
    role: string;
  }>;
}
```

### 2. Update Description Builder in `generateStaffICSFile`

Replace role with staff list and add all details:

```typescript
const descriptionParts = [
  // Staff Assigned (replaces Role)
  staffAssignments && staffAssignments.length > 0 
    ? `Staff Assigned: ${staffAssignments.map(s => `${s.name} (${s.role})`).join(', ')}`
    : '',
  
  eventStartTime ? `Event starts: ${formatTime(eventStartTime)}` : '',
  guestCount ? `Guests: ${guestCount}` : '',
  serviceType ? `Service: ${serviceType}` : '',
  eventType ? `Type: ${eventType}` : '',
  '',
  
  // Equipment section
  hasEquipment ? `Equipment: ${equipmentList.join(', ')}` : '',
  
  // Services section  
  hasServices ? `Services: ${servicesList.join(', ')}` : '',
  '',
  
  // Full menu by category
  proteins?.length ? `Proteins: ${proteins.map(formatMenuId).join(', ')}` : '',
  sides?.length ? `Sides: ${sides.map(formatMenuId).join(', ')}` : '',
  appetizers?.length ? `Appetizers: ${appetizers.map(formatMenuId).join(', ')}` : '',
  desserts?.length ? `Desserts: ${desserts.map(formatMenuId).join(', ')}` : '',
  drinks?.length ? `Drinks: ${drinks.map(formatMenuId).join(', ')}` : '',
  vegetarianOptions?.length ? `Vegetarian: ${vegetarianOptions.map(formatMenuId).join(', ')}` : '',
  '',
  
  // Dietary restrictions (important callout)
  dietaryRestrictions?.length 
    ? `⚠️ DIETARY: ${dietaryRestrictions.map(formatMenuId).join(', ')}`
    : '',
  
  specialRequests ? `Notes: ${specialRequests}` : '',
  '',
  
  `Contact: Soul Train's Eatery`,
  `(843) 970-0265 | soultrainseatery@gmail.com`
];
```

### 3. Update `AddToCalendarButton` to Pass Full Event Data

```typescript
const calendarData: StaffCalendarEventData = {
  eventName: event.event_name,
  eventDate: event.event_date,
  eventStartTime: event.start_time,
  staffArrivalTime: staffAssignment?.arrival_time || event.start_time,
  location: event.location,
  guestCount: event.guest_count,
  serviceType: event.service_type,
  eventType: event.event_type,
  
  // Full menu
  proteins: event.proteins,
  sides: event.sides,
  appetizers: event.appetizers,
  desserts: event.desserts,
  drinks: event.drinks,
  vegetarianOptions: event.vegetarian_entrees,
  dietaryRestrictions: event.dietary_restrictions,
  specialRequests: event.special_requests,
  
  // Equipment
  chafersRequested: event.chafers_requested,
  platesRequested: event.plates_requested,
  cupsRequested: event.cups_requested,
  napkinsRequested: event.napkins_requested,
  servingUtensilsRequested: event.serving_utensils_requested,
  iceRequested: event.ice_requested,
  
  // Services
  waitStaffRequested: event.wait_staff_requested,
  bussingTablesNeeded: event.bussing_tables_needed,
  cocktailHour: event.cocktail_hour,
  
  // Staff list (replaces single role)
  staffAssignments: event.staff_assignments?.map(s => ({
    name: s.staff_name,
    role: s.role
  })),
  
  notes: staffAssignment?.notes || undefined
};
```

### 4. Update `StaffEvent` Interface in AddToCalendarButton

Expand the local interface to accept all event fields (or import from useStaffEvents).

---

## Visual Comparison

### Before (Current iCal Description)
```text
Role: Server
Event starts: 14:00
Guests: 150 (Full Service)

Menu Highlights:
- fried-chicken
- mac-cheese
- green-beans

Contact: Soul Train's Eatery
(843) 970-0265 | soultrainseatery@gmail.com
```

### After (Enhanced iCal Description)
```text
Staff Assigned: John Smith (Lead Chef), Jane Doe (Server), Mike Johnson (Setup)

Event starts: 2:00 PM
Guests: 150
Service: Full Service
Type: Wedding

Equipment: Chafers, Plates, Serving Utensils

Services: Wait Staff, Bussing Tables, Cocktail Hour

Proteins: Fried Chicken, Turkey Wings
Sides: Mac & Cheese, Green Beans & Potatoes, Collard Greens
Appetizers: Tomato Caprese, Bruschetta
Desserts: Peach Cobbler
Drinks: Fresh Lemonade, Sweet Tea

⚠️ DIETARY: Gluten-Free, Dairy-Free

Notes: Bride is vegetarian, separate table needed

Contact: Soul Train's Eatery
(843) 970-0265 | soultrainseatery@gmail.com
```

---

## Summary of Changes

| Change | File | Description |
|--------|------|-------------|
| Expand interface | `calendarExport.ts` | Add all menu, equipment, service, and staff fields |
| Remove `staffRole` | `calendarExport.ts` | Replace with `staffAssignments` array |
| Add menu formatter | `calendarExport.ts` | Convert IDs to readable text |
| Build equipment list | `calendarExport.ts` | Collect true flags into comma-separated list |
| Build services list | `calendarExport.ts` | Collect true service flags |
| Format staff list | `calendarExport.ts` | Show all assigned staff with roles |
| Expand interface | `AddToCalendarButton.tsx` | Accept full StaffEvent fields |
| Pass all data | `AddToCalendarButton.tsx` | Map event properties to calendar data |

---

## Notes

- **Staff Assigned** replaces single "Role" - shows all team members
- **Equipment/Services** only shown if at least one item is requested
- **Menu items** use `convertMenuIdToReadableText` pattern for consistent formatting
- **Dietary restrictions** get a warning emoji for visibility
- **Special requests** included at the end as notes

