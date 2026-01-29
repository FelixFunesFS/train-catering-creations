

# Real-Time Visitor Push Notifications for Admin PWA

## Overview

This feature allows admin users who have installed the PWA to receive real-time push notifications on their phones when customers visit the website. The notifications will include available visitor information such as location (via IP geolocation), referrer, device type, and any known customer identity (email) if they're logged in.

---

## Current State Analysis

### What Already Exists:
1. **PWA Infrastructure** (`vite.config.ts`): Service worker with Workbox, manifest, caching strategies
2. **Basic Browser Notifications** (`src/hooks/useQuoteNotifications.ts`): Uses `Notification` API for browser-only alerts when new quotes arrive
3. **Analytics Table** (`analytics_events`): Already has columns for `user_agent`, `ip_address`, `referrer`, `session_id`, and `metadata`
4. **Admin Notification Edge Function** (`send-admin-notification`): Sends email notifications to admin

### What's Missing:
- Web Push subscription management (VAPID keys, push endpoints)
- Push subscriptions database table
- Service worker push event handler
- Visitor tracking hook on frontend
- Admin settings to enable/disable visitor alerts
- Edge function to send push notifications

---

## Architecture

```
[Visitor arrives] → [Frontend tracks visit] → [Edge Function logs + sends push]
                                                       ↓
                                            [Admin's phone receives push]
```

### Components to Build:

| Component | Type | Purpose |
|-----------|------|---------|
| `push_subscriptions` | DB Table | Store admin push endpoint subscriptions |
| `admin_notification_preferences` | DB Table | Store who wants which notifications |
| `track-visitor` | Edge Function | Log visit + trigger push to admins |
| `send-push-notification` | Edge Function | Send Web Push to subscribed devices |
| `usePushSubscription` | React Hook | Subscribe/unsubscribe from push |
| `useVisitorTracking` | React Hook | Track visitor on page load |
| Service Worker | Updated | Handle push events |
| Admin Settings Panel | UI Component | Toggle visitor notification preferences |

---

## Database Schema

### Table 1: `push_subscriptions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References auth.users |
| `endpoint` | text | Push service endpoint URL |
| `p256dh` | text | Browser's public key |
| `auth` | text | Auth secret |
| `device_name` | text | Optional device identifier |
| `created_at` | timestamptz | When subscribed |
| `last_used_at` | timestamptz | Last successful push |

### Table 2: `admin_notification_preferences`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References auth.users |
| `visitor_alerts` | boolean | Receive visitor notifications |
| `quote_alerts` | boolean | Receive quote notifications |
| `payment_alerts` | boolean | Receive payment notifications |
| `quiet_hours_start` | time | Don't disturb start (optional) |
| `quiet_hours_end` | time | Don't disturb end (optional) |

---

## Required Secrets (VAPID Keys)

You'll need to generate VAPID keys and store them as Supabase secrets:

| Secret Name | Description |
|-------------|-------------|
| `VAPID_PUBLIC_KEY` | Public key for client-side subscription |
| `VAPID_PRIVATE_KEY` | Private key for server-side push sending |
| `VAPID_SUBJECT` | Contact email (`mailto:soultrainseatery@gmail.com`) |

These can be generated using `npx web-push generate-vapid-keys` or an online generator.

---

## Edge Function: `track-visitor`

This function will:
1. Log the visit to `analytics_events`
2. Extract visitor info (IP → geolocation, user agent → device type)
3. Check if any admin wants visitor alerts
4. Send push notifications to subscribed admin devices

**Visitor Information Available:**
- IP address (can be geocoded to city/state via free services like ip-api.com)
- User agent (parsed to device type, browser, OS)
- Referrer (where they came from)
- Session ID (track unique vs returning visitors)
- Logged-in email (if authenticated)

---

## Edge Function: `send-push-notification`

Uses the Web Push protocol (RFC 8030) to send notifications:

```typescript
// Pseudocode
import webPush from 'web-push';

webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

await webPush.sendNotification(subscription, JSON.stringify({
  title: '👀 New Visitor',
  body: 'Someone from Charleston, SC is browsing your menu',
  icon: '/icon-192.png',
  data: { url: '/admin' }
}));
```

---

## Frontend Components

### 1. Visitor Tracking Hook (`useVisitorTracking`)

Placed in `App.tsx` - runs on initial page load for non-admin routes:

```typescript
useEffect(() => {
  // Don't track admin visits
  if (isAdminRoute) return;
  
  supabase.functions.invoke('track-visitor', {
    body: {
      path: location.pathname,
      referrer: document.referrer,
      sessionId: getOrCreateSessionId()
    }
  });
}, []);
```

### 2. Push Subscription Hook (`usePushSubscription`)

Manages the push subscription lifecycle:

```typescript
const { 
  isSubscribed, 
  subscribe, 
  unsubscribe 
} = usePushSubscription();
```

### 3. Admin Settings Panel

New section in admin settings:

- Toggle: "Receive visitor alerts on this device"
- Toggle: "Receive quote request alerts"
- Toggle: "Receive payment alerts"
- Quiet hours time pickers

---

## Service Worker Updates

Add push event handler to the service worker:

```typescript
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Soul Train\'s Eatery', {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data,
      requireInteraction: false,
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
```

---

## Visitor Information Extraction

### What We Can Capture:

| Data Point | Source | Notes |
|------------|--------|-------|
| Location (City/State) | IP geolocation API | Free services: ip-api.com, ipapi.co |
| Device Type | User-Agent parsing | Mobile/Desktop/Tablet |
| Browser | User-Agent parsing | Chrome, Safari, Firefox, etc. |
| Operating System | User-Agent parsing | iOS, Android, Windows, Mac |
| Referrer | Document referrer | Google, Facebook, direct, etc. |
| Page Visited | URL path | /menu, /request-quote, etc. |
| Customer Email | Auth session | Only if logged in |
| Session Duration | Frontend tracking | Optional enhancement |

### Privacy Considerations:
- IP geolocation is approximate (city-level)
- No personal data collected unless user is logged in
- Compliant with standard analytics practices

---

## Push Notification Examples

**New Visitor:**
```
👀 New Visitor
Someone from Charleston, SC is viewing your menu
[Tap to view dashboard]
```

**Returning Visitor:**
```
🔄 Returning Visitor  
A previous visitor is back on the Request Quote page
[Tap to view]
```

**Known Customer:**
```
👋 Customer Online
john.doe@email.com is viewing their estimate
[Tap to view]
```

---

## Implementation Order

1. **Database Setup**
   - Create `push_subscriptions` table
   - Create `admin_notification_preferences` table
   - Add RLS policies (admin-only access)

2. **VAPID Key Setup**
   - Generate VAPID keys
   - Store as Supabase secrets

3. **Edge Functions**
   - Create `send-push-notification` function
   - Create `track-visitor` function

4. **Service Worker**
   - Add push event handlers
   - Add notification click handler

5. **Frontend Hooks**
   - Create `usePushSubscription` hook
   - Create `useVisitorTracking` hook

6. **Admin UI**
   - Add notification preferences panel in admin settings
   - Add subscribe/unsubscribe toggle

7. **Integration**
   - Wire up visitor tracking in `App.tsx`
   - Test end-to-end flow

---

## iOS Limitations

Web Push on iOS (Safari) has limitations:
- Requires iOS 16.4+ and PWA to be installed to home screen
- User must explicitly grant notification permission from PWA
- Some features may be limited compared to Android

This should be communicated in the admin settings UI.

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/track-visitor/index.ts` | Create | Log visits + trigger push |
| `supabase/functions/send-push-notification/index.ts` | Create | Send Web Push notifications |
| `src/hooks/usePushSubscription.ts` | Create | Manage push subscriptions |
| `src/hooks/useVisitorTracking.ts` | Create | Track page visits |
| `src/components/admin/settings/NotificationPreferencesPanel.tsx` | Create | Admin toggle settings |
| `vite.config.ts` | Update | Add push handler to SW |
| `src/App.tsx` | Update | Add visitor tracking hook |
| Database migration | Create | Add 2 new tables |

