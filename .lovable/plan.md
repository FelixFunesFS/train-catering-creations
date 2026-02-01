

# Mask Staff Link and Map Address in Calendar Exports

## Overview

Replace the raw URLs with human-readable labels while keeping the links functional. Instead of showing encoded URLs, display the actual address text and friendly link labels.

---

## Current vs Proposed

| Field | Current | Proposed |
|-------|---------|----------|
| Maps Link | `Maps: https://maps.google.com/?q=King%27s%20Grant%20Clubhouse%2C%20Summerville%2C%20SC` | `Address: King's Grant Clubhouse, Summerville, SC` (with Maps link below) |
| Staff Link | `Staff View: https://www.soultrainseatery.com/staff` | `Staff View: soultrainseatery.com/staff` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/calendarExport.ts` | Update description builder (lines 272-275) |
| `supabase/functions/staff-calendar-feed/index.ts` | Update description builder (lines 160-163) |

---

## Implementation Details

### 1. Show Readable Address with Separate Maps Link

Instead of the encoded URL as the address, show the actual location text:

**Before:**
```text
Maps: https://maps.google.com/?q=King%27s%20Grant%20Clubhouse%2C%20Summerville%2C%20SC
Staff View: https://www.soultrainseatery.com/staff
```

**After:**
```text
Address: King's Grant Clubhouse, Summerville, SC
Get Directions: maps.google.com/?q=...

Staff View: soultrainseatery.com/staff
```

### 2. Code Changes

**src/utils/calendarExport.ts (lines 272-276)**

```typescript
const descriptionParts: string[] = [
  // Address shown as readable text, with shorter maps link
  location ? `Address: ${location}` : '',
  mapsUrl ? `Get Directions: maps.google.com/?q=${encodeURIComponent(location || '')}` : '',
  `Staff View: soultrainseatery.com/staff`,
  '',
  // ... rest unchanged
```

**supabase/functions/staff-calendar-feed/index.ts (lines 160-164)**

```typescript
const descParts: string[] = [
  // Address shown as readable text, with shorter maps link
  event.location ? `Address: ${event.location}` : '',
  event.location ? `Get Directions: maps.google.com/?q=${encodeURIComponent(event.location)}` : '',
  `Staff View: soultrainseatery.com/staff`,
  '',
  // ... rest unchanged
```

---

## Expected Result

### iOS Calendar Notes View
```text
Address: King's Grant Clubhouse, Summerville, SC
Get Directions: maps.google.com/?q=King%27s%20Grant%20Clubhouse%2C%20Summerville%2C%20SC

Staff View: soultrainseatery.com/staff

Staff Assigned: John Smith (Lead Chef), Jane Doe (Server)

--------
EVENT DETAILS
--------
Event starts: 6:00 PM
Guests: 150
Service: Full Service
Type: Military Function

...
```

---

## Benefits

1. **Human-Readable Address** - Staff immediately see the venue name without decoding URLs
2. **Cleaner Staff Link** - Removed `https://www.` prefix for a shorter, cleaner look
3. **Links Still Work** - iOS and Google Calendar auto-detect both URLs and make them tappable
4. **Labeled Clearly** - "Address" for the venue, "Get Directions" for the maps link

---

## Summary of Changes

| Change | Both Files | Description |
|--------|------------|-------------|
| Add Address line | Line ~272-273 | Show `Address: {location}` as plain text |
| Shorten Maps link | Line ~274 | Show `Get Directions: maps.google.com/?q=...` |
| Shorten Staff link | Line ~275 | Show `Staff View: soultrainseatery.com/staff` |

