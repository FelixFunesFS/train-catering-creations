

# Fix iCal Line Breaks & Improve Visual Formatting (Updated)

## Overview

Fix the double-escaping bug causing literal `\n` text in iOS Calendar notes, improve visual formatting with section headers, and address link length concerns.

---

## Research Findings

### HTML Formatting Support

| Calendar App | HTML in DESCRIPTION | X-ALT-DESC HTML | Links Auto-Detected |
|--------------|---------------------|-----------------|---------------------|
| iOS Calendar | No | No | Yes (tappable) |
| Google Calendar | No | No | Yes (tappable) |
| Microsoft Outlook | No | Yes (works) | Yes |
| Apple Calendar (macOS) | No | No | Yes |

**Conclusion:** HTML formatting is NOT supported in the standard DESCRIPTION field. Only Outlook supports the `X-ALT-DESC` extension. Plain text with proper line breaks is the universal solution.

### Link Shortening Options

| Option | Pros | Cons |
|--------|------|------|
| Custom short domain (e.g., `ste.link/abc`) | Branded, clean | Requires setup, hosting, maintenance |
| Bitly/TinyURL | Quick to implement | Third-party dependency, may look suspicious |
| Remove URL encoding | Slightly shorter | Still long for addresses |
| Label-only approach | Cleanest look | Users must know the URL |
| Keep full URLs | Works everywhere, transparent | Long in notes view |

**Recommendation:** Keep full URLs because:
1. iOS/Google Calendar auto-detect and make them tappable regardless of length
2. Staff can see exactly where they're going (trust)
3. No third-party dependencies
4. The Google Maps URL is unavoidably long due to address encoding

---

## Root Cause of Current Bug

Line 331 in `calendarExport.ts`:
```typescript
// WRONG: Using literal backslash-n creates text "\n"
`DESCRIPTION:${escapeICS(descriptionParts.join('\\n'))}`,
```

The `escapeICS` function expects real newlines (`\n`) to convert to `\\n` for ICS format. When we pass `'\\n'` (literal text), it stays as literal text.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/calendarExport.ts` | Fix join character, add visual sections |
| `supabase/functions/staff-calendar-feed/index.ts` | Fix join character, add visual sections |

---

## Implementation Details

### 1. Fix Line Break Join Character

**src/utils/calendarExport.ts (line 331)**

Before:
```typescript
`DESCRIPTION:${escapeICS(descriptionParts.join('\\n'))}`,
```

After:
```typescript
`DESCRIPTION:${escapeICS(descriptionParts.join('\n'))}`,
```

**supabase/functions/staff-calendar-feed/index.ts (line 193)**

Before:
```typescript
const description = escapeICSText(descParts.join('\\n'));
```

After:
```typescript
const description = escapeICSText(descParts.join('\n'));
```

---

### 2. Add Visual Section Headers

Update the description builder to use ASCII separators for better readability:

```typescript
const descriptionParts: string[] = [
  // Links at top - kept full for tap-ability
  mapsUrl ? `Maps: ${mapsUrl}` : '',
  `Staff View: ${SITE_URL}/staff`,
  '',
  
  // Staff Assigned section
  staffAssignments.length > 0 
    ? `Staff Assigned: ${staffAssignments.map(s => `${s.name} (${s.role})`).join(', ')}`
    : '',
  '',
  
  // Event Details with separator
  '--------',
  'EVENT DETAILS',
  '--------',
  eventStartTime ? `Event starts: ${formatTimeDisplay(eventStartTime)}` : '',
  guestCount ? `Guests: ${guestCount}` : '',
  serviceType ? `Service: ${formatServiceType(serviceType)}` : '',
  eventType ? `Type: ${formatEventType(eventType)}` : '',
  '',
  
  // Equipment & Services section (conditional)
  ...(equipmentList.length > 0 || servicesList.length > 0 ? [
    '--------',
    'EQUIPMENT & SERVICES',
    '--------',
    equipmentList.length > 0 ? `Equipment: ${equipmentList.join(', ')}` : '',
    servicesList.length > 0 ? `Services: ${servicesList.join(', ')}` : '',
    ''
  ] : []),
  
  // Menu section (conditional)
  ...(hasMenuItems ? [
    '--------',
    'MENU',
    '--------',
    proteins.length > 0 ? `Proteins: ${proteins.map(formatMenuId).join(', ')}` : '',
    sides.length > 0 ? `Sides: ${sides.map(formatMenuId).join(', ')}` : '',
    appetizers.length > 0 ? `Appetizers: ${appetizers.map(formatMenuId).join(', ')}` : '',
    desserts.length > 0 ? `Desserts: ${desserts.map(formatMenuId).join(', ')}` : '',
    drinks.length > 0 ? `Drinks: ${drinks.map(formatMenuId).join(', ')}` : '',
    vegetarianOptions.length > 0 ? `Vegetarian: ${vegetarianOptions.map(formatMenuId).join(', ')}` : '',
    ''
  ] : []),
  
  // Special Notes section (conditional)
  ...(dietaryRestrictions.length > 0 || specialRequests || notes ? [
    '--------',
    'SPECIAL NOTES',
    '--------',
    dietaryRestrictions.length > 0 
      ? `DIETARY: ${dietaryRestrictions.map(formatMenuId).join(', ')}`
      : '',
    specialRequests ? `Special Requests: ${specialRequests}` : '',
    notes ? `Notes: ${notes}` : '',
    ''
  ] : []),
  
  // Contact footer
  `Contact: Soul Train's Eatery`,
  `(843) 970-0265 | soultrainseatery@gmail.com`
].filter(Boolean);

// Use REAL newlines, escapeICS will convert them to \\n for ICS format
`DESCRIPTION:${escapeICS(descriptionParts.join('\n'))}`,
```

---

## Expected Result After Fix

### iOS Calendar Notes View
```text
Maps: https://maps.google.com/?q=King%27s%20Grant%20Clubhouse%2C%20Summerville%2C%20SC

Staff View: https://www.soultrainseatery.com/staff

Staff Assigned: John Smith (Lead Chef), Jane Doe (Server)

--------
EVENT DETAILS
--------
Event starts: 6:00 PM
Guests: 150
Service: Full Service
Type: Military Function

--------
EQUIPMENT & SERVICES
--------
Equipment: Chafers, Plates, Cups, Napkins, Serving Utensils, Ice

--------
MENU
--------
Proteins: Baked Chicken, Pulled Pork
Sides: Mac & Cheese, Green Beans & Potatoes
Appetizers: Fruit Platter, Chocolate Covered Fruit, Deviled Eggs
Desserts: Cupcakes, Dessert Shooters
Drinks: Iced Tea

--------
SPECIAL NOTES
--------
Special Requests: Buffet setup/sweet tea/dessert: 75 assorted cupcakes

Contact: Soul Train's Eatery
(843) 970-0265 | soultrainseatery@gmail.com
```

---

## Why Keep Full URLs

1. **Auto-Tappable:** iOS and Google Calendar automatically detect URLs and make them tappable buttons
2. **Transparency:** Staff see exactly where they're going (builds trust)
3. **No Dependencies:** No third-party URL shortener needed
4. **Google Maps Requirement:** Address must be URL-encoded regardless of shortener

---

## iOS vs Android/Google Calendar

**No difference needed.** The `.ics` format (RFC 5545) is universal:
- iOS Calendar, Apple Calendar (macOS)
- Google Calendar (Android & Web)
- Microsoft Outlook
- Samsung Calendar

The file extension `.ics` works on all platforms.

---

## Summary of Changes

| Change | File | Line | Description |
|--------|------|------|-------------|
| Fix join character | `calendarExport.ts` | 331 | Change `'\\n'` to `'\n'` |
| Fix join character | `staff-calendar-feed/index.ts` | 193 | Change `'\\n'` to `'\n'` |
| Add section headers | Both files | Description builder | Use `--------` dividers |
| Group related items | Both files | Description builder | Event Details, Equipment, Menu, Notes sections |
| Keep links at top | Both files | Description builder | Easy access to Maps and Staff View |

