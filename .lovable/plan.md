

# Live Calendar Integration Options

## The Problem with Static Downloads

The current `.ics` download approach creates a **snapshot** that:
- Does NOT update when events change
- Does NOT reflect cancellations
- Does NOT include newly approved events
- Requires manual re-download to stay current

---

## Live Calendar Integration Approaches

| Approach | Auto-Updates | Complexity | User Action |
|----------|--------------|------------|-------------|
| **Static .ics download** | No | Low | Re-download manually |
| **Subscribable Calendar Feed (webcal://)** | Yes | Medium | Subscribe once |
| **Google Calendar API** | Yes | High | OAuth + permissions |
| **CalDAV Server** | Yes (two-way) | Very High | Full server setup |

---

## Recommended: Subscribable Calendar Feed

### How It Works

1. Create an Edge Function that generates `.ics` content dynamically
2. User subscribes to a URL like: `webcal://your-domain/functions/v1/staff-calendar-feed`
3. Calendar apps (Google, Apple, Outlook) automatically refresh the feed periodically (typically every 1-12 hours)
4. Changes, cancellations, and new events appear on next refresh

### Key Benefits

- Works with ALL major calendar apps
- No OAuth or API integration needed
- Staff subscribes once, stays synced forever
- Events auto-update (name changes, time changes, cancellations)
- New approved events appear automatically

### Technical Implementation

**New Edge Function: `staff-calendar-feed`**

```text
GET /functions/v1/staff-calendar-feed?token=<staff_token>

Returns:
Content-Type: text/calendar
Content-Disposition: inline; filename="soul_trains_schedule.ics"
X-WR-CALNAME: Soul Train's Eatery - Staff Schedule

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Soul Train's Eatery//Staff Schedule//EN
REFRESH-INTERVAL;VALUE=DURATION:PT4H  (tells apps to refresh every 4 hours)
X-PUBLISHED-TTL:PT4H
BEGIN:VEVENT
... (all approved/confirmed events)
END:VEVENT
BEGIN:VEVENT
... (next event)
END:VEVENT
END:VCALENDAR
```

### Security Options

| Option | How It Works |
|--------|--------------|
| **Shared staff token** | Single URL for all staff (simple) |
| **Per-user tokens** | Each staff member gets unique URL |
| **JWT-based** | Authenticated feed requiring login |

For a catering team, a shared staff token is often sufficient.

---

## User Experience

### Subscription Flow

1. Staff taps "Subscribe to Calendar" button
2. Opens calendar app with subscription URL
3. Calendar app asks to confirm subscription
4. Done - events sync automatically

### Platform-Specific URLs

| Platform | URL Format |
|----------|------------|
| **iOS/macOS** | `webcal://...` (native support) |
| **Google Calendar** | `https://...` (add via "From URL") |
| **Outlook** | `webcal://...` (native support) |

---

## Implementation Plan

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/staff-calendar-feed/index.ts` | Edge function that queries approved events and returns live `.ics` |

### Files to Modify

| File | Purpose |
|------|---------|
| `supabase/config.toml` | Register the new edge function |
| `src/pages/StaffSchedule.tsx` | Add "Subscribe to Calendar" button with `webcal://` link |
| `src/utils/calendarExport.ts` | Keep for single-event downloads (backup option) |

### Edge Function Logic

```text
1. Verify token (or skip for authenticated users)
2. Query quote_requests WHERE workflow_status IN ('confirmed', 'approved', 'quoted', 'estimated')
   AND event_date >= today
3. For each event:
   - Use event.id as UID (stable, survives updates)
   - Include SEQUENCE number (version field) so updates are recognized
   - Set STATUS:CANCELLED for cancelled events (removes from calendar)
4. Return .ics with proper headers
```

### Key ICS Fields for Live Sync

| Field | Purpose |
|-------|---------|
| `UID` | Stable identifier (use event.id) - MUST stay same for updates |
| `SEQUENCE` | Version number - increment on each change |
| `DTSTAMP` | When feed was generated |
| `REFRESH-INTERVAL` | How often to check for updates (e.g., PT4H = 4 hours) |
| `STATUS:CANCELLED` | Marks event as cancelled (appears struck-through) |

---

## UI in Staff Schedule

**Mobile Header:**
```text
┌─────────────────────────────────────────┐
│ Calendar Staff Schedule          [+ Subscribe] │
└─────────────────────────────────────────┘
```

**Subscribe Button Behavior:**
- iOS/macOS: Opens `webcal://` URL directly
- Android: Shows instructions for Google Calendar
- Desktop: Copies URL or shows QR code

---

## Handling Cancellations

When an event is cancelled:
- **Option A**: Remove from feed entirely (event disappears)
- **Option B**: Keep in feed with `STATUS:CANCELLED` (shows struck-through)

Option B is better for staff awareness - they see the cancellation rather than wondering why an event disappeared.

---

## Summary

| Feature | Static Download | Subscribable Feed |
|---------|-----------------|-------------------|
| Auto-updates | No | Yes |
| New events appear | No | Yes |
| Cancellations sync | No | Yes |
| Time changes sync | No | Yes |
| Works offline | Yes | Yes (cached) |
| User action needed | Every time | Subscribe once |

The subscribable calendar feed is the best balance of simplicity and live functionality for a staff scheduling system.

---

## Implementation Order

1. Create `staff-calendar-feed` edge function
2. Add to `supabase/config.toml`
3. Update `StaffSchedule.tsx` with "Subscribe" button
4. Test with Google Calendar, Apple Calendar, Outlook
5. Keep single-event download as backup option

