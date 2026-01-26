
# Add Event Type Display to Customer Emails and PDFs

## Overview

This plan adds the event type (Birthday, Corporate, Wedding, Graduation, etc.) to customer-facing emails and PDF documents so customers can clearly see their event category.

---

## Current State

| Information | Customer Emails | PDF |
|-------------|:---------------:|:---:|
| Event Name | ✓ | ✓ |
| **Event Type** | ❌ | ❌ |
| Military Badge | ✓ | ✓ |
| Service Type | ✓ | ✓ |

---

## Part 1: Add formatEventType to Email Templates

### supabase/functions/_shared/emailTemplates.ts

**Add formatEventType function (after formatServiceType, around line 83):**

```typescript
export const formatEventType = (eventType: string | null): string => {
  if (!eventType) return 'Event';
  
  const eventTypeMap: Record<string, string> = {
    'wedding': 'Wedding',
    'birthday': 'Birthday',
    'corporate': 'Corporate Event',
    'graduation': 'Graduation',
    'anniversary': 'Anniversary',
    'baby_shower': 'Baby Shower',
    'bridal_shower': 'Bridal Shower',
    'retirement': 'Retirement',
    'holiday_party': 'Holiday Party',
    'bereavement': 'Bereavement',
    'private_party': 'Private Party',
    'black_tie': 'Black Tie',
    'military_function': 'Military Function',
    'other': 'Other Event'
  };
  
  return eventTypeMap[eventType.toLowerCase()] || 
         eventType.replace(/_/g, ' ').split(' ')
           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
           .join(' ');
};
```

---

## Part 2: Update generateEventDetailsCard in Emails

### supabase/functions/_shared/emailTemplates.ts

**In the generateEventDetailsCard function (lines 191-236):**

Add event type display below the event name/military badge, before the date/time table:

```typescript
// After the event name h3 (around line 198), add:
<p style="margin:4px 0 12px 0;font-size:13px;color:#666;">
  <span style="display:inline-block;background:#f3f4f6;color:#374151;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:500;">
    ${formatEventType(quote.event_type)}
  </span>
</p>
```

**Updated Event Details Card Structure:**
```
Event Name [Military Badge if applicable]
[Event Type Badge] ← NEW
📅 Date    ⏰ Time
📍 Location    👥 Guests
🍽️ Service Type
```

---

## Part 3: Add formatEventType to PDF Generation

### supabase/functions/generate-invoice-pdf/index.ts

**Add formatEventType function (after formatMilestoneType, around line 171):**

```typescript
// Format event type
const formatEventType = (type: string | null): string => {
  if (!type) return 'Event';
  const types: Record<string, string> = {
    'wedding': 'Wedding',
    'birthday': 'Birthday',
    'corporate': 'Corporate Event',
    'graduation': 'Graduation',
    'anniversary': 'Anniversary',
    'baby_shower': 'Baby Shower',
    'bridal_shower': 'Bridal Shower',
    'retirement': 'Retirement',
    'holiday_party': 'Holiday Party',
    'bereavement': 'Bereavement',
    'private_party': 'Private Party',
    'black_tie': 'Black Tie',
    'military_function': 'Military Function',
    'other': 'Other Event'
  };
  return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
```

---

## Part 4: Update PDF Event Details Section

### supabase/functions/generate-invoice-pdf/index.ts

**In the Event column section (lines 338-364):**

Add event type display after the event name, before date/time:

```typescript
// After drawing event name (line 342), add:
drawText(formatEventType(quote?.event_type), col2X, eventY, { size: 9, color: MEDIUM_GRAY });
eventY -= 10;
```

**Updated PDF Event Details Layout:**
```
EVENT DETAILS
Event Name (bold)
Corporate Event ← NEW (gray text)
Mon, Jan 27, 2026 at 2:00 PM ET
Location
50 Guests | Full Service
Military Org: [if applicable]
```

---

## Visual Examples

### Email Event Details Card:
```
┌─────────────────────────────────────────────────────────┐
│  Johnson Retirement Party  [🎖️ Military]               │
│  ┌──────────────────┐                                   │
│  │ Retirement Party │  ← Event Type Badge (gray bg)     │
│  └──────────────────┘                                   │
│                                                         │
│  📅 Jan 27, 2026        ⏰ 2:00 PM                      │
│  📍 Charleston, SC      👥 75 guests                   │
│  🍽️ Full-Service Catering                              │
└─────────────────────────────────────────────────────────┘
```

### PDF Event Details Column:
```
EVENT DETAILS
Johnson Retirement Party
Retirement Party            ← Event Type (gray)
Mon, Jan 27, 2026 at 2:00 PM ET
Charleston, SC
75 Guests | Full Service
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `_shared/emailTemplates.ts` | Add `formatEventType()` function |
| `_shared/emailTemplates.ts` | Add event type badge in `generateEventDetailsCard()` |
| `generate-invoice-pdf/index.ts` | Add `formatEventType()` function |
| `generate-invoice-pdf/index.ts` | Add event type line in PDF event column |

---

## Edge Functions to Deploy

1. `send-customer-portal-email` (uses shared emailTemplates.ts)
2. `send-quote-confirmation` (uses shared emailTemplates.ts)
3. `generate-invoice-pdf`

---

## Technical Notes

- Event type is displayed in a subtle gray style to not compete with the event name
- Military events will show both the event type badge AND the military badge
- The formatEventType function handles all event types from the form schema
- Fallback formatting converts snake_case to Title Case for unknown types
