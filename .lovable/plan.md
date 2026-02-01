
# Staff View: Mobile-First Responsive Event Dashboard

## Overview

Create a dedicated **Staff View** page for team members to see all upcoming events with full operational details (excluding pricing) and staff assignments. This is a read-only view optimized for mobile access in the field.

## Key Design Decisions

### 1. Access Model: Staff Role (No Admin Required)

The current system only has `admin` role. For a true staff view, we have two options:

| Option | Pros | Cons |
|--------|------|------|
| **A) New "staff" role** | Proper access control, separate permissions | Requires database migration, new RLS policies |
| **B) Public view with event token** | Simple, no auth required | Less secure, anyone with link can view |
| **C) Use admin auth (recommended for now)** | Works immediately, leverages existing system | Staff needs admin credentials |

**Recommendation:** Start with Option C (reuse admin auth) since staff are internal team members. This avoids database changes and can be enhanced later with a dedicated staff role.

### 2. Information Architecture

**What Staff Need to See:**
- Event date, time, location (with maps link)
- Event name and type (wedding/military/corporate)
- Guest count and service type
- Menu selections (proteins, sides, appetizers, desserts, drinks)
- Special requests and dietary restrictions
- Equipment/supplies needed (plates, chafers, ice, etc.)
- Service add-ons (wait staff, bussing, cocktail hour)
- Staff assignments with roles, arrival times, and confirmation status
- Days until event countdown

**What to Hide:**
- All pricing/financial data
- Invoice details and payment status
- Customer contact info (email, phone) - optional, can be shown to lead chef only
- Change history and audit logs

### 3. Mobile-First Layout

```
┌─────────────────────────────────┐
│ ☰  Staff Schedule        🔔    │  ← Sticky header
├─────────────────────────────────┤
│ [Today] [This Week] [All]      │  ← Filter tabs
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ⏰ IN 2 DAYS                │ │  ← Countdown badge
│ │ ═══════════════════════════ │ │
│ │ Military Ball               │ │  ← Event name
│ │ 📅 Sat, Feb 14 · 6:00 PM   │ │
│ │ 📍 King's Grant Clubhouse  │ │  ← Tappable for maps
│ │ 👥 150 guests · Full Svc   │ │
│ │                             │ │
│ │ 👨‍🍳 Staff (0/4 confirmed)    │ │  ← Expandable
│ │ ▸ View Details              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⏰ IN 4 DAYS                │ │
│ │ ═══════════════════════════ │ │
│ │ Ward Dinner                 │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 4. Event Detail View (Expandable Card or Modal)

When tapping an event card, show full details in an expandable section or bottom sheet:

```
┌─────────────────────────────────┐
│ ← Back    Military Ball    📋  │  ← Copy summary
├─────────────────────────────────┤
│                                 │
│ 📅 EVENT                        │
│ Saturday, February 14, 2026    │
│ 6:00 PM · Full Service         │
│                                 │
│ 📍 LOCATION                     │
│ King's Grant Clubhouse         │
│ Summerville, SC                │
│ [Open in Maps]                 │
│                                 │
│ 👥 GUESTS                       │
│ 150 people                     │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🍗 MENU                         │
│ ▾ Proteins                     │
│   • Baked Chicken              │
│   • Pulled Pork                │
│ ▾ Sides                        │
│   • Mac & Cheese               │
│   • Green Beans & Potatoes     │
│ ▾ Appetizers                   │
│   • Fruit Platter              │
│   • Deviled Eggs               │
│ ▾ Desserts                     │
│   • Cupcakes (75)              │
│   • Dessert Shooters (75)      │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 📝 SPECIAL REQUESTS             │
│ Buffet setup, sweet tea        │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🛠️ EQUIPMENT NEEDED             │
│ • Plates                       │
│ • Chafers                      │
│ • Serving Utensils             │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 👨‍🍳 STAFF ASSIGNMENTS            │
│ ┌─────────────────────────────┐ │
│ │ ☐ John Smith                │ │
│ │   Lead Chef · Arrive 4:00PM │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ☑ Sarah Jones               │ │
│ │   Server · Arrive 5:00PM    │ │
│ └─────────────────────────────┘ │
│ [+ No staff assigned yet]      │
│                                 │
└─────────────────────────────────┘
```

---

## Technical Implementation

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/StaffSchedule.tsx` | Main staff schedule page |
| `src/components/staff/StaffEventCard.tsx` | Event card component (mobile-optimized) |
| `src/components/staff/StaffEventDetails.tsx` | Expanded event details view |
| `src/components/staff/StaffHeader.tsx` | Minimal sticky header |
| `src/hooks/useStaffEvents.ts` | Data fetching hook (excludes pricing) |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/staff` route (protected) |
| `src/components/admin/mobile/MobileAdminNav.tsx` | Add "Staff" nav item |

### Route Structure

```
/staff                → Staff schedule (list of upcoming events)
/staff/event/:id      → Event detail view (optional, could use modal instead)
```

### Data Hook: `useStaffEvents`

Create a lean query that excludes pricing data:

```typescript
// src/hooks/useStaffEvents.ts
export function useStaffEvents(filter: 'today' | 'week' | 'all' = 'all') {
  return useQuery({
    queryKey: ['staff-events', filter],
    queryFn: async () => {
      const today = formatDateToLocalString(new Date());
      const weekEnd = formatDateToLocalString(addDays(new Date(), 7));
      
      let query = supabase
        .from('quote_requests')
        .select(`
          id,
          event_name,
          event_date,
          start_time,
          serving_start_time,
          location,
          guest_count,
          guest_count_with_restrictions,
          service_type,
          event_type,
          workflow_status,
          contact_name,
          military_organization,
          proteins,
          vegetarian_entrees,
          sides,
          appetizers,
          desserts,
          drinks,
          extras,
          dietary_restrictions,
          special_requests,
          custom_menu_requests,
          plates_requested,
          cups_requested,
          napkins_requested,
          serving_utensils_requested,
          ice_requested,
          chafers_requested,
          wait_staff_requested,
          bussing_tables_needed,
          ceremony_included,
          cocktail_hour,
          both_proteins_available,
          theme_colors,
          serving_setup_area,
          wait_staff_setup_areas,
          wait_staff_requirements,
          staff_assignments (
            id, staff_name, role, arrival_time, notes, confirmed
          )
        `)
        .gte('event_date', today)
        .not('workflow_status', 'in', '("pending","under_review","cancelled")')
        .order('event_date', { ascending: true });

      if (filter === 'today') {
        query = query.eq('event_date', today);
      } else if (filter === 'week') {
        query = query.lte('event_date', weekEnd);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
```

### Mobile-First CSS Patterns

Following existing patterns from the codebase:

```typescript
// Card with touch-friendly targets
<div className="p-4 border rounded-xl bg-card active:bg-muted/50 transition-colors">

// Sticky header with safe area
<header className="sticky top-0 z-50 bg-background/95 backdrop-blur pt-[env(safe-area-inset-top)]">

// Bottom padding for mobile nav
<main className="pb-20 lg:pb-[env(safe-area-inset-bottom)]">

// Touch-friendly button sizing (44px minimum)
<Button className="h-11 min-w-[44px]">

// Responsive text truncation
<p className="truncate text-sm">
```

### Staff Event Card Component

```typescript
// src/components/staff/StaffEventCard.tsx
interface StaffEventCardProps {
  event: StaffEvent;
  onSelect: (id: string) => void;
}

export function StaffEventCard({ event, onSelect }: StaffEventCardProps) {
  const daysUntil = /* calculate */;
  const staffCount = event.staff_assignments?.length || 0;
  const confirmedCount = event.staff_assignments?.filter(s => s.confirmed).length || 0;
  
  return (
    <div 
      className="p-4 border rounded-xl bg-card active:bg-muted/50 transition-all"
      onClick={() => onSelect(event.id)}
    >
      {/* Countdown badge */}
      <Badge className={daysUntil <= 2 ? 'bg-red-500' : 'bg-blue-500'}>
        {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `IN ${daysUntil} DAYS`}
      </Badge>
      
      {/* Event info */}
      <h3 className="font-semibold text-lg mt-2">{event.event_name}</h3>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <Calendar className="h-4 w-4" />
        {formatDate(event.event_date)} · {formatTime(event.start_time)}
      </div>
      
      <a 
        href={formatLocationLink(event.location)}
        className="flex items-center gap-2 text-sm text-primary mt-1"
        onClick={e => e.stopPropagation()}
      >
        <MapPin className="h-4 w-4" />
        {event.location}
      </a>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {event.guest_count} guests
        </span>
        <span>{formatServiceType(event.service_type)}</span>
      </div>
      
      {/* Staff summary */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span className="text-sm">
          <Users className="h-4 w-4 inline mr-1" />
          {staffCount} staff ({confirmedCount} confirmed)
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
```

### Desktop Enhancement (Tablet/Desktop)

On larger screens, show a two-column layout:

```
┌────────────────────────────────────────────────────────┐
│ Staff Schedule                                    🔔   │
├────────────────────┬───────────────────────────────────┤
│ [Today] [Week]     │                                   │
│ ─────────────────  │  Selected Event Details           │
│ ┌───────────────┐  │  ─────────────────────────────    │
│ │ Military Ball │  │  📅 Saturday, Feb 14, 2026       │
│ │ Feb 14 · 6PM  │◀─┼─ 👥 150 guests                    │
│ │ 150 guests    │  │  📍 King's Grant Clubhouse       │
│ └───────────────┘  │                                   │
│ ┌───────────────┐  │  🍗 MENU                          │
│ │ Ward Dinner   │  │  • Baked Chicken                 │
│ │ Feb 16 · 2PM  │  │  • Pulled Pork                   │
│ │ 20 guests     │  │  • Mac & Cheese                  │
│ └───────────────┘  │  ...                              │
│                    │                                   │
│                    │  👨‍🍳 STAFF                          │
│                    │  ┌─────────────────────────────┐  │
│                    │  │ John Smith - Lead Chef      │  │
│                    │  │ Sarah Jones - Server ✓      │  │
│                    │  └─────────────────────────────┘  │
└────────────────────┴───────────────────────────────────┘
```

Use `ResizablePanelGroup` (already in the codebase) for this layout.

---

## Summary

| Aspect | Approach |
|--------|----------|
| **Auth** | Reuse existing admin auth (can add staff role later) |
| **Data** | New `useStaffEvents` hook excluding pricing |
| **Layout** | Mobile-first cards → Desktop split-panel |
| **Navigation** | Add to existing mobile admin nav |
| **Patterns** | Follow existing touch-friendly, safe-area patterns |

### Files to Create
1. `src/pages/StaffSchedule.tsx`
2. `src/components/staff/StaffEventCard.tsx`
3. `src/components/staff/StaffEventDetails.tsx`
4. `src/components/staff/StaffHeader.tsx`
5. `src/hooks/useStaffEvents.ts`

### Files to Modify
1. `src/App.tsx` - Add route
2. `src/components/admin/mobile/MobileAdminNav.tsx` - Add nav item
